import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, badge }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
  };

  const iconBgMap = {
    blue: 'bg-blue-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    amber: 'bg-amber-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    rose: 'bg-rose-600 text-white',
    purple: 'bg-purple-600 text-white',
    sky: 'bg-sky-600 text-white',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${iconBgMap[color] || iconBgMap.blue}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {(subtitle || badge) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${colorMap[color]}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
