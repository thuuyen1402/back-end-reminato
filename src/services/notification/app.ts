import express, { Application } from "express";
import * as http from "http";
import sharingConsume from "./consume/sharing-consume";
import init from "./init";
import { Server } from "socket.io";
import dotenv from "dotenv";
import logger from "@utils/logger";
import { authSocket } from "@services/auth";
import Logger from "@utils/logger";
import { waitResolve } from "@utils/utils";
dotenv.config();

const NOTIFICATION_SOCKET_PORT = process.env.NOTIFICATION_SOCKET_PORT ?? 3555;

(async () => {
  const close = await init();
  process.once("SIGINT", async () => {
    await close();
  });

  const socketApp: Application = express();
  const server = http.createServer(socketApp);


  const io = new Server(server, {
    cors: {
      origin: process.env.WEB_APP_URL ?? true,
      credentials: true
    },
  });

  //Wrap auth session

  io.use((socket, next) => {
    return authSocket(socket, next);
  });


  const runConsume = async (io) => {
    try {
      const sharing = sharingConsume(io);
      //...Other consumer
      await Promise.all([sharing]);

    } catch (err) {
      Logger.error("Consume notification error", err);
      await waitResolve(20000)
      Logger.warn("Re-connect notification consume", err);
      await runConsume(io)
    }
  }

  io.on("connection", (socket) => {
    if (!socket.data.isAuth) socket.disconnect();
    runConsume(io)
  });

  server.listen(NOTIFICATION_SOCKET_PORT, function () {
    logger.info(
      "",
      `Notification service is binding on port ${NOTIFICATION_SOCKET_PORT} !`
    );
  });
})();
