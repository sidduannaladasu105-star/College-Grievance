import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  Building2, PlusCircle, Users, Check, X, Edit, 
  ShieldAlert, Settings, RefreshCw, AlertCircle 
} from 'lucide-react';

export const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [newDept, setNewDept] = useState({
    department_name: '',
    description: '',
    contact_email: '',
    is_sensitive: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptsRes, rulesRes] = await Promise.all([
        api.getDepartments(),
        api.getRoutingRules()
      ]);
      if (deptsRes.success) setDepartments(deptsRes.departments || []);
      if (rulesRes.success) setRules(rulesRes.rules || []);
    } catch (err) {
      setError(err.message || 'Failed to load department configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!newDept.department_name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createDepartment(newDept);
      setIsAddDeptOpen(false);
      setNewDept({ department_name: '', description: '', contact_email: '', is_sensitive: false });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Departments & Automated Routing Rules
          </h1>
          <p className="text-xs text-slate-500">
            Configure institutional departments, designated officers, and category routing SLAs.
          </p>
        </div>

        <button
          onClick={() => setIsAddDeptOpen(true)}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading department structures...</div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-red-600">{error}</div>
      ) : (
        <>
          {/* Departments Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Configured Departments ({departments.length})</h2>
                <p className="text-xs text-slate-500">Active university offices registered to resolve student and staff complaints</p>
              </div>
              <button onClick={loadData} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Department Name</th>
                    <th className="px-6 py-4">Scope & Purpose</th>
                    <th className="px-6 py-4">Contact Email</th>
                    <th className="px-6 py-4">Officers</th>
                    <th className="px-6 py-4">Active Cases</th>
                    <th className="px-6 py-4">Sensitivity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {departments.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {d.department_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-sm">
                        {d.description || 'No description configured'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">
                        {d.contact_email || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          {d.officer_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-900 font-mono">
                          {d.active_complaints_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {d.is_sensitive === 1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Restricted
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Standard
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Routing Rules Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Category Auto-Routing & SLA Rules</h2>
              <p className="text-xs text-slate-500">
                Grievances submitted under these categories are routed to the designated committee with strict SLA resolution limits.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Routed Department</th>
                    <th className="px-6 py-4">Default Priority</th>
                    <th className="px-6 py-4">Resolution SLA</th>
                    <th className="px-6 py-4">Confidentiality Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {rules.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {r.category}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {r.department_name}
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={r.default_priority} size="sm" />
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {r.resolution_days} Days
                      </td>
                      <td className="px-6 py-4">
                        {r.is_sensitive === 1 ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            Sensitive Committee Only
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Standard Department Staff</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Department Modal */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Register New Department</h3>
              <button 
                onClick={() => setIsAddDeptOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={newDept.department_name}
                  onChange={(e) => setNewDept({ ...newDept, department_name: e.target.value })}
                  placeholder="e.g. Sports & Physical Education"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scope & Description
                </label>
                <textarea
                  rows={3}
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Mandate and jurisdiction of this committee..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Contact Email
                </label>
                <input
                  type="email"
                  value={newDept.contact_email}
                  onChange={(e) => setNewDept({ ...newDept, contact_email: e.target.value })}
                  placeholder="sports.council@university.edu"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sensitiveToggle"
                  checked={newDept.is_sensitive}
                  onChange={(e) => setNewDept({ ...newDept, is_sensitive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="sensitiveToggle" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Confidential / Sensitive Department (Restricted to designated committee members)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDeptOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
