import './globals.css';
import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import SecurityGuard from '@/components/SecurityGuard';

export const metadata = {
  title: 'Skip-Q | Super Admin Governance',
  description: 'Master administrative system for hospital onboarding and queue supervision.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 select-none">
        <SecurityGuard />
        <nav className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
                <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform text-white">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Super<span className="text-blue-500">Admin</span>
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Governance Dashboard
                </Link>
                <a
                  href="https://skipq-user.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Patient App ↗
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>

        <main className="min-h-[calc(100vh-80px)]">{children}</main>
      </body>
    </html>
  );
}
