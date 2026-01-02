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
      firstname,
      lastname,
      email,
      password,
      gender,
      jobrole,
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
        firstname,
        lastname,
        newEmail,
        hashedPassword,
        gender,
        jobrole,
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

      const { userID, firstName, lastName, jobrole } = user;

      const token = jwt.sign(
        {
          userID,
          firstName,
          lastName,
          email: userEmail,
          jobrole: jobrole.trim().toLowerCase(),
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        status: 'success',
        data: {
          token,
          id: userID,
          firstName,
          lastname: lastName,
          jobrole,
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
