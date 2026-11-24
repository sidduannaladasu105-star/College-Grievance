import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { CommitteeDashboard } from './pages/CommitteeDashboard';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { DepartmentManagementPage } from './pages/DepartmentManagementPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { UserProfilePage } from './pages/UserProfilePage';

const MainApp = () => {
  const { user, login } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [trackingParams, setTrackingParams] = useState({ ref: '', token: '' });

  // Default page upon login based on role
  useEffect(() => {
    if (user && (activePage === 'landing' || activePage === 'login' || activePage === 'register')) {
      if (user.role === 'admin') setActivePage('admin');
      else if (user.role === 'officer') setActivePage('officer');
      else if (user.role === 'committee') setActivePage('committee');
      else setActivePage('student');
    }
  }, [user]);

  const handleNavigate = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectComplaint = (id) => {
    setSelectedComplaintId(id);
    setActivePage('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSubmitted = (ref, token) => {
    setTrackingParams({ ref, token });
    setActivePage('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'student':
        return <StudentDashboard onNavigate={handleNavigate} onSelectComplaint={handleSelectComplaint} />;
      case 'submit':
        return <SubmitComplaintPage onNavigate={handleNavigate} onTrackSubmitted={handleTrackSubmitted} />;
      case 'track':
        return <TrackComplaintPage initialRef={trackingParams.ref} initialToken={trackingParams.token} />;
      case 'my-complaints':
        return <MyComplaintsPage onSelectComplaint={handleSelectComplaint} onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} onSelectComplaint={handleSelectComplaint} />;
      case 'officer':
        return <OfficerDashboard onNavigate={handleNavigate} onSelectComplaint={handleSelectComplaint} />;
      case 'committee':
        return <CommitteeDashboard onNavigate={handleNavigate} onSelectComplaint={handleSelectComplaint} />;
      case 'details':
        return (
          <ComplaintDetailsPage 
            complaintId={selectedComplaintId} 
            onBack={() => setActivePage('my-complaints')} 
            onNavigate={handleNavigate}
          />
        );
      case 'departments':
        return <DepartmentManagementPage />;
      case 'reports':
        return <ReportsAnalyticsPage />;
      case 'profile':
        return <UserProfilePage />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Header Navbar */}
      <Navbar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex">
        
        {/* Left Sidebar (Only visible when user is logged in) */}
        {user && (
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 ${user ? 'lg:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

      </div>

      {/* Floating Demo Role Switcher Bar for Seamless Evaluation */}
      <div className="fixed bottom-3 right-3 z-50 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2 text-xs">
        <span className="hidden sm:inline-block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Demo Switch:
        </span>
        <button
          onClick={async () => { await login('admin@university.edu', 'Password@123'); setActivePage('admin'); }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${user?.role === 'admin' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Admin
        </button>
        <button
          onClick={async () => { await login('officer.academics@university.edu', 'Password@123'); setActivePage('officer'); }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${user?.role === 'officer' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Officer
        </button>
        <button
          onClick={async () => { await login('committee.chair@university.edu', 'Password@123'); setActivePage('committee'); }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${user?.role === 'committee' ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Committee
        </button>
        <button
          onClick={async () => { await login('alex.student@university.edu', 'Password@123'); setActivePage('student'); }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${user?.role === 'student' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          Student
        </button>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
