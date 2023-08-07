import Prisma from "@services/prisma";
import Logger from "@utils/logger";
import { QUEUE } from "src/constants/queue";
import { ServiceReceiver } from "src/services/receiver";

export default async () => {
  try {

    const channel = await ServiceReceiver.getInstance();
    const prisma = Prisma.getInstance();

    await channel.consume(
      QUEUE.VIDEO_SERVICE.VOTE,
      async (message) => {
        try {
          if (message) {
            const content: VideoServiceConsumerData = JSON.parse(
              message.content.toString()
            );
            if (content) {
              const videoShare = await prisma.videoShare.findFirst({
                where: {
                  id: content.videoShareId,
                },
                select: {
                  upvote: true,
                  downvote: true,
                  _count: {
                    // For testing to get real number
                    select: {
                      upvoteUsers: true,
                      downvoteUsers: true
                    }
                  }
                },
              });

              if (!videoShare) {
                throw new Error("Video not exist");
              }
              const upVoteCount = videoShare._count.upvoteUsers;
              const downVoteCount = videoShare._count.downvoteUsers;

              const disconnectVoteQuery = {
                upvoteUsers: {
                  disconnect: {
                    id: content.userId,
                  },
                },
                downvoteUsers: {
                  disconnect: {
                    id: content.userId,
                  },
                },
              }



              await prisma.videoShare.update({
                where: {
                  id: content.videoShareId,
                },
                data: {
                  ...(
                    content.isVoted
                      // case voted before
                      ? {
                        ...(content.vote == "up"
                          ? {
                            upvote: upVoteCount - 1,
                          }
                          : {
                            downvote: downVoteCount - 1,
                          }),
                        ...disconnectVoteQuery//Disconnect all connect before, include duplicate
                      }
                      // case new vote
                      : {
                        ...(content.vote == "up"
                          ? {
                            upvote: upVoteCount + 1,
                            upvoteUsers: {
                              connect: {
                                id: content.userId,
                              },
                            },
                            downvoteUsers: {
                              disconnect: {
                                id: content.userId,
                              }
                            }
                          }
                          : {
                            downvote: downVoteCount + 1,
                            downvoteUsers: {
                              connect: {
                                id: content.userId,
                              },
                            },
                            upvoteUsers: {
                              disconnect: {
                                id: content.userId,
                              },
                            },
                          }),
                      }),
                },
              });
              Logger.info(
                "Consume vote service",
                "Run on video",
                content.videoShareId
              );
            }
          }
        } catch (err) {
          Logger.error("Consume vote service", err);
        } finally {
          channel.ack(message);
        }

      },
      { noAck: false }
    );
  } catch (err) {
    Logger.error("Consume vote service channel error", err);
    await ServiceReceiver.reconnect();
  }

};
