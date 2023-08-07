import passport from "passport";
import prisma from "@services/prisma";
import passportJwt from "passport-jwt";
import { Request } from "express";
import { decodeAndVerifyToken, isNullable } from "@utils/utils";
import { User } from "@prisma/client";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ExtendedError } from "socket.io/dist/namespace";
import { parseCookies } from "@utils/cookies";

const JwtStrategy = passportJwt.Strategy;

const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) token = req.cookies["jwt"];
  return token;
};

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
      jsonWebTokenOptions: {
        ignoreExpiration: false,
      },
    },
    async function (jwt_payload, done) {
      try {
        const user = await prisma.getInstance().user.findFirst({
          where: {
            id: jwt_payload.id,
          },
          select: {
            email: true,
            id: true,
          },
        });

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

type UserDataAuth = Omit<User, "password" | "refreshToken"> & {
  isAuth: boolean;
};

export class AuthNotRequiredStrategy extends passport.Strategy {
  name?: string = "auth_not_required";
  authenticate(
    this: passport.StrategyCreated<this, this & passport.StrategyCreatedStatic>,
    req: Request
  ) {
    const token = cookieExtractor(req);
    let user: UserDataAuth = null;
    if (token && token != "") {
      const decode = decodeAndVerifyToken(token) as UserDataAuth;
      if (decode != undefined) {
        user = decode;
      }
    }

    return this.success(
      Object.assign(user ?? {}, {
        isAuth: !isNullable(user),
      } as UserDataAuth)
    );
  }
}

passport.use(new AuthNotRequiredStrategy());

export const auth = passport;

export function authSocket(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  next: (err?: ExtendedError) => void
) {
  try {
    const req = socket.request;
    const cookies = parseCookies((req.headers?.cookies) ?? req.headers?.cookie);
    const token = cookies["jwt"];
    socket.data.isAuth = false;
    if (token && token != "") {
      const decode = decodeAndVerifyToken(token) as UserDataAuth;
      if (decode != undefined) {
        socket.data.isAuth = true;
      }
    }

    return next();
  } catch (err) {
    return next();
  }
}
