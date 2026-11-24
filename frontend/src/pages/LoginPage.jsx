import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Shield, AlertCircle, Key, UserCheck } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { label: 'Admin', email: 'admin@university.edu', role: 'admin', desc: 'Manage departments, officers, global stats' },
    { label: 'Academic Officer', email: 'officer.academics@university.edu', role: 'officer', desc: 'Reviews teaching & grading grievances' },
    { label: 'Hostel Officer', email: 'officer.hostel@university.edu', role: 'officer', desc: 'Resolves hostel & facility issues' },
    { label: 'Committee Chair', email: 'committee.chair@university.edu', role: 'committee', desc: 'Reviews escalated & sensitive hearings' },
    { label: 'Student', email: 'alex.student@university.edu', role: 'student', desc: 'Submits & tracks personal grievances' }
  ];

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      const role = res.user.role;
      if (role === 'admin') onNavigate('admin');
      else if (role === 'officer') onNavigate('officer');
      else if (role === 'committee') onNavigate('committee');
      else onNavigate('student');
    } catch (err) {
      setError(err.message || 'Invalid credentials or connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      
      {/* Login Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-900/20">
            <Lock className="w-6 h-6 text-sky-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">University Portal Login</h2>
          <p className="text-xs text-slate-500">Sign in with your role-based institutional credentials</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@university.edu"
                className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          New student?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-blue-900 hover:underline"
          >
            Create account
          </button>
        </div>

      </div>

      {/* One-Click Demo Role Accounts Helper */}
      <div className="bg-slate-100/90 rounded-2xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <UserCheck className="w-4 h-4 text-blue-700" />
          <span>One-Click Demo Credentials:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleFillDemo(d.email)}
              className="text-left p-2.5 bg-white hover:bg-blue-50 rounded-xl border border-slate-200/80 hover:border-blue-300 transition-all text-[11px] group"
            >
              <div className="font-bold text-slate-900 group-hover:text-blue-900">{d.label}</div>
              <div className="text-[10px] text-slate-500 truncate">{d.email}</div>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-slate-500 text-center">
          Default seed password for all test accounts: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">Password@123</code>
        </div>
      </div>

    </div>
  );
};
