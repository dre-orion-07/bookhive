import type { Response, NextFunction } from "express";
import { verifyAccessToken } from "../jwt/jwt.js";
import type { AuthenticatedRequest } from "./authenticate.js";

/**
 * Like authenticate, but does not reject unauthenticated requests.
 * If a valid Bearer token is present, req.user is populated.
 * If no token or an invalid token is provided, the request continues without req.user.
 */
export function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
  } catch {
    // token invalid or expired — continue as unauthenticated
  }

  return next();
}
