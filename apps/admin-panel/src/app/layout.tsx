import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Skip-Q | Super Admin Control Center',
  description: 'Super Admin Management System for platform governance, hospital onboarding, and queue oversight.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-md shadow-indigo-600/20">
                👑
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-slate-900">Skip-Q</span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    Super Admin
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 hidden sm:block">
                  Master Governance & Hospital Verification
                </p>
              </div>
            </div>

            <nav className="flex gap-5 text-xs font-semibold items-center text-slate-600">
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                Admin Dashboard
              </Link>
              <a
                href="https://skipq-user.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-600 transition-colors"
              >
                📱 Patient Web ↗
              </a>
              <a
                href="https://skipq-hospital.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 transition-colors"
              >
                🏢 Hospital Portal ↗
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-bold text-slate-800">Skip-Q Governance Console</p>
              <p className="text-[11px] text-slate-500">Platform-wide Hospital Verification & Queue Oversight</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <a
                href="https://skipq-user.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-emerald-600"
              >
                Patient Web
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://skipq-hospital.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-indigo-600"
              >
                Hospital Portal
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
