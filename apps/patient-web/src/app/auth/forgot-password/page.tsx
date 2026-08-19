'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'SUCCESS'>('REQUEST');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Send Reset OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_OTP',
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to dispatch password reset OTP.');

      if (data.otp) setPreviewOtp(data.otp);
      setSuccess(data.message || `Password reset OTP sent to ${email}`);
      setStep('RESET');
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP & Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_PASSWORD',
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password reset failed.');

      setSuccess('Your password has been reset successfully!');
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-14 px-4 space-y-6">
      <div className="glass p-8 sm:p-10 rounded-[3rem] shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-amber-500/30">
          <KeyRound className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {step === 'REQUEST' && 'Reset Password'}
            {step === 'RESET' && 'Enter Code & New Password'}
            {step === 'SUCCESS' && 'Password Updated!'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {step === 'REQUEST' && "We'll send a 6-digit verification code to your registered email"}
            {step === 'RESET' && 'Verify code and choose your new password'}
            {step === 'SUCCESS' && 'You can now sign in with your new credentials'}
          </p>
        </div>

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

        {previewOtp && step === 'RESET' && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-blue-600 dark:text-blue-400 font-bold text-center">
            Reset OTP Code: <span className="font-mono text-sm">{previewOtp}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'REQUEST' && (
          <form onSubmit={handleSendResetOtp} className="space-y-4 text-xs font-bold text-left">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Registered Email Address</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Reset Code...</span>
                </>
              ) : (
                'Send Password Reset OTP ➔'
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="text-slate-500 hover:text-slate-700 font-bold">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-bold text-left">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">6-Digit Reset Code</label>
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

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">New Password (Min 6 chars)</label>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Updating Password...</span>
                </>
              ) : (
                'Reset Password & Proceed ➔'
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'SUCCESS' && (
          <div className="space-y-4 pt-2">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <Link
              href="/auth/login"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all block hover:scale-105"
            >
              Sign In with New Password ➔
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
