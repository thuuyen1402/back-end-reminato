import prisma from "@services/prisma";
import rabbitMQSender from "@services/rabbitmq";
import { QUEUE } from "./constants/queue";
import Logger from "@utils/logger";

export default async () => {
  try {
    prisma.getInstance();
  } catch (err) {
    Logger.error("INIT", err);
    prisma.reconnect()
  }

  const initRabbitMQSender = async () => {
    await rabbitMQSender.getInstance();
    await rabbitMQSender.signQueue(
      QUEUE.VIDEO_SERVICE.VOTE,
      QUEUE.NOTIFICATION_SERVICE.SHARING
    );
  };
  try {
    // Init Rabbit MQ first time
    await initRabbitMQSender();
  } catch (err) {
    Logger.error("INIT", err);
    // Try to re-connect each 60 seconds
    const reConnectMQInterval = setInterval(async () => {
      try {
        Logger.warn("RE-CONNECT RABBIT MQ", "Trying to re-connect");
        await initRabbitMQSender();
        clearInterval(reConnectMQInterval);
      } catch (err) {
        Logger.error("RE-CONNECT RABBIT MQ", err);
      }
    }, 60 * 1000);
  }

  return async () => {
    prisma.close();
    await rabbitMQSender.close();
  };
};
