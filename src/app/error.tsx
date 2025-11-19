'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 sm:p-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Something went wrong!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
          An error occurred while processing your request.
        </p>
        {error.message && (
          <code className="block mt-2 p-2 rounded bg-slate-100 dark:bg-black border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400">
            {error.message}
          </code>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:focus:ring-offset-slate-900 transition-all shadow-sm"
        >
          Try again
        </button>

        {/* Optional: Refresh Page Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-all shadow-sm"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
