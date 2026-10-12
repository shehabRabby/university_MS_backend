import pino from "pino";
import config from "../config/index.js";

export const logger = pino({
  level: config.logLevel,
  base: {
    service: "university-management-api",
    environment: config.nodeEnv,
  },
  redact: {
    paths: [
      "password",
      "*.password",
      "authorization",
      "*.authorization",
      "req.headers.authorization",
      "cookie",
      "*.cookie",
      "req.headers.cookie",
      "set-cookie",
      "*.set-cookie",
      "token",
      "*.token",
      "secret",
      "*.secret",
    ],
    censor: "[REDACTED]",
  },
});
