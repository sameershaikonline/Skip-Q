'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Lock, Mail, ArrowRight } from 'lucide-react';

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
        throw new Error(data.message || 'Authentication failed. Please verify your credentials.');
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
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-1 text-center">
          <div className="w-10 h-10 mx-auto rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Building2 className="w-5 h-5 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 pt-2">Hospital Reception Portal</h1>
          <p className="text-xs text-slate-500">
            Sign in with the authorized account assigned to your healthcare facility
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Authorized Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="reception@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Account Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Reception Desk</span>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 pt-3 border-t border-slate-100">
          Skip-Q Outpatient Management Infrastructure
        </div>
      </div>
    </div>
  );
}
