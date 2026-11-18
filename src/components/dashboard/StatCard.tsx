import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  statusDot?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
  statusDot = false,
}) => {
  const variantStyles = {
    default: {
      card: 'border-slate-800 bg-slate-900/70',
      iconBox: 'bg-slate-800 text-slate-300',
      valueColor: 'text-white',
    },
    success: {
      card: 'border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/40',
      iconBox: 'bg-emerald-500/20 text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    danger: {
      card: 'border-rose-500/20 bg-rose-950/20 hover:border-rose-500/40',
      iconBox: 'bg-rose-500/20 text-rose-400',
      valueColor: 'text-rose-400',
    },
    warning: {
      card: 'border-amber-500/20 bg-amber-950/20 hover:border-amber-500/40',
      iconBox: 'bg-amber-500/20 text-amber-400',
      valueColor: 'text-amber-400',
    },
    info: {
      card: 'border-blue-500/20 bg-blue-950/20 hover:border-blue-500/40',
      iconBox: 'bg-blue-500/20 text-blue-400',
      valueColor: 'text-blue-400',
    },
  }[variant];

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 ${variantStyles.card}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          {statusDot && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          )}
          {label}
        </span>
        <div className={`p-2 rounded-lg ${variantStyles.iconBox}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold font-mono tracking-tight ${variantStyles.valueColor}`}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-400 font-mono">{subValue}</span>
        )}
      </div>
    </div>
  );
};
