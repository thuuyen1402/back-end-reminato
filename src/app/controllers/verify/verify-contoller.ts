import { Response, Request } from "express";
import { HttpError, HttpSuccess } from "@utils/http";
import { decodeAndVerifyToken, signToken } from "@utils/utils";
import prisma from "@services/prisma";
import { User } from "@prisma/client";

const DEFAULT_TIME_EXPIRED = 60 * 60 * 1000; //60 min;

export class VerifyController {
  async verifyToken(req: Request, res: Response) {
    try {
      const decode = decodeAndVerifyToken(req.cookies["jwt"]) as User;
      if (decode == undefined) {
        res.clearCookie("jwt");
        return HttpError(res, {
          status: 500,
          message: "A. Token is not existed or expired",
        });
      }
      const refreshToken = req.cookies["rs"] as string;

      const user = await prisma.getInstance().user.findFirst({
        where: {
          id: decode.id,
        },
      });

      if (!user) {
        res.clearCookie("jwt");
        return HttpError(res, {
          status: 500,
          message: "B. Token is not existed or expired",
        });
      }

      if (refreshToken && refreshToken != "") {
        //Re update the session with refresh token
        if (user.refreshToken == refreshToken) {
        
          const token = signToken({
            id: user.id,
            email: user.email,

          });

          res.cookie("jwt", token, {
            maxAge: +process.env.JWT_EXPIRED_TIME ?? DEFAULT_TIME_EXPIRED,
            sameSite: "none",
            secure: true,
            httpOnly:true,
            path: "/"
          });
        } else {
          res.clearCookie("rs");
        }
      }

      return HttpSuccess(req, res, {
        data: true,
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
