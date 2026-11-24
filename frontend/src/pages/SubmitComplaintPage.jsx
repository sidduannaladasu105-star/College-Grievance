import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Shield, Lock, EyeOff, User, UploadCloud, AlertCircle, 
  CheckCircle2, Copy, Check, ArrowRight, FileText, Trash2, Info 
} from 'lucide-react';

export const SubmitComplaintPage = ({ onNavigate, onTrackSubmitted }) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Teaching & Academic Issues',
    subject: '',
    description: '',
    department_id: '',
    priority: 'Medium'
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.getPublicDepartments();
        if (res.success) setDepartments(res.departments || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    // Limit to 5 files
    if (files.length + selected.length > 5) {
      setError('You can upload a maximum of 5 supporting documents.');
      return;
    }
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Subject and detailed description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('subject', formData.subject.trim());
      data.append('description', formData.description.trim());
      data.append('anonymous', isAnonymous ? 'true' : 'false');
      if (formData.department_id) {
        data.append('department_id', formData.department_id);
      }
      data.append('priority', formData.priority);

      files.forEach((file) => {
        data.append('attachments', file);
      });

      const res = await api.submitComplaint(data);
      if (res.success && res.data) {
        setSubmittedData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit grievance');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lodge an Official Grievance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Submissions are automatically routed to designated departmental committees under university bylaws.
        </p>
      </div>

      {/* Submission Success Dialog */}
      {submittedData ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Grievance Registered Successfully</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your grievance has been safely logged in the university queue and auto-routed to{' '}
              <span className="font-bold text-slate-900">{submittedData.departmentName}</span>.
            </p>
          </div>

          {/* Reference ID and Tracking Token Card */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                Unique Tracking Reference ID
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-300">
                <span className="font-mono text-base font-extrabold text-blue-900">
                  {submittedData.referenceId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(submittedData.referenceId, 'ref')}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedRef ? 'Copied!' : 'Copy ID'}
                </button>
              </div>
            </div>

            {submittedData.anonymous && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-700 tracking-wider mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  Confidential Tracking Secret Token
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-300">
                  <span className="font-mono text-xs font-bold text-slate-800 truncate mr-2">
                    {submittedData.trackingToken}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(submittedData.trackingToken, 'tok')}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50 rounded-lg flex items-center gap-1.5 transition-colors flex-shrink-0"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copiedToken ? 'Copied!' : 'Copy Token'}
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 mt-1.5">
                  <strong>Save this secret token!</strong> Because you submitted anonymously, you must provide this token on the Track page to view detailed notes and committee updates.
                </p>
              </div>
            )}

          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onTrackSubmitted(submittedData.referenceId, submittedData.trackingToken)}
              className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Track this Case Now
            </button>
            <button
              onClick={() => {
                setSubmittedData(null);
                setFormData({
                  category: 'Teaching & Academic Issues',
                  subject: '',
                  description: '',
                  department_id: '',
                  priority: 'Medium'
                });
                setFiles([]);
              }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Submit Another Grievance
            </button>
          </div>

        </div>
      ) : (
        /* Submission Form */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          
          {/* Anonymous vs Identified Toggle */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                {isAnonymous ? (
                  <span className="flex items-center gap-1 text-purple-700">
                    <EyeOff className="w-4 h-4" /> Anonymous Submission Mode
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-blue-900">
                    <User className="w-4 h-4" /> Identified Complainant Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isAnonymous 
                  ? 'Your identity and IP are strictly isolated. A secure tracking token will be issued.'
                  : user 
                    ? `Linked to your verified student profile (${user.name}). Department officers will see only what is needed.`
                    : 'Submit with your verified email and name.'}
              </p>
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${!isAnonymous ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Identified
              </button>
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${isAnonymous ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Anonymous
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Category & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Grievance Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 bg-white"
                >
                  <option value="Teaching & Academic Issues">Teaching & Academic Issues</option>
                  <option value="Faculty Interaction & Behavior">Faculty Interaction & Behavior</option>
                  <option value="Hostel Facilities">Hostel Facilities & Accommodation</option>
                  <option value="Mess & Food Quality">Mess & Food Quality</option>
                  <option value="Infrastructure & Maintenance">Infrastructure & Maintenance</option>
                  <option value="Student Safety & Harassment">Student Safety & Harassment (Urgent)</option>
                  <option value="Administrative Services">Administrative Services & Fees</option>
                  <option value="Other Institutional Concerns">Other Institutional Concerns</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Department
                  </label>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                    Auto-Routing Active
                  </span>
                </div>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 bg-white"
                >
                  <option value="">(Automatic routing based on category)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.department_name} {d.is_sensitive ? '(Sensitive Committee)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject / Short Summary *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Unavailability of laboratory equipment for Microprocessor practicals"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                required
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Grievance Description *
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the incident, dates, locations, persons involved (if any), and previous attempts to resolve..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                required
              />
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Requested Severity / Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      formData.priority === p 
                        ? p === 'Urgent' ? 'bg-red-600 text-white border-red-600 shadow-md'
                          : p === 'High' ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                          : p === 'Medium' ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                          : 'bg-slate-800 text-white border-slate-800 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Supporting Evidence / Attachments (Optional, max 5 files, 10MB each)
              </label>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-8 h-8 text-blue-900 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-800">
                  Click or drag files here to attach
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Supported formats: PDF, Images (JPG, PNG), Word Documents, Text
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-900 flex-shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-400">({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting Grievance...' : 'Submit Grievance to University Queue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
};
