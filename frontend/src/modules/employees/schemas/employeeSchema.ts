import { z } from 'zod';

const weekdaySchema = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

const employeeBaseSchema = z
  .object({
    first_name: z.string().trim().min(1, 'First name is required'),
    last_name: z.string().trim().min(1, 'Last name is required'),
    father_name: z.string().trim().min(1, 'Father name is required'),
    date_of_birth: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
    address: z.string().trim().min(1, 'Address is required'),
    phone: z.string().trim().min(1, 'Phone is required'),
    email: z.string().trim().email('Invalid email address'),
    salary: z.coerce.number().min(0, 'Salary cannot be negative'),
    work_days: z.array(weekdaySchema).min(1, 'At least one work day is required'),
    join_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Join date must be in YYYY-MM-DD format'),
    membership_type: z.enum(['permanent', 'contract', 'intern']),
    role: z.enum(['admin', 'manager', 'staff']),
    status: z.enum(['active', 'inactive']),
    username: z.string().trim().min(1, 'Username is required'),
    picture: z.instanceof(File).optional(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 8 characters',
        path: ['password'],
      });
    }
  });

export const getEmployeeFormSchema = (requirePassword: boolean) =>
  employeeBaseSchema.superRefine((data, ctx) => {
    if (requirePassword && !data.password?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required',
        path: ['password'],
      });
    }
  });

export type EmployeeFormSchema = z.infer<typeof employeeBaseSchema>;
