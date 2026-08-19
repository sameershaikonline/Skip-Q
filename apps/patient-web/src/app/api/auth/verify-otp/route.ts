import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const store: Map<string, { otp: string; name: string; phone?: string; expiresAt: number }> =
      (global as any).__OTP_STORE__ || new Map();

    const storedData = store.get(cleanEmail);

    if (!storedData) {
      return NextResponse.json(
        { message: 'No active OTP found for this email. Please click Resend OTP.' },
        { status: 400 }
      );
    }

    if (Date.now() > storedData.expiresAt) {
      store.delete(cleanEmail);
      return NextResponse.json(
        { message: 'This OTP code has expired. Please request a new OTP code.' },
        { status: 400 }
      );
    }

    if (storedData.otp !== cleanOtp) {
      return NextResponse.json(
        { message: 'Incorrect verification OTP. Please enter the exact 6 digits.' },
        { status: 400 }
      );
    }

    const { name, phone } = storedData;

    return NextResponse.json({
      verified: true,
      message: 'OTP verified successfully! Please set your secure password.',
      email: cleanEmail,
      name,
      phone,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Verification failed.' }, { status: 500 });
  }
}
