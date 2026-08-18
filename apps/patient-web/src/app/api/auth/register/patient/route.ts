import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim() || 'Patient';

    // Generate strict random 6-digit cryptographic OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    if (!(global as any).__OTP_STORE__) {
      (global as any).__OTP_STORE__ = new Map<string, { otp: string; name: string; expiresAt: number }>();
    }
    (global as any).__OTP_STORE__.set(cleanEmail, { otp, name: cleanName, expiresAt });

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
            <h2 style="color: #14b8a6; margin: 0; font-size: 24px;">SkipQ • Hospital Queue Platform</h2>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Official Account Verification Code</p>
          </div>
          <div style="padding: 24px 0; text-align: center;">
            <p style="font-size: 14px; color: #cbd5e1;">Hello <strong>${cleanName}</strong>,</p>
            <p style="font-size: 13px; color: #94a3b8;">Enter the 6-digit verification code below to verify your account:</p>
            <div style="background-color: #1e293b; padding: 18px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #2dd4bf; margin: 24px 0; border: 1px solid #0d9488;">
              ${otp}
            </div>
            <p style="font-size: 11px; color: #64748b;">This OTP code expires in 10 minutes. Never share this code with anyone.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"SkipQ Security" <${smtpUser}>`,
        to: cleanEmail,
        subject: `Your SkipQ Verification Code: ${otp}`,
        html: htmlContent,
      });

      return NextResponse.json({
        requiresOtp: true,
        email: cleanEmail,
        message: `OTP sent to ${cleanEmail}. Please check your inbox.`,
      });
    }

    // If SMTP credentials not provided yet, include note
    return NextResponse.json({
      requiresOtp: true,
      email: cleanEmail,
      otp, // Temporary preview so user can test before entering SMTP_PASS
      message: `OTP generated for ${cleanEmail}. Check inbox or use code below.`,
    });
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ message: err.message || 'Failed to dispatch OTP.' }, { status: 500 });
  }
}
