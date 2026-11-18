import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Calendar,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AccessRequest } from '../types/security';
import { SecurityService } from '../services/securityService';
import { useApp } from '../context/AppContext';
import { getEndpoints } from '../services/config';

export const SecurityLogs: React.FC = () => {
  const { addToast } = useApp();
  const endpoints = getEndpoints();

  const [logs, setLogs] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultFilter, setResultFilter] = useState<'ALL' | 'ALLOWED' | 'DENIED'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [revealedNids, setRevealedNids] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await SecurityService.getAccessLogs(resultFilter, search);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [resultFilter, search]);

  const toggleMask = (id: string) => {
    setRevealedNids((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maskNid = (nid?: string, logId?: string): string => {
    if (!nid) return '•••• •••• ••••';
    if (logId && revealedNids.has(logId)) return nid;
    if (nid.length <= 4) return '•••• ' + nid;
    return '•••• •••• ' + nid.slice(-4);
  };

  const handleExportCsv = () => {
    window.open(endpoints.logsExport, '_blank');
    addToast({
      title: 'Audit Log Export Triggered',
      message: 'Downloading immutable security audit logs CSV directly from Flask backend.',
      type: 'success',
    });
  };

  // Pagination calculation
  const totalPages = Math.ceil(logs.length / pageSize) || 1;
  const paginatedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const grantedCount = logs.filter((l) => l.result === 'ALLOWED').length;
  const deniedCount = logs.filter((l) => l.result === 'DENIED').length;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Immutable Security Audit & Biometric Access Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-evident audit trail recording every dual-biometric access decision, match status, and reason
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadLogs}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total Access Evaluated</div>
            <div className="text-xl font-bold text-white font-display mt-0.5">{logs.length} Events</div>
          </div>
          <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Granted Approvals</div>
            <div className="text-xl font-bold text-emerald-400 font-display mt-0.5">{grantedCount}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Security Prohibitions</div>
            <div className="text-xl font-bold text-rose-400 font-display mt-0.5">{deniedCount}</div>
          </div>
          <XCircle className="w-6 h-6 text-rose-400" />
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by NID, Citizen Name, or Failure Reason..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Outcomes (Granted & Denied)</option>
            <option value="ALLOWED">ACCESS GRANTED Only</option>
            <option value="DENIED">ACCESS DENIED Only</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Subject / Name</th>
                <th className="py-3 px-4">National ID (Masked)</th>
                <th className="py-3 px-4">Face Check</th>
                <th className="py-3 px-4">Fingerprint</th>
                <th className="py-3 px-4">Final Decision</th>
                <th className="py-3 px-4">Security Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No access log events matched the query criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap text-[10px]">
                      {log.timestamp}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-white whitespace-nowrap">
                      {log.user}
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-cyan-300">
                          {maskNid(log.nid, log.id)}
                        </span>
                        {log.nid && (
                          <button
                            onClick={() => toggleMask(log.id)}
                            className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="Toggle Mask"
                          >
                            {revealedNids.has(log.id) ? (
                              <EyeOff className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.faceMatched
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {log.faceMatched ? 'PASS' : 'FAIL'}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.fingerprintMatched
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {log.matchedId ? `ID #${log.matchedId}` : log.fingerprintMatched ? 'PASS' : 'FAIL'}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'ALLOWED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {log.result === 'ALLOWED' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-slate-300 font-mono text-[10px] truncate max-w-[160px]">
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-400">
            Showing Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({logs.length} Total Logs)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
