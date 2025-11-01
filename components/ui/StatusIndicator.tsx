import React from 'react';

export interface StatusIndicatorProps {
  type: 'live' | 'sync' | 'offline';
  text: string;
}

export default function StatusIndicator({ type, text }: StatusIndicatorProps) {
  const classes = {
    live: 'status-live',
    sync: 'status-sync',
    offline: 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 font-medium text-xs',
  };

  return (
    <div className={classes[type]}>
      {text}
    </div>
  );
}
