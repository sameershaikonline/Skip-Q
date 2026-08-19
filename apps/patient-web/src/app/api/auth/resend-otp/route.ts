import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    (global as any).__OTP_STORE__ = (global as any).__OTP_STORE__ || new Map();
    (global as any).__OTP_STORE__.set(email.toLowerCase(), { otp, name: 'Patient', expiresAt });

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"Skip-Q Healthcare" <${smtpUser}>`,
        to: email,
        subject: `Your Skip-Q Verification OTP: ${otp}`,
        text: `Your Skip-Q verification OTP is: ${otp}. It expires in 10 minutes.`,
      });
    }

    return NextResponse.json({
      message: (smtpUser && smtpPass) ? `New OTP sent to ${email}.` : `New OTP generated: ${otp}`,
      otp: (!smtpUser || !smtpPass) ? otp : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Failed to resend OTP' }, { status: 500 });
  }
}
