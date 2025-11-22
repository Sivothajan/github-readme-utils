'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* --- Wrapper for Centering content, but keeping Header at top --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        {/* Header: No Title/Home btn, just GitHub + Theme */}
        <div className="w-full absolute top-0 left-0 right-0 px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
          <PageHeader showHomeButton={false} />
        </div>

        {/* Hero Content */}
        <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center mt-12 sm:mt-0">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to the <br className="hidden sm:block" />
              <span className="text-primary">GitHub Readme Utils</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Explore various utilities to enhance your GitHub profile README.
              Generate dynamic content effortlessly.
            </p>
          </div>

          {/* Navigation Grid */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/streak-preview"
              className="group rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/50"
            >
              <h2 className="mb-2 text-2xl font-semibold tracking-tight group-hover:text-primary flex items-center gap-2">
                Streak Preview
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </h2>
              <p className="text-sm text-muted-foreground">
                View and customize your contribution streak visualization.
              </p>
            </Link>

            <Link
              href="/count-preview"
              className="group rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/50"
            >
              <h2 className="mb-2 text-2xl font-semibold tracking-tight group-hover:text-primary flex items-center gap-2">
                Count Preview
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </h2>
              <p className="text-sm text-muted-foreground">
                Track visitor counts or statistics with a live preview.
              </p>
            </Link>
          </div>

          <PageFooter />
        </div>
      </div>
    </main>
  );
}
