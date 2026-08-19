'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputEmail, password: inputPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please check credentials with Super Admin.');
      }

      if (data.token) {
        localStorage.setItem('hospital_token', data.token);
        localStorage.setItem('hospital_id', data.user?.hospitalId || data.user?.id);
        localStorage.setItem('hospital_name', data.user?.name || 'Hospital Reception Desk');
        localStorage.setItem('hospital_email', inputEmail);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials with Super Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
            🏢
          </div>
          <h1 className="text-2xl font-black text-slate-900">Hospital Partner Sign In</h1>
          <p className="text-xs text-slate-500">
            Sign in using the authorized email and password assigned by Super Admin.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Authorized Hospital Email *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. sameershaikonline@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assigned Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              'Sign In to Hospital Portal ➔'
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 pt-3 border-t border-slate-100 space-y-1">
          <p className="font-semibold text-slate-600">Skip-Q Hospital Governance</p>
          <p>Only hospital accounts created by Super Admin have access to this portal.</p>
        </div>
      </div>
    </div>
  );
}
