import dayjs from "dayjs";
import chalk, { ChalkInstance } from "chalk";
export default class Logger {
  static greenLog = chalk.greenBright;
  static yellowLog = chalk.yellowBright;
  static redLog = chalk.redBright;
  public static log = console.log;
  public static info(title, ...content) {
    this.log(
      this.timestamp(),
      this.greenLog(title == "" ? "INFO" : title),
      "-",
      content.length == 0 ? "" : content.join(" ")
    );
  }
  public static warn(title, ...content) {
    this.log(
      this.timestamp(),
      this.yellowLog(title == "" ? "WARN" : title),
      "-",
      content.length == 0 ? "" : content.join(" ")
    );
  }
  public static error(title, ...content) {
    this.log(
      this.timestamp(),
      this.redLog(title == "" ? "ERROR" : title),
      "-",
      this.getErrorLogs(content).join(" ")
    );
  }

  public static custom(chalkCustom: ChalkInstance, title, ...content) {
    this.log(
      this.timestamp(),
      chalkCustom(title == "" ? "ERROR" : title),
      "-",
      this.getErrorLogs(content).join(" ")
    );
  }
  private static timestamp() {
    return `[${dayjs().format("DD/MM/YYYY HH:mm")}]:`;
  }
  private static getErrorLogs(...errors) {
    const errorsConvert: string[] = [];
    errors.forEach((error) => {
      if (error instanceof Error) {
        errorsConvert.push(error?.stack ?? "Unexpected");
      } else errorsConvert.push(error?.toString() ?? "Unexpected");
    });
    return errorsConvert;
  }
}
