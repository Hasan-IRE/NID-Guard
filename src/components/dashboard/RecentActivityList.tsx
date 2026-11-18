import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { SecurityEvent, AccessRequest } from '../../types/security';
import { useApp } from '../../context/AppContext';

interface RecentActivityListProps {
  events: SecurityEvent[];
  accessRequests: AccessRequest[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ events, accessRequests }) => {
  const [activeTab, setActiveTab] = useState<'access' | 'events'>('access');
  const { setActivePage } = useApp();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'ALERT':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'WARNING':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-700/60';
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden font-mono">
      {/* Header with Tabs */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('access')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'access'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Recent Access Requests ({accessRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'events'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Security Event Timeline ({events.length})
          </button>
        </div>

        <button
          onClick={() => setActivePage(activeTab === 'access' ? 'access' : 'logs')}
          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          View Full Log <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table / List View */}
      <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
        {activeTab === 'access' ? (
          accessRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No recent access requests recorded.
            </div>
          ) : (
            accessRequests.slice(0, 6).map((req) => (
              <div
                key={req.id}
                className="p-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {req.result === 'ALLOWED' ? (
                      <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 truncate">
                        {req.resource}
                      </span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                        {req.method}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      Subject: <span className="text-slate-300 font-medium">{req.user}</span> • Reason: {req.reason}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                      req.result === 'ALLOWED'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                        : 'bg-rose-950/60 text-rose-300 border-rose-700/50'
                    }`}
                  >
                    {req.result}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {req.time}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          events.slice(0, 6).map((evt) => (
            <div
              key={evt.id}
              className="p-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(
                    evt.severity
                  )}`}
                >
                  {evt.severity}
                </span>

                <div className="min-w-0">
                  <div className="text-slate-200 font-medium truncate">
                    {evt.event}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    Node: {evt.device} • User: {evt.user} • IP: {evt.ipAddress}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    evt.result === 'SUCCESS'
                      ? 'text-emerald-400 bg-emerald-950/40'
                      : 'text-rose-400 bg-rose-950/40'
                  }`}
                >
                  {evt.result}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">
                  {evt.timestamp.split(' ')[1] || evt.timestamp}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
