import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pool from '../../db';
import HttpError from '../../errorModel';
import { checkEmailQuery, insertUserQuery } from '../../queries/users.queries';
import { registerSchema, signInSchema } from '../../zodSchema';

dotenv.config();

// Create User

export const createUser = async (req: Request, res: Response) => {
  const newUserDetails = registerSchema.safeParse(req.body);

  if (newUserDetails.success) {
    try {
      const newEmail = newUserDetails.data.email.toLowerCase();

      const emailExists = await pool.query(checkEmailQuery, [newEmail]);

      if (emailExists.rows && emailExists.rows.length > 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Email already exists',
        });
      }

      const newUserPassword = newUserDetails.data.password;

      if (newUserPassword.trim().length < 6) {
        return res.status(400).json({
          status: 'error',
          error: new HttpError(
            'Password must be at least 6 characters long',
            400
          ),
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newUserPassword, salt);

      const insertUserValues = [
        newUserDetails.data.firstname,
        newUserDetails.data.lastname,
        newEmail,
        hashedPassword,
        newUserDetails.data.gender,
        newUserDetails.data.jobrole,
        newUserDetails.data.department,
        newUserDetails.data.address,
      ];

      const newUserResult = await pool.query(insertUserQuery, insertUserValues);
      if (!newUserResult.rows || newUserResult.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: new HttpError('Failed to create user', 400),
        });
      }

      const newUser = newUserResult.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: `User ${newUser.firstname} ${newUser.lastname} created successfully`,
          id: newUser.userID,
          jobrole: newUser.jobrole,
        },
      });
    } catch (error: unknown) {
      return res.status(400).json({
        status: 'error',
        error: new HttpError((error as string) || 'Server Error', 500),
      });
    }
  } else {
    return res.status(400).json({
      status: 'error',
      error: new HttpError('Invalid input', 400),
    });
  }
};

// SIGN IN USER

export const signInUser = async (req: Request, res: Response) => {
  const userPass = signInSchema.safeParse(req.body);

  if (userPass.success) {
    try {
      const userEmail = userPass.data.email.toLowerCase();

      const userResponse = await pool.query(checkEmailQuery, [userEmail]);

      if (!userResponse.rows || userResponse.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid email or password',
        });
      }

      const user = userResponse.rows[0];
      const userPassword = userPass.data.password;

      const checkPassword = await bcrypt.compare(userPassword, user.password);

      if (!checkPassword) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid email or password',
        });
      }

      const { userID, firstName, lastName, jobrole } = user;

      const token = jwt.sign(
        {
          userID,
          firstName,
          lastName,
          email: userEmail,
          jobrole,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        status: 'success',
        data: {
          token,
          id: userID,
          lastname: lastName,
          jobrole,
        },
      });
    } catch (error: unknown) {
      return res
        .status(400)
        .json(new HttpError((error as string) || 'Server Error', 500));
    }
  } else {
    return res.status(400).json({
      status: 'error',
      error: new HttpError('Invalid input', 400),
    });
  }
};
