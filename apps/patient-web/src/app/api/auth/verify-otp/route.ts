import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const store: Map<string, { otp: string; name: string; expiresAt: number }> =
      (global as any).__OTP_STORE__ || new Map();

    const storedData = store.get(cleanEmail);

    if (!storedData) {
      return NextResponse.json(
        { message: 'No active OTP found for this email. Please click Resend OTP.' },
        { status: 400 }
      );
    }

    // Check expiry (10 mins)
    if (Date.now() > storedData.expiresAt) {
      store.delete(cleanEmail);
      return NextResponse.json(
        { message: 'This OTP has expired. Please request a new OTP code.' },
        { status: 400 }
      );
    }

    // STRICT CHECK: Must match the exact generated OTP
    if (storedData.otp !== cleanOtp) {
      return NextResponse.json(
        { message: 'Incorrect OTP code! Please enter the exact 6-digit code sent to your email.' },
        { status: 400 }
      );
    }

    // Valid OTP — consume it so it cannot be reused
    const name = storedData.name || 'Patient';
    store.delete(cleanEmail);

    const token = `jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      message: 'Email verified successfully!',
      user: { id: `user_${Date.now()}`, name, email: cleanEmail, role: 'PATIENT' },
      token,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Verification failed.' }, { status: 500 });
  }
}
