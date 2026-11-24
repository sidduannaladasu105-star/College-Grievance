import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  PlusCircle, Search, Clock, CheckCircle2, ShieldAlert, 
  FileText, ArrowRight, AlertCircle, RefreshCw 
} from 'lucide-react';

export const StudentDashboard = ({ onNavigate, onSelectComplaint }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({ limit: 10 });
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      setError('Failed to load recent grievances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(c => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const escalatedCount = complaints.filter(c => c.status === 'Escalated').length;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-800/80 rounded-full text-xs font-semibold text-sky-200">
            Student Redressal Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
            Lodge campus concerns with guaranteed institutional confidentiality, automatic department routing, and real-time SLA tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('submit')}
            className="px-5 py-3 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            Lodge Grievance
          </button>
          <button
            onClick={() => onNavigate('track')}
            className="px-5 py-3 bg-blue-800/60 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl border border-blue-700 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-sky-300" />
            Track Case ID
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submitted"
          value={totalCount}
          icon={FileText}
          color="blue"
          subtitle="Your recorded grievances"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="indigo"
          subtitle="Under active investigation"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully closed cases"
        />
        <StatCard
          title="Escalated"
          value={escalatedCount}
          icon={ShieldAlert}
          color="rose"
          subtitle="Forwarded to committee"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Recent Grievances</h2>
            <p className="text-xs text-slate-500">Track real-time status and departmental notes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('my-complaints')}
              className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your grievances...</div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-600">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-slate-800">No grievances submitted yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Need assistance with academics, hostels, dining, or campus facilities? Lodge your complaint securely.
            </p>
            <button
              onClick={() => onNavigate('submit')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors"
            >
              Submit First Complaint
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Subject & Category</th>
                  <th className="px-6 py-3.5">Assigned Department</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Submitted On</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-900">
                      {c.reference_id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 max-w-xs truncate">{c.subject}</div>
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
                      {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onSelectComplaint(c.id)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
