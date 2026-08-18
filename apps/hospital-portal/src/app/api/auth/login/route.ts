import { NextResponse } from 'next/server';
import { findHospitalAccountByEmail } from '@/lib/authStore';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const account = findHospitalAccountByEmail(cleanEmail);

    // If registered in serverless store
    if (account) {
      if (account.passwordHash !== password) {
        return NextResponse.json({ message: 'Invalid password. Please check your credentials.' }, { status: 401 });
      }

      if (account.status === 'SUSPENDED') {
        return NextResponse.json({ message: 'This hospital account has been suspended by Super Admin.' }, { status: 403 });
      }

      const token = `hosp_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      return NextResponse.json({
        message: 'Login successful',
        token,
        user: {
          id: account.id,
          name: account.hospitalName,
          email: account.email,
          role: 'HOSPITAL_ADMIN',
          hospitalId: account.id,
        },
      });
    }

    // Default Super Admin created / Onboarded hospital check fallback
    return NextResponse.json({
      message: 'Hospital account not found. Only emails onboarded by Super Admin can access this portal.',
      needsLocalCheck: true,
    }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Authentication error' }, { status: 500 });
  }
}
