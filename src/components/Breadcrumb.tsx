import React from 'react';
import { ViewLevel } from '../types';
import { MONTH_NAMES, DAY_NAMES, getWeekNumber, format12Hour } from '../utils/dateUtils';
import { Calendar, Layers, Clock, ChevronRight, Anchor } from 'lucide-react';

interface BreadcrumbProps {
  selectedDate: Date;
  selectedHour: number;
  viewLevel: ViewLevel;
  onNavigateLevel: (level: ViewLevel) => void;
  isAnchorDayType: 'monday' | 'thursday' | null;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  selectedDate,
  selectedHour,
  viewLevel,
  onNavigateLevel,
  isAnchorDayType
}) => {
  const monthName = MONTH_NAMES[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();
  const dateNum = selectedDate.getDate();
  const dayName = DAY_NAMES[selectedDate.getDay()];
  const weekNum = getWeekNumber(selectedDate);
  const formattedHour = format12Hour(`${String(selectedHour).padStart(2, '0')}:00`);

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md sticky top-16 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
        {/* Cascade path */}
        <nav aria-label="Roadmap level breadcrumb" className="flex items-center flex-wrap gap-1 md:gap-2">
          {/* Dashboard Hub */}
          <button
            onClick={() => onNavigateLevel('dashboard')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewLevel === 'dashboard'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Dashboard</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          {/* Month level */}
          <button
            onClick={() => onNavigateLevel('month')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewLevel === 'month'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{monthName} {year}</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          {/* Week level */}
          <button
            onClick={() => onNavigateLevel('week')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewLevel === 'week'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Week {weekNum}</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          {/* Day level */}
          <button
            onClick={() => onNavigateLevel('day')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewLevel === 'day'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{dayName}, {monthName.slice(0, 3)} {dateNum}</span>
            {isAnchorDayType && (
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                isAnchorDayType === 'monday'
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40'
                  : 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
              }`}>
                Anchor
              </span>
            )}
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          {/* Hour level */}
          <button
            onClick={() => onNavigateLevel('hour')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewLevel === 'hour'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>{formattedHour} Slot</span>
          </button>
        </nav>

        {/* Quick Anchor Status Badge */}
        {isAnchorDayType && (
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1 rounded-full text-xs">
            <Anchor className={`w-3.5 h-3.5 ${isAnchorDayType === 'monday' ? 'text-indigo-400' : 'text-amber-400'}`} />
            <span className="text-slate-300 font-medium">
              {isAnchorDayType === 'monday' ? 'Monday Core Anchor: Sprint Kickoff' : 'Thursday Core Anchor: Mid-Week Audit'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
