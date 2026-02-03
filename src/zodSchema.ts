import { z } from 'zod';

// ------------- USER SCHEMAS -----------------

// User registration schema validation
export const registerSchema = z.object({
  firstname: z.string().min(2, 'First name is required').max(40),
  lastname: z.string().min(2, 'Last name is required').max(40),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  gender: z.enum(['male', 'female'], 'Gender must be either male or female'),
  jobrole: z.enum(
    ['admin', 'employee'],
    'Job role must be either admin or employee'
  ),
  department: z.string().min(1, 'Department is required'),
  address: z.string().min(1, 'Address is required'),
});

export const registrationSchemaDTO = z.object({
  body: registerSchema,
});

// User Signin schema validation

export const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const signInSchemaDTO = z.object({
  body: signInSchema,
});

// ------------------- GIF SCHEMAS --------------------

// Gif POST schema validation

export const postGifSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
});

export const postGifSchemaDTO = z.object({
  body: postGifSchema,
});

// GIF LIKE SCHEMA
export const gifLikeSchema = z.object({
  gifId: z
    .number('Invalid GIF ID')
    .int('Invalid GIF ID')
    .positive('Invalid GIF ID'),
});

export const gifLikeSchemaDTO = z.object({
  params: gifLikeSchema,
});

// GIF COMMENT SCHEMA
export const gifCommentSchema = z.object({
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long'),
});

export const gifCommentSchemaDTO = z.object({
  body: gifCommentSchema,
  params: z.object({
    gifId: z
      .number('Invalid GIF ID')
      .int('Invalid GIF ID')
      .positive('Invalid GIF ID'),
  }),
});
