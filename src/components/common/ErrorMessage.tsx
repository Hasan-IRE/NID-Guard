import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Hardware / Network Alert',
  message,
  onRetry,
}) => {
  return (
    <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-200 font-mono text-xs space-y-2">
      <div className="flex items-center gap-2 text-rose-300 font-bold uppercase tracking-wider">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>{title}</span>
      </div>
      <p className="text-[11px] text-rose-200/90 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-850 text-rose-100 text-xs font-semibold border border-rose-700/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
export default ErrorMessage;
