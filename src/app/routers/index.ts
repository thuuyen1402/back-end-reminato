import { Application } from "express";
import { accountRouter } from "./account";
import { verifyRouter } from "./verify";
import { videoShareRouter } from "./video-share";
import { statusRouter } from "./status";

export default (app: Application) => {
  app.use("/account", accountRouter);
  app.use("/verify", verifyRouter);
  app.use("/videos", videoShareRouter);
  app.use("/status", statusRouter);
};
