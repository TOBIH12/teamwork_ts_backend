import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (
    authHeader &&
    typeof authHeader === 'string' &&
    authHeader.startsWith('Bearer ')
  ) {
    // Extract the token from the Authorization header

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (error, info) => {
      if (error?.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          error: error.message,
        });
      }
      if (error) {
        return res.status(401).json({
          status: 'error',
          error: error.message,
        });
      }

      req.user = info as Record<string, unknown>;
      return next();
    });
  } else {
    return res.status(401).json({
      status: 'error',
      error: 'Authorization token is missing',
    });
  }
  return next();
};

export default authMiddleware;
