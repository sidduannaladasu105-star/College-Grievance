import React from 'react';

export const PriorityBadge = ({ priority, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (priority) {
    case 'Urgent':
      return (
        <span className={`inline-flex items-center font-bold uppercase tracking-wider rounded-md bg-red-100 text-red-800 border border-red-300 ${sizeClasses}`}>
          ● Urgent
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center font-semibold rounded-md bg-orange-100 text-orange-800 border border-orange-200 ${sizeClasses}`}>
          High
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          Low
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {priority || 'Normal'}
        </span>
      );
  }
};
