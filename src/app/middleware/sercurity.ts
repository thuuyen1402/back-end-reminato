import rateLimit, { Options } from "express-rate-limit";

export const rateLimiter = (
  options: Partial<Options> = {
    max: 100,
    windowMs: 24 * 60 * 60 * 1000,
  }
) =>
  rateLimit({
    message: `You have exceeded the ${options.max} requests in ${
      options.windowMs / 1000 / 60
    } minutes limit!`,
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
