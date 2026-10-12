import type { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";

export function createHealthController(checkReadiness: () => Promise<boolean>) {
  const live: RequestHandler = (_req, res) =>
    sendResponse(res, {
      message: "Service is live",
      data: { status: "live" },
    });

  const ready = catchAsync(async (_req, res) => {
    if (!(await checkReadiness())) {
      res.status(503).json({
        success: false,
        message: "Service is not ready",
        errors: [{ dependency: "database", status: "not_ready" }],
      });
      return;
    }

    sendResponse(res, {
      message: "Service is ready",
      data: { status: "ready" },
    });
  });

  return { live, ready };
}
