import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import HttpError from '../errorModel';

dotenv.config();

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (
    authHeader &&
    typeof authHeader === 'string' &&
    authHeader.startsWith('Bearer ')
  ) {
    // Extract the token from the Authorization header

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (error, info) => {
      if (error?.name === 'TokenExpiredError') {
        res.send(new HttpError('Session expired. Please sign in again', 401));
      }
      if (error) {
        res.send(new HttpError('Unathorized. Invalid token', 401));
      }

      req.user = info as Record<string, unknown>;
      next();
    });
  } else {
    res.send(new HttpError('Authorization token missing', 401));
  }
};

export default authMiddleware;
