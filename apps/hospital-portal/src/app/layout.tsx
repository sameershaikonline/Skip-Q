import './globals.css';
import React from 'react';
import Link from 'next/link';
import { Building2, Stethoscope, Activity } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'Skip-Q | Hospital Outpatient Queue Portal',
  description: 'Hospital reception queue caller, outpatient tokens, and doctor scheduling.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* Clean Enterprise Hospital Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Skip-Q</span>
                  <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Hospital Desk
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Outpatient Department Token Controller
                </p>
              </div>
            </Link>

            <nav className="flex items-center space-x-5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>Live Calling</span>
              </Link>
              <Link href="/doctors" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                <span>Doctor Schedule</span>
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-slate-800">Skip-Q Outpatient Management Infrastructure</p>
              <p className="text-[11px] text-slate-500">Reception token broadcasting console</p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <a
                href="https://skipq-user.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-slate-900"
              >
                Patient Portal ↗
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://skipq-admin.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-slate-900"
              >
                Super Admin Hub ↗
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
