import React from 'react';
import { DayData } from '../types';
import { getWeekRange, DAY_NAMES, MONTH_NAMES, formatDateKey, isMonday, isThursday } from '../utils/dateUtils';
import { Droplets, Utensils, Anchor, Sun, Sparkles, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

interface WeeklyViewProps {
  selectedDate: Date;
  allData: Record<string, DayData>;
  onSelectDay: (date: Date) => void;
  onUpdateDayData: (dateStr: string, updated: DayData) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  selectedDate,
  allData,
  onSelectDay,
  onUpdateDayData
}) => {
  const { start, end, days } = getWeekRange(selectedDate);

  const startMonth = MONTH_NAMES[start.getMonth()];
  const endMonth = MONTH_NAMES[end.getMonth()];
  const dateRangeStr =
    startMonth === endMonth
      ? `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`
      : `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Weekly Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <span>Weekly Roadmap Stream</span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 mt-1">{dateRangeStr}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Cascading 7-day view highlighting anchor days <span className="text-indigo-400 font-bold">(Monday)</span> and <span className="text-amber-400 font-bold">(Thursday)</span> for strategic momentum.
            </p>
          </div>

          {/* Anchor Days Quick Legend */}
          <div className="flex items-center gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-indigo-300">
              <Anchor className="w-4 h-4 text-indigo-400" />
              <span className="font-bold">Mon Anchor:</span> Sprint Kickoff
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-amber-300">
              <Anchor className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Thu Anchor:</span> Momentum Audit
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Cascading Roadmap List */}
      <div className="space-y-4">
        {days.map((day) => {
          const dKey = formatDateKey(day);
          const dayData = allData[dKey] || {
            date: dKey,
            waterLogs: [],
            mealLogs: [],
            restroomLogs: [],
            activityLogs: []
          };

          const isMon = isMonday(day);
          const isThu = isThursday(day);
          const isToday = formatDateKey(new Date()) === dKey;

          const waterTotal = dayData.waterLogs.reduce((acc, w) => acc + w.amountMl, 0);
          const waterTarget = 2500;
          const waterPct = Math.min(100, Math.round((waterTotal / waterTarget) * 100));

          const dayName = DAY_NAMES[day.getDay()];
          const dateFormatted = `${MONTH_NAMES[day.getMonth()].slice(0, 3)} ${day.getDate()}`;

          return (
            <div
              key={dKey}
              className={`rounded-2xl border transition-all p-5 shadow-lg relative overflow-hidden ${
                isToday
                  ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/60 shadow-amber-500/10'
                  : isMon
                  ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-500/50 hover:border-indigo-400'
                  : isThu
                  ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/50 hover:border-amber-400'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Special Anchor Glow Accent Bar */}
              {isMon && <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-indigo-600" />}
              {isThu && <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 to-amber-600" />}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Day Header Info */}
                <div className="flex items-start gap-4">
                  <div
                    onClick={() => onSelectDay(day)}
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isToday
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                        : isMon
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                        : isThu
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-slate-800 text-slate-200 font-bold'
                    }`}
                  >
                    <span className="text-xs uppercase">{dayName.slice(0, 3)}</span>
                    <span className="text-lg font-black">{day.getDate()}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-extrabold text-slate-100">{dayName}, {dateFormatted}</h3>
                      
                      {isToday && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}

                      {/* SPECIAL DAY ANCHOR HIGHLIGHT BADGES */}
                      {isMon && (
                        <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 font-extrabold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Anchor className="w-3.5 h-3.5 text-indigo-400" />
                          <span>🎯 MONDAY CORE ANCHOR DAY</span>
                        </span>
                      )}

                      {isThu && (
                        <span className="bg-amber-500/30 text-amber-200 border border-amber-400/50 font-extrabold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Anchor className="w-3.5 h-3.5 text-amber-400" />
                          <span>⚡ THURSDAY CORE ANCHOR DAY</span>
                        </span>
                      )}
                    </div>

                    {/* Anchor Goal or Daily Note */}
                    <div className="mt-1 text-xs text-slate-300">
                      {isMon ? (
                        <span className="text-indigo-300 font-medium">
                          Goal: Kickoff sprint, establish 2,500ml hydration routine & review main deliverables.
                        </span>
                      ) : isThu ? (
                        <span className="text-amber-300 font-medium">
                          Goal: Mid-week audit, align meal timestamps & track energy consistency.
                        </span>
                      ) : (
                        <span className="text-slate-400">Regular tracking flow</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Bar */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-xs lg:w-1/2">
                  {/* Water Progress */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-sky-400 font-semibold mb-1">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5" />
                        Water
                      </span>
                      <span className="text-[10px] text-slate-400">{waterPct}%</span>
                    </div>
                    <span className="font-black text-slate-100">{waterTotal} ml</span>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-sky-400 h-full rounded-full transition-all" style={{ width: `${waterPct}%` }} />
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center gap-1 text-amber-400 font-semibold mb-1">
                      <Utensils className="w-3.5 h-3.5" />
                      Meals
                    </div>
                    <span className="font-black text-slate-100">{dayData.mealLogs.length} Logged</span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {dayData.mealLogs.length > 0 ? dayData.mealLogs.map(m => m.mealType[0].toUpperCase()).join(' • ') : 'None'}
                    </span>
                  </div>

                  {/* Restroom */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center gap-1 text-purple-400 font-semibold mb-1">
                      <span>🚽</span>
                      Restroom
                    </div>
                    <span className="font-black text-slate-100">{dayData.restroomLogs.length} Logs</span>
                    <span className="text-[10px] text-slate-500">Pattern tracked</span>
                  </div>

                  {/* Drill to Sun Clock Action Button */}
                  <button
                    onClick={() => onSelectDay(day)}
                    className="col-span-3 sm:col-span-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold p-2.5 rounded-xl border border-slate-700 hover:border-amber-400 flex flex-col items-center justify-center gap-1 transition-all group"
                  >
                    <Sun className="w-4 h-4 text-amber-400 group-hover:text-slate-950" />
                    <span className="text-[11px] flex items-center gap-1">
                      Sun Clock <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
