'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, User, LogOut, Calendar, Search } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">Skip-Q</span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                Healthcare
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal leading-none">
              Outpatient Department Token System
            </p>
          </div>
        </Link>

        {/* Navigation Links & Theme Toggle */}
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-teal-700 transition-colors flex items-center gap-1.5 hidden sm:flex">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Find Hospitals</span>
          </Link>
          <Link href="/dashboard" className="hover:text-teal-700 transition-colors flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>My Tokens</span>
          </Link>

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium">{user.name || user.email || 'Patient'}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
