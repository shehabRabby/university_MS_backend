import type { Response } from "express";

interface SuccessResponse<T> {
  statusCode?: number;
  message: string;
  data: T;
}

export function sendResponse<T>(res: Response, response: SuccessResponse<T>): Response {
  return res.status(response.statusCode ?? 200).json({
    success: true,
    message: response.message,
    data: response.data,
  });
}
