import { Router } from "express";
import { checkDatabaseReady } from "../../lib/prisma.js";
import { createHealthController } from "./health.controller.js";

export function createHealthRouter(checkReadiness = checkDatabaseReady): Router {
  const router = Router();
  const controller = createHealthController(checkReadiness);

  router.get("/live", controller.live);
  router.get("/ready", controller.ready);

  return router;
}
