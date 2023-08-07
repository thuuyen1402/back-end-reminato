import { Response } from "express";
import prisma from "@services/prisma";
import { ConvertRequest, GetSchemaInfer } from "src/types/convert";
import { HttpError, HttpSuccess } from "@utils/http";
import {
  getPublicVideoSharingSchema,
  sharingVideoSchema,
  voteVideoSchema,
} from "./video-share-schema";
import { YoutubeService } from "@services/youtube";
import { VideoShare } from "@prisma/client";
import RabbitMQSender from "@services/rabbitmq";
import { QUEUE } from "src/constants/queue";

export class VideoShareController {
  async sharingVideo(
    req: ConvertRequest<GetSchemaInfer<typeof sharingVideoSchema>["body"]>,
    res: Response
  ) {
    try {
      const userId = req.user.id;
      const { url } = req.body;
      const videoStatistic = await YoutubeService.getYoutubeStatistic(url);
      let videoSharing: VideoShare;
      if (videoStatistic.complete) {
        const detail = videoStatistic.data;
        videoSharing = await prisma.getInstance().videoShare.create({
          data: {
            title: detail.snippet.title,
            description: detail.snippet.description,
            sharedBy: {
              connect: {
                id: userId,
              },
            },
            videoId: detail.id,
            thumbnailUrls: JSON.stringify(detail.snippet.thumbnails),
          },
        });
      } else {
        return HttpError(res, {
          status: 404,
          message: videoStatistic.reason,
        });
      }
      //Send sharing notify to rabbit mq channel
      const channel = await RabbitMQSender.getInstance();

      channel.sendToQueue(
        QUEUE.NOTIFICATION_SERVICE.SHARING,
        Buffer.from(
          JSON.stringify({
            videoShareId: videoSharing.id,
          } as NotificationServiceShardingConsumerData)
        )
      );

      return HttpSuccess(req, res, {
        data: videoSharing,
        message: "Success",
      });
    } catch (err) {
      return HttpError(res, {
        status: 500,
        message: err,
      });
    }
  }

  async voteVideo(
    req: ConvertRequest<
      GetSchemaInfer<typeof voteVideoSchema>["body"],
      GetSchemaInfer<typeof voteVideoSchema>["params"]
    >,
    res: Response
  ) {
    try {
      const userId = req.user.id;
      const videoShareId = req.params.id;
      const videoShare = await prisma.getInstance().videoShare.findFirst({
        where: {
          id: videoShareId,
        },
        include: {
          upvoteUsers: {
            where: {
              id: userId,
            },
            select: {
              id: true,
            },
          },
          downvoteUsers: {
            where: {
              id: userId,
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!videoShare) {
        return HttpError(res, {
          status: 500,
          message: "Video does not exists",
        });
      }

      let isVoted = false;
      let vote: "up" | "down" = req.body.type;
      if (videoShare.upvoteUsers && videoShare.upvoteUsers.length > 0) {
        isVoted = true;
      }
      if (videoShare.downvoteUsers && videoShare.downvoteUsers.length > 0) {
        isVoted = true;
        vote = "down";
      }

      //Send vote to rabbit mq channel
      const channel = await RabbitMQSender.getInstance();

      channel.sendToQueue(
        QUEUE.VIDEO_SERVICE.VOTE,
        Buffer.from(
          JSON.stringify({
            isVoted,
            vote,
            userId,
            videoShareId,
          } as VideoServiceConsumerData)
        )
      );
      return HttpSuccess(req, res, {
        message: "Vote video success",
      });
    } catch (err) {
      return HttpError(res, {
        status: 500,
        message: err,
      });
    }
  }

  async getPublicVideos(
    req: ConvertRequest<
      unknown,
      unknown,
      GetSchemaInfer<typeof getPublicVideoSharingSchema>["query"]
    >,
    res: Response
  ) {
    try {
      const limit = +(req.query.limit ?? 5);
      const isAuth = req.user.isAuth;
      const cursor = req.query.cursor ?? "";
      const cursorObj = cursor === "" ? undefined : { id: cursor };
      const videoSharing = await prisma.getInstance().videoShare.findMany({
        cursor: cursorObj,
        take: limit + 1,
        orderBy: {
          sharedTime: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          downvote: true,
          upvote: true,
          sharedTime: true,
          sharedBy: {
            select: {
              id: true,
              email: true,
            },
          },
          videoId: true,
          thumbnailUrls: true,
          ...(isAuth
            ? {
              downvoteUsers: {
                select: {
                  id: true,
                },
                where: {
                  id: req.user.id,
                },
              },
              upvoteUsers: {
                select: {
                  id: true,
                },
                where: {
                  id: req.user.id,
                },
              },
            }
            : {}),
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (videoSharing.length > limit) {
        const nextItem = videoSharing.pop();
        nextCursor = nextItem.id;
      }
      type ConvertVideoSharing = ArrElement<typeof videoSharing> & {
        isOwner: boolean;
        isVoteUp: boolean;
        isVoted: boolean;
        isVoteDown: boolean;
        thumbnails: YoutubeStatistic["snippet"]["thumbnails"];
      };
      const convertVideoSharing: ConvertVideoSharing[] = videoSharing.map(
        (video) => {
          const item: ConvertVideoSharing = Object.assign(video, {
            isOwner: false,
            isVoteUp: false,
            isVoted: false,
            isVoteDown: false,
            thumbnails: {} as any,
          });
          if (isAuth) {
            if (item.sharedBy.id == req.user.id) {
              item.isOwner = true;
            }

            if (item.upvoteUsers && item.upvoteUsers.length > 0) {
              item.isVoteUp = true;
            }

            if (item.downvoteUsers && item.downvoteUsers.length > 0) {
              item.isVoteDown = true;
            }

            item.isVoted = item.isVoteUp || item.isVoteDown;
          }
          item.thumbnails = JSON.parse(
            item.thumbnailUrls
          ) as YoutubeStatistic["snippet"]["thumbnails"];
          // Hide user vote
          // item.downvoteUsers = [];
          // item.upvoteUsers = [];
          return item;
        }
      );

      return HttpSuccess(req, res, {
        data: convertVideoSharing,
        message: "Success",
        pagination: {
          cursor: nextCursor ?? "",
          isEnd: nextCursor == undefined,
        },
      });
    } catch (err) {
      return HttpError(res, {
        status: 500,
        message: err,
      });
    }
  }
}
