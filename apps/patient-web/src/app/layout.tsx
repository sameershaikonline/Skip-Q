import './globals.css';
import React from 'react';
import Header from '@/components/Header';

export const metadata = {
  title: 'Skip-Q | Hospital Appointments & Token System',
  description: 'Book hospital appointments, receive digital queue tokens, and access medical consultations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        {/* Dynamic Header with Sign In / Sign Out */}
        <Header />

        <main className="flex-1">{children}</main>

        {/* Standard Official Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/60 py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-slate-300">Skip-Q Healthcare Ecosystem</p>
              <p className="text-[11px] text-slate-500">Official Healthcare Token & Appointment Booking System</p>
            </div>
            <div className="flex items-center space-x-6 text-[11px]">
              <a
                href="https://skipq-hospital.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-indigo-400 transition-colors"
              >
                Hospital Partner Portal ↗
              </a>
              <a
                href="https://skipq-admin.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-purple-400 transition-colors"
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
