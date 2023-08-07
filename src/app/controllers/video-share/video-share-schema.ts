import { z } from "zod";

export const sharingVideoSchema = z.object({
  body: z.object({
    url: z.string({
      required_error: "Url is required",
    }),
  }),
});

export const getPublicVideoSharingSchema = z.object({
  query: z
    .object({
      cursor: z.string().nullish(),
      limit: z.string().nullish(),
    })
    .nullish(),
});

export const voteVideoSchema = z.object({
  body: z.object({
    type: z.enum(["up", "down"], {
      required_error: "You must choose up or down vote",
    }),
  }),
  params: z.object({
    id: z.string({
      required_error: "Video id is required",
    }),
  }),
});
