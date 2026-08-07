import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { AppError } from "./AppError.js";

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  void _next;

  const requestId = randomUUID();
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    if (!err.isOperational) {
      console.error("Non-operational error:", err);
    }

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: [],
        requestId,
        timestamp,
      },
    });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong. Please try again.",
      details: [],
      requestId,
      timestamp,
    },
  });
}
