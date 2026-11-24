import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  BarChart3, Users, Building2, ShieldAlert, CheckCircle2, 
  Clock, AlertTriangle, FileText, ArrowRight, Eye, ShieldCheck 
} from 'lucide-react';

export const AdminDashboard = ({ onNavigate, onSelectComplaint }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        setError('Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading university administrative metrics...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-xs text-red-600">{error || 'Failed to load stats'}</div>;
  }

  const { stats, categoryStats, departmentStats, urgentComplaints } = data;

  return (
    <div className="space-y-8">
      
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Redressal Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time university-wide grievance metrics, resolution SLAs, and departmental oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('departments')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-blue-900" />
            Departments & Routing
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-sky-300" />
            Export Reports
          </button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={stats.total}
          icon={FileText}
          color="blue"
          subtitle="Cumulative cases logged"
          badge={`${stats.anonymous} Anonymous`}
        />
        <StatCard
          title="Active Pending"
          value={stats.pending}
          icon={Clock}
          color="indigo"
          subtitle="Currently under investigation"
          badge={`${stats.overdue} Overdue SLA`}
        />
        <StatCard
          title="Resolved Cases"
          value={stats.resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`Avg ${stats.avgResolutionDays} days resolution`}
          badge={`${Math.round((stats.resolved / (stats.total || 1)) * 100)}% Success`}
        />
        <StatCard
          title="Escalated to Committee"
          value={stats.escalated}
          icon={ShieldAlert}
          color="rose"
          subtitle="Direct committee hearings"
          badge="High Priority"
        />
      </div>

      {/* Urgent Overdue & Escalated Cases Banner */}
      {urgentComplaints && urgentComplaints.length > 0 && (
        <div className="bg-white rounded-3xl border border-red-200/90 shadow-sm overflow-hidden">
          <div className="bg-red-50/70 p-5 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
              <h2 className="font-bold text-sm text-red-950">Urgent Cases Requiring Immediate Attention</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-200 text-red-800">
              {urgentComplaints.length} Cases
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {urgentComplaints.map((c) => (
              <div key={c.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900">{c.reference_id}</span>
                    <StatusBadge status={c.status} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                  </div>
                  <div className="font-bold text-slate-900">{c.subject}</div>
                  <div className="text-slate-500 text-[11px]">
                    Category: {c.category} • Department: <strong>{c.department_name}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => onSelectComplaint(c.id)}
                    className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Resolution Efficiency */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Department Resolution Efficiency</h3>
              <p className="text-xs text-slate-500">Resolved vs Pending complaints per department</p>
            </div>
            <Building2 className="w-5 h-5 text-blue-900" />
          </div>

          <div className="space-y-3 pt-2">
            {departmentStats.map((d) => (
              <div key={d.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span className="truncate max-w-[200px]">{d.department_name}</span>
                  <span className="text-[11px] font-mono font-bold text-slate-900">
                    {d.resolved_count} / {d.total_received} ({d.resolution_rate_pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${d.resolution_rate_pct}%` }}
                    title={`Resolved: ${d.resolved_count}`}
                  ></div>
                  <div 
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${100 - d.resolution_rate_pct}%` }}
                    title={`Pending: ${d.pending_count}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints by Category Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Category Distribution</h3>
              <p className="text-xs text-slate-500">Proportion of campus grievances by category</p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-900" />
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((cat, i) => {
              const pct = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
              return (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span className="truncate max-w-[220px]">{cat.category}</span>
                    <span className="text-[11px] font-mono font-bold text-blue-900">
                      {cat.count} cases ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-900 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
