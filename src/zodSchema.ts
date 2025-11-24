import { z } from 'zod';

// User registration schema validation
export const registerSchema = z.object({
  firstname: z.string().min(2, 'First name is required'),
  lastname: z.string().min(2, 'Last name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  gender: z.string().min(4, 'Gender is required'),
  jobrole: z.enum(
    ['admin', 'employee'],
    'Job role must be either admin or employee'
  ),
  department: z.string().min(1, 'Department is required'),
  address: z.string().min(1, 'Address is required'),
});

// User Signin schema validation

export const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
