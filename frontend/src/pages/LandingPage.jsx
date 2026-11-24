import React from 'react';
import { 
  ShieldCheck, Lock, ArrowRight, Clock, Award, Users, 
  HelpCircle, AlertCircle, FileText, CheckCircle2, ChevronRight 
} from 'lucide-react';

export const LandingPage = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-14 lg:p-16 shadow-2xl border border-blue-900/50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-sky-300 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            Official Confidential Grievance Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Transparent, Secure & Responsive <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-200">Grievance Redressal</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            A state-of-the-art institutional platform empowering students and staff to raise concerns anonymously or openly. Automated routing, strict SLA resolution deadlines, and impartial committee oversight.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('submit')}
              className="px-6 py-3.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              Lodge a Grievance
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-sky-400" />
              Track by Reference ID
            </button>
          </div>
        </div>

        {/* Quick Trust Highlights */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-800/30 rounded-2xl border border-slate-800">
            <div className="text-2xl font-extrabold text-sky-300">100%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Anonymous Option</div>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-2xl border border-slate-800">
            <div className="text-2xl font-extrabold text-sky-300">&lt; 48h</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Urgent Safety SLA</div>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-2xl border border-slate-800">
            <div className="text-2xl font-extrabold text-sky-300">Auto</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Department Routing</div>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-2xl border border-slate-800">
            <div className="text-2xl font-extrabold text-sky-300">Hierarchical</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Committee Escalation</div>
          </div>
        </div>
      </section>

      {/* Categories We Handle */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Coverage</h2>
          <p className="text-xs sm:text-sm text-slate-500">Every concern is automatically matched with the designated committee.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Academic & Teaching', desc: 'Syllabus coverage, grading disputes, lecture scheduling, and exam inquiries.', dept: 'Academic Affairs' },
            { title: 'Faculty Interactions', desc: 'Classroom conduct, student mentoring, and disciplinary fairness.', dept: 'Grievance Committee' },
            { title: 'Hostel & Residential', desc: 'Room allotment, washroom hygiene, water supply, and security.', dept: 'Hostel Admin' },
            { title: 'Mess & Food Quality', desc: 'Dining hall cleanliness, nutritious meals, and dietary hygiene audits.', dept: 'Mess Committee' },
            { title: 'Campus Infrastructure', desc: 'Lab workstations, electrical power, library facilities, and grounds maintenance.', dept: 'Maintenance Dept' },
            { title: 'Safety & Harassment', desc: 'Anti-ragging, bullying, gender equity, and emergency protection.', dept: 'Women Safety Cell', urgent: true },
            { title: 'Administrative Services', desc: 'Tuition certificates, scholarship verification, transport, and ID cards.', dept: 'Registrar Office' },
            { title: 'Other Concerns', desc: 'Campus policies, recreational facilities, and general student welfare.', dept: 'General Affairs' }
          ].map((cat, idx) => (
            <div key={idx} className={`p-5 rounded-2xl bg-white border ${cat.urgent ? 'border-red-200 shadow-red-50' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{cat.title}</h3>
                  {cat.urgent && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                      High Priority
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Routes to:</span>
                <span className="font-semibold text-blue-900">{cat.dept}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Stepper */}
      <section className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Four Steps to Resolution</h2>
          <p className="text-xs sm:text-sm text-slate-500">Structured workflow designed to eliminate bureaucratic delays.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Submit Grievance', desc: 'Choose identified or fully anonymous submission. Attach supporting evidence or photos.' },
            { step: '02', title: 'Smart Auto-Routing', desc: 'System directs your complaint to the authorized department officer based on category rules.' },
            { step: '03', title: 'Investigation & Note', desc: 'Officers record timestamped notes, request clarification, or dispatch remedial teams.' },
            { step: '04', title: 'Resolution or Escalation', desc: 'Satisfactory closure with evidence or automatic escalation to the Grievance Committee if delayed.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <span className="text-3xl font-black text-slate-200 mb-2 block">{item.step}</span>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency & Anti-Harassment Banner */}
      <section className="bg-gradient-to-r from-red-900 to-rose-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-800 text-red-200 rounded-full text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-300" />
            24/7 Rapid Response
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">Emergency Student Safety & Anti-Ragging</h3>
          <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed">
            If you or someone on campus is facing harassment, ragging, or imminent threat, lodge an urgent complaint immediately. Cases under this category trigger instant committee mobile & email dispatch within 2 hours.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => onNavigate('submit')}
            className="px-6 py-3 bg-white hover:bg-red-50 text-red-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Lodge Urgent Safety Case
          </button>
        </div>
      </section>

    </div>
  );
};
