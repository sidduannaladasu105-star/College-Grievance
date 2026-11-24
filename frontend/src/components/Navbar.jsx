import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, Shield, User, LogOut, Check, ExternalLink, Menu, X 
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, activePage, onNavigate }) => {
  const { user, logout, notifications, unreadCount, markAllNotificationsRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'officer': return 'Department Officer';
      case 'committee': return 'Grievance Committee';
      default: return 'Student';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'committee': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'officer': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* Left: Mobile hamburger & portal branding */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => onNavigate(user ? (user.role === 'admin' ? 'admin' : user.role === 'officer' ? 'officer' : user.role === 'committee' ? 'committee' : 'student') : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                <span>SGMS</span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  University Portal
                </span>
              </div>
              <div className="text-[10px] text-slate-500 hidden md:block font-medium">
                Confidential Grievance & Escalation System
              </div>
            </div>
          </div>
        </div>

        {/* Center: Quick Public Links (if not logged in) */}
        {!user && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button 
              onClick={() => onNavigate('landing')}
              className={`hover:text-blue-900 transition-colors ${activePage === 'landing' ? 'text-blue-900 font-bold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('submit')}
              className={`hover:text-blue-900 transition-colors ${activePage === 'submit' ? 'text-blue-900 font-bold' : ''}`}
            >
              Submit Grievance
            </button>
            <button 
              onClick={() => onNavigate('track')}
              className={`hover:text-blue-900 transition-colors ${activePage === 'track' ? 'text-blue-900 font-bold' : ''}`}
            >
              Track Status
            </button>
          </div>
        )}

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Quick Track Button if logged out */}
          {!user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('track')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                Track Status
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-all"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Notifications Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            className={`p-3.5 text-xs hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/60' : ''}`}
                          >
                            <div className="font-semibold text-slate-900 mb-0.5">{n.title}</div>
                            <div className="text-slate-600 line-clamp-2">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <div className="font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="font-bold text-sm text-slate-900 truncate">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      <div className="mt-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => { setShowUserMenu(false); onNavigate('profile'); }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => { setShowUserMenu(false); logout(); onNavigate('landing'); }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
};
