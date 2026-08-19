'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');

  // Password Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP Login
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Password Login Submit
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed. Please check your credentials.');

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || { email }));
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 2. OTP Login Request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Account not found. Please register.');

      if (data.otp) setPreviewOtp(data.otp);
      setSuccess(data.message || `Login OTP sent to ${email}`);
      setOtpStep(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send login OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 3. OTP Login Verify
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP code.');

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || { email }));
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-14 px-4 space-y-6">
      <div className="glass p-8 sm:p-10 rounded-[3rem] shadow-2xl space-y-6 text-center">
        {/* Brand Logo */}
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/30">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Patient Sign In
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Access your live hospital queues and digital tokens
          </p>
        </div>

        {/* Tab Selector: Password vs OTP */}
        <div className="flex items-center p-1 glass rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setLoginMode('PASSWORD');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              loginMode === 'PASSWORD'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Password Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('OTP');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              loginMode === 'OTP'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            OTP Sign In
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-500 font-bold text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-500 font-bold text-center">
            {success}
          </div>
        )}

        {previewOtp && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-blue-600 dark:text-blue-400 font-bold text-center">
            Test Verification OTP: <span className="font-mono text-sm">{previewOtp}</span>
          </div>
        )}

        {/* 1. PASSWORD LOGIN FORM */}
        {loginMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs font-bold text-left">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 dark:text-slate-300">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-blue-500 hover:underline font-bold text-[11px]"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In to Skip-Q ➔'
              )}
            </button>
          </form>
        )}

        {/* 2. OTP LOGIN FORM */}
        {loginMode === 'OTP' && (
          <div>
            {!otpStep ? (
              <form onSubmit={handleRequestOtp} className="space-y-4 text-xs font-bold text-left">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Registered Email</label>
                  <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                    <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    'Send Login OTP ➔'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpLogin} className="space-y-4 text-xs font-bold text-left">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">6-Digit Login Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-2xl font-mono text-center font-black tracking-widest outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify & Enter ➔'
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="text-slate-500 hover:text-slate-700 font-bold"
                  >
                    ← Change email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link href="/auth/register" className="text-blue-500 hover:underline font-bold text-xs">
            Don't have an account? Register as new patient ➔
          </Link>
        </div>

        <p className="text-[11px] font-medium text-slate-500 pt-1">
          Skip-Q Official Healthcare Authentication
        </p>
      </div>
    </div>
  );
}
