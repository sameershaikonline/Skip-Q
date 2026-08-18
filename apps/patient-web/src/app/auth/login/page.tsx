'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [timer, setTimer] = useState(0);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const getUrl = (path: string) => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    return base ? `${base}${path}` : path;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPreviewOtp(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Account not found. Please register first.');

      setStep('OTP');
      setTimer(60);
      if (data.otp) setPreviewOtp(data.otp);
      setSuccess(data.message || `OTP sent to ${email}. Check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim().length !== 6) {
      setError('Please enter all 6 digits of the OTP code from your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Incorrect OTP code.');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please enter the exact code sent to your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(getUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setTimer(60);
      if (data.otp) setPreviewOtp(data.otp);
      setSuccess(data.message || `New OTP sent to ${email}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-2xl">
            ✉️
          </div>
          <h1 className="text-2xl font-black text-white">
            {step === 'FORM' ? 'Sign In' : 'Verify Email OTP'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 'FORM'
              ? 'Enter your email to receive a sign-in OTP'
              : `Check your inbox at ${email}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* Success */}
        {success && !previewOtp && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-400 text-center">
            {success}
          </div>
        )}

        {/* Step 1 — Email Form */}
        {step === 'FORM' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="sksr.sameer@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-400 text-slate-950 font-black text-sm rounded-xl hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : '✉️ Send Sign In OTP →'}
            </button>
          </form>
        )}

        {/* Step 2 — OTP Form */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                6-Digit Email OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                placeholder="• • • • • •"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full p-4 bg-slate-950 border border-teal-500/40 rounded-xl text-center font-mono text-3xl text-teal-400 tracking-[0.5em] focus:outline-none focus:border-teal-400 placeholder-slate-700 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-teal-400 text-slate-950 font-black text-sm rounded-xl hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : '✅ Verify & Sign In'}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-xs text-slate-500">Resend in <span className="text-teal-400 font-bold">{timer}s</span></p>
              ) : (
                <button type="button" onClick={handleResend} disabled={loading} className="text-xs text-teal-400 hover:underline font-semibold">
                  ↺ Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => { setStep('FORM'); setOtp(''); setError(''); setSuccess(''); setPreviewOtp(null); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300"
            >
              ← Change Email
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-teal-400 font-bold hover:underline">Register</Link>
          {' · '}
          <Link href="/auth/forgot-password" className="text-slate-400 hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
