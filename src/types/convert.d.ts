/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { z } from "zod";
type ConvertRequest<
  Body = any,
  Param = ParamsDictionary,
  Query = any,
> = Request<Required<Param>, any, Required<Body>, Query>;

type GetSchemaInfer<Schema> = z.infer<Schema>;
