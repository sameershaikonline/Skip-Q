import { NextResponse } from 'next/server';
import { prisma } from '@healthcare/database';
import * as crypto from 'crypto';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { action, email, otp, newPassword } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. ACTION: SEND OTP FOR PASSWORD RESET
    if (action === 'SEND_OTP') {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        return NextResponse.json(
          { message: 'No registered user found with this email address.' },
          { status: 404 }
        );
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;

      if (!(global as any).__RESET_OTP_STORE__) {
        (global as any).__RESET_OTP_STORE__ = new Map<string, { otp: string; expiresAt: number }>();
      }
      (global as any).__RESET_OTP_STORE__.set(cleanEmail, { otp: generatedOtp, expiresAt });

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
              <h2 style="color: #ef4444; margin: 0; font-size: 24px;">🔒 Skip-Q Password Reset</h2>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Security Verification Code</p>
            </div>
            <div style="padding: 24px 0; text-align: center;">
              <p style="font-size: 14px; color: #cbd5e1;">You requested to reset your password for Skip-Q.</p>
              <p style="font-size: 13px; color: #94a3b8;">Enter the 6-digit verification code below:</p>
              <div style="background-color: #1e293b; padding: 18px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #f87171; margin: 24px 0; border: 1px solid #dc2626;">
                ${generatedOtp}
              </div>
              <p style="font-size: 11px; color: #64748b;">If you did not request this, please ignore this email.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Skip-Q Security" <${smtpUser}>`,
          to: cleanEmail,
          subject: `Your Skip-Q Password Reset Code: ${generatedOtp}`,
          html: htmlContent,
        });
      }

      return NextResponse.json({
        message: `Password reset OTP dispatched to ${cleanEmail}. Check your inbox.`,
        otp: smtpUser && smtpPass ? undefined : generatedOtp,
      });
    }

    // 2. ACTION: VERIFY OTP AND RESET NEW PASSWORD
    if (action === 'RESET_PASSWORD') {
      if (!otp || !newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { message: 'Valid OTP and a password with at least 6 characters are required.' },
          { status: 400 }
        );
      }

      const store: Map<string, { otp: string; expiresAt: number }> =
        (global as any).__RESET_OTP_STORE__ || new Map();

      const storedData = store.get(cleanEmail);

      if (!storedData) {
        return NextResponse.json(
          { message: 'No active password reset request found. Please request a new OTP.' },
          { status: 400 }
        );
      }

      if (Date.now() > storedData.expiresAt) {
        store.delete(cleanEmail);
        return NextResponse.json(
          { message: 'This reset OTP has expired. Please request a new code.' },
          { status: 400 }
        );
      }

      if (storedData.otp !== otp.trim()) {
        return NextResponse.json(
          { message: 'Incorrect OTP code! Please enter the exact 6 digits.' },
          { status: 400 }
        );
      }

      // Update password in database
      const passwordHash = hashPassword(newPassword);
      await prisma.user.update({
        where: { email: cleanEmail },
        data: { password: passwordHash },
      });

      store.delete(cleanEmail);

      return NextResponse.json({
        message: 'Your password has been reset successfully! Please sign in with your new password.',
      });
    }

    return NextResponse.json({ message: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    console.error('Forgot Password API Error:', err);
    return NextResponse.json({ message: err.message || 'Failed to process request.' }, { status: 500 });
  }
}
