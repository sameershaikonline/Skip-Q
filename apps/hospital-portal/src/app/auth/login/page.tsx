'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      if (data.token) {
        localStorage.setItem('hospital_token', data.token);
        if (data.user?.hospitalId) {
          localStorage.setItem('hospital_id', data.user.hospitalId);
        }
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Hospital portal authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl font-bold">
            🏢
          </div>
          <h1 className="text-2xl font-black text-white">Hospital Partner Sign In</h1>
          <p className="text-xs text-slate-400">Access your hospital OPD live token queue & operations in Mahabubabad</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hospital Admin Email *</label>
            <input
              type="email"
              required
              placeholder="hospital@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-500 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-indigo-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to Hospital Portal'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Need help with hospital onboarding? Contact Super Admin.
        </div>
      </div>
    </div>
  );
}
