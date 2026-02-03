import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db';
import { fetchUserByIdQuery } from '../queries/users.queries';

dotenv.config();

const authMiddleware: RequestHandler = (req, res, next) => {
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

      try {
        const dbUserId = (info as { user_id: number }).user_id;

        const userResult = await pool.query(fetchUserByIdQuery, [dbUserId]);
        if (userResult.rows.length === 0 || !userResult.rows) {
          return res.status(401).json({
            status: 'error',
            error: 'User not found',
          });
        }
        req.user = userResult.rows[0];

        return next();
      } catch (err) {
        return res.status(500).json({
          status: 'error',
          error: err || 'Internal server error',
        });
      }
    });
  } else {
    return res.status(401).json({
      status: 'error',
      error: 'Authorization token is missing',
    });
  }
};

export default authMiddleware;
