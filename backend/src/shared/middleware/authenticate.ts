import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../jwt/jwt.js";
import { ErrorFactory } from "../errors/ErrorFactory.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(ErrorFactory.authenticationFailed("Authentication token is required."));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}
