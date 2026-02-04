import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import z from 'zod';
import pool from '../../db';
import { checkEmailQuery, insertUserQuery } from '../../queries/users.queries';
import { registerSchema, signInSchema } from '../../zodSchema';

dotenv.config();

type RegisterInput = z.infer<typeof registerSchema>;
type SignInput = z.infer<typeof signInSchema>;

export default class UserControllers {
  // Create User

  async createUser(
    req: Request<RegisterInput>,
    res: Response
  ): Promise<Response> {
    const {
      firstName,
      lastName,
      email,
      password,
      gender,
      jobRole,
      department,
      address,
    } = req.body;

    try {
      const newEmail = email.toLowerCase();

      const emailExists = await pool.query(checkEmailQuery, [newEmail]);

      if (emailExists.rows && emailExists.rows.length > 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Email already exists',
        });
      }

      const newUserPassword = password;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newUserPassword, salt);

      const insertUserValues = [
        firstName,
        lastName,
        newEmail,
        hashedPassword,
        gender,
        jobRole,
        department,
        address,
      ];

      const newUserResult = await pool.query(insertUserQuery, insertUserValues);
      if (!newUserResult.rows || newUserResult.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to create user',
        });
      }

      const user = newUserResult.rows[0];
      const { user_id, first_name, last_name, job_role, created_on } = user;

      return res.status(200).json({
        status: 'success',
        data: {
          message: `User ${first_name} ${last_name} created successfully`,
          userId: user_id,
          jobRole: job_role,
          createdOn: created_on,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // SIGN IN USER

  async signInUser(req: Request<SignInput>, res: Response): Promise<Response> {
    const { email, password } = req.body;
    try {
      const userEmail = email.toLowerCase();

      const userResponse = await pool.query(checkEmailQuery, [userEmail]);

      if (!userResponse.rows || userResponse.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid email or password',
        });
      }

      const user = userResponse.rows[0];
      const userPassword = password;

      const checkPassword = await bcrypt.compare(userPassword, user.password);

      if (!checkPassword) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid email or password',
        });
      }

      const { user_id, first_name, last_name, job_role } = user;

      const token = jwt.sign(
        {
          userId: user_id,
          firstName: first_name,
          lastName: last_name,
          email: userEmail,
          jobRole: job_role.trim().toLowerCase(),
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        status: 'success',
        data: {
          token,
          userId: user_id,
          firstName: first_name,
          lastName: last_name,
          jobRole: job_role,
        },
      });
    } catch (error: unknown) {
      return res.status(400).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }
}
