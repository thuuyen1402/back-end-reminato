import { isNullable } from "@utils/utils";
import _ from "lodash";
import fetch from "node-fetch";

export class YoutubeService {
  public static async getYoutubeStatistic(url: string): Promise<{
    complete: boolean;
    data?: YoutubeStatistic;
    reason?: string;
  }> {
    try {
      const urlObj = new URL(url);
      const urlParams = new URLSearchParams(urlObj.search);
      let id = urlParams.get("v");

      if (isNullable(id)) {
        urlObj.search = "";
        const splitUrl = urlObj.toString().split("/");
        id = splitUrl[splitUrl.length - 1];
      }

      const queryString = new URLSearchParams({
        id,
        key: process.env.YOUTUBE_API_KEY,
        fields: "items(id,snippet(title,description,thumbnails))",
        part: "snippet",
      }).toString();

      const res = await fetch(
        `${process.env.YOUTUBE_API_URL}/videos?` + queryString
      );

      if (res.ok) {
        const cv = ((await res.json())?.items ?? []) as YoutubeStatistic[];

        if (cv && cv.length > 0) {
          const result = cv[0];

          if (
            result?.snippet?.title &&
            result?.snippet?.description &&
            result.snippet?.thumbnails
          ) {
            return {
              complete: true,
              data: result,
            };
          }
        }
      }

      return {
        complete: false,
        reason: "The video is not exists or is being setting private",
      };
    } catch (err) {
      return {
        complete: false,
        reason: "The video is not exists or is being setting private",
      };
    }
  }
}
