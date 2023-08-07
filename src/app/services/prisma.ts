import { PrismaClient } from "@prisma/client";
import Logger from "@utils/logger";
import { waitResolve } from "@utils/utils";

class Prisma {
  private static instance: PrismaClient = null;
  public static getInstance() {
    if (this.instance == null) {
      this.instance = new PrismaClient();
      if (process.env.NODE_ENV == "DEVELOPMENT") {
        Logger.info("INIT", "Prisma service");
      }
    }
    return Prisma.instance as PrismaClient;
  }
  public static close() {
    this.instance.$disconnect();
  }
  public static async reconnect() {
    try {
      Logger.warn("Re-connect prisma");
      this.instance = new PrismaClient();
    } catch (err) {
      Logger.error("Re-connect prisma failed", err);
      await waitResolve(10000);
      Logger.warn("Re-connect prisma");
      await this.reconnect()
    }
  }
}

export default Prisma;
