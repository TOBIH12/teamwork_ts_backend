import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import z from 'zod';
import pool from '../../db';
import cloudinaryConfig from '../../utils/cloudinaryConfig';
import {
  checkEmailQuery,
  fetchUserByIdQuery,
  insertUserQuery,
  updateUserQuery,
  updatePasswordQuery,
  updateUserImgquery,
  deleteUserQuery,
  getUsersQuery,
  getUsersCount,
  updateUserRoleQuery,
  saveResetTokenQuery,
} from '../../queries/users.queries';
import { registerSchema, signInSchema } from '../../zodSchema';
import { UserRoles } from '../../utils/userInterface';
import { sendEmail, emailTemplate } from '../../utils/email';

dotenv.config();

type RegisterInput = z.infer<typeof registerSchema>;
type SignInput = z.infer<typeof signInSchema>;

export default class UserControllers {
  // Create User
  async createUser(
    req: Request<RegisterInput>,
    res: Response
  ): Promise<Response> {
    try {
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
    try {
      const { email, password } = req.body;
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
          jobRole: job_role,
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
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // Forgot Password
  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const userEmail = email.toLowerCase();

      const userResponse = await pool.query(checkEmailQuery, [userEmail]);

      if (!userResponse.rows || userResponse.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Email does not exist',
        });
      }

      const { user_id } = userResponse.rows[0];

      const token = crypto.randomBytes(20).toString('hex');
      const dbResetToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const resetTimeInMilliseconds = Date.now() + 300000;
      const validDbTime = new Date(resetTimeInMilliseconds).toISOString();

      const updateDBToken = await pool.query(saveResetTokenQuery, [
        dbResetToken,
        validDbTime,
        userEmail,
      ]);

      if (!updateDBToken.rows || updateDBToken.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'could not update database token',
        });
      }

      const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${user_id}/${token}`;

      const emailOptions = {
        to: userEmail,
        subject: 'Password Reset Request',
        html: emailTemplate({
          content: `You requested a password reset. Click the button below to reset your password. This link will expire in 5 minutes.`,
          buttonUrl: resetUrl,
          buttonText: 'Reset Password',
        }),
      };

      await sendEmail(emailOptions).catch((err) => {
        pool.query(saveResetTokenQuery, ['-1', validDbTime, user_id]);
        throw new Error(`Error sending email. Please try again later: ${err}`);
      });

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'A password reset link has been sent to your email address',
          token,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // Reset Password
  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { newPassword, confirmNewPassword } = req.body;
      const { userId, token } = req.params;

      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const dbTokenUserLookUp = await pool.query(fetchUserByIdQuery, [userId]);

      if (!dbTokenUserLookUp.rows || dbTokenUserLookUp.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: `Some problem occured with finding user.`,
        });
      }

      const { user_id, reset_password_token, reset_password_token_expires } =
        dbTokenUserLookUp.rows[0];

      const currentTimeInMilliseconds = Date.now();
      const dbFormatCurrentTime = new Date(
        currentTimeInMilliseconds
      ).toISOString();

      if (reset_password_token_expires > dbFormatCurrentTime) {
        return res.status(403).json({
          status: 'error',
          error: 'Sorry, This reset password link has expired.',
        });
      }

      if (reset_password_token !== hashedToken) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid reset token',
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          status: 'error',
          error: 'The new password and confirm password do not match.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedNewPassword = await pool.query(updatePasswordQuery, [
        hashedPassword,
        user_id,
      ]);

      if (!updatedNewPassword) {
        return res.status(400).json({
          status: 'error',
          error: 'Could not update password. please try again later.',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message:
            'Password successfully updated. Return to login page to continue.',
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // Get Users
  async getUsers(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.params.page);
      const limit = 10;

      const offset = (page - 1) * limit;

      const usersCountResult = await pool.query(getUsersCount);
      const totalUsersCount = usersCountResult.rows[0].total_count;

      const usersResponse = await pool.query(getUsersQuery, [limit, offset]);

      const users = usersResponse.rows;

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Users fetched successfully',
          usersCount: parseInt(totalUsersCount),
          users,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // GET USER BY ID
  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      const userResponse = await pool.query(fetchUserByIdQuery, [userId]);

      if (
        !userResponse ||
        !userResponse.rows ||
        userResponse.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'User not found',
        });
      }

      const {
        user_id,
        first_name,
        last_name,
        email,
        gender,
        job_role,
        department,
        address,
        created_on,
      } = userResponse.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'User fetched successfully',
          userId: user_id,
          firstName: first_name,
          lastName: last_name,
          email,
          gender,
          jobRole: job_role,
          department,
          address,
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

  // Edit User details
  async editUserDetails(req: Request, res: Response): Promise<Response> {
    try {
      const reqUserId = req.user?.user_id;

      const { firstName, lastName, gender, department, address } = req.body;

      const updateUserValues = [
        firstName,
        lastName,
        gender,
        department,
        address,
      ];

      const updatedUser = await pool.query(updateUserQuery, [
        ...updateUserValues,
        reqUserId,
      ]);

      if (!updatedUser.rows || updatedUser.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to update user',
        });
      }

      const updatedUserInfo = updatedUser.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'User details updated successfully',
          userId: updatedUserInfo.user_id,
          firstName: updatedUserInfo.first_name,
          lastName: updatedUserInfo.last_name,
          gender: updatedUserInfo.gender,
          department: updatedUserInfo.department,
          address: updatedUserInfo.address,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // Change Password
  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const reqUserId = req.user?.user_id;

      const user = await pool.query(fetchUserByIdQuery, [reqUserId]);

      if (!user.rows[0] || user.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'User not found',
        });
      }

      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      const checkPassword = await bcrypt.compare(
        currentPassword,
        user.rows[0].password
      );

      if (!checkPassword) {
        return res.status(400).json({
          status: 'error',
          error: 'Current password is incorrect',
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          status: 'error',
          error: 'New password and confirm new password do not match',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      const updatedPassword = await pool.query(updatePasswordQuery, [
        hashedNewPassword,
        reqUserId,
      ]);

      if (!updatedPassword) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to update password',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Password updated successfully',
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // Edit User Image
  async uploadUserImage(req: Request, res: Response): Promise<Response> {
    try {
      const reqUserId = req.user?.user_id;

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          error: 'No image file uploaded',
        });
      }

      const userImg = req.file;

      const userImgUrl = await cloudinaryConfig.uploader.upload(userImg.path, {
        resource_type: 'auto',
        folder: 'avatars',
        public_id: `${Date.now()}`,
      });

      if (!userImgUrl || !userImgUrl.secure_url) {
        return res.status(500).json({
          status: 'error',
          error: 'Failed to upload user image to Cloudinary',
        });
      }

      const updatedUserImg = await pool.query(updateUserImgquery, [
        userImgUrl.secure_url,
        reqUserId,
      ]);

      if (!updatedUserImg || updatedUserImg.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to update user image',
        });
      }

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'User image updated successfully',
          userId: reqUserId,
          userImgUrl: userImgUrl.secure_url,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // Update User Role
  async updateUserRole(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const { role } = req.params;

      const user = await pool.query(fetchUserByIdQuery, [userId]);

      if (!user || !user.rows[0] || user.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'User not found',
        });
      }

      const { job_role, user_id } = user.rows[0];

      if (job_role === UserRoles.SuperAdmin) {
        return res.status(403).json({
          status: 'error',
          error: `Cannot change super admin's role`,
        });
      }

      if (!Object.values(UserRoles).includes(role as UserRoles)) {
        return res.status(400).json({
          status: 'error',
          error: 'The requested role does not exist.',
        });
      }

      if (role === job_role) {
        return res.status(400).json({
          status: 'error',
          error: `User is already an ${role}`,
        });
      }

      const updatedUser = await pool.query(updateUserRoleQuery, [
        role,
        user_id,
      ]);

      if (!updatedUser || updatedUser.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to update user role',
        });
      }

      const { first_name, last_name } = updatedUser.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: `${first_name} ${last_name}'s role has been updated to ${role}`,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }

  // Delete User
  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      const user = await pool.query(fetchUserByIdQuery, [userId]);

      if (!user || !user.rows[0] || user.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'User not found',
        });
      }

      const { user_id, first_name, last_name, job_role } = user.rows[0];

      if (job_role === UserRoles.SuperAdmin) {
        return res.status(403).json({
          status: 'error',
          error: 'Super admin cannot be deleted',
        });
      }

      const deleteUser = await pool.query(deleteUserQuery, [user_id]);

      if (!deleteUser || deleteUser.rows.length === 0) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to delete user',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: `Successfully deleted ${first_name} ${last_name}`,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        status: 'error',
        error: (error as string) || 'Server Error',
      });
    }
  }
}
