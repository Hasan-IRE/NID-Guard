import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { DemoNidRecord } from '../../types/nidRecord';
import { StatusBadge } from '../common/StatusBadge';

interface NIDRecordListProps {
  records: DemoNidRecord[];
  search: string;
  onSearchChange: (val: string) => void;
  onViewRecord: (record: DemoNidRecord) => void;
  onEditRecord?: (record: DemoNidRecord) => void;
  onDeleteRecord?: (id: string | number, recordId?: string) => void;
  onAddNew?: () => void;
  canManage?: boolean;
}

export const NIDRecordList: React.FC<NIDRecordListProps> = ({
  records,
  search,
  onSearchChange,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onAddNew,
  canManage = true,
}) => {
  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Search and Action Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Name, Demo NID, Record ID, Address..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {canManage && onAddNew && (
          <button
            onClick={onAddNew}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Demo Record</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Demo NID Number</th>
                <th className="py-3 px-4">Full Name (Synthetic)</th>
                <th className="py-3 px-4">Associated Template ID</th>
                <th className="py-3 px-4">Biometric Status</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No synthetic NID records found matching search.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-800/30 transition-colors text-xs"
                  >
                    <td className="py-3 px-4 font-semibold text-cyan-400">
                      {r.record_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                        {r.demo_nid_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-100">
                      {r.name}
                    </td>
                    <td className="py-3 px-4 text-purple-300">
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                        <span>Slot #{r.fingerprint_template_id || (r.record_id === 'NID-DEMO-001' ? 1 : r.record_id === 'NID-DEMO-002' ? 2 : '—')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.biometric_status} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.account_status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewRecord(r)}
                          className="p-1.5 text-blue-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          title="View encrypted details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && onEditRecord && (
                          <button
                            onClick={() => onEditRecord(r)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Edit demo record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canManage && onDeleteRecord && (
                          <button
                            onClick={() => onDeleteRecord(r.id, r.record_id)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded transition-colors"
                            title="Delete demo record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default NIDRecordList;
