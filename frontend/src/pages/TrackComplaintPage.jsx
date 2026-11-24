import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { EscalateModal } from '../components/EscalateModal';
import { 
  Search, Shield, CheckCircle2, Clock, AlertTriangle, 
  FileText, ArrowRight, Download, Lock, ShieldAlert, Calendar, Building2 
} from 'lucide-react';

export const TrackComplaintPage = ({ initialRef = '', initialToken = '' }) => {
  const [referenceId, setReferenceId] = useState(initialRef);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);

  useEffect(() => {
    if (initialRef) {
      handleTrack(initialRef, initialToken);
    }
  }, [initialRef, initialToken]);

  const handleTrack = async (refToUse, tokenToUse) => {
    const rId = refToUse || referenceId;
    const t = tokenToUse !== undefined ? tokenToUse : token;

    if (!rId || !rId.trim()) {
      setError('Please enter a valid Reference ID (e.g. GRV-2026-A8K92X)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.trackComplaint(rId.trim(), t.trim());
      if (res.success && res.complaint) {
        setResult(res);
      } else {
        setError(res.message || 'Grievance not found');
        setResult(null);
      }
    } catch (err) {
      setError(err.message || 'Tracking failed. Please verify the Reference ID.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateSubmit = async (complaintId, reason) => {
    await api.escalateComplaint(complaintId, { reason });
    // Reload tracking result
    handleTrack(referenceId, token);
  };

  const sampleRefs = [
    { label: 'Academic Delay', ref: 'GRV-2026-A8K92X' },
    { label: 'Anonymous Mess Food', ref: 'GRV-2026-M4P10Q', token: 'tk_1a2b3c4d5e6f7a8b' },
    { label: 'Resolved Hostel Water', ref: 'GRV-2026-H7X49L' },
    { label: 'Urgent Safety Escalation', ref: 'GRV-2026-S9W83Z' }
  ];

  // Visual stepper steps
  const steps = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
  const getStepIndex = (status) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      case 'Escalated': return 3; // Escalated branches out from active investigation
      case 'Rejected': return 1;
      default: return 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Grievance Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your unique tracking reference ID to view real-time investigation progress and committee updates.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reference ID *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. GRV-2026-A8K92X"
                  className="w-full text-xs font-mono uppercase pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Secret Token <span className="text-[10px] text-slate-400 font-normal">(Optional for full view)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="tk_..."
                  className="w-full text-xs font-mono pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Quick Demo Test Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
              <span className="font-semibold">Quick Test:</span>
              {sampleRefs.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setReferenceId(s.ref);
                    setToken(s.token || '');
                    handleTrack(s.ref, s.token || '');
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 rounded-md border border-slate-200 text-[10px] font-mono transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Track Grievance'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && result.complaint && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Main Case Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-blue-900">
                    {result.complaint.referenceId}
                  </span>
                  <StatusBadge status={result.complaint.status} size="md" />
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span className="font-medium">{result.complaint.category}</span>
                  <span>•</span>
                  <span>Routed to: <strong className="text-slate-800">{result.complaint.departmentName}</strong></span>
                </div>
              </div>

              {result.complaint.priority && (
                <div>
                  <PriorityBadge priority={result.complaint.priority} size="md" />
                </div>
              )}
            </div>

            {/* Stepper Progress Bar */}
            {result.complaint.status !== 'Rejected' && (
              <div className="py-2">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0"></div>
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-900 transition-all duration-500 z-0"
                    style={{ width: `${(getStepIndex(result.complaint.status) / (steps.length - 1)) * 100}%` }}
                  ></div>

                  {steps.map((st, i) => {
                    const activeIndex = getStepIndex(result.complaint.status);
                    const isDone = i <= activeIndex;
                    const isCurrent = i === activeIndex;
                    return (
                      <div key={st} className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                          isDone ? 'bg-blue-900 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                          isCurrent ? 'text-blue-900 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Escalated Alert Banner if complaint is escalated */}
            {result.complaint.status === 'Escalated' && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-900 space-y-1">
                  <div className="font-bold">Elevated to University Grievance Committee</div>
                  <p>
                    This case has been escalated due to deadline expiration or formal escalation review. The Grievance Committee has assumed direct jurisdiction over proceedings.
                  </p>
                </div>
              </div>
            )}

            {/* Rejection Alert */}
            {result.complaint.status === 'Rejected' && (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
                <div className="font-bold text-rose-700">Complaint Rejected</div>
                <p><strong>Reason:</strong> {result.complaint.rejectionReason || 'Institutional criteria not met.'}</p>
              </div>
            )}

            {/* Resolution Banner */}
            {result.complaint.status === 'Resolved' && result.complaint.resolutionNotes && (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="font-extrabold text-sm text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Remedial Action / Resolution
                </div>
                <p className="text-xs leading-relaxed text-emerald-950 font-medium">
                  {result.complaint.resolutionNotes}
                </p>
                {result.complaint.resolvedAt && (
                  <div className="text-[10px] text-emerald-700 pt-1">
                    Resolved on: {new Date(result.complaint.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Details Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{result.complaint.subject}</h3>
                {result.complaint.description ? (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                    {result.complaint.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-1">
                    [Detailed description protected by confidentiality. Enter tracking token to view.]
                  </p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Submission Date</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {new Date(result.complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Resolution SLA</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {result.complaint.resolutionDeadline 
                      ? new Date(result.complaint.resolutionDeadline).toLocaleDateString()
                      : 'Standard 7 Days'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Submission Type</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {result.complaint.anonymous ? 'Anonymous' : 'Identified'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Verification Level</div>
                  <div className={`font-bold mt-0.5 ${result.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {result.verified ? 'Verified Full Access' : 'Public Status View'}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Updates */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Investigation Updates & Timeline
              </h4>

              {result.complaint.updates && result.complaint.updates.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {result.complaint.updates.map((upd, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-900 ring-4 ring-blue-100"></div>
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{upd.status}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(upd.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {upd.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  Initial submission registered. Department officer assigned for preliminary review.
                </div>
              )}
            </div>

            {/* Escalation Button if active and not already escalated */}
            {result.complaint.status !== 'Resolved' && result.complaint.status !== 'Escalated' && result.complaint.id && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Unsatisfied with the departmental handling or exceeded deadline?
                </div>
                <button
                  type="button"
                  onClick={() => setIsEscalateOpen(true)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Escalate Complaint
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Escalate Modal */}
      {result && result.complaint && (
        <EscalateModal
          isOpen={isEscalateOpen}
          onClose={() => setIsEscalateOpen(false)}
          complaint={result.complaint}
          onEscalate={handleEscalateSubmit}
        />
      )}

    </div>
  );
};
