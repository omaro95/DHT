import React from 'react';
import { DayData, WaterLog, MealLog, RestroomLog, ActivityLog } from '../types';
import { SunClock } from './SunClock';
import { DAY_NAMES, MONTH_NAMES, format12Hour, isMonday, isThursday } from '../utils/dateUtils';
import { Droplets, Utensils, Anchor, Clock, Plus, Trash2, CheckCircle, Activity, Sparkles, AlertCircle } from 'lucide-react';

interface DailyViewProps {
  dayData: DayData;
  selectedHour: number;
  onSelectHour: (hour: number) => void;
  onOpenQuickLog: (type?: 'water' | 'meal' | 'restroom' | 'activity') => void;
  onUpdateDayData: (updated: DayData) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  dayData,
  selectedHour,
  onSelectHour,
  onOpenQuickLog,
  onUpdateDayData
}) => {
  const dateObj = new Date(dayData.date + 'T00:00:00');
  const dayName = DAY_NAMES[dateObj.getDay()];
  const monthName = MONTH_NAMES[dateObj.getMonth()];
  const dateNum = dateObj.getDate();
  const yearNum = dateObj.getFullYear();

  const isMon = isMonday(dateObj);
  const isThu = isThursday(dateObj);

  // Water calculations
  const totalWaterMl = dayData.waterLogs.reduce((acc, w) => acc + w.amountMl, 0);
  const waterTargetMl = 2500;
  const waterPct = Math.min(100, Math.round((totalWaterMl / waterTargetMl) * 100));

  // Quick +250ml Water shortcut
  const handleQuickAddWater = (amount: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: WaterLog = {
      id: `w_quick_${Date.now()}`,
      date: dayData.date,
      time: timeStr,
      amountMl: amount,
      type: 'water'
    };
    onUpdateDayData({
      ...dayData,
      waterLogs: [...dayData.waterLogs, newLog]
    });
  };

  // Delete handlers
  const handleDeleteWater = (id: string) => {
    onUpdateDayData({
      ...dayData,
      waterLogs: dayData.waterLogs.filter((w) => w.id !== id)
    });
  };

  const handleDeleteMeal = (id: string) => {
    onUpdateDayData({
      ...dayData,
      mealLogs: dayData.mealLogs.filter((m) => m.id !== id)
    });
  };

  const handleDeleteRestroom = (id: string) => {
    onUpdateDayData({
      ...dayData,
      restroomLogs: dayData.restroomLogs.filter((r) => r.id !== id)
    });
  };

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Calendar Temporal Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Daily Roadmap Dashboard
              </span>

              {isMon && (
                <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Anchor className="w-3.5 h-3.5 text-indigo-400" />
                  <span>MONDAY ANCHOR DAY</span>
                </span>
              )}

              {isThu && (
                <span className="bg-amber-500/30 text-amber-200 border border-amber-400/50 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Anchor className="w-3.5 h-3.5 text-amber-400" />
                  <span>THURSDAY ANCHOR DAY</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight mt-1">
              {dayName}, {monthName} {dateNum}, {yearNum}
            </h2>

            {dayData.dayNotes && (
              <p className="text-xs text-slate-400 mt-1 italic">
                "{dayData.dayNotes}"
              </p>
            )}
          </div>

          {/* Quick Log Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenQuickLog('water')}
              className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>+ Water</span>
            </button>

            <button
              onClick={() => onOpenQuickLog('meal')}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>+ Meal</span>
            </button>

            <button
              onClick={() => onOpenQuickLog('restroom')}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span>🚽</span>
              <span>+ Restroom</span>
            </button>

            <button
              onClick={() => onOpenQuickLog('activity')}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>+ Activity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Centerpiece Visual Component: The 180° Sun Clock */}
      <SunClock
        dayData={dayData}
        selectedHour={selectedHour}
        onSelectHour={onSelectHour}
        onQuickLog={onOpenQuickLog}
      />

      {/* Main 3-Column Tracking Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1: Water Intake & Hydration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Water Intake</h3>
                  <p className="text-xs text-slate-400">Daily target: {waterTargetMl} ml</p>
                </div>
              </div>

              <span className="text-xs font-extrabold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/30">
                {waterPct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-3 mb-4 overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${waterPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span>Total Volume Logged:</span>
              <span className="font-black text-sky-300 text-sm">{totalWaterMl} ml</span>
            </div>

            {/* Quick Add Water Shortcuts */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => handleQuickAddWater(250)}
                className="flex-1 bg-slate-800 hover:bg-sky-500/20 text-sky-300 border border-slate-700 hover:border-sky-500/40 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> +250ml
              </button>
              <button
                onClick={() => handleQuickAddWater(500)}
                className="flex-1 bg-slate-800 hover:bg-sky-500/20 text-sky-300 border border-slate-700 hover:border-sky-500/40 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> +500ml
              </button>
            </div>

            {/* Water Timestamps Stream */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {dayData.waterLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No water logs for today</p>
              ) : (
                dayData.waterLogs.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sky-400 font-bold">{format12Hour(w.time)}</span>
                      <span className="text-slate-200 font-semibold">{w.amountMl} ml</span>
                      {w.type && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded capitalize">
                          {w.type}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteWater(w.id)}
                      className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Meal Timestamps */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Meal Timestamps</h3>
                  <p className="text-xs text-slate-400">{dayData.mealLogs.length} meals consumed</p>
                </div>
              </div>

              <button
                onClick={() => onOpenQuickLog('meal')}
                className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Meals Timeline Stream */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {dayData.mealLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No meals recorded today</p>
              ) : (
                dayData.mealLogs.map((m) => (
                  <div
                    key={m.id}
                    className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-xs space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400 font-bold">{format12Hour(m.time)}</span>
                        <span className="uppercase text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                          {m.mealType}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteMeal(m.id)}
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="font-extrabold text-slate-100">{m.title}</p>
                    {m.notes && <p className="text-[11px] text-slate-400 italic">{m.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: Restroom Log & Pattern Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <span className="text-base">🚽</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Restroom Log</h3>
                  <p className="text-xs text-slate-400">{dayData.restroomLogs.length} events logged</p>
                </div>
              </div>

              <button
                onClick={() => onOpenQuickLog('restroom')}
                className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold px-2.5 py-1 rounded-lg border border-purple-500/40 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log
              </button>
            </div>

            {/* Restroom Logs Stream */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {dayData.restroomLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No restroom logs recorded</p>
              ) : (
                dayData.restroomLogs.map((r) => (
                  <div
                    key={r.id}
                    className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-xs space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-400 font-bold">{format12Hour(r.time)}</span>
                        <span className="capitalize text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                          {r.type.replace('_', ' ')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteRestroom(r.id)}
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {r.type === 'urination' && r.hydrationColor && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span>Hydration Clarity:</span>
                        <span className="font-bold text-sky-300">
                          {r.hydrationColor === 1
                            ? 'Optimal Clear (1)'
                            : r.hydrationColor === 2
                            ? 'Pale Yellow (2)'
                            : r.hydrationColor === 3
                            ? 'Yellow (3)'
                            : 'Dark Dehydrated (4-5)'}
                        </span>
                      </div>
                    )}

                    {r.type === 'bowel_movement' && r.bristolScale && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span>Bristol Scale:</span>
                        <span className="font-bold text-emerald-300">Type {r.bristolScale}</span>
                      </div>
                    )}

                    {r.notes && <p className="text-[11px] text-slate-400 italic">{r.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Hourly Schedule Breakdown List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Hourly Roadmap Slots (24-Hour Cascade)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any hour slot to drill down into minute-by-minute activity and journal notes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hoursArray.map((h) => {
            const isDaylight = h >= 7 && h <= 19;
            const hourLabel = format12Hour(`${String(h).padStart(2, '0')}:00`);

            const hWater = dayData.waterLogs.filter((w) => parseInt(w.time.split(':')[0], 10) === h);
            const hMeals = dayData.mealLogs.filter((m) => parseInt(m.time.split(':')[0], 10) === h);
            const hRestroom = dayData.restroomLogs.filter((r) => parseInt(r.time.split(':')[0], 10) === h);
            const hActivities = dayData.activityLogs.filter((a) => a.hour === h);

            const isSelected = selectedHour === h;

            return (
              <div
                key={h}
                onClick={() => onSelectHour(h)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-slate-100 shadow-md'
                    : isDaylight
                    ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className={isSelected ? 'text-amber-300' : 'text-slate-300'}>
                    {hourLabel}
                  </span>
                  {isDaylight ? (
                    <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      Daylight
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600">Night</span>
                  )}
                </div>

                {/* Badges in this hour */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {hWater.length > 0 && (
                    <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                      💧 {hWater.reduce((s, w) => s + w.amountMl, 0)}ml
                    </span>
                  )}

                  {hMeals.length > 0 && (
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded flex items-center gap-1 font-semibold truncate max-w-[120px]">
                      🍱 {hMeals[0].title}
                    </span>
                  )}

                  {hRestroom.length > 0 && (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-semibold">
                      🚽 Logged
                    </span>
                  )}

                  {hActivities.length > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold truncate max-w-[120px]">
                      ⚡ {hActivities[0].title}
                    </span>
                  )}

                  {hWater.length === 0 && hMeals.length === 0 && hRestroom.length === 0 && hActivities.length === 0 && (
                    <span className="text-[10px] text-slate-600 italic">Empty slot</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
