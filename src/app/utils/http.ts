import * as util from "util";
import { Response, Request } from "express";
import Logger from "./logger";
import chalk from "chalk";
import { ConvertRequest } from "src/types/convert";

function HttpError(
  res: Response,
  ctx: { status: number; message: string | any; url?: string }
) {
  try {
    Logger.error(ctx.url ?? "API ERROR", ctx.message);
    return res.status(ctx.status).json({
      message: ctx.message,
    });
  } catch (err) {
    return res.status(500).json({
      message: err,
    });
  }
}
util.inherits(Error, HttpError);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HttpSuccess<T = any, R extends ConvertRequest = Request>(
  req: R,
  res: Response,
  ctx: { data?: T; message: string; [key: string]: any }
) {
  try {
    Logger.custom(chalk.bgGreenBright.white.bold, "SUCCESS", req.url);
    return res.status(200).json(ctx);
  } catch (err) {
    return res.status(500).json({
      message: err,
    });
  }
}

export { HttpError, HttpSuccess };
