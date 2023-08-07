import { HttpError } from "@utils/http";
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // Error from ZOD
      const errorC = error as z.ZodError;
      const issues = errorC.issues;
      return HttpError(res, {
        status: 500,
        url: req.url,
        message: issues
          .map((err) => `${err.message} in ${err.path.join(".")}`)
          .join(", "),
      });
    }
  };
export { validate };
