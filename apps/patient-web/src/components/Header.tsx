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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-extrabold text-slate-950 text-xl shadow-lg shadow-teal-500/20">
            +
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
            SkipQ / OnlineAppointment
          </span>
        </Link>

        <nav className="flex items-center space-x-6 text-xs font-semibold text-slate-300">
          <Link href="/" className="hover:text-teal-400 transition-colors">Find Hospitals</Link>
          <Link href="/dashboard" className="hover:text-teal-400 transition-colors">My Appointments & Queue</Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-teal-400 font-mono text-[11px]">
                👤 {user.name || user.email || 'Patient'}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 transition-all shadow"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
