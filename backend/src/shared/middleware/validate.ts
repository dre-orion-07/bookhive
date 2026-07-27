import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ErrorFactory } from "../errors/ErrorFactory.js";

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(" ");
      return next(ErrorFactory.validation(message));
    }

    req.body = result.data;
    next();
  };
}
