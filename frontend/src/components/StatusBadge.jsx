import React from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, XCircle, ArrowUpRight, 
  HelpCircle, UserCheck, ShieldAlert 
} from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 font-medium' 
    : 'text-xs px-2.5 py-1 font-semibold';

  switch (status) {
    case 'Submitted':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Submitted
        </span>
      );
    case 'Under Review':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          Under Review
        </span>
      );
    case 'Assigned':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>
          <UserCheck className="w-3.5 h-3.5 text-sky-600" />
          Assigned
        </span>
      );
    case 'In Progress':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          In Progress
        </span>
      );
    case 'Awaiting Information':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
          Awaiting Info
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Resolved
        </span>
      );
    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    case 'Escalated':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 border border-red-300 animate-pulse ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          Escalated
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          {status || 'Unknown'}
        </span>
      );
  }
};
