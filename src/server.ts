import express from "express";
import { Application } from "express";
import logger from "@utils/logger";
import middleware from "@app/middleware";
import routers from "@app/routers";

//Load env for all
import dotenv from "dotenv";
dotenv.config();
import initService from "./init-service";

(async () => {
  await initService();
  const app: Application = express();
  const port = process.env.SERVER_PORT || 3000;

  //Middleware and router
  middleware(app);
  routers(app);

  app.listen(port, function () {
    logger.info("", `App is binding on port ${port} !`);
  });
})();
