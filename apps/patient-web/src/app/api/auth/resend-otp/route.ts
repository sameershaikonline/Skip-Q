import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: 'Email is required.' }, { status: 400 });

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        emailOtp: otp,
        otpExpiresAt: expiresAt,
      },
      create: {
        name: 'Patient',
        email: cleanEmail,
        password: 'PENDING_REGISTRATION',
        emailOtp: otp,
        otpExpiresAt: expiresAt,
        role: 'PATIENT',
        isVerified: false,
      },
    });

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"Skip-Q Security" <${smtpUser}>`,
          to: cleanEmail,
          subject: `Your Skip-Q Verification OTP: ${otp}`,
          text: `Your Skip-Q verification OTP is: ${otp}. It expires in 15 minutes.`,
        });
      } catch (err) {
        console.warn('Mail send failed:', err);
      }
    }

    return NextResponse.json({
      message: `Fresh OTP sent to ${cleanEmail}. Check your inbox.`,
      otp: (!smtpUser || !smtpPass) ? otp : undefined,
    });
  } catch (err: any) {
    console.error('Resend OTP Error:', err);
    return NextResponse.json({ message: 'Failed to resend OTP.' }, { status: 500 });
  }
}
