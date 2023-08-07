import Prisma from "@services/prisma";
import Logger from "@utils/logger";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { QUEUE } from "src/constants/queue";
import { ServiceReceiver } from "src/services/receiver";

export default async (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  try {
    const channel = await ServiceReceiver.getInstance();
    const prisma = Prisma.getInstance();

    await channel.consume(
      QUEUE.NOTIFICATION_SERVICE.SHARING,
      async (message) => {
        try {
          if (message) {
            const content = JSON.parse(
              message.content.toString()
            ) as NotificationServiceShardingConsumerData;
            const videoShare = await prisma.videoShare.findFirst({
              where: {
                id: content.videoShareId,
              },
              select: {
                id: true,
                sharedBy: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
                thumbnailUrls: true,
                title: true,
                description: true,
                sharedTime: true,
                upvote: true,
                downvote: true,
              },
            });

            if (!videoShare) {
              throw new Error("Video not exist");
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (videoShare as any).thumbnails = JSON.parse(
              videoShare.thumbnailUrls
            ) as YoutubeStatistic["snippet"]["thumbnails"];
            videoShare.thumbnailUrls = ""

            io.emit("new_video_sharing", JSON.stringify(videoShare));

            Logger.info(
              "Consume notification service",
              "User sharing video",
              content.videoShareId
            );
          }
        } catch (err) {
          Logger.error("Consume notification service", err);
        } finally {
          channel.ack(message);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    await ServiceReceiver.reconnect()
    Logger.error("Consume close", err);
  }
};
