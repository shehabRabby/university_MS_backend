import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Application } from "express";
import config from "./app/config/index.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";
import { notFound } from "./app/middleware/notFound.js";
import { rateLimiter } from "./app/middleware/rateLimiter.js";
import { requestContext } from "./app/middleware/requestContext.js";
import { createHealthRouter } from "./app/module/health/health.route.js";
import { AppError } from "./app/utils/AppError.js";

interface AppOptions {
  checkReadiness?: () => Promise<boolean>;
}

export function createApp(options: AppOptions = {}): Application {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new AppError(403, "Origin is not allowed by CORS"));
      },
      exposedHeaders: ["X-Request-ID"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimiter);

  app.use("/health", createHealthRouter(options.checkReadiness));
  app.use("/api/v1", express.Router());

  app.use(notFound);
  app.use(globalErrorHandler);

  return app;
}

const app = createApp();

export default app;
