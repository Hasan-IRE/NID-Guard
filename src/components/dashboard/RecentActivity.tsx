import React from 'react';
import { 
  KeyRound, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Clock,
  Fingerprint
} from 'lucide-react';
import type { SecurityLog } from '../../types/securityLog';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

interface RecentActivityProps {
  logs: SecurityLog[];
  onViewAll?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs, onViewAll }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden font-mono text-xs">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-slate-200 uppercase tracking-wider">
            Live Biometric & Security Event Feed
          </h3>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            All Logs <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No security events logged yet. System standing by.
          </div>
        ) : (
          logs.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="p-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {item.status === 'SUCCESS' || item.status === 'GRANTED' ? (
                    <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : item.status === 'BLOCKED' || item.status === 'FAILURE' || item.status === 'DENIED' ? (
                    <div className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <XCircle className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded bg-slate-800 text-slate-400">
                      <Fingerprint className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 truncate">
                      {item.event_type}
                    </span>
                    {item.event_id && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.event_id}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.event_details}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <StatusBadge status={item.status} />
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {formatDate(item.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default RecentActivity;
