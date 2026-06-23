import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().optional(),
  phoneNum: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
});

const ForgotPasswordSchema = z.object({
  email: z.string().optional(),
  phoneNum: z.string().optional(),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const RegisterSchema = z.object({
    email: z.email('Invalid email format').optional(),
    phoneNum: z.string(),
    accName: z.string().min(1, 'Account name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    roleId: z.string().min(1, 'Role is required'),
});

const FirstTimeLoginSchema = z.object({
    email: z.email('Invalid email format').optional(),
    phoneNum: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    token: z.string().min(1, 'Token is required'),
});

export { 
    LoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    RegisterSchema,
    FirstTimeLoginSchema
};