import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, Mail, Phone, Lock, BookOpen, Building2, 
  ShieldCheck, Key, CheckCircle2, AlertCircle 
} from 'lucide-react';

export const UserProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setSuccessMsg('Your password has been changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.message || 'Failed to update password');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Profile & Security</h1>
        <p className="text-xs text-slate-500">Manage your credentials, role privileges, and authentication credentials.</p>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-900/20">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-900">
                {user.role}
              </span>
              {user.department_name && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {user.department_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px]">
              <Mail className="w-3.5 h-3.5" />
              University Email
            </div>
            <div className="font-bold text-slate-900">{user.email}</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px]">
              <BookOpen className="w-3.5 h-3.5" />
              Identification Roll Number
            </div>
            <div className="font-bold text-slate-900 font-mono">{user.student_id || 'ID Verified'}</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px]">
              <Phone className="w-3.5 h-3.5" />
              Emergency Phone
            </div>
            <div className="font-bold text-slate-900">{user.phone || '+1-555-0100'}</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Account Verification Status
            </div>
            <div className="font-bold text-emerald-700">Active & Verified</div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-900" />
          <h3 className="font-bold text-slate-900 text-base">Change Password</h3>
        </div>
        <p className="text-xs text-slate-500">
          Ensure your password contains at least 8 characters, combining uppercase, lowercase, and numeric digits.
        </p>

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>

    </div>
  );
};
