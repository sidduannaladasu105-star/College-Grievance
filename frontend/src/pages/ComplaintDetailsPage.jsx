import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { EscalateModal } from '../components/EscalateModal';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { 
  ArrowLeft, Shield, Clock, CheckCircle2, AlertTriangle, 
  FileText, Download, User, Building2, Send, ShieldAlert, Edit3 
} from 'lucide-react';

export const ComplaintDetailsPage = ({ complaintId, onBack, onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaintById(complaintId);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load complaint');
      }
    } catch (err) {
      setError(err.message || 'Error loading complaint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) loadDetails();
  }, [complaintId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSendingNote(true);
    try {
      await api.addComplaintUpdate(complaintId, {
        message: newNote.trim(),
        is_internal: isInternalNote
      });
      setNewNote('');
      loadDetails();
    } catch (err) {
      alert(err.message || 'Failed to post note');
    } finally {
      setSendingNote(false);
    }
  };

  const handleEscalateSubmit = async (cId, reason) => {
    await api.escalateComplaint(cId, { reason });
    loadDetails();
  };

  const handleStatusUpdate = async (cId, payload) => {
    await api.updateComplaintStatus(cId, payload);
    loadDetails();
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading complaint details...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-xs text-red-600">{error || 'Grievance not found'}</div>
        <button onClick={onBack} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const { complaint, updates, attachments, escalations } = data;
  const isStaff = ['officer', 'admin', 'committee'].includes(user?.role);
  const canEscalate = user?.role === 'student' && complaint.status !== 'Resolved' && complaint.status !== 'Escalated';

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to List
      </button>

      {/* Main Dossier Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl font-black text-blue-900">
                {complaint.reference_id}
              </span>
              <StatusBadge status={complaint.status} size="md" />
              <PriorityBadge priority={complaint.priority} size="md" />
              {complaint.is_sensitive === 1 && (
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                  Strict Confidentiality
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Category: <strong className="text-slate-800">{complaint.category}</strong> • Routed to:{' '}
              <strong className="text-slate-800">{complaint.department_name}</strong>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isStaff && (
              <button
                onClick={() => setIsUpdateOpen(true)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Update Status
              </button>
            )}
            {canEscalate && (
              <button
                onClick={() => setIsEscalateOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Escalate
              </button>
            )}
          </div>
        </div>

        {/* Rejection / Resolution Alerts */}
        {complaint.status === 'Resolved' && complaint.resolution_notes && (
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Official Resolution
            </div>
            <p className="leading-relaxed">{complaint.resolution_notes}</p>
          </div>
        )}

        {complaint.status === 'Rejected' && (
          <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-1">
            <div className="font-extrabold text-sm text-rose-900">Case Rejected</div>
            <p>{complaint.rejection_reason || 'Institutional grounds not met.'}</p>
          </div>
        )}

        {/* Content & Description */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{complaint.subject}</h2>
            <div className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {complaint.description}
            </div>
          </div>

          {/* Submitter & SLA details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Complainant</div>
              <div className="font-bold text-slate-800 mt-0.5 truncate">
                {complaint.submitter_name || (complaint.anonymous ? 'Anonymous' : 'Student')}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Logged Date</div>
              <div className="font-bold text-slate-800 mt-0.5">
                {new Date(complaint.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Resolution SLA</div>
              <div className="font-bold text-slate-800 mt-0.5">
                {complaint.resolution_deadline 
                  ? new Date(complaint.resolution_deadline).toLocaleDateString()
                  : '7 Days'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Officer</div>
              <div className="font-bold text-slate-800 mt-0.5 truncate">
                {complaint.officer_name || 'Pending Officer Assignment'}
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        {attachments && attachments.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Attached Evidence ({attachments.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((att) => (
                <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-900 flex-shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{att.file_name}</span>
                    <span className="text-[10px] text-slate-400">({(att.file_size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <a
                    href={`/api/complaints/attachments/${att.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-blue-900 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                    title="Download / View"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Escalation History */}
        {escalations && escalations.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-900">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Escalation History & Committee Hearings</span>
            </div>

            {escalations.map((esc) => (
              <div key={esc.id} className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-950 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Level {esc.escalation_level} Escalation</span>
                  <span className="text-[10px] text-red-700">{new Date(esc.created_at).toLocaleString()}</span>
                </div>
                <p><strong>Reason:</strong> {esc.escalation_reason}</p>
                {esc.committee_notes && (
                  <p className="mt-1 pt-1 border-t border-red-200/60 text-red-900">
                    <strong>Committee Ruling:</strong> {esc.committee_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timeline & Updates */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Case Timeline & Progress Records
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {updates.map((u) => (
              <div key={u.id} className="relative group">
                <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ${
                  u.is_internal ? 'bg-amber-600 ring-amber-100' : 'bg-blue-900 ring-blue-100'
                }`}></div>
                <div className="text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{u.status}</span>
                    {u.is_internal === 1 && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                        Internal Note
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(u.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {u.updater_name && (
                      <span className="text-[10px] text-slate-500">• {u.updater_name}</span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {u.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Communication Note Box */}
        <div className="pt-4 border-t border-slate-100">
          <form onSubmit={handleAddNote} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add Follow-up Message or Status Note
            </label>
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Post a message, inquiry, or update on this grievance..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
              required
            />

            <div className="flex items-center justify-between">
              {isStaff ? (
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-500"
                  />
                  <span>Mark internal note (invisible to student)</span>
                </label>
              ) : <div></div>}

              <button
                type="submit"
                disabled={sendingNote || !newNote.trim()}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingNote ? 'Posting...' : 'Post Message'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Modals */}
      <EscalateModal
        isOpen={isEscalateOpen}
        onClose={() => setIsEscalateOpen(false)}
        complaint={complaint}
        onEscalate={handleEscalateSubmit}
      />

      <StatusUpdateModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        complaint={complaint}
        onUpdateStatus={handleStatusUpdate}
      />

    </div>
  );
};
