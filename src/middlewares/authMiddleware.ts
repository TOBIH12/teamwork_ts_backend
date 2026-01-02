import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import pool from '../db';
import { fetchUserByIdQuery } from '../queries/users.queries';

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

    jwt.verify(token, process.env.JWT_SECRET as string, async (error, info) => {
      if (error?.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          error: 'authorization access has expired',
        });
      }
      if (error) {
        return res.status(401).json({
          status: 'error',
          error: error.message,
        });
      }

      const dbUserId = (info as { userID: number }).userID;

      const userResult = await pool.query(fetchUserByIdQuery, [dbUserId]);
      if (userResult.rows.length === 0 || !userResult.rows) {
        return res.status(401).json({
          status: 'error',
          error: 'User not found',
        });
      }
      const userInfo = userResult.rows[0];
      req.user = userInfo;

      return next();
    });
  } else {
    return res.status(401).json({
      status: 'error',
      error: 'Authorization token is missing',
    });
  }
};

export default authMiddleware;
