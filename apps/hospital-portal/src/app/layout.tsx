import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Skip-Q | Hospital Management & Live Token Portal',
  description: 'Manage OPD queue tokens, call patients to doctor rooms, and onboard hospital doctors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Hospital Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-md shadow-indigo-600/20">
                🏢
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-slate-900">Skip-Q</span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    Hospital Desk
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 hidden sm:block">
                  Live OPD Queue Calling & Reception Desk
                </p>
              </div>
            </Link>

            <nav className="flex items-center space-x-5 text-xs font-semibold text-slate-600">
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                Queue Operations
              </Link>
              <Link href="/doctors" className="hover:text-indigo-600 transition-colors">
                Doctors & OPD
              </Link>
              <Link
                href="/auth/login"
                className="px-3.5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-bold text-slate-800">Skip-Q Healthcare Ecosystem</p>
              <p className="text-[11px] text-slate-500">Live Hospital OPD Token Calling & Patient Queue Controller</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <a
                href="https://skipq-user.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-emerald-600"
              >
                📱 Patient Web App ↗
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://skipq-admin.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-indigo-600"
              >
                👑 Super Admin Console ↗
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
