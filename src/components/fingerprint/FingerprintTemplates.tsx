import React from 'react';
import { Fingerprint, Lock, ShieldAlert, AlertTriangle, Info, Database } from 'lucide-react';
import { DemoNidRecord } from '../../types/nidRecord';

interface FingerprintTemplatesProps {
  storedCount: number;
  matchedId: number;
  nidRecords: DemoNidRecord[];
}

export const FingerprintTemplates: React.FC<FingerprintTemplatesProps> = ({
  storedCount,
  matchedId,
  nidRecords,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 font-mono text-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>On-Chip Template Allocation & Synthetic NID Mapping</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Internal R307S flash slots paired with synthetic demo identity records
          </p>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold">
          {storedCount} Active Slots
        </span>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: Math.max(storedCount, 4) }).map((_, index) => {
          const slotId = index + 1;
          const isSlotActive = slotId <= storedCount;
          const isCurrentlyMatched = matchedId === slotId;
          const matchedRecord = nidRecords.find((r) => r.fingerprint_template_id === slotId || (slotId === 1 && r.record_id === 'NID-DEMO-001') || (slotId === 2 && r.record_id === 'NID-DEMO-002'));

          return (
            <div
              key={slotId}
              className={`p-3.5 rounded-lg border transition-all ${
                isCurrentlyMatched
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                  : isSlotActive
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-950/30 border-slate-800/40 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 uppercase">
                  Slot #{slotId}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isCurrentlyMatched
                      ? 'bg-emerald-500 text-slate-950 animate-pulse'
                      : isSlotActive
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCurrentlyMatched ? 'MATCHED' : isSlotActive ? 'ENROLLED' : 'EMPTY'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Fingerprint className={`w-5 h-5 ${isCurrentlyMatched ? 'text-emerald-400' : isSlotActive ? 'text-purple-400' : 'text-slate-600'}`} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">
                    {matchedRecord ? matchedRecord.name : isSlotActive ? `Template #00${slotId}` : 'Unassigned Slot'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {matchedRecord ? matchedRecord.record_id : 'Synthetic Slot'}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Security Ring:</span>
                <span className="text-slate-400 font-mono">DSP AES-256</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Firmware Operation Notice per section 8 of Master Prompt */}
      <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-600/30 text-amber-200 text-[11px] leading-relaxed flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-300 uppercase tracking-wide">
            Firmware Operational Boundary Notice
          </div>
          <p className="text-amber-200/90 text-[10px]">
            Fingerprint enrollment and template deletion require dedicated ESP32 firmware UART command routines (e.g., <code>FINGERPRINT_ENROLL</code> / <code>FINGERPRINT_DELETE</code>). If your active ESP32 firmware only exposes read status, enrollment and deletion operations are unavailable from the web console.
          </p>
        </div>
      </div>
    </div>
  );
};
export default FingerprintTemplates;
