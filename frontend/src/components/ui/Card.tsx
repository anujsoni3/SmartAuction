import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
  ...props
}) => {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  const hoverClass = hoverable
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover hover:border-[var(--app-primary)] hover:border-opacity-30'
    : '';

  return (
    <div
      className={[
        'sa-card theme-transition',
        paddingMap[padding],
        hoverClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};