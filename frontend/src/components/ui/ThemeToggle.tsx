import React from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-transition relative inline-flex h-9 w-9 items-center justify-center rounded-xl"
      style={{
        backgroundColor: 'var(--app-panel)',
        color: 'var(--app-muted)',
        border: '1px solid var(--app-border)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--app-text)';
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--app-panel-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--app-muted)';
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--app-panel)';
      }}
    >
      <span className="theme-transition">
        {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      </span>
    </button>
  );
};
