import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X, Info } from 'lucide-react';

export const AcademicDisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-950/60 border-b border-amber-600/30 text-amber-200 px-4 py-2 text-xs flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-400 font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
        </span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-semibold uppercase tracking-wider text-amber-300">
            Academic Research Prototype:
          </span>
          <span className="text-amber-200/90">
            Synthetic demo data only. Does not connect to or store real Bangladesh National ID databases or government records.
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            ESP32-S3 Edge Node Simulation Active
          </span>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-100 p-1 rounded hover:bg-amber-800/40 transition-colors ml-2"
        title="Dismiss notice"
        aria-label="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
