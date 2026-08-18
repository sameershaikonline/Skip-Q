import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// In-memory / temporary store for OTPs in serverless runtime
const otpStore = new Map<string, { otp: string; name: string; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email is required.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore.set(email.toLowerCase(), { otp, name: name || 'Patient', expiresAt });
    (global as any).__OTP_STORE__ = (global as any).__OTP_STORE__ || new Map();
    (global as any).__OTP_STORE__.set(email.toLowerCase(), { otp, name: name || 'Patient', expiresAt });

    // Send via Gmail SMTP if configured
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
            <h2 style="color: #14b8a6; margin: 0; font-size: 24px;">SkipQ / OnlineAppointment</h2>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Digital Healthcare Appointment Platform</p>
          </div>
          <div style="padding: 24px 0; text-align: center;">
            <p style="font-size: 14px; color: #cbd5e1;">Hello <strong>${name || 'Patient'}</strong>,</p>
            <p style="font-size: 13px; color: #94a3b8;">Your 6-digit verification OTP is:</p>
            <div style="background-color: #1e293b; padding: 18px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #2dd4bf; margin: 24px 0; border: 1px solid #0d9488;">
              ${otp}
            </div>
            <p style="font-size: 11px; color: #64748b;">This OTP code is valid for 10 minutes.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"SkipQ Healthcare" <${smtpUser}>`,
        to: email,
        subject: `Your SkipQ Verification OTP: ${otp}`,
        html: htmlContent,
      });
    }

    return NextResponse.json({
      requiresOtp: true,
      email,
      otp: (!smtpUser || !smtpPass) ? otp : undefined, // Include OTP for instant preview if SMTP not yet set
      message: (smtpUser && smtpPass)
        ? `OTP sent to ${email}. Please check your inbox.`
        : `OTP generated: ${otp} (Set SMTP_PASS in Vercel to send real emails to inbox)`,
    });
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ message: err.message || 'Failed to send OTP.' }, { status: 500 });
  }
}
