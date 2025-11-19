import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Mail,
  Scale,
  ShieldCheck,
} from 'lucide-react';

const readLicenseFile = (relativePath: string) => {
  try {
    return fs
      .readFileSync(path.join(process.cwd(), relativePath), 'utf8')
      .trim();
  } catch {
    return `Unable to load this section of the license. Please contact the maintainer.<br/>
            Maintainer: Sivothayan Sivasiva — [https://sivothajan.dev](https://sivothajan.dev)<br/>
            Email: license@sivothajan.dev`;
  }
};

const markdownToHtml = (markdown: string) =>
  marked.parse(markdown, { async: false }) as string;

const formatFileUpdatedDate = (relativePath: string) => {
  try {
    const stats = fs.statSync(path.join(process.cwd(), relativePath));
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(stats.mtime);
  } catch {
    return 'Unavailable';
  }
};

const proprietaryLicenseHtml = markdownToHtml(readLicenseFile('LICENSE'));
const thirdPartyNoticeHtml = markdownToHtml(
  readLicenseFile('THIRD-PARTY-LICENSE')
);
const proprietaryUpdated = formatFileUpdatedDate('LICENSE');
const thirdPartyUpdated = formatFileUpdatedDate('THIRD-PARTY-LICENSE');

const CONTACT_EMAIL = 'license@sivothajan.dev';
const MAINTAINER_URL = 'https://sivothajan.dev';
const LICENSE_VERSION = '2025-01';

export const metadata: Metadata = {
  title: 'Licenses',
  description:
    'Review the proprietary license agreement and bundled third-party notices for School Report Automation.',
};

type LicenseSectionProps = {
  heading: string;
  description: string;
  html: string;
  icon: ReactNode;
  accentClass: string;
  id: string;
  updated: string;
};

const LicenseSection = ({
  heading,
  description,
  html,
  icon,
  accentClass,
  id,
  updated,
}: LicenseSectionProps) => (
  <section
    id={id}
    className="rounded-3xl border border-white/10 bg-[#0f1425] p-6 shadow-xl shadow-black/40"
    aria-labelledby={`${id}-heading`}
  >
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-white ${accentClass}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500">
            Legal Section
          </p>
          <h2
            id={`${id}-heading`}
            className="text-2xl font-semibold text-white"
          >
            {heading}
          </h2>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-300">
        <p className="max-w-3xl">{description}</p>
        <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
          Updated {updated}
        </p>
      </div>
    </div>
    <article
      className="license-markdown prose prose-invert max-h-[65vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#090e1c] p-6 text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  </section>
);

export default function LicensePage() {
  const highlightCards = [
    {
      label: 'License version',
      value: LICENSE_VERSION,
      hint: 'Applies to proprietary terms',
    },
    {
      label: 'Primary maintainer',
      value: 'Sivothayan Sivasiva',
      hint: 'Reach out for custom agreements',
      href: MAINTAINER_URL,
    },
    {
      label: 'Contact',
      value: CONTACT_EMAIL,
      hint: 'Replies within 2 business days',
      href: `mailto:${CONTACT_EMAIL}`,
    },
  ];

  const quickLinks = [
    {
      label: 'Proprietary license',
      href: '#proprietary-license',
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      label: 'Third-party notices',
      href: '#third-party-notices',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: 'Contact legal',
      href: `mailto:${CONTACT_EMAIL}`,
      icon: <Mail className="h-4 w-4" />,
    },
  ];

  return (
    <main className="min-h-screen bg-[#080b15] text-gray-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-200">
                <Scale className="h-3.5 w-3.5" /> Compliance & Licensing
              </p>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                License & Notices
              </h1>
              <p className="max-w-3xl text-base text-gray-300">
                View the full proprietary agreement that governs School Report
                Automation along with the third-party open-source credits that
                make the experience possible.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:border-white/60 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Back to app
            </Link>
          </div>

          <section className="rounded-3xl border border-white/15 bg-[#0f1322] p-6 shadow-lg shadow-black/40">
            <div className="grid gap-6 md:grid-cols-3">
              {highlightCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/10 bg-[#11172b] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
                    {card.label}
                  </p>
                  {card.href ? (
                    <a
                      href={card.href}
                      target={
                        card.href.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        card.href.startsWith('http') ? 'noreferrer' : undefined
                      }
                      className="mt-2 inline-flex items-center text-lg font-medium text-white hover:text-indigo-200"
                    >
                      {card.value}
                      {card.href.startsWith('http') && (
                        <ExternalLink className="ml-1 inline h-4 w-4" />
                      )}
                    </a>
                  ) : (
                    <p className="mt-2 text-lg font-medium text-white">
                      {card.value}
                    </p>
                  )}
                  <p className="text-sm text-gray-400">{card.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group flex items-center justify-between rounded-2xl border border-white/15 bg-[#101523] px-4 py-3 text-sm font-medium text-gray-200 transition hover:border-white/40 hover:bg-[#181e34]"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-xl bg-white/10 p-2 text-gray-100">
                    {link.icon}
                  </span>
                  {link.label}
                </span>
                <span className="text-white transition group-hover:translate-x-1">
                  →
                </span>
              </a>
            ))}
          </section>
        </header>

        <div className="flex flex-col gap-8">
          <LicenseSection
            id="proprietary-license"
            heading="Sivothayan Sivasiva Proprietary License"
            description="Binding proprietary agreement governing evaluation access to School Report Automation."
            html={proprietaryLicenseHtml}
            icon={<ShieldCheck className="h-6 w-6" />}
            accentClass="bg-[#1e2437]"
            updated={proprietaryUpdated}
          />
          <LicenseSection
            id="third-party-notices"
            heading="Third-Party Notices"
            description="Open-source dependencies distributed with the product along with their respective licenses."
            html={thirdPartyNoticeHtml}
            icon={<FileText className="h-6 w-6" />}
            accentClass="bg-[#1e2437]"
            updated={thirdPartyUpdated}
          />
        </div>
      </div>
    </main>
  );
}
