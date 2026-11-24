import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  BarChart3, Download, Filter, RefreshCw, Calendar, 
  Clock, FileText, CheckCircle2, ShieldAlert 
} from 'lucide-react';

export const ReportsAnalyticsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    departmentId: '',
    category: '',
    status: ''
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    setLoading(true);
    try {
      const [deptsRes, reportRes] = await Promise.all([
        api.getDepartments(),
        api.getReports(filters)
      ]);
      if (deptsRes.success) setDepartments(deptsRes.departments || []);
      if (reportRes.success) setReportData(reportRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadReport();
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (reportData.length === 0) return;

    const headers = ['Reference ID', 'Category', 'Subject', 'Department', 'Status', 'Priority', 'Anonymous', 'Created At', 'Resolved At', 'Hours Elapsed'];
    const rows = reportData.map(r => [
      r.reference_id,
      `"${r.category}"`,
      `"${r.subject.replace(/"/g, '""')}"`,
      `"${r.department_name}"`,
      r.status,
      r.priority,
      r.anonymous ? 'Yes' : 'No',
      r.created_at,
      r.resolved_at || 'Unresolved',
      r.hours_elapsed || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Grievance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const total = reportData.length;
  const resolvedCount = reportData.filter(r => r.status === 'Resolved').length;
  const escalatedCount = reportData.filter(r => r.status === 'Escalated').length;
  const avgHours = total > 0 
    ? Math.round(reportData.reduce((acc, r) => acc + (r.hours_elapsed || 0), 0) / total) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Audit Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Generate customized grievance logs, SLA turnaround analytics, and compliance data for accreditation.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={reportData.length === 0}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4 text-sky-300" />
          Export CSV Spreadsheet
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total in Scope</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{total}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-emerald-600">Resolved Cases</div>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{resolvedCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-red-600">Escalated Cases</div>
          <div className="text-2xl font-black text-red-700 mt-0.5">{escalatedCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase text-blue-600">Avg Turnaround</div>
          <div className="text-2xl font-black text-blue-900 mt-0.5">{avgHours}h</div>
        </div>
      </div>

      {/* Filter Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.department_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ startDate: '', endDate: '', departmentId: '', category: '', status: '' });
                loadReport();
              }}
              className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Compiling report rows...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">{error}</div>
        ) : reportData.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400">No grievances found matching the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Category & Subject</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Hours Elapsed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-900">
                      {row.reference_id}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{row.subject}</div>
                      <div className="text-[11px] text-slate-500">{row.category}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {row.department_name}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={row.priority} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                      {row.hours_elapsed || 0} hrs
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
