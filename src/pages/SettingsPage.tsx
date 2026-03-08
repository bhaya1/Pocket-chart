import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon, SettingsIcon } from 'lucide-react';
export function SettingsPage() {
  const [isDark, setIsDark] = useState(() => {
    return (
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark');

  });
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-blue-600" />
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your application preferences and appearance.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden max-w-2xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Appearance
          </h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Theme Preference
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Choose between light and dark mode.
              </p>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsDark(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${!isDark ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>

                <SunIcon className="h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setIsDark(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${isDark ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>

                <MoonIcon className="h-4 w-4" />
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}