import { Response, Request } from "express";
import { HttpError } from "@utils/http";
import dayjs from "dayjs";

export class StatusController {
  async healthCheck(_req: Request, res: Response) {
    const health = {
      uptime: process.uptime(),
      message: "OK",
      timestamp: dayjs().unix(),
    };
    try {
      return res.send(health);
    } catch (err) {
      res.status(503).send();
      return HttpError(res, {
        status: 503,
        message: {
          ...health,
          error: err,
        },
      });
    }
  }
}
