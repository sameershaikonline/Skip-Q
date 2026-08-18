'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams?.get('email') || searchParams?.get('phone') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter all 6 digits of your email OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid Email Verification OTP code.');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMessage('');

    try {
      const res = await fetch(`${BACKEND}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend Email OTP');
      setResendMessage(data.message || 'A new 6-digit OTP code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend Email OTP');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-2xl font-bold">
            ✉️
          </div>
          <h1 className="text-2xl font-black text-white">Verify Email OTP</h1>
          <p className="text-xs text-slate-400">
            Enter the 6-digit verification code sent to{' '}
            <strong className="text-white font-mono">{email || 'your email address'}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold text-center">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-400 font-semibold text-center">
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
              6-DIGIT EMAIL OTP
            </label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full p-3 bg-slate-950 border border-teal-500/40 rounded-xl text-center font-mono text-2xl text-teal-400 tracking-widest focus:outline-none focus:border-teal-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-teal-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying OTP...' : '✅ Verify Email OTP & Continue'}
          </button>
        </form>

        <div className="text-center text-xs space-y-2 pt-2 border-t border-slate-800">
          <p className="text-slate-400">Didn't receive the OTP email?</p>
          <button onClick={handleResend} className="text-teal-400 font-bold hover:underline">
            🔄 Resend OTP to Email
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400 text-xs">Loading OTP page...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
