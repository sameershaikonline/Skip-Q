'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const pathname = usePathname();
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
    <nav className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" className="w-6 h-6 fill-none stroke-white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M50 10 L15 28 V55 C15 75 50 90 50 90 C50 90 85 75 85 55 V28 L50 10Z" />
                <path d="M35 52 L45 62 L65 42" strokeWidth="10" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Skip<span className="text-blue-500">-Q</span>
            </span>
          </Link>

          {/* Clean minimal navigation without redundant hospital tabs */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                pathname === '/dashboard' ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              My Live Queue
            </Link>
          </div>

          {/* Right Controls: User & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {user.name || user.email || 'Patient'}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
              >
                Sign In
              </Link>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
