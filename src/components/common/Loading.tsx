import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Connecting to SecureGuard...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 font-mono">
      <Loader2 className={`${sizeClasses} text-cyan-400 animate-spin`} />
      <span className="text-xs text-slate-400">{message}</span>
    </div>
  );
};
export default Loading;
