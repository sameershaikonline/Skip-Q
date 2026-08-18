'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${BACKEND}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Unable to request password reset.');
      }

      setMessage(data.message || 'Password reset OTP sent to your email.');
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl font-bold">
            🔑
          </div>
          <h1 className="text-2xl font-black text-white">Forgot Password?</h1>
          <p className="text-xs text-slate-400">Enter your registered email address to receive a 6-digit Reset OTP</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-500 text-white font-black text-xs rounded-xl shadow hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending Reset OTP...' : 'Send Password Reset OTP'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-teal-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
