import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // 1. Fetch persistent User record from Supabase PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !user.emailOtp) {
      return NextResponse.json(
        { message: 'No active OTP found for this email. Please click Resend OTP.' },
        { status: 400 }
      );
    }

    // 2. Check Expiration
    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return NextResponse.json(
        { message: 'This OTP has expired. Please click Resend OTP to receive a new code.' },
        { status: 400 }
      );
    }

    // 3. Check OTP Match
    if (user.emailOtp !== cleanOtp) {
      return NextResponse.json(
        { message: 'Invalid OTP code. Please enter the correct 6-digit code.' },
        { status: 400 }
      );
    }

    // 4. Generate Session Token
    const token = `jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // 5. Return success with token and user object
    return NextResponse.json({
      verified: true,
      message: 'OTP verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name || 'Patient',
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'PATIENT',
      },
    });
  } catch (err: any) {
    console.error('Verify OTP Error:', err);
    return NextResponse.json({ message: err.message || 'Verification failed.' }, { status: 500 });
  }
}
