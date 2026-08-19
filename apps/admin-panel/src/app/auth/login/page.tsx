'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail } from 'lucide-react';

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
        throw new Error(data.message || 'Super Admin authentication failed');
      }

      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_email', data.user?.email || email);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 space-y-6">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <div className="w-10 h-10 mx-auto rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 pt-2">Super Admin Control Hub</h1>
          <p className="text-xs text-slate-500">Platform Governance & Database Management</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Master Email</label>
            <input
              type="email"
              required
              placeholder="sameershaikonline@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <span>Sign In to Governance Console</span>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          Skip-Q Healthcare Infrastructure Governance
        </div>
      </div>
    </div>
  );
}
