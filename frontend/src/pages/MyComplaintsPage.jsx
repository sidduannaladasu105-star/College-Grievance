import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  Search, Filter, PlusCircle, ArrowUpDown, RefreshCw, 
  Eye, FileText, Calendar, Building2, User 
} from 'lucide-react';

export const MyComplaintsPage = ({ onSelectComplaint, onNavigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const loadComplaints = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined
      };
      const res = await api.getComplaints(params);
      if (res.success) {
        setComplaints(res.complaints || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints(1);
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComplaints(1);
  };

  const getPageTitle = () => {
    if (user?.role === 'admin') return 'Master Grievance Registry';
    if (user?.role === 'officer') return 'Departmental Case Records';
    if (user?.role === 'committee') return 'Escalated & Sensitive Committee Cases';
    return 'My Grievance History';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{getPageTitle()}</h1>
          <p className="text-xs text-slate-500">
            {user?.role === 'admin' 
              ? 'Institutional record of all logged grievances, assignments, and resolutions.'
              : 'Search, filter, and review active or resolved grievances.'}
          </p>
        </div>

        {user?.role === 'student' && (
          <button
            onClick={() => onNavigate('submit')}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start"
          >
            <PlusCircle className="w-4 h-4" />
            Lodge New Grievance
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Reference ID, Subject, or description keywords..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Escalated">Escalated</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Filter
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCategoryFilter('');
                setPriorityFilter('');
                loadComplaints(1);
              }}
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading cases...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <div className="text-sm font-bold text-slate-800">No records found</div>
            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Subject & Category</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Submitter</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-blue-900">{c.reference_id}</div>
                      {c.is_sensitive === 1 && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 mt-0.5">
                          Confidential
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
                    <td className="px-6 py-4 text-slate-600">
                      {c.submitter_name}
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
                        className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {complaints.length} of {pagination.total} records
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => loadComplaints(pg)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    pagination.page === pg ? 'bg-blue-900 text-white' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
