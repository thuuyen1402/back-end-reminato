import Logger from "@utils/logger";
import { videoServiceConsume } from "./consume";
import init from "./init";
import dotenv from "dotenv";
import { waitResolve } from "@utils/utils";
dotenv.config();

(async () => {
  const close = await init();
  process.once("SIGINT", async () => {
    await close();
  });

  const runConsume = async () => {
    try {
      await videoServiceConsume();
    } catch (err) {
      Logger.error("Consume video error", err);
      await waitResolve(20000)
      Logger.warn("Re-connect video consume", err);
      await runConsume()
    }
  }

  await runConsume() //Run forever
})();
