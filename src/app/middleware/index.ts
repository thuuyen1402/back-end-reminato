import { Application } from "express";
import config from "./config";
import utils from "./utils";

export default (app: Application) => {
  config(app);
  utils(app);
};
