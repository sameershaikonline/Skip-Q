'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Super Admin login failed');
      }

      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_email', data.user?.email || email);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Super Admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 space-y-6">
      <div className="bg-slate-900 p-8 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl font-bold">
            👑
          </div>
          <h1 className="text-2xl font-black text-white">Super Admin Control Hub</h1>
          <p className="text-xs text-slate-400">Platform Governance & Hospital Verification</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Admin Email *</label>
            <input
              type="email"
              required
              placeholder="admin@skipq.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-purple-500 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-purple-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Super Admin Console ➔'}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          Skip-Q Healthcare Infrastructure Governance
        </div>
      </div>
    </div>
  );
}
