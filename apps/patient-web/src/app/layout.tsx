import './globals.css';
import React from 'react';
import Header from '@/components/Header';

export const metadata = {
  title: 'Skip-Q | Book Hospital OPD Appointments & Track Live Tokens',
  description: 'Skip the hospital waiting queue in Mahabubabad. View real-time ongoing token numbers being served in doctor rooms and book your OPD token online.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Header />

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Skip-Q Healthcare Network</span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Mahabubabad
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Empowering patients with live OPD token tracking and zero physical queue waiting.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <a
                href="https://skipq-hospital.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition-colors flex items-center gap-1"
              >
                Hospital Partner Portal ↗
              </a>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <a
                href="https://skipq-admin.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-1"
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
