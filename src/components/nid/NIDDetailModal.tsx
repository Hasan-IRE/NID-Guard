import React, { useState } from 'react';
import { 
  CreditCard, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { DemoNidRecord } from '../../types/nid';
import { Modal } from '../common/Modal';

interface NIDDetailModalProps {
  record: DemoNidRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (id: string | number) => void;
}

export const NIDDetailModal: React.FC<NIDDetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onToggleStatus,
}) => {
  const [showNidNumber, setShowNidNumber] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  if (!record) return null;

  const maskedNid = '••••••••••••';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Demo Record: ${record.record_id}`}
      subtitle="Fictitious Synthetic Demographic Record (Zero Real PII)"
      maxWidth="xl"
    >
      <div className="space-y-5 font-mono text-xs">
        {/* Academic Prototype Synthetic Warning */}
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Synthetic Record for Prototype Evaluation. No real identity linked.</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase text-[10px] font-bold">
            Synthetic
          </span>
        </div>

        {/* Primary Identification Card Mockup */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Registered Citizen Name (Synthetic)</div>
                <div className="text-base font-bold text-white tracking-wide">{record.name}</div>
                <div className="text-[10px] text-slate-400">Record ID: {record.record_id}</div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border ${
                  record.account_status === 'Active'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                    : 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                }`}
              >
                {record.account_status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Privacy-Aware Masked NID Number Field */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-400" />
                Protected Demo NID Number (Masked by Default)
              </div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5 tracking-wider">
                {showNidNumber ? record.demo_nid_number : maskedNid}
              </div>
            </div>

            <button
              onClick={() => setShowNidNumber(!showNidNumber)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
            >
              {showNidNumber ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>

          {/* Detailed demographic grid */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Date of Birth</span>
              <div className="text-slate-200 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {record.date_of_birth}
              </div>
            </div>

            <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Blood Group</span>
              <div className="text-slate-200 mt-0.5">{record.blood_group || 'O+'}</div>
            </div>

            <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Biometric Registration</span>
              <div className="text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {record.biometric_status}
              </div>
            </div>

            <div className="p-2 rounded bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase">Access Count</span>
              <div className="text-cyan-400 mt-0.5 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {record.access_count} Access Requests
              </div>
            </div>

            <div className="col-span-2 p-2 rounded bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[10px] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Address (Synthetic)
                </span>
                <div className="text-slate-200 mt-0.5">
                  {showAddress ? record.address : '••••••••••••••••••••••••••••'}
                </div>
              </div>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="text-[10px] text-blue-400 hover:text-blue-300 underline"
              >
                {showAddress ? 'Mask' : 'Reveal'}
              </button>
            </div>
          </div>
        </div>

        {/* Cryptographic Envelope Details */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
          <div className="text-slate-400 font-semibold uppercase text-[10px] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Cryptographic Storage Envelope (At-Rest)
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-400">
            <div>
              Cipher: <span className="text-slate-200">{record.encryption_algorithm}</span>
            </div>
            <div>
              Key Ring: <span className="text-slate-200">{record.key_version}</span>
            </div>
            <div>
              Enrolled: <span className="text-slate-200">{record.created_at}</span>
            </div>
            <div>
              Last Accessed: <span className="text-slate-200">{record.last_access || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              onToggleStatus(record.id);
              onClose();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              record.account_status === 'Active'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
            }`}
          >
            {record.account_status === 'Active' ? 'Disable Demo Record' : 'Activate Demo Record'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
