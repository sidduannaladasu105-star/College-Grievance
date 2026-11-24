import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, PlusCircle, Search, ListFilter, Building2, 
  BarChart3, User, LogOut, ShieldAlert, Award, FileText 
} from 'lucide-react';

export const Sidebar = ({ activePage, onNavigate, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;

  const navItems = [
    // Student Links
    ...(role === 'student' ? [
      { id: 'student', label: 'Student Dashboard', icon: LayoutDashboard },
      { id: 'submit', label: 'Submit Complaint', icon: PlusCircle },
      { id: 'my-complaints', label: 'My Grievances', icon: ListFilter },
      { id: 'track', label: 'Track Reference ID', icon: Search },
    ] : []),

    // Officer Links
    ...(role === 'officer' ? [
      { id: 'officer', label: 'Department Console', icon: LayoutDashboard },
      { id: 'my-complaints', label: 'Department Cases', icon: ListFilter },
      { id: 'track', label: 'Lookup Grievance', icon: Search },
    ] : []),

    // Committee Links
    ...(role === 'committee' ? [
      { id: 'committee', label: 'Committee Hearings', icon: ShieldAlert },
      { id: 'my-complaints', label: 'Escalated Cases', icon: ListFilter },
      { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
      { id: 'track', label: 'Lookup Grievance', icon: Search },
    ] : []),

    // Admin Links
    ...(role === 'admin' ? [
      { id: 'admin', label: 'Admin Command Center', icon: LayoutDashboard },
      { id: 'my-complaints', label: 'All Grievances', icon: ListFilter },
      { id: 'departments', label: 'Departments & Routing', icon: Building2 },
      { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
      { id: 'submit', label: 'Lodge Grievance', icon: PlusCircle },
      { id: 'track', label: 'Lookup Grievance', icon: Search },
    ] : []),

    // Common Links
    { id: 'profile', label: 'Account Profile', icon: User }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between
        transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation Items */}
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-150
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 bg-slate-800/60 rounded-xl text-xs">
            <div className="text-[10px] text-slate-400 font-medium">Signed in as</div>
            <div className="font-bold text-slate-200 truncate">{user.name}</div>
            <div className="text-[10px] text-sky-400 uppercase tracking-wider font-semibold mt-0.5">
              {user.role} {user.department_name ? `• ${user.department_name}` : ''}
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('landing');
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
