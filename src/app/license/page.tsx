import {
  Scale,
  Box,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';

const MITLicenseSection = () => {
  const year = new Date().getFullYear();
  const holder = 'Sivothayan Sivasiva';

  return (
    <div className="space-y-4 font-mono text-sm text-muted-foreground leading-relaxed selection:bg-primary/10">
      <p>
        Copyright © {year} {holder}
      </p>
      <p>
        Permission is hereby granted, free of charge, to any person obtaining a
        copy of this software and associated documentation files (the
        &quot;Software&quot;), to deal in the Software without restriction,
        including without limitation the rights to use, copy, modify, merge,
        publish, distribute, sublicense, and/or sell copies of the Software, and
        to permit persons to whom the Software is furnished to do so, subject to
        the following conditions:
      </p>
      <p>
        The above copyright notice and this permission notice shall be included
        in all copies or substantial portions of the Software.
      </p>
      <p className="uppercase font-semibold pt-2 text-foreground/80">
        The software is provided &quot;as is&quot;, without warranty of any
        kind, express or implied, including but not limited to the warranties of
        merchantability, fitness for a particular purpose and noninfringement.
        In no event shall the authors or copyright holders be liable for any
        claim, damages or other liability, whether in an action of contract,
        tort or otherwise, arising from, out of or in connection with the
        software or the use or other dealings in the software.
      </p>
    </div>
  );
};

type DependencyGroup = {
  license: string;
  packages: string[];
};

const productionDeps: DependencyGroup[] = [
  {
    license: 'MIT',
    packages: [
      '@radix-ui/react-popover@1.1.15',
      'canvg@4.0.3',
      'clsx@2.1.1',
      'lodash@4.17.21',
      'motion@12.23.24',
      'next@16.0.3',
      'react@19.2.0',
      'react-colorful@5.6.1',
      'react-dom@19.2.0',
      'tailwind-merge@3.4.0',
    ],
  },
  {
    license: 'Apache-2.0',
    packages: ['class-variance-authority@0.7.1', 'sharp@0.34.5'],
  },
  {
    license: 'ISC',
    packages: ['lucide-react@0.554.0'],
  },
];

const devDeps: DependencyGroup[] = [
  {
    license: 'MIT',
    packages: [
      '@tailwindcss/postcss@4.1.17',
      '@types/lodash@4.17.20',
      '@types/node@24.10.1',
      '@types/react@19.2.5',
      'eslint@9.39.1',
      'png-to-ico@3.0.1',
      'prettier@3.6.2',
      'raw-loader@4.0.2',
      'tailwindcss@4.1.17',
      'tsx@4.20.6',
      'tw-animate-css@1.4.0',
      'typescript-eslint@8.47.0',
    ],
  },
  {
    license: 'Apache-2.0',
    packages: ['typescript@5.9.3'],
  },
];

const DependencySection = ({
  title,
  groups,
}: {
  title: string;
  groups: DependencyGroup[];
}) => (
  <div className="mt-8 first:mt-4">
    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
      {title}
    </h3>
    <div className="grid gap-4">
      {groups.map((group) => (
        <div
          key={group.license}
          className="rounded-lg border border-border/60 bg-muted/20 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground/70" />
            <span className="font-medium text-sm text-foreground">
              {group.license} Licensed Components
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.packages.map((pkg) => (
              <span
                key={pkg}
                className="inline-flex items-center rounded-md border border-border/50 bg-background px-2 py-1 text-[11px] font-mono text-muted-foreground shadow-sm hover:border-primary/30 hover:text-primary transition-colors cursor-default select-all"
              >
                {pkg}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function LicensePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <div className="flex-1 flex flex-col items-center px-4 py-12 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="w-full absolute top-0 left-0 right-0 px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto z-10">
          <PageHeader showHomeButton={true} />
        </div>

        {/* Content Container */}
        <div className="w-full max-w-4xl mt-12 sm:mt-8 space-y-10">
          {/* Title Section */}
          <div className="space-y-4 text-center pb-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              License & <span className="text-primary">Legal</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Open source permissions and third-party software credits.
            </p>
          </div>

          {/* 1. Project MIT License Section */}
          <section className="group rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  MIT License
                </h2>
                <p className="text-sm text-muted-foreground">
                  Project Permissions
                </p>
              </div>
            </div>
            <MITLicenseSection />
          </section>

          {/* 2. Third Party Notices */}
          <section className="group rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-blue-500/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Third-Party Software Notice
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Credits and attributions
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 pt-6">
              {/* Auto-generated Warning Blockquote */}
              <div className="mb-8 flex gap-4 rounded-lg border-l-4 border-amber-500/60 bg-amber-500/5 px-5 py-4 text-sm dark:bg-amber-500/10">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
                <div className="space-y-2 text-amber-800 dark:text-amber-400">
                  <p className="font-bold">
                    ⚠️ Auto-generated file – Do not modify manually.
                  </p>
                  <p className="opacity-90">
                    This section lists third-party software components used in
                    this project, along with their licenses.
                  </p>
                </div>
              </div>

              {/* Intro Text */}
              <div className="prose prose-sm dark:prose-invert max-w-none mb-8 text-muted-foreground">
                <p>
                  This project includes third-party software components licensed
                  under open-source licenses. These components remain subject to
                  their respective licenses as described below. No ownership of
                  these components is claimed by{' '}
                  <a
                    href="https://sivothajan.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary inline-flex items-center gap-1"
                  >
                    Sivothayan Sivasiva
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  .
                </p>
              </div>

              <div className="h-px w-full bg-border/50 my-8" />

              {/* Lists */}
              <div className="space-y-10">
                <DependencySection
                  title="Production Dependencies"
                  groups={productionDeps}
                />
                <div className="h-px w-full bg-border/50" />
                <DependencySection
                  title="Development Dependencies"
                  groups={devDeps}
                />
              </div>

              {/* Notes Section */}
              <div className="mt-10 pt-8 border-t border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Notes
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>
                    All listed third-party licenses{' '}
                    <strong className="text-foreground font-medium">
                      permit inclusion in proprietary software
                    </strong>
                    .
                  </li>
                  <li>
                    Full license texts for each component can be found in{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                      node_modules/
                    </code>
                    .
                  </li>
                  <li>
                    No modifications were made to third-party components beyond
                    normal build, compilation, or bundling processes.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <div className="pt-8 pb-8">
            <PageFooter />
          </div>
        </div>
      </div>
    </main>
  );
}
