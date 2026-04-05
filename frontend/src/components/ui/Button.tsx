import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const base = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl border',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'select-none',
    'transition-all duration-200 ease-spring',
    'active:scale-[0.97]',
  ].join(' ');

  const variants: Record<string, string> = {
    primary: [
      'bg-brand-500 hover:bg-brand-600 text-white border-transparent',
      'shadow-sm hover:shadow-[0_4px_12px_rgba(0,208,156,0.35)]',
      'focus-visible:ring-brand-500',
      'hover:-translate-y-px',
    ].join(' '),
    secondary: [
      'bg-[var(--app-panel)] hover:bg-[var(--app-panel-hover)] text-[var(--app-text)] border-[var(--app-border)]',
      'focus-visible:ring-[var(--app-primary)]',
    ].join(' '),
    ghost: [
      'bg-transparent hover:bg-[var(--app-panel)] text-[var(--app-muted)] hover:text-[var(--app-text)] border-transparent',
      'focus-visible:ring-[var(--app-primary)]',
    ].join(' '),
    outline: [
      'bg-transparent border-brand-500 text-brand-500 hover:bg-[var(--app-primary-soft)]',
      'focus-visible:ring-brand-500',
      'hover:-translate-y-px',
    ].join(' '),
    danger: [
      'bg-danger-500 hover:bg-danger-600 text-white border-transparent',
      'shadow-sm hover:shadow-md focus-visible:ring-danger-500',
      'hover:-translate-y-px',
    ].join(' '),
    success: [
      'bg-brand-500 hover:bg-brand-600 text-white border-transparent',
      'shadow-sm hover:shadow-[0_4px_12px_rgba(0,208,156,0.35)] focus-visible:ring-brand-500',
      'hover:-translate-y-px',
    ].join(' '),
    warning: [
      'bg-warning-500 hover:bg-warning-600 text-white border-transparent',
      'shadow-sm hover:shadow-md focus-visible:ring-warning-400',
      'hover:-translate-y-px',
    ].join(' '),
  };

  const sizes: Record<string, string> = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3.5 py-1.5 text-sm',
    md: 'px-4.5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex h-4 w-4 items-center justify-center">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="3"
            />
            <path
              className="opacity-85"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </span>
      ) : null}
      {children}
    </button>
  );
};