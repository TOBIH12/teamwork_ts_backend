import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import z from 'zod';
import pool from '../../db';
import { CheckEmailQuery, InsertUserQuery } from '../../queries/users.queries';
import { RegisterSchema, SignInSchema } from '../../zodSchema';

dotenv.config();

type RegisterInput = z.infer<typeof RegisterSchema>;
type SignInput = z.infer<typeof SignInSchema>;

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
      const NewEmail = email.toLowerCase();

      const EmailExists = await pool.query(CheckEmailQuery, [NewEmail]);

      if (EmailExists.rows && EmailExists.rows.length > 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Email already exists',
        });
      }

      const NewUserPassword = password;

      const Salt = await bcrypt.genSalt(10);
      const HashedPassword = await bcrypt.hash(NewUserPassword, Salt);

      const InsertUserValues = [
        firstname,
        lastname,
        NewEmail,
        HashedPassword,
        gender,
        jobrole,
        department,
        address,
      ];

      const NewUserResult = await pool.query(InsertUserQuery, InsertUserValues);
      if (!NewUserResult.rows || NewUserResult.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to create user',
        });
      }

      const NewUser = NewUserResult.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: `User ${NewUser.firstname} ${NewUser.lastname} created successfully`,
          id: NewUser.user_id,
          jobrole: NewUser.jobrole,
          created_on: NewUser.created_on,
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
      const UserEmail = email.toLowerCase();

      const UserResponse = await pool.query(CheckEmailQuery, [UserEmail]);

      if (!UserResponse.rows || UserResponse.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid email or password',
        });
      }

      const User = UserResponse.rows[0];
      const UserPassword = password;

      const CheckPassword = await bcrypt.compare(UserPassword, User.password);

      if (!CheckPassword) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid email or password',
        });
      }

      const { user_id, firstName, lastName, jobrole } = User;

      const Token = jwt.sign(
        {
          user_id,
          firstName,
          lastName,
          email: UserEmail,
          jobrole: jobrole.trim().toLowerCase(),
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        status: 'success',
        data: {
          Token,
          id: user_id,
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
