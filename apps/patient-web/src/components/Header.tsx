'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const updateUser = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
        else setUser(null);
      } catch {
        setUser(null);
      }
    };

    updateUser();
    window.addEventListener('storage', updateUser);
    return () => window.removeEventListener('storage', updateUser);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            🏥
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">Skip-Q</span>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Healthcare
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 hidden sm:block">
              Hospital Appointment & Live Token System
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-emerald-600 transition-colors hidden sm:block">
            Find Hospitals
          </Link>
          <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
            My Tokens & Queue
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {user.name || user.email || 'Patient'}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20"
              >
                Sign In / Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
