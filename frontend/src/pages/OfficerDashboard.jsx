import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { 
  Building2, Clock, CheckCircle2, ShieldAlert, FileText, 
  RefreshCw, Eye, Edit3, User, AlertCircle 
} from 'lucide-react';

export const OfficerDashboard = ({ onNavigate, onSelectComplaint }) => {
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
      setError(err.message || 'Failed to load department cases');
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

  const total = complaints.length;
  const inProgress = complaints.filter(c => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const escalated = complaints.filter(c => c.status === 'Escalated').length;

  return (
    <div className="space-y-8">
      
      {/* Department Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-800/80 rounded-full text-xs font-semibold text-sky-200">
            <Building2 className="w-3.5 h-3.5" />
            {user?.department_name || 'Department Console'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Officer Case Queue: {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Review grievances assigned to your department. Complainant identities are strictly anonymized for anonymous submissions to ensure objective handling.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-blue-800/60 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl border border-blue-700 transition-all flex items-center gap-2 self-start md:self-center"
        >
          <RefreshCw className="w-4 h-4 text-sky-300" />
          Refresh Queue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Cases"
          value={total}
          icon={FileText}
          color="blue"
          subtitle="Department workload"
        />
        <StatCard
          title="Under Investigation"
          value={inProgress}
          icon={Clock}
          color="indigo"
          subtitle="Active cases pending resolution"
        />
        <StatCard
          title="Successfully Resolved"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Resolved department cases"
        />
        <StatCard
          title="Escalated to Committee"
          value={escalated}
          icon={ShieldAlert}
          color="rose"
          subtitle="Exceeded deadline or committee review"
        />
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Assigned Grievance Roster</h2>
            <p className="text-xs text-slate-500">Respond, record investigation notes, and mark resolutions</p>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading department grievances...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <div className="text-sm font-bold text-slate-800">Queue is clear!</div>
            <p className="text-xs text-slate-400">No active grievances currently assigned to this department.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Subject & Description</th>
                  <th className="px-6 py-4">Complainant</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Resolution SLA</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-900">
                      {c.reference_id}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{c.subject}</div>
                      <div className="text-[11px] text-slate-500">{c.category}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.anonymous ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.submitter_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {c.resolution_deadline 
                        ? new Date(c.resolution_deadline).toLocaleDateString()
                        : '7 Days'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setIsUpdateModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Update
                      </button>
                      <button
                        onClick={() => onSelectComplaint(c.id)}
                        className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
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
