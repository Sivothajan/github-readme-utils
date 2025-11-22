'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      html.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        flex items-center justify-center gap-2 
        w-10 h-10 p-0 rounded-full 
        bg-white dark:bg-slate-800 
        text-slate-700 dark:text-slate-200 
        border border-slate-200 dark:border-slate-700 
        hover:bg-slate-100 dark:hover:bg-slate-700 
        transition-all shadow-sm hover:shadow-md
      "
      aria-label="Toggle Theme"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-500" />
      )}
    </button>
  );
}
