import React from 'react';
import { LucideIcon } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface StatusCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  statusVariant?: string;
  statusBadgeLabel?: string;
  subtext?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  statusVariant,
  statusBadgeLabel,
  subtext,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm hover:border-slate-700 transition-all duration-200 flex flex-col justify-between font-mono">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 truncate pr-2">
            {title}
          </span>
          <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold tracking-tight text-white truncate">
            {value}
          </span>
          {subValue && (
            <span className="text-xs text-slate-400 truncate">{subValue}</span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {statusVariant ? (
          <StatusBadge status={statusVariant} label={statusBadgeLabel} />
        ) : (
          <span className="text-[10px] text-slate-500 uppercase">Status</span>
        )}
        {subtext && (
          <span className="text-[10px] text-slate-500 truncate" title={subtext}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
export default StatusCard;
