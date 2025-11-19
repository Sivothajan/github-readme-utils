'use client';

import { useState, useEffect, useMemo } from 'react';
import { CopyButton } from '@/components/ui/shadcn-io/copy-button';
import HEXColorPicker from '@/components/HEXColorPicker';
import {
  getAvailableLocales,
  getLocaleDisplayName,
} from '@/lib/common/locale/translations';
import { getAllThemeNames } from '@/lib/common/themes/themes';
import { generateOutput } from '@/lib/client/card/card';
import {
  defaultOptions,
  defaultDailyStats,
  defaultWeeklyStats,
  formatToday,
  weekdays,
  dateFormatValues,
  outputTypesValues,
  compareOptionsType,
  DEFAULT_OPTIONS,
} from '@/lib/client/preview/preview';
import { MoonIcon, SunIcon } from '@/components/custom-icons/custom-icons';
import appConfig from '@/config/app.config';

import type {
  HexValue,
  StreakPreviewOptions,
} from '@/lib/client/preview/preview.d';
import type { CardStats, CardRequestParams } from '@/lib/common/card/card.d';

export default function Preview() {
  const [options, setOptions] = useState<StreakPreviewOptions>(defaultOptions);
  const [optionsTypeBoolean, setOptionsTypeBoolean] = useState<boolean>(
    compareOptionsType(options.type, 'json')
  );

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
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

  const stats: CardStats = useMemo(() => {
    const base =
      options.streak_mode === 'daily' ? defaultDailyStats : defaultWeeklyStats;
    return { ...base, excludedDays: options.exclude_days };
  }, [options.streak_mode, options.exclude_days]);

  const params: CardRequestParams = useMemo(() => {
    const p: CardRequestParams = {};
    Object.entries(options).forEach(([key, value]) => {
      if (value === undefined) return;
      p[key] = Array.isArray(value) ? value.join(',') : String(value);
    });
    return p;
  }, [options]);

  const [outputContent, setOutputContent] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function fetchOutput() {
      try {
        const res = await generateOutput(stats, params);
        if (cancelled) return;

        if (res.contentType === 'image/svg+xml') {
          setOutputContent(typeof res.body === 'string' ? res.body : '');
        } else if (res.contentType === 'application/json') {
          setOutputContent(
            typeof res.body === 'string'
              ? `<pre class="whitespace-pre-wrap font-mono text-xs md:text-sm text-emerald-600 dark:text-emerald-400">${JSON.stringify(JSON.parse(res.body), null, 2)}</pre>`
              : 'Invalid JSON response'
          );
        } else if (res.contentType === 'image/png') {
          const blob =
            res.body instanceof Blob
              ? res.body
              : new Blob([], { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          setOutputContent(`<img alt="Streaks PNG Preview" src="${url}" />`);
        }
      } catch {
        if (!cancelled) setOutputContent('Error generating preview');
      }
    }

    fetchOutput();
    return () => {
      cancelled = true;
    };
  }, [stats, params]);

  const queryParams = useMemo(
    () =>
      new URLSearchParams(
        Object.entries(options).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (
              key === 'customColors' ||
              value === undefined ||
              value === '' ||
              value === null
            ) {
              return acc;
            }

            const defaultVal = (
              DEFAULT_OPTIONS as Record<string, string | number | boolean>
            )[key];
            if (defaultVal === value) {
              return acc;
            }

            if (Array.isArray(value)) {
              if (value.length > 0) {
                acc[key] = value.join(',');
              }
              return acc;
            }

            acc[key] = String(value);
            return acc;
          },
          {}
        )
      ),
    [options]
  );

  const imageUrl = `${appConfig.NEXT_PUBLIC_BASE_URL.endsWith('/') ? appConfig.NEXT_PUBLIC_BASE_URL + 'streak' : appConfig.NEXT_PUBLIC_BASE_URL + '/streak'}?${queryParams.toString()}`;
  const markdownTxt = `![Streaks](${imageUrl})`;
  const htmlTxt = `<img alt="Streaks" src="${imageUrl}" />`;

  const toggleDay = (
    day: NonNullable<StreakPreviewOptions['exclude_days']>[number]
  ) => {
    setOptions((prev) => {
      const exclude = prev.exclude_days || [];
      return {
        ...prev,
        exclude_days: exclude.includes(day)
          ? exclude.filter((d) => d !== day)
          : [...exclude, day],
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Header & Theme Toggle */}
      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Streak Config
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Customize your card.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="
            flex items-center justify-center gap-2 
            w-10 h-10 p-0 rounded-full 
            sm:w-auto sm:h-auto sm:px-5 sm:py-2.5
            bg-white dark:bg-slate-800 
            text-slate-700 dark:text-slate-200 
            border border-slate-200 dark:border-slate-700 
            hover:bg-slate-100 dark:hover:bg-slate-700 
            transition-all font-medium text-sm shadow-sm hover:shadow-md
          "
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <>
              <SunIcon className="w-5 h-5 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <MoonIcon className="w-5 h-5 text-indigo-500" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Options Section */}
      <div
        id="optionsSection"
        className="grid grid-cols-1 xl:grid-cols-12 gap-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300"
      >
        {/* Left Column (Main Settings) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Sivothajan"
                value={options.user}
                onChange={(e) =>
                  setOptions({ ...options, user: e.target.value })
                }
                pattern="^[A-Za-z\d-]{0,39}[A-Za-z\d]$"
                className="input input-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 focus:ring-blue-500/20 rounded-lg"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="theme"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
                >
                  Theme
                </label>
                <select
                  id="theme"
                  value={optionsTypeBoolean ? '' : options.theme}
                  onChange={(e) =>
                    setOptions({ ...options, theme: e.target.value })
                  }
                  disabled={optionsTypeBoolean}
                  className="select select-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg disabled:opacity-50"
                >
                  {getAllThemeNames().map((themeName) => (
                    <option key={themeName} value={themeName}>
                      {themeName
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="locale"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
                >
                  Locale
                </label>
                <select
                  id="locale"
                  value={optionsTypeBoolean ? '' : options.locale}
                  onChange={(e) =>
                    setOptions({ ...options, locale: e.target.value })
                  }
                  disabled={optionsTypeBoolean}
                  className="select select-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg disabled:opacity-50"
                >
                  {getAvailableLocales().map((locale) => (
                    <option key={locale} value={locale}>
                      {getLocaleDisplayName(locale)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="border_radius"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
                >
                  Border Radius
                </label>
                <input
                  id="border_radius"
                  type="number"
                  value={
                    optionsTypeBoolean ? 0 : (options.border_radius ?? 4.5)
                  }
                  step={0.1}
                  min={0}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      border_radius: parseFloat(e.target.value),
                    })
                  }
                  disabled={optionsTypeBoolean}
                  className="input input-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg disabled:opacity-50"
                />
              </div>
              <div className="flex items-center pt-6">
                <label
                  htmlFor="hide_border"
                  className="flex items-center space-x-3 cursor-pointer group p-2 -ml-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
                >
                  <input
                    id="hide_border"
                    type="checkbox"
                    checked={optionsTypeBoolean ? false : options.hide_border}
                    onChange={(e) =>
                      setOptions({ ...options, hide_border: e.target.checked })
                    }
                    disabled={optionsTypeBoolean}
                    className="checkbox checkbox-sm checkbox-primary rounded border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                    Hide Border
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="date_format"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
                >
                  Date Format
                </label>
                <select
                  id="date_format"
                  value={optionsTypeBoolean ? '' : (options.date_format ?? '')}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      date_format: e.target
                        .value as StreakPreviewOptions['date_format'],
                    })
                  }
                  disabled={optionsTypeBoolean}
                  className="select select-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg disabled:opacity-50"
                >
                  {dateFormatValues.map((df) => (
                    <option key={df} value={df}>
                      {formatToday(df)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label
                  htmlFor="short_numbers"
                  className="flex items-center space-x-3 cursor-pointer group p-2 -ml-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
                >
                  <input
                    id="short_numbers"
                    type="checkbox"
                    checked={optionsTypeBoolean ? false : options.short_numbers}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        short_numbers: e.target.checked,
                      })
                    }
                    disabled={optionsTypeBoolean}
                    className="checkbox checkbox-sm checkbox-primary rounded border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                    Short Numbers
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="streak_mode"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
              >
                Streak Mode
              </label>
              <select
                id="streak_mode"
                value={options.streak_mode}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    streak_mode: e.target
                      .value as StreakPreviewOptions['streak_mode'],
                  })
                }
                className="select select-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column (Additional Settings) */}
        <div className="xl:col-span-7 space-y-8">
          {/* Exclude Days */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 ml-1">
              Exclude Days
            </span>
            <div className="flex flex-wrap gap-3">
              {weekdays.map((day) => {
                const isExcluded = options.exclude_days?.includes(
                  day.short as NonNullable<
                    StreakPreviewOptions['exclude_days']
                  >[number]
                );
                return (
                  <label
                    key={day.short}
                    className={`
                      relative flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all select-none border
                      ${
                        isExcluded
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <input
                      id={day.short}
                      type="checkbox"
                      checked={isExcluded ?? false}
                      onChange={() =>
                        toggleDay(
                          day.short as NonNullable<
                            StreakPreviewOptions['exclude_days']
                          >[number]
                        )
                      }
                      className="sr-only"
                    />
                    <span title={`Exclude ${day.full}`}>{day.short}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 ml-1">
              Selected days will be removed from streak calculations.
            </p>
          </div>

          {/* Show Sections */}
          <div>
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 ml-1">
              Visibility
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'hide_total_contributions',
                'hide_current_streak',
                'hide_longest_streak',
              ].map((key) => {
                const labelMap: Record<string, string> = {
                  hide_total_contributions: 'Total Contributions',
                  hide_current_streak: 'Current Streak',
                  hide_longest_streak: 'Longest Streak',
                };
                return (
                  <label
                    key={key}
                    htmlFor={key}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <input
                      id={key}
                      type="checkbox"
                      checked={
                        optionsTypeBoolean
                          ? false
                          : Boolean(options[key as keyof typeof options])
                      }
                      onChange={(e) =>
                        setOptions({ ...options, [key]: e.target.checked })
                      }
                      disabled={optionsTypeBoolean}
                      className="checkbox checkbox-sm checkbox-primary rounded border-slate-300 dark:border-slate-600"
                    />
                    <span
                      className="text-sm text-slate-600 dark:text-slate-300"
                      title={labelMap[key]}
                    >
                      {labelMap[key]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card Dimensions and Output */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="card_width"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
              >
                Card Width
              </label>
              <input
                id="card_width"
                type="number"
                value={optionsTypeBoolean ? 0 : (options.card_width ?? 495)}
                min={300}
                max={800}
                step={1}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    card_width: parseInt(e.target.value),
                  })
                }
                disabled={optionsTypeBoolean}
                className="input input-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="card_height"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
              >
                Card Height
              </label>
              <input
                id="card_height"
                type="number"
                value={optionsTypeBoolean ? 0 : (options.card_height ?? 195)}
                min={170}
                max={400}
                step={1}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    card_height: parseInt(e.target.value),
                  })
                }
                disabled={optionsTypeBoolean}
                className="input input-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="output_type"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1"
              >
                Output Type
              </label>
              <select
                id="output_type"
                value={options.type}
                onChange={(e) => {
                  const newType = e.target
                    .value as StreakPreviewOptions['type'];
                  setOptions({ ...options, type: newType });
                  setOptionsTypeBoolean(compareOptionsType(newType, 'json'));
                }}
                className="select select-bordered w-full h-11 bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-all rounded-lg"
              >
                {outputTypesValues.map((ot) => (
                  <option key={ot} value={ot}>
                    {String(ot).toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Colors Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <summary className="list-none text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 ml-1 block">
              Custom Colors
            </summary>
            {/* Grid layout for color cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(() => {
                const colorMap = {
                  background: 'Background',
                  border: 'Border',
                  stroke: 'Stroke',
                  ring: 'Ring',
                  fire: 'Fire',
                  currStreakNum: 'Streak Num',
                  sideLabels: 'Labels',
                  dates: 'Dates',
                  excludeDaysLabel: 'Excluded',
                } as const;
                const entries = Object.entries(colorMap) as [
                  keyof StreakPreviewOptions,
                  string,
                ][];
                return entries.map(([key, label]) => (
                  <label
                    key={String(key)}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col justify-center pr-2 min-w-0 flex-1">
                      {/* Aligned & Bold Label */}
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight truncate">
                        {label}
                      </span>
                      {/* Aligned & Clear Hex Code */}
                      <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">
                        #{(options[key] as string) || 'FFFFFF'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Color Preview Box (Small) */}
                      <div
                        className="w-6 h-6 rounded shadow-sm border border-slate-200 dark:border-slate-600 shrink-0"
                        style={{
                          backgroundColor: `#${options[key] || 'FFFFFF'}`,
                        }}
                      />

                      {/* Color Picker Component */}
                      <div className="relative overflow-hidden rounded-full shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                        <HEXColorPicker
                          id={String(key)}
                          value={(options[key] as string) ?? '#ffffff'}
                          onChange={(e: string) =>
                            setOptions({
                              ...options,
                              [key]: e.replace('#', '') as HexValue,
                            })
                          }
                          disabled={optionsTypeBoolean}
                        />
                      </div>
                    </div>
                  </label>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div id="previewSection" className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Preview
        </h2>

        {/* Preview Image Container */}
        <div
          id="previewImageSection"
          className="
            bg-slate-50/50 dark:bg-slate-900/50 
            border border-slate-200 dark:border-slate-800 
            p-4 sm:p-8 rounded-2xl 
            flex items-center justify-center 
            min-h-[200px] 
            shadow-inner transition-colors duration-300
            /* Force SVG/Image to scale nicely */
            [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-[600px]
            [&>img]:w-full [&>img]:h-auto [&>img]:max-w-[600px] 
            [&>img]:shadow-lg [&>img]:rounded-md
            [&>img]:object-contain
          "
          dangerouslySetInnerHTML={{ __html: outputContent }}
        />

        {/* Code Snippets */}
        <div id="codeSection" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Markdown Section */}
          <div className="bg-slate-900 dark:bg-black text-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-800 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">Markdown</h2>
              <div className="flex items-center">
                <CopyButton
                  content={markdownTxt}
                  size="md"
                  variant={isDarkMode ? 'default' : 'ghost'}
                />
              </div>
            </div>
            <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <pre>
                <code className="font-mono text-sm text-blue-300 whitespace-pre">
                  {markdownTxt}
                </code>
              </pre>
            </div>
          </div>

          {/* 2. HTML Section */}
          <div className="bg-slate-900 dark:bg-black text-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-800 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">HTML</h2>
              <div className="flex items-center">
                <CopyButton
                  content={htmlTxt}
                  size="md"
                  variant={isDarkMode ? 'default' : 'ghost'}
                />
              </div>
            </div>
            <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <pre>
                <code className="font-mono text-sm text-emerald-300 whitespace-pre">
                  {htmlTxt}
                </code>
              </pre>
            </div>
          </div>

          {/* 3. URL Section */}
          <div className="bg-slate-900 dark:bg-black text-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-800 dark:border-slate-800 lg:col-span-2 lg:mx-auto lg:w-[calc(50%-0.75rem)] w-full">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">URL</h2>
              <div className="flex items-center">
                <CopyButton
                  content={imageUrl}
                  size="md"
                  variant={isDarkMode ? 'default' : 'ghost'}
                />
              </div>
            </div>
            <div className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <pre>
                <code className="font-mono text-sm text-yellow-300 whitespace-pre">
                  {imageUrl}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
