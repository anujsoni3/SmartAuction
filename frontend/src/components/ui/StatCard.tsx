import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';
  caption?: string;
}

const toneClasses = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-100',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, tone = 'brand', caption }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {caption ? <p className="mt-1 text-sm text-slate-500">{caption}</p> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};