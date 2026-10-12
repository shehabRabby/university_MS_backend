import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";
import { AppError } from "../utils/AppError.js";

export const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const requestId = res.getHeader("X-Request-ID");
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown[] = [];

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Request validation failed";
    errors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (typeof error === "object" && error !== null && "type" in error) {
    if (error.type === "entity.too.large") {
      statusCode = 413;
      message = "Request body is too large";
    } else if (error.type === "entity.parse.failed") {
      statusCode = 400;
      message = "Invalid JSON request body";
    }
  }

  logger.error(
    {
      requestId,
      statusCode,
      errorName: error instanceof Error ? error.name : "UnknownError",
    },
    "request failed",
  );

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
