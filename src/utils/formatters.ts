export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleTimeString();
  } catch {
    return dateString;
  }
}

export function maskNid(nidNumber?: string, reveal: boolean = false): string {
  if (!nidNumber) return '••••••••••••';
  if (reveal) return nidNumber;
  return '••••••••••••';
}

export function getStatusColor(status?: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'ONLINE':
    case 'CONNECTED':
    case 'ACTIVE':
    case 'VERIFIED':
    case 'GRANTED':
    case 'SUCCESS':
    case 'DETECTED':
      return {
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-300',
        border: 'border-emerald-600/50',
        dot: 'bg-emerald-400',
      };

    case 'OFFLINE':
    case 'DISCONNECTED':
    case 'DENIED':
    case 'BLOCKED':
    case 'ERROR':
    case 'FAILURE':
      return {
        bg: 'bg-rose-950/60',
        text: 'text-rose-300',
        border: 'border-rose-600/50',
        dot: 'bg-rose-400',
      };

    case 'WARNING':
    case 'NOT VERIFIED':
    case 'NOT_VERIFIED':
    case 'NO_FINGER':
    case 'PENDING':
    case 'NOT DETECTED':
      return {
        bg: 'bg-amber-950/60',
        text: 'text-amber-300',
        border: 'border-amber-600/50',
        dot: 'bg-amber-400',
      };

    default:
      return {
        bg: 'bg-slate-900',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-500',
      };
  }
}
