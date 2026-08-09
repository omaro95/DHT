import React from 'react';
import { DayData } from '../types';
import { getMonthDays, MONTH_NAMES, SHORT_DAY_NAMES, formatDateKey, isMonday, isThursday } from '../utils/dateUtils';
import { Calendar, Droplets, Utensils, Anchor, ChevronRight, Activity, Award } from 'lucide-react';

interface MonthlyViewProps {
  selectedDate: Date;
  allData: Record<string, DayData>;
  onSelectDay: (date: Date) => void;
  onSelectWeek: (date: Date) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  selectedDate,
  allData,
  onSelectDay,
  onSelectWeek
}) => {
  const { weeks } = getMonthDays(selectedDate);
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Monthly Aggregates
  let totalWaterMl = 0;
  let totalMeals = 0;
  let totalRestroomLogs = 0;
  let anchorDaysTotal = 0;
  let anchorDaysCompleted = 0;

  weeks.forEach((week) => {
    week.forEach((day) => {
      if (day.getMonth() === currentMonth) {
        const dKey = formatDateKey(day);
        const dayData = allData[dKey];
        if (dayData) {
          totalWaterMl += dayData.waterLogs.reduce((acc, w) => acc + w.amountMl, 0);
          totalMeals += dayData.mealLogs.length;
          totalRestroomLogs += dayData.restroomLogs.length;

          if (isMonday(day) || isThursday(day)) {
            anchorDaysTotal++;
            if (dayData.waterLogs.length > 0 || dayData.mealLogs.length > 0) {
              anchorDaysCompleted++;
            }
          }
        }
      }
    });
  });

  const anchorScorePct = anchorDaysTotal > 0 ? Math.round((anchorDaysCompleted / anchorDaysTotal) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Monthly Overview Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear} Roadmap
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              High-level cascade overview. Track weekly progress, hydration density, meal alignment, and Monday/Thursday anchor day performance across the entire month.
            </p>
          </div>

          {/* Monthly Aggregates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
                <Droplets className="w-4 h-4" />
                <span>Monthly Water</span>
              </div>
              <span className="text-lg font-black text-slate-100">{(totalWaterMl / 1000).toFixed(1)} L</span>
              <span className="text-[10px] text-slate-500">Total volume logged</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <Utensils className="w-4 h-4" />
                <span>Total Meals</span>
              </div>
              <span className="text-lg font-black text-slate-100">{totalMeals} Meals</span>
              <span className="text-[10px] text-slate-500">Logged food events</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
                <span>🚽</span>
                <span>Restroom Logs</span>
              </div>
              <span className="text-lg font-black text-slate-100">{totalRestroomLogs} Entries</span>
              <span className="text-[10px] text-slate-500">Pattern tracking</span>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/30 bg-amber-500/5 p-3 rounded-xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                <Anchor className="w-4 h-4 text-amber-400" />
                <span>Anchor Day Score</span>
              </div>
              <span className="text-lg font-black text-amber-300">{anchorScorePct}%</span>
              <span className="text-[10px] text-amber-400/80">Monday & Thursday target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Header Day Names */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-8 gap-2 text-center text-xs font-bold text-slate-400 pb-3 border-b border-slate-800">
          <div className="text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>Week</span>
          </div>
          {SHORT_DAY_NAMES.map((name, i) => {
            const isMon = i === 0;
            const isThu = i === 3;
            return (
              <div
                key={name}
                className={`uppercase tracking-wider ${
                  isMon ? 'text-indigo-400 font-extrabold' : isThu ? 'text-amber-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                {name}
                {isMon && <span className="block text-[9px] text-indigo-400/70 lowercase font-medium">Anchor</span>}
                {isThu && <span className="block text-[9px] text-amber-400/70 lowercase font-medium">Anchor</span>}
              </div>
            );
          })}
        </div>

        {/* Calendar Grid Weeks */}
        <div className="space-y-2 mt-3">
          {weeks.map((week, wIdx) => {
            const firstOfWeek = week[0];

            return (
              <div key={wIdx} className="grid grid-cols-8 gap-2 items-stretch">
                {/* Week Action Row Header */}
                <button
                  onClick={() => onSelectWeek(firstOfWeek)}
                  className="bg-slate-950/90 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-sky-400 uppercase">Week</span>
                  <span className="text-sm font-black text-slate-200 group-hover:text-sky-300">#{wIdx + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 mt-1" />
                </button>

                {/* Days of the Week */}
                {week.map((dayDate) => {
                  const dKey = formatDateKey(dayDate);
                  const isCurrentMonth = dayDate.getMonth() === currentMonth;
                  const dayData = allData[dKey] || {
                    date: dKey,
                    waterLogs: [],
                    mealLogs: [],
                    restroomLogs: [],
                    activityLogs: []
                  };

                  const waterTotal = dayData.waterLogs.reduce((acc, w) => acc + w.amountMl, 0);
                  const mealCount = dayData.mealLogs.length;
                  const restroomCount = dayData.restroomLogs.length;

                  const isMon = isMonday(dayDate);
                  const isThu = isThursday(dayDate);

                  const isToday = formatDateKey(new Date()) === dKey;

                  return (
                    <div
                      key={dKey}
                      onClick={() => onSelectDay(dayDate)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                        !isCurrentMonth
                          ? 'bg-slate-950/30 border-slate-900 opacity-40 hover:opacity-80'
                          : isToday
                          ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : isMon
                          ? 'bg-indigo-950/30 border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/50'
                          : isThu
                          ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/50'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Day Header & Badges */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-sm font-black ${
                            isToday
                              ? 'text-amber-300 font-extrabold'
                              : isCurrentMonth
                              ? 'text-slate-200'
                              : 'text-slate-600'
                          }`}
                        >
                          {dayDate.getDate()}
                        </span>

                        {isMon && isCurrentMonth && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1 py-0.2 rounded font-bold uppercase">
                            Mon
                          </span>
                        )}

                        {isThu && isCurrentMonth && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-bold uppercase">
                            Thu
                          </span>
                        )}
                      </div>

                      {/* Day Metrics Mini Summary */}
                      {isCurrentMonth && (
                        <div className="space-y-1 my-1">
                          {/* Water Bar */}
                          <div className="flex items-center gap-1 text-[10px] text-sky-300">
                            <Droplets className="w-3 h-3 text-sky-400 shrink-0" />
                            <span className="font-medium truncate">{waterTotal} ml</span>
                          </div>

                          {/* Meal Indicator */}
                          <div className="flex items-center gap-1 text-[10px] text-amber-300">
                            <Utensils className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="font-medium">{mealCount} Meals</span>
                          </div>

                          {/* Restroom count */}
                          <div className="flex items-center gap-1 text-[10px] text-purple-300">
                            <span className="text-[9px]">🚽</span>
                            <span className="font-medium">{restroomCount} Logs</span>
                          </div>
                        </div>
                      )}

                      {/* Footer Activity Indicator */}
                      {isCurrentMonth && dayData.activityLogs.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-400 pt-1 border-t border-slate-800/80">
                          <Activity className="w-2.5 h-2.5" />
                          <span className="truncate">{dayData.activityLogs.length} Activities</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
