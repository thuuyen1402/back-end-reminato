import { Application } from "express";
import logger from "@utils/logger";
import chalk from "chalk";

export default (app: Application) => {
  //Logging
  app.use((request) => {
    switch (request.method.toUpperCase()) {
      case "GET": {
        logger.info(request.method.toUpperCase(), request.url);
        break;
      }
      case "POST": {
        logger.warn(request.method.toUpperCase(), request.url);
        break;
      }
      case "DELETE": {
        logger.custom(
          chalk.redBright,
          request.method.toUpperCase(),
          request.url
        );
        break;
      }
      case "PUT": {
        logger.custom(
          chalk.blueBright,
          request.method.toUpperCase(),
          request.url
        );
        break;
      }
      case "PATCH": {
        logger.custom(chalk.blue, request.method.toUpperCase(), request.url);
        break;
      }
      default: {
        logger.info(request.method.toUpperCase(), request.url);
        break;
      }
    }
    request.next();
  });
};
