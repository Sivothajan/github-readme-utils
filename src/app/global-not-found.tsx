import './globals.css';
import { IBM_Plex_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import Link from 'next/link';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${ibmPlexMono.className} h-full`}>
      <body className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <div className="w-full max-w-md px-4 py-10 text-center">
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-8 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </body>
    </html>
  );
}
