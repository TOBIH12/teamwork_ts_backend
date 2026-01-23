import { z } from 'zod';

// ------------- USER SCHEMAS -----------------

// User registration schema validation
export const RegisterSchema = z.object({
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

export const RegistrationSchemaDTO = z.object({
  body: RegisterSchema,
});

// User Signin schema validation

export const SignInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const SignInSchemaDTO = z.object({
  body: SignInSchema,
});

// ------------------- GIF SCHEMAS --------------------

// Gif POST schema validation

export const PostGifSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
});

export const PostGifSchemaDTO = z.object({
  body: PostGifSchema,
});

// GIF LIKE SCHEMA
export const GifLikeSchema = z.object({
  gifId: z
    .number('Invalid GIF ID')
    .int('Invalid GIF ID')
    .positive('Invalid GIF ID'),
});

export const GifLikeSchemaDTO = z.object({
  params: GifLikeSchema,
});

// GIF COMMENT SCHEMA
export const GifCommentSchema = z.object({
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long'),
});

export const GifCommentSchemaDTO = z.object({
  body: GifCommentSchema,
  params: z.object({
    gifId: z
      .number('Invalid GIF ID')
      .int('Invalid GIF ID')
      .positive('Invalid GIF ID'),
  }),
});
