'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Mahabubabad',
    contactNumber: '',
    email: '',
    password: '',
    licenseNumber: '',
    isGovernment: false,
    isEmergency: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = backend ? `${backend}/api/auth/register/hospital` : '/api/auth/register/hospital';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setSuccess('Hospital registered successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit hospital application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4 space-y-6 pb-20">
      <div className="bg-slate-900 p-8 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl font-bold">
            🏥
          </div>
          <h1 className="text-2xl font-black text-white">Register Your Hospital</h1>
          <p className="text-xs text-slate-400">
            Join the SkipQ Digital Healthcare Queue Platform in Mahabubabad
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Hospital Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. City Care Multispecialty Hospital"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Hospital License Number *</label>
              <input
                type="text"
                required
                placeholder="TS-MED-2026-001"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Address & Landmark *</label>
            <input
              type="text"
              required
              placeholder="Main Bazar Road, Near RTC Bus Stand"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 99120 92468"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Admin Email *</label>
              <input
                type="email"
                required
                placeholder="admin@hospital.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.isEmergency}
                onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                className="rounded accent-indigo-500"
              />
              <span>24/7 Emergency Support</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.isGovernment}
                onChange={(e) => setFormData({ ...formData, isGovernment: e.target.checked })}
                className="rounded accent-indigo-500"
              />
              <span>Government Hospital</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-indigo-400 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Registration...' : 'Register Hospital & Open Portal ➔'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <Link href="/auth/login" className="text-indigo-400 font-bold hover:underline">
            Sign In to Hospital Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
