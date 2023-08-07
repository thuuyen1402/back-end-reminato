import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export default (app: Application) => {
  //CORS
  app.use(
    cors({
      origin: process.env.WEB_APP_URL ?? true,
      credentials: true
    })
  );

  //PARSE
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(cookieParser());
};
