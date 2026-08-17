import { z } from 'zod';

export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum HospitalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  IN_QUEUE = 'IN_QUEUE',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SKIPPED = 'SKIPPED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Zod Auth Validation Schemas
export const RegisterPatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterHospitalSchema = z.object({
  hospitalName: z.string().min(3, 'Hospital name required'),
  adminName: z.string().min(2, 'Admin name required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().min(5, 'Address required'),
  licenseNumber: z.string().min(3, 'License number required'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterPatientInput = z.infer<typeof RegisterPatientSchema>;
export type RegisterHospitalInput = z.infer<typeof RegisterHospitalSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
