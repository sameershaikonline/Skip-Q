import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'OnlineAppointment | Hospital Appointments & Token System - Mahabubabad',
  description: 'Book hospital appointments, receive digital queue tokens, and access medical consultations in Mahabubabad.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        {/* Official Clean Patient Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-extrabold text-slate-950 text-xl shadow-lg shadow-teal-500/20">
                +
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
                OnlineAppointment
              </span>
            </Link>

            <nav className="flex items-center space-x-6 text-xs font-semibold text-slate-300">
              <Link href="/" className="hover:text-teal-400 transition-colors">Find Hospitals</Link>
              <Link href="/dashboard" className="hover:text-teal-400 transition-colors">My Appointments & Queue</Link>
              <Link href="/auth/login" className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 transition-all shadow">
                Sign In
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Standard Official Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/60 py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-slate-300">OnlineAppointment Platform</p>
              <p className="text-[11px] text-slate-500">Official Healthcare Token & Appointment Booking System • Mahabubabad, Telangana</p>
            </div>
            <div className="flex items-center space-x-6 text-[11px]">
              <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">
                Hospital Partner Login
              </a>
              <a href="http://localhost:3003" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 transition-colors">
                Super Admin Console
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
