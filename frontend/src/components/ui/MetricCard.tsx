import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  description?: string;
  className?: string;
}

const toneStyles: Record<NonNullable<MetricCardProps['tone']>, { icon: string; badge: string; value: string }> = {
  brand: {
    icon: 'bg-brand-50 text-brand-700 ring-1 ring-brand-100',
    badge: 'text-brand-600',
    value: 'text-brand-700',
  },
  success: {
    icon: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    badge: 'text-emerald-600',
    value: 'text-emerald-700',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    badge: 'text-amber-600',
    value: 'text-amber-700',
  },
  danger: {
    icon: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    badge: 'text-rose-600',
    value: 'text-rose-700',
  },
  neutral: {
    icon: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
    badge: 'text-slate-500',
    value: 'text-slate-900',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  description,
  className = '',
}) => {
  const styles = toneStyles[tone];

  return (
    <Card className={`h-full ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-sm font-medium ${styles.badge}`}>{label}</p>
          <p className={`mt-2 text-2xl font-semibold tracking-tight ${styles.value}`}>{value}</p>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};
