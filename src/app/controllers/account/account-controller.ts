import { Response, Request } from "express";
import prisma from "@services/prisma";
import bCrypto from "bcryptjs";
import { ConvertRequest, GetSchemaInfer } from "src/types/convert";
import { signInSchema } from "./account-controller-schema";
import { HttpError, HttpSuccess } from "@utils/http";
import { signToken } from "@utils/utils";
import { Str } from "@supercharge/strings";

const DEFAULT_TIME_EXPIRED = 60 * 60 * 1000; //60 min;
export class AccountController {
  async signIn(
    req: ConvertRequest<GetSchemaInfer<typeof signInSchema>["body"]>,
    res: Response
  ) {
    try {
      const { email, password } = req.body;
      let user = await prisma.getInstance().user.findFirst({
        where: {
          email,
        },
        select: {
          password: true,
          id: true,
          email: true,
        },
      });

      if (!user) {
        //Sign up user if user don't exist

        const hash = bCrypto.hashSync(password, 10);
        user = await prisma.getInstance().user.create({
          data: {
            password: hash,
            email,
          },
        });
      } else {
        const isTruePassword = bCrypto.compareSync(
          password,
          user.password
        );
        if (!isTruePassword) {
          return HttpError(res, {
            status: 500,
            message: "Incorrect username or password",
          });
        }
      }
      const token = signToken({
        id: user.id,
        email: email,
      });

      const refreshToken = Str.random(50);
      await prisma.getInstance().user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken,
        },
      });

      //Auth set cookie header

      res.cookie("jwt", token, {
        maxAge: +process.env.JWT_EXPIRED_TIME ?? DEFAULT_TIME_EXPIRED,
        sameSite: "none",
        secure: true,
        httpOnly: true,
        path: "/"
      });
      res.cookie("rs", refreshToken, {
        maxAge: +process.env.JWT_EXPIRED_TIME ?? DEFAULT_TIME_EXPIRED,
        sameSite: "none",
        secure: true,
        httpOnly: true,
        path: "/"
      });

      return HttpSuccess(req, res, {
        data: {
          access_token: token,
          refresh_token: refreshToken,
          user: {
            email: user.email,
            id: user.id,
          },
        },
        message: "Success",
      });
    } catch (err) {
      return HttpError(res, {
        status: 500,
        message: err?.message ?? "Internal Server Error",
      });
    }
  }
  async logout(
    req: ConvertRequest<GetSchemaInfer<typeof signInSchema>["body"]>,
    res: Response
  ) {
    try {
      res.clearCookie("jwt");
      res.clearCookie("rs");
      return HttpSuccess(req, res, {
        message: "Success",
      });
    } catch (err) {
      return HttpError(res, {
        status: 500,
        message: err?.message ?? "Internal Server Error",
      });
    }
  }
  async getUserMe(req: Request, res: Response) {
    try {
      const user = await prisma.getInstance().user.findFirst({
        where: {
          id: req.user.id,
        },
        select: {
          email: true,
          id: true,
        },
      });

      return HttpSuccess(req, res, {
        data: user,
        message: "Success",
      });
    } catch (err) {
      return HttpError(res, {
        status: 500,
        message: err,
      });
    }
  }
}
