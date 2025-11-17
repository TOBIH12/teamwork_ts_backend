import HttpError from '../../errorModel';
import { Request, Response, NextFunction } from 'express';
import pool from '../../db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { checkEmailQuery, insertUserQuery } from '../../queries/users.queries';

dotenv.config();



// Admin/ Create User
// POST /api/v1/users/admin/createUser

export const createUser = async (req: Request, res: Response, next: NextFunction) => {

    try {
         let { firstname, lastname, email, password, gender, jobrole, department, address} = req.body;

         if(!firstname || !lastname || !email || !password || !gender || !jobrole || !department || !address) {
            return next(new HttpError('All fields are required', 422));
         }

         const newEmail = email.toLowerCase();

         const emailExists = await pool.query(checkEmailQuery, [newEmail]);
         console.log('Email exists check:', emailExists.rows);

         if(emailExists.rows && emailExists.rows.length > 0) {
            return next(new HttpError('Email already exists', 409));
         }

         if(password.trim().length < 6) {
            return next(new HttpError('Password must be at least 6 characters long', 422));
         }

         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

         

         const insertUserValues = [firstname, lastname, newEmail, hashedPassword, gender, jobrole, department, address];

         const newUserResult = await pool.query(insertUserQuery, insertUserValues);
         if(!newUserResult.rows || newUserResult.rows.length === 0) {
            return next(new HttpError('Failed to create user', 500));
         }

            const newUser = newUserResult.rows[0];

            res.status(201).json({

                status: 'success',
                data: {
                    message: `User ${newUser.firstname} ${newUser.lastname} created successfully`,
                    id: newUser.userID,
                    jobrole: newUser.jobrole
                }

                
            });
        
    } catch (error: any) {

        return next(new HttpError(error.message || 'Server Error', 500));
        
    }
};