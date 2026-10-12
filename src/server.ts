import { createServer } from "node:http";
import app from "./app.js";
import config from "./app/config/index.js";
import { disconnectPrisma } from "./app/lib/prisma.js";
import { logger } from "./app/lib/logger.js";

const server = createServer(app);
let shuttingDown = false;

server.listen(config.port, () => {
  logger.info({ port: config.port }, "server listening");
});

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, "server shutdown started");

  server.close(async (error) => {
    if (error) {
      logger.error({ errorName: error.name }, "server failed to close cleanly");
      process.exitCode = 1;
    }

    try {
      await disconnectPrisma();
    } catch (disconnectError) {
      logger.error(
        {
          errorName: disconnectError instanceof Error ? disconnectError.name : "UnknownError",
        },
        "database disconnect failed",
      );
      process.exitCode = 1;
    }

    logger.info("server shutdown complete");
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
