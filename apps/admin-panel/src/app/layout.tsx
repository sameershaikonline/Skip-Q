import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'SkipQ | Super Admin Control Center',
  description: 'Super Admin Management System for platform governance, hospital onboarding, and queue oversight.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center font-black text-slate-950">
                👑
              </div>
              <div>
                <span className="font-bold text-base text-white">SkipQ Super Admin Control</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Governance
                </span>
              </div>
            </div>

            <nav className="flex gap-5 text-xs font-semibold items-center">
              <Link href="/" className="hover:text-purple-400 text-slate-300">
                Admin Dashboard
              </Link>
              <a
                href="https://online-hospital-appointment-patient.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:underline transition-colors"
              >
                Patient Web App ↗
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-slate-300">SkipQ Governance Console</p>
              <p className="text-[11px] text-slate-500">Platform-wide Hospital Verification & Queue Oversight</p>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <a href="https://online-hospital-appointment-patient.vercel.app" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                Patient Web
              </a>
              <span className="text-slate-600">•</span>
              <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                Hospital Portal
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
