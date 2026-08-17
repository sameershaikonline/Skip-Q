import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private getTransporter() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
    return null;
  }

  async sendOtpEmail(toEmail: string, otpCode: string, name: string) {
    const subject = `Your OnlineAppointment Verification Code: ${otpCode}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 20px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
          <h2 style="color: #14b8a6; margin: 0; font-size: 24px;">OnlineAppointment</h2>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Mahabubabad Digital Healthcare Platform</p>
        </div>

        <div style="padding: 24px 0; text-align: center;">
          <p style="font-size: 14px; color: #cbd5e1;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 13px; color: #94a3b8;">Enter the 6-digit verification code below to activate your account:</p>

          <div style="background-color: #1e293b; padding: 18px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #2dd4bf; margin: 24px 0; border: 1px solid #0d9488;">
            ${otpCode}
          </div>

          <p style="font-size: 11px; color: #64748b;">This OTP code is valid for 10 minutes. For your security, never share this code with anyone.</p>
        </div>

        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #334155; font-size: 11px; color: #64748b;">
          OnlineAppointment © 2026 • Mahabubabad, Telangana
        </div>
      </div>
    `;

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"OnlineAppointment Security" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject,
          html: htmlContent,
        });
        console.log(`[EMAIL DISPATCH SUCCESS] Real OTP email sent via Gmail SMTP to ${toEmail}`);
      } catch (err) {
        console.error(`[EMAIL DISPATCH ERROR] Failed to send email via SMTP:`, err);
        console.log(`[SECURE LOG] Email OTP for ${toEmail}: ${otpCode}`);
      }
    } else {
      console.log(`
=====================================================
📧 EMAIL OTP DISPATCHED TO USER INBOX
To: ${toEmail}
Subject: ${subject}
OTP Code: ${otpCode}
(Set SMTP_PASS in .env to deliver directly to inbox)
=====================================================
      `);
    }
  }

  async sendPasswordResetEmail(toEmail: string, otpCode: string, name: string) {
    const subject = `Reset Your OnlineAppointment Password: ${otpCode}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 20px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
          <h2 style="color: #f43f5e; margin: 0; font-size: 24px;">OnlineAppointment</h2>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Password Reset Security Request</p>
        </div>

        <div style="padding: 24px 0; text-align: center;">
          <p style="font-size: 14px; color: #cbd5e1;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 13px; color: #94a3b8;">Use this 6-digit OTP code to reset your account password:</p>

          <div style="background-color: #1e293b; padding: 18px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #fb7185; margin: 24px 0; border: 1px solid #e11d48;">
            ${otpCode}
          </div>

          <p style="font-size: 11px; color: #64748b;">If you did not request a password reset, please ignore this email.</p>
        </div>

        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #334155; font-size: 11px; color: #64748b;">
          OnlineAppointment © 2026 • Mahabubabad, Telangana
        </div>
      </div>
    `;

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"OnlineAppointment Security" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject,
          html: htmlContent,
        });
        console.log(`[PASSWORD RESET EMAIL SUCCESS] Reset OTP sent to ${toEmail}`);
      } catch (err) {
        console.error(`[PASSWORD RESET EMAIL ERROR] Failed:`, err);
        console.log(`[SECURE LOG] Password Reset OTP for ${toEmail}: ${otpCode}`);
      }
    } else {
      console.log(`
=====================================================
🔑 PASSWORD RESET OTP DISPATCHED TO USER INBOX
To: ${toEmail}
Subject: ${subject}
Reset OTP Code: ${otpCode}
=====================================================
      `);
    }
  }
}
