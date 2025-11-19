'use client';

import './globals.css'; // Ensure styles are loaded
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optional: Log error to service
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex h-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-slate-800 dark:text-slate-100 font-sans">
        <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-lg text-center space-y-6">
          {/* Error Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-red-600 dark:text-red-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              500 – Server Error
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Something went wrong on our end. We are working to fix it.
            </p>

            {/* Optional: Display error message only in dev/staging */}
            {error.message && (
              <pre className="mt-4 max-h-32 overflow-auto rounded bg-slate-100 dark:bg-slate-950 p-3 text-xs font-mono text-red-600 dark:text-red-400 text-left">
                {error.message}
              </pre>
            )}
          </div>

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:focus:ring-offset-slate-900 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
