'use client';

import { useState, useEffect, useMemo } from 'react';
import { CopyButton } from '@/components/ui/shadcn-io/copy-button';
import { RotateCcw, Minus, Plus } from 'lucide-react';
import appConfig from '@/config/app.config';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageFooter } from '@/components/layout/PageFooter';

import svg from '@/lib/common/counter/counter-batch.svg';

export default function CountPreview() {
  const [count, setCount] = useState(1520);
  const [identifier, setIdentifier] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, []);

  useEffect(() => {
    const updated = svg.replace(/\$\{count\}/g, String(count));
    setSvgContent(updated);
  }, [count]);

  const generatedUrls = useMemo(() => {
    const baseUrl = appConfig.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
    let finalUrl = `${baseUrl}/count`;

    const cleanId = identifier.trim();
    if (cleanId) {
      finalUrl += `/${cleanId.replace(/^\/+/, '')}`;
    }

    return {
      url: finalUrl,
      markdown: `![Visitor Count](${finalUrl})`,
      html: `<img src="${finalUrl}" alt="Visitor Count" />`,
    };
  }, [identifier]);

  return (
    <div className="min-h-screen w-full font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* --- Common Header --- */}
        <PageHeader
          title="Count Config"
          description="Generate a unique visitor counter."
        />

        {/* --- Main Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300 space-y-8">
              {/* Identifier */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
                >
                  Identifier / Path{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="identifier"
                  type="text"
                  placeholder="github-username or project-name"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input input-bordered w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 focus:ring-blue-500/20 rounded-lg"
                />
                <p className="text-xs text-slate-400 mt-2 ml-1 leading-relaxed">
                  If empty, uses{' '}
                  <span className="font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                    /count
                  </span>{' '}
                  (Global). <br />
                  If set, uses{' '}
                  <span className="font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                    /count/your-id
                  </span>{' '}
                  (Unique).
                </p>
              </div>

              {/* Test Controls */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 ml-1">
                  Test Counter Animation
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCount((prev) => prev + 1)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-all active:scale-95 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                  >
                    <Plus className="w-4 h-4" />
                    Increase
                  </button>

                  <button
                    onClick={() =>
                      setCount((prev) => (prev > 0 ? prev - 1 : 0))
                    }
                    disabled={count === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                    Decrease
                  </button>

                  <button
                    onClick={() => setCount(0)}
                    className="px-3 py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Reset to 0"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Output */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white px-1">
                Visual Preview
              </h2>
              <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 rounded-2xl flex items-center justify-center min-h-[180px] shadow-inner">
                <div
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                  className="transform transition-all duration-300 hover:scale-105"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                {
                  label: 'Markdown',
                  val: generatedUrls.markdown,
                  lang: 'text-blue-300',
                },
                {
                  label: 'HTML',
                  val: generatedUrls.html,
                  lang: 'text-emerald-300',
                },
                {
                  label: 'Direct URL',
                  val: generatedUrls.url,
                  lang: 'text-yellow-300',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-900 dark:bg-black text-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-800 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
                    <h2 className="text-sm font-semibold text-slate-300">
                      {item.label}
                    </h2>
                    <CopyButton
                      content={item.val}
                      size="md"
                      variant={isDarkMode ? 'default' : 'ghost'}
                    />
                  </div>
                  <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <pre>
                      <code
                        className={`font-mono text-sm whitespace-pre ${item.lang}`}
                      >
                        {item.val}
                      </code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Common Footer --- */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <PageFooter />
      </div>
    </div>
  );
}
