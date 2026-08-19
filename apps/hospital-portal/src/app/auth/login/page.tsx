'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock } from 'lucide-react';

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
        throw new Error(data.message || 'Authentication failed. Please verify credentials with Super Admin.');
      }

      if (data.token) {
        localStorage.setItem('hospital_token', data.token);
        localStorage.setItem('hospital_id', data.user?.hospitalId || data.user?.id);
        localStorage.setItem('hospital_name', data.user?.name || 'Hospital Reception Desk');
        localStorage.setItem('hospital_email', inputEmail);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 space-y-6">
      <div className="glass p-10 rounded-[3rem] shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/30">
          <Building2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Hospital Sign In</h1>
          <p className="text-xs text-slate-500 font-medium">Access reception desk live queue controller</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-500 font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold text-left">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Authorized Email</label>
            <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                required
                placeholder="Enter hospital reception email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="password"
                required
                placeholder="Enter hospital password"
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
                <span>Authenticating...</span>
              </>
            ) : (
              'Sign In to Hospital Portal ➔'
            )}
          </button>
        </form>

        <p className="text-[11px] font-medium text-slate-500 pt-2">
          Skip-Q Healthcare Queue Infrastructure
        </p>
      </div>
    </div>
  );
}
