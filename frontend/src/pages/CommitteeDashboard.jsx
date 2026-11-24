import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { 
  ShieldAlert, CheckCircle2, Clock, Eye, Edit3, 
  Calendar, RefreshCw, AlertCircle, Award 
} from 'lucide-react';

export const CommitteeDashboard = ({ onNavigate, onSelectComplaint }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({ limit: 50 });
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch committee hearings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (id, payload) => {
    await api.updateComplaintStatus(id, payload);
    loadData();
  };

  const escalatedCases = complaints.filter(c => c.status === 'Escalated');
  const sensitiveCases = complaints.filter(c => c.is_sensitive === 1 || c.is_sensitive === true);
  const resolvedByCommittee = complaints.filter(c => c.status === 'Resolved');

  return (
    <div className="space-y-8">
      
      {/* Committee Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-red-900/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/80 rounded-full text-xs font-semibold text-red-200">
            <ShieldAlert className="w-3.5 h-3.5 text-red-300" />
            University Grievance & Disciplinary Committee
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Committee Hearings Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Presiding officer: <strong>{user?.name}</strong>. Handling formal escalations, overdue SLA breaches, sensitive anti-harassment investigations, and disciplinary rulings.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-red-900/50 hover:bg-red-900 text-white font-semibold text-xs rounded-xl border border-red-700 transition-all flex items-center gap-2 self-start md:self-center"
        >
          <RefreshCw className="w-4 h-4 text-red-300" />
          Refresh Docket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Escalated Hearings"
          value={escalatedCases.length}
          icon={ShieldAlert}
          color="rose"
          subtitle="Cases requiring committee intervention"
          badge="Urgent Attention"
        />
        <StatCard
          title="Sensitive Safety Cases"
          value={sensitiveCases.length}
          icon={AlertCircle}
          color="amber"
          subtitle="Confidential anti-harassment inquiries"
          badge="Strict Confidentiality"
        />
        <StatCard
          title="Closed Decisions"
          value={resolvedByCommittee.length}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Formal determinations rendered"
        />
      </div>

      {/* Hearing Docket Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Hearing Docket</h2>
            <p className="text-xs text-slate-500">Cases under formal committee mediation or review</p>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading committee hearings...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <div className="text-sm font-bold text-slate-800">No active escalations</div>
            <p className="text-xs text-slate-400">All escalated campus grievances have been resolved or concluded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Subject & Category</th>
                  <th className="px-6 py-4">Origin Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Escalated On</th>
                  <th className="px-6 py-4 text-right">Committee Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-900">
                      {c.reference_id}
                      {c.is_sensitive === 1 && (
                        <span className="block text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded w-fit mt-1">
                          Sensitive Safety
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{c.subject}</div>
                      <div className="text-[11px] text-slate-500">{c.category}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.department_name}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {new Date(c.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setIsUpdateModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-red-900 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Decide / Update
                      </button>
                      <button
                        onClick={() => onSelectComplaint(c.id)}
                        className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Hearing Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision / Status Modal */}
      {selectedComplaint && (
        <StatusUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedComplaint(null);
          }}
          complaint={selectedComplaint}
          onUpdateStatus={handleStatusUpdate}
        />
      )}

    </div>
  );
};
