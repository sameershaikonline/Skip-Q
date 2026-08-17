import React from 'react';

export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClass = 'bg-sky-500/10 text-sky-500 border-sky-500/20';

  if (['APPROVED', 'COMPLETED', 'SUCCESS'].includes(status)) {
    colorClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  } else if (['PENDING', 'BOOKED', 'IN_QUEUE'].includes(status)) {
    colorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  } else if (['REJECTED', 'CANCELLED', 'FAILED'].includes(status)) {
    colorClass = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  }

  return React.createElement(
    'span',
    {
      className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`,
    },
    status
  );
};
