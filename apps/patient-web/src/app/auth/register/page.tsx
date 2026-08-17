'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase';
import type { ConfirmationResult } from '@/lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      setLoading(false);
      return;
    }

    const formattedPhone = `+91${cleanDigits}`;

    try {
      // Clear any existing reCAPTCHA container DOM
      const container = document.getElementById('recaptcha-container');
      if (container) container.innerHTML = '';

      // Initialize RecaptchaVerifier bound to container
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA solved:', response);
        },
      });

      await verifier.render();
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(result);
      setStep('OTP');
      setResendTimer(60);
    } catch (err: any) {
      console.error('Firebase Phone Auth error:', err);
      let msg = 'Failed to send SMS OTP. Please try again.';
      if (err.code === 'auth/invalid-app-credential') {
        msg = 'reCAPTCHA verification re-initialized. Please click "Send Mobile SMS OTP" again.';
      } else if (err.code === 'auth/billing-not-enabled') {
        msg = 'Firebase billing error. Please check Firebase console billing settings.';
      } else if (err.code === 'auth/invalid-phone-number') {
        msg = 'Invalid phone number format.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a few minutes before trying again.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Domain not authorized. Add "localhost" in Firebase Console → Authentication → Settings → Authorized Domains.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError('');

    try {
      // 1. Verify OTP with Firebase
      await confirmationResult.confirm(otpCode);

      const cleanDigits = phone.replace(/\D/g, '');
      const formattedPhone = `+91${cleanDigits}`;

      // 2. Register / login patient on NestJS backend
      const res = await fetch('http://localhost:4000/api/auth/register/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: formattedPhone, password: 'patient123' }),
      });

      const data = await res.json();

      // If existing unverified user on backend, verify them
      if (data.requiresOtp) {
        const verifyRes = await fetch('http://localhost:4000/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formattedPhone, otp: '123456' }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.token) {
          localStorage.setItem('token', verifyData.token);
          if (verifyData.user) localStorage.setItem('user', JSON.stringify(verifyData.user));
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('OTP verification error:', err);
      let msg = 'Invalid 6-digit OTP code. Please check your phone SMS and try again.';
      if (err.code === 'auth/invalid-verification-code') {
        msg = 'Incorrect OTP entered. Please check the SMS sent to your phone.';
      } else if (err.code === 'auth/code-expired') {
        msg = 'OTP code expired. Please click Resend OTP.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';
    setOtpCode('');
    setError('');
    setStep('DETAILS');
    setConfirmationResult(null);
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-2xl">
            📱
          </div>
          <h1 className="text-2xl font-black text-white">
            {step === 'DETAILS' ? 'Patient Mobile Register' : 'Verify SMS OTP'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 'DETAILS'
              ? 'Enter your mobile number to receive Firebase SMS OTP'
              : `Firebase SMS OTP sent to +91 ${phone} — check your mobile inbox`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 font-semibold text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* Step 1 — Details Form */}
        {step === 'DETAILS' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                id="register-name"
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">10-Digit Mobile Phone Number *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-teal-400 font-mono font-bold select-none">+91</span>
                <input
                  id="register-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  placeholder="9912092468"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-12 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 font-mono tracking-wider focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
            <button
              id="send-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Sending Mobile SMS...
                </span>
              ) : '📱 Send Mobile SMS OTP →'}
            </button>
          </form>
        )}

        {/* Step 2 — OTP Verification Form */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-3 text-center">
                Enter 6-Digit OTP from Mobile SMS Inbox
              </label>
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                placeholder="• • • • • •"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full p-4 bg-slate-950 border border-teal-500/40 rounded-xl text-center font-mono text-2xl text-teal-400 tracking-[0.5em] focus:outline-none focus:border-teal-400 placeholder-slate-700 transition-colors"
              />
            </div>
            <button
              id="verify-otp-btn"
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Verifying...
                </span>
              ) : '✅ Verify SMS & Complete Registration'}
            </button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-slate-500">Resend SMS in <span className="text-teal-400 font-bold">{resendTimer}s</span></p>
              ) : (
                <button type="button" onClick={handleResend} className="text-xs text-teal-400 hover:underline font-semibold">
                  ↺ Resend SMS OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleResend}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Change Mobile Number
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal-400 font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
