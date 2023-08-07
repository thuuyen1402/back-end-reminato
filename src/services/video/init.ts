import { QUEUE } from "src/constants/queue";
import { ServiceReceiver } from "../receiver";
import prisma from "@services/prisma";

export default async () => {
  prisma.getInstance();
  await ServiceReceiver.getInstance();
  ServiceReceiver.serviceName = "Video service"
  await ServiceReceiver.signQueue(QUEUE.VIDEO_SERVICE.VOTE);

  return async () => {
    await ServiceReceiver.close();
  };
};
