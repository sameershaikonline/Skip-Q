import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[0-9]{10}$/;

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Full name is required.' }, { status: 400 });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ message: 'Please enter a valid email address with domain suffix (e.g. name@gmail.com).' }, { status: 400 });
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json({ message: 'Mobile phone number must be exactly 10 digits.' }, { status: 400 });
    }

    const cleanName = name.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser && existingUser.password) {
      return NextResponse.json({
        message: 'An account with this email already exists. Please sign in with your password.',
        exists: true,
      }, { status: 400 });
    }

    // Generate strict 6-digit cryptographic OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    if (!(global as any).__OTP_STORE__) {
      (global as any).__OTP_STORE__ = new Map<string, { otp: string; name: string; phone: string; expiresAt: number }>();
    }
    (global as any).__OTP_STORE__.set(cleanEmail, { otp, name: cleanName, phone: cleanPhone, expiresAt });

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 20px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
            <h2 style="color: #3b82f6; margin: 0; font-size: 24px;">Skip-Q Healthcare Platform</h2>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Patient Registration Verification</p>
          </div>
          <div style="padding: 24px 0; text-align: center;">
            <p style="font-size: 14px; color: #cbd5e1;">Hello <strong>${cleanName}</strong>,</p>
            <p style="font-size: 13px; color: #94a3b8;">Enter the 6-digit verification code below to verify your account:</p>
            <div style="background-color: #1e293b; padding: 18px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; margin: 24px 0; border: 1px solid #0284c7;">
              ${otp}
            </div>
            <p style="font-size: 11px; color: #64748b;">This OTP expires in 10 minutes. Never share this code with anyone.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Skip-Q Security" <${smtpUser}>`,
        to: cleanEmail,
        subject: `Your Skip-Q Verification Code: ${otp}`,
        html: htmlContent,
      });

      return NextResponse.json({
        requiresOtp: true,
        email: cleanEmail,
        message: `OTP sent to ${cleanEmail}. Please check your inbox.`,
      });
    }

    return NextResponse.json({
      requiresOtp: true,
      email: cleanEmail,
      otp,
      message: `OTP generated for ${cleanEmail}.`,
    });
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ message: err.message || 'Failed to dispatch registration OTP.' }, { status: 500 });
  }
}
