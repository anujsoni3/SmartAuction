import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md' 
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  };

  return (
    <div className={`theme-surface theme-border theme-transition rounded-2xl border shadow-card ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};