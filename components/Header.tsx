import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon, SentriLensLogo, DownloadIcon } from './icons';

interface HeaderProps {
    onExport: (format: 'json' | 'csv' | 'pdf') => void;
    hasResults: boolean;
}


export const Header: React.FC<HeaderProps> = ({ onExport, hasResults }) => {
  const [theme, toggleTheme] = useTheme();

  const baseButtonClasses = "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const lightModeClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  const darkModeClasses = "dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";


  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
            <SentriLensLogo className="h-8 w-auto text-primary-500" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white md:text-2xl">
                SentriLens
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
                <span className={`text-sm font-semibold transition-colors ${!hasResults ? 'text-gray-400 dark:text-gray-500' : ''}`}>Export:</span>
                <button onClick={() => onExport('json')} disabled={!hasResults} className={`${baseButtonClasses} ${lightModeClasses} ${darkModeClasses}`}><DownloadIcon className="h-4 w-4" /> JSON</button>
                <button onClick={() => onExport('csv')} disabled={!hasResults} className={`${baseButtonClasses} ${lightModeClasses} ${darkModeClasses}`}><DownloadIcon className="h-4 w-4" /> CSV</button>
                <button onClick={() => onExport('pdf')} disabled={!hasResults} className={`${baseButtonClasses} ${lightModeClasses} ${darkModeClasses}`}><DownloadIcon className="h-4 w-4" /> PDF</button>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
        </div>
      </div>
    </header>
  );
};