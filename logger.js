import moment from "moment-timezone";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { combine, timestamp, printf } = format;

// Define a custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create a custom timestamp format that uses the Philippine time zone
const timestampFormat = format((info) => {
  info.timestamp = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
  return info;
});

const logger = createLogger({
  level: "info",
  format: combine(timestampFormat(), logFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export default logger;
