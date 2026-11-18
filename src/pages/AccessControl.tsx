import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Filter, 
  Search, 
  RefreshCw, 
  Fingerprint, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  User,
  Info
} from 'lucide-react';
import { AccessRequest } from '../types/security';
import { DemoNidRecord } from '../types/nidRecord';
import { SecurityService } from '../services/securityService';
import { NidService } from '../services/nidService';
import { AccessSimulatorModal } from '../components/access/AccessSimulatorModal';
import { useSecureGuardStatus } from '../hooks/useSecureGuardStatus';
import { StatusBadge } from '../components/common/StatusBadge';

export const AccessControl: React.FC = () => {
  const { status: liveStatus, isLiveConnected } = useSecureGuardStatus();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [records, setRecords] = useState<DemoNidRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ALLOWED' | 'DENIED'>('ALL');
  const [search, setSearch] = useState('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, nidRes] = await Promise.all([
        SecurityService.getAccessLogs(filter),
        NidService.getRecords(),
      ]);
      if (reqRes.data) setRequests(reqRes.data);
      if (nidRes.data) setRecords(nidRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const filteredRequests = requests.filter((r) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      r.user.toLowerCase().includes(query) ||
      r.resource.toLowerCase().includes(query) ||
      r.method.toLowerCase().includes(query) ||
      r.reason.toLowerCase().includes(query)
    );
  });

  const currentAccessResult = liveStatus?.access_result || 'UNKNOWN';
  const matchedId = liveStatus?.matched_id ?? -1;
  const associatedRecord = records.find(
    (r) => r.fingerprint_template_id === matchedId || (matchedId === 1 && r.record_id === 'NID-DEMO-001') || (matchedId === 2 && r.record_id === 'NID-DEMO-002')
  );

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <span>Biometric Access Control & Verification Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-Trust access decisions evaluated between R307S fingerprint sensor, ESP32, and Flask backend
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Access Pipeline</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh access records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Current Access Decision Hero Panel */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white uppercase tracking-wider">
              Current Live Hardware Access Decision
            </h3>
          </div>
          <StatusBadge status={currentAccessResult} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Live Access Result</span>
            <div className="text-base font-bold mt-1 flex items-center gap-2">
              {currentAccessResult === 'GRANTED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : currentAccessResult === 'DENIED' ? (
                <XCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className={currentAccessResult === 'GRANTED' ? 'text-emerald-400' : currentAccessResult === 'DENIED' ? 'text-rose-400' : 'text-slate-300'}>
                {currentAccessResult}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Matched Fingerprint ID</span>
            <div className="text-base font-bold text-cyan-300 mt-1 flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>{matchedId > 0 ? `Template #${matchedId}` : 'NONE / UNMATCHED'}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Associated Synthetic NID Record</span>
            <div className="text-sm font-bold text-purple-300 mt-1 truncate">
              {associatedRecord ? `${associatedRecord.name} (${associatedRecord.record_id})` : 'No Associated Record'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Decision Timestamp</span>
            <div className="text-xs font-semibold text-slate-300 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{liveStatus?.timestamp || 'Polling live...'}</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-200 text-[11px] flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong>Access Policy Enforcement:</strong> Access is never automatically granted based only on face detection. The backend enforces verification against the R307S fingerprint sensor match and RBAC authorization tokens.
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by User, Resource, Method, Reason..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-700/80">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white shadow font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setFilter('ALLOWED')}
            className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              filter === 'ALLOWED'
                ? 'bg-emerald-600 text-white shadow font-semibold'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Allowed
          </button>
          <button
            onClick={() => setFilter('DENIED')}
            className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              filter === 'DENIED'
                ? 'bg-rose-600 text-white shadow font-semibold'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Denied
          </button>
        </div>
      </div>

      {/* Access Requests Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Subject / User</th>
                <th className="py-3 px-4">Protected Resource</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Authorization Reason</th>
                <th className="py-3 px-4">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No access requests found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-800/30 transition-colors text-xs"
                  >
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {req.time}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {req.user}
                    </td>
                    <td className="py-3 px-4 text-cyan-300">
                      {req.resource}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] text-slate-300">
                        {req.method}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.result} />
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {req.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator Modal */}
      <AccessSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        records={records}
        onComplete={loadData}
      />
    </div>
  );
};
export default AccessControl;
