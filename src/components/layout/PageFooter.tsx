import Link from 'next/link';

export function PageFooter() {
  return (
    <footer className="mt-12 py-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
      <p>
        Open source project by{' '}
        <Link
          href="https://github.com/sivothajan"
          className="font-medium underline underline-offset-4 hover:text-slate-900 dark:hover:text-white transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sivothajan
        </Link>
        .
      </p>
    </footer>
  );
}
