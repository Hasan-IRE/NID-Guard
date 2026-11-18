import React from 'react';
import { getStatusColor } from '../../utils/formatters';

interface StatusBadgeProps {
  status?: string;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'UNKNOWN',
  label,
  showDot = true,
  className = '',
}) => {
  const displayLabel = label || status;
  const colors = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${status === 'ONLINE' || status === 'ACTIVE' || status === 'CONNECTED' ? 'animate-pulse' : ''}`} />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
export default StatusBadge;
