import jwt from "jsonwebtoken";

export const signToken = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  claims: any,
  expiredTime = process.env.JWT_EXPIRED_TIME ?? 60 * 60 * 1000
) => {
  return jwt.sign(claims, process.env.JWT_SECRET, {
    expiresIn: expiredTime,
  });
};

export const decodeAndVerifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    ignoreExpiration: true,
  });
};

export const isNullable = <T>(data: T) => {
  if (data == null || data == undefined) return true;
  return false;
};

export async function waitResolve(ms = 1000) {
  return await new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, ms)
  })
}
