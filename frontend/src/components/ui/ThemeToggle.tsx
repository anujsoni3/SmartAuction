import React from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-surface theme-border theme-transition fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium theme-text shadow-card hover:translate-y-[-1px] sm:right-6 sm:top-5"
      aria-label="Toggle light and dark mode"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span className="theme-transition inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-panel)]">
        {theme === 'light' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </span>
      <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
    </button>
  );
};
