import pino from "pino";
import pinoPretty from "pino-pretty";

const stream = pinoPretty({
  colorize: true,
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  stream
);
