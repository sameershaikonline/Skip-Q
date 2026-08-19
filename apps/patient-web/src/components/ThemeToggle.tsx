'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('skipq_theme') as ThemeMode) || 'system';
    setTheme(saved);
    applyTheme(saved);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const current = localStorage.getItem('skipq_theme') as ThemeMode;
      if (current === 'system' || !current) {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSelect = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem('skipq_theme', mode);
    applyTheme(mode);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <button
        onClick={() => handleSelect('light')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => handleSelect('dark')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => handleSelect('system')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="System Default"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
