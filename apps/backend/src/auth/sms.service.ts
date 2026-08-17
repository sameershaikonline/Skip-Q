import { Injectable, Logger } from '@nestjs/common';
import twilio = require('twilio');

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: twilio.Twilio | null = null;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken && accountSid !== 'YOUR_TWILIO_ACCOUNT_SID') {
      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio SMS service initialized successfully');
    }
  }

  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const fast2smsApiKey = process.env.FAST2SMS_API_KEY;

    // 1. Fast2SMS (Indian Gateway — Free signup credits)
    if (fast2smsApiKey && fast2smsApiKey !== 'YOUR_FAST2SMS_API_KEY') {
      try {
        const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsApiKey}&route=otp&variables_values=${otp}&numbers=${cleanDigits}`;
        const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
        const data = await res.json();
        if (data.return) {
          this.logger.log(`Fast2SMS OTP sent successfully to +91${cleanDigits}`);
          return true;
        } else {
          this.logger.error(`Fast2SMS error: ${data.message || JSON.stringify(data)}`);
        }
      } catch (err: any) {
        this.logger.error(`Fast2SMS fetch error: ${err.message}`);
      }
    }

    // 2. Twilio Gateway
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    if (this.twilioClient && fromNumber && fromNumber !== 'YOUR_TWILIO_PHONE_NUMBER') {
      try {
        await this.twilioClient.messages.create({
          body: `Your OnlineAppointment verification code is: ${otp}. Valid for 10 minutes.`,
          from: fromNumber,
          to: phone.startsWith('+') ? phone : `+91${cleanDigits}`,
        });
        this.logger.log(`Twilio SMS sent successfully to ${phone}`);
        return true;
      } catch (error: any) {
        this.logger.error(`Twilio SMS error: ${error.message}`);
      }
    }

    this.logger.warn(`[SMS DISPATCH SKIPPED] OTP ${otp} for +91${cleanDigits} — No active SMS Gateway key found.`);
    return false;
  }
}
