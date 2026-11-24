import React, { useState } from 'react';
import { CheckCircle, X, Shield, Lock, FileText } from 'lucide-react';

export const StatusUpdateModal = ({ isOpen, onClose, complaint, onUpdateStatus }) => {
  const [status, setStatus] = useState(complaint?.status || 'In Progress');
  const [message, setMessage] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdateStatus(complaint.id, {
        status,
        message: message || `Status changed to ${status}`,
        resolution_notes: status === 'Resolved' ? resolutionNotes : undefined,
        rejection_reason: status === 'Rejected' ? rejectionReason : undefined,
        is_internal: isInternal
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update complaint status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Update Grievance Status</h3>
            <p className="text-xs text-blue-800">Case ID: {complaint.reference_id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Workflow Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            >
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Information">Awaiting Information</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Update Note / Message to Complainant
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Committee has verified lab records. Facilities manager will replace the equipment."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {status === 'Resolved' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Official Resolution Details *
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Detail the remedial actions taken to fully resolve this grievance..."
                className="w-full text-xs p-3 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                required
              />
            </div>
          )}

          {status === 'Rejected' && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
              <label className="block text-xs font-bold text-rose-900 uppercase tracking-wider">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State the institutional grounds for rejecting this grievance..."
                className="w-full text-xs p-3 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                required
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="internalCheck"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <label htmlFor="internalCheck" className="text-xs text-slate-700 flex items-center gap-1 font-medium cursor-pointer">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Mark as Internal Note (Confidential to Department & Admin)
            </label>
          </div>

          {error && (
            <div className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'Updating...' : 'Save Status Update'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
