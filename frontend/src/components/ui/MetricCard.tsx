import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
  description?: string;
  change?: { value: string; positive: boolean };
  className?: string;
}

const toneConfig: Record<
  NonNullable<MetricCardProps['tone']>,
  { iconBg: string; iconColor: string; valueColor: string; labelColor: string }
> = {
  brand: {
    iconBg: 'var(--app-primary-soft)',
    iconColor: 'var(--app-primary)',
    valueColor: 'var(--app-text)',
    labelColor: 'var(--app-muted)',
  },
  success: {
    iconBg: 'rgba(0, 208, 156, 0.12)',
    iconColor: '#00D09C',
    valueColor: 'var(--app-text)',
    labelColor: 'var(--app-muted)',
  },
  warning: {
    iconBg: 'rgba(245, 158, 11, 0.1)',
    iconColor: '#d97706',
    valueColor: 'var(--app-text)',
    labelColor: 'var(--app-muted)',
  },
  danger: {
    iconBg: 'rgba(239, 68, 68, 0.1)',
    iconColor: '#dc2626',
    valueColor: 'var(--app-text)',
    labelColor: 'var(--app-muted)',
  },
  neutral: {
    iconBg: 'var(--app-panel)',
    iconColor: 'var(--app-muted)',
    valueColor: 'var(--app-text)',
    labelColor: 'var(--app-muted)',
  },
  accent: {
    iconBg: 'rgba(59, 130, 246, 0.1)',
    iconColor: '#3B82F6',
    valueColor: 'var(--app-text)',
    labelColor: 'var(--app-muted)',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  description,
  change,
  className = '',
}) => {
  const cfg = toneConfig[tone];

  return (
    <div
      className={`sa-card theme-transition p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: cfg.labelColor }}>
            {label}
          </p>
          <p
            className="mt-2 text-2xl font-bold tracking-tight"
            style={{ color: cfg.valueColor }}
          >
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs" style={{ color: 'var(--app-muted)' }}>
              {description}
            </p>
          )}
          {change && (
            <p
              className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${
                change.positive ? 'text-brand-500' : 'text-danger-500'
              }`}
            >
              <span>{change.positive ? '↑' : '↓'}</span>
              {change.value}
            </p>
          )}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: cfg.iconBg, color: cfg.iconColor }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
