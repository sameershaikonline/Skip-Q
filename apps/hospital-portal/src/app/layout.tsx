import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'SkipQ | Hospital Management & Live Token Portal',
  description: 'Manage OPD queue tokens, call patients to doctor rooms, and onboard hospital doctors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        {/* Hospital Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-indigo-500/20">
                🏢
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-teal-300 bg-clip-text text-transparent">
                  SkipQ Hospital Portal
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Reception Desk
                </span>
              </div>
            </Link>

            <nav className="flex items-center space-x-5 text-xs font-semibold text-slate-300">
              <Link href="/" className="hover:text-indigo-400 transition-colors">
                Queue Operations
              </Link>
              <Link href="/doctors" className="hover:text-indigo-400 transition-colors">
                Doctors & OPD
              </Link>
              <Link
                href="/auth/register"
                className="px-3.5 py-2 bg-indigo-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-indigo-400 transition-all shadow"
              >
                + Register Hospital
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-slate-300">SkipQ Healthcare Ecosystem</p>
              <p className="text-[11px] text-slate-500">Live Hospital OPD Token Calling & Patient Queue Controller</p>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <a
                href="https://skipq-user.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:underline"
              >
                Patient Web App ↗
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="https://skipq-admin.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline"
              >
                Super Admin Console ↗
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
