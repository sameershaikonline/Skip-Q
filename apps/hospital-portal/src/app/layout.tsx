import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Hospital Operations Portal | OnlineAppointment',
  description: 'Official management console for registered hospitals in Mahabubabad.',
};

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-slate-950">
                🏢
              </div>
              <span className="font-bold text-base text-white">Hospital Management System</span>
            </div>

            <nav className="flex gap-6 text-xs font-semibold items-center">
              <Link href="/" className="hover:text-indigo-400 text-slate-300">Live Token Queue</Link>
              <Link href="/doctors" className="hover:text-indigo-400 text-slate-300">Manage Doctors & OPD</Link>
              <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors">
                Patient Web Site ↗
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
          © 2026 OnlineAppointment • Hospital Partner Operations Console
        </footer>
      </body>
    </html>
  );
}
