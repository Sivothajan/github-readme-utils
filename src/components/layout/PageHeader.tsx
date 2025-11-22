'use client';

import Link from 'next/link';
import { Home, Github, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageHeaderProps {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

export function PageHeader({
  title,
  description,
  showHomeButton = true,
}: PageHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {showHomeButton && (
          <Link
            href="/"
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            aria-label="Go Home"
          >
            <Home className="w-5 h-5" />
          </Link>
        )}

        {(title || description) && (
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="https://github.com/sivothajan/github-readme-utils"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center justify-center 
            w-10 h-10 rounded-full 
            bg-white dark:bg-slate-800 
            text-slate-700 dark:text-slate-200 
            border border-slate-200 dark:border-slate-700 
            hover:bg-slate-100 dark:hover:bg-slate-700 
            transition-all shadow-sm hover:shadow-md
          "
          aria-label="View on GitHub"
        >
          <Github className="w-5 h-5" />
        </Link>

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
      </div>
    </div>
  );
}
