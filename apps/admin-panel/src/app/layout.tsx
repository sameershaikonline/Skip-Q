import './globals.css';
import React from 'react';
import Link from 'next/link';
import { Shield, Building2, Activity } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'Skip-Q | Super Admin Governance Hub',
  description: 'Master administrative system for hospital onboarding, validation, and queue supervision.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-sm">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Skip-Q</span>
                  <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    Governance
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Master Administrative Console
                </p>
              </div>
            </div>

            <nav className="flex gap-4 text-xs font-medium items-center text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Admin Console
              </Link>
              <a
                href="https://skipq-user.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block"
              >
                Patient Portal ↗
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-slate-800">Skip-Q Master Governance Hub</p>
              <p className="text-[11px] text-slate-500">Facility verification and database administration</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <a
                href="https://skipq-user.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-slate-900"
              >
                Patient Portal
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://skipq-hospital.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-slate-900"
              >
                Hospital Reception
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
