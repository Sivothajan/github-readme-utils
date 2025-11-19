import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 m-4">
      <div className="space-y-4">
        {/* Icon / Graphic */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <span className="text-3xl">?</span>
        </div>

        {/* Text Content */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Page Not Found
          </h2>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Could not find the requested resource. It might have been moved or
            deleted.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
