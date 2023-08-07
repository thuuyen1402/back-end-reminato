import Logger from "@utils/logger";
import amqp from "amqplib";
const RABBIT_MQ_HOST = process.env.RABBIT_MQ_HOST ?? "amqp://localhost";
class RabbitMQSender {
  private static connection: amqp.Connection = null;
  private static channel: amqp.Channel = null;
  public static async getInstance() {
    if (this.connection == null) {
      try {
        this.connection = await amqp.connect(RABBIT_MQ_HOST);
      } catch (err) {
        throw new Error("Can't connect to Rabbit MQ")
      }
    }
    if (this.channel == null) {
      this.channel = await this.connection.createChannel();
      if (process.env.NODE_ENV == "DEVELOPMENT") {
        Logger.info("INIT", "Rabbit MQ Service");
      }
    }

    return this.channel;
  }
  public static async signQueue(...queues: string[]) {
    for (const queue of queues) {
      await this.channel.assertQueue(queue, {
        durable: false,
      });
    }
  }
  public static async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

export default RabbitMQSender;
