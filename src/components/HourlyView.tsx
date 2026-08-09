import React, { useState } from 'react';
import { DayData, ActivityLog, WaterLog, MealLog, RestroomLog } from '../types';
import { format12Hour } from '../utils/dateUtils';
import { Clock, Droplets, Utensils, Plus, Trash2, Zap, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface HourlyViewProps {
  dayData: DayData;
  hour: number;
  onBackToDay: () => void;
  onUpdateDayData: (updated: DayData) => void;
  onOpenQuickLog: (type?: 'water' | 'meal' | 'restroom' | 'activity') => void;
}

export const HourlyView: React.FC<HourlyViewProps> = ({
  dayData,
  hour,
  onBackToDay,
  onUpdateDayData,
  onOpenQuickLog
}) => {
  const formattedHour = format12Hour(`${String(hour).padStart(2, '0')}:00`);
  const nextHourStr = format12Hour(`${String((hour + 1) % 24).padStart(2, '0')}:00`);

  // Local state for energy level & activity title
  const hourActivities = dayData.activityLogs.filter((a) => a.hour === hour);
  const existingActivity = hourActivities[0];

  const [titleInput, setTitleInput] = useState(existingActivity ? existingActivity.title : '');
  const [energyLevel, setEnergyLevel] = useState<number>(existingActivity?.energyLevel || 4);
  const [notesInput, setNotesInput] = useState(existingActivity?.notes || '');

  const hourWater = dayData.waterLogs.filter((w) => parseInt(w.time.split(':')[0], 10) === hour);
  const hourMeals = dayData.mealLogs.filter((m) => parseInt(m.time.split(':')[0], 10) === hour);
  const hourRestroom = dayData.restroomLogs.filter((r) => parseInt(r.time.split(':')[0], 10) === hour);

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const newActivity: ActivityLog = {
      id: existingActivity ? existingActivity.id : `act_${Date.now()}`,
      date: dayData.date,
      hour,
      time: `${String(hour).padStart(2, '0')}:00`,
      title: titleInput.trim(),
      category: 'work',
      completed: true,
      energyLevel,
      notes: notesInput.trim()
    };

    const updatedActivities = dayData.activityLogs.filter((a) => a.hour !== hour);
    updatedActivities.push(newActivity);

    onUpdateDayData({
      ...dayData,
      activityLogs: updatedActivities
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-slate-950 border border-violet-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={onBackToDay}
              className="text-xs text-violet-400 hover:text-violet-300 font-bold mb-2 flex items-center gap-1 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Daily Sun Clock
            </button>

            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-violet-400" />
              <h2 className="text-2xl font-black text-slate-100">
                {formattedHour} – {nextHourStr} Slot
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Micro-view for {dayData.date}. Manage logs, energy scores, and hourly focus notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQuickLog()}
              className="bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Hour Log
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Hour Activity & Focus Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Hour Primary Focus & Energy Score</span>
            </h3>
            <span className="text-xs text-slate-400">Timestamp: {formattedHour}</span>
          </div>

          <form onSubmit={handleSaveActivity} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Focus Title / Task</label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g., Deep Work: Roadmap Architecture & Hydration check"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Energy Score (1 to 5)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    type="button"
                    key={rating}
                    onClick={() => setEnergyLevel(rating)}
                    className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                      energyLevel === rating
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ⚡{rating}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hour Journal / Reflection Notes</label>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Notes on energy, hydration, or focus during this hour..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              Save Hour Activity
            </button>
          </form>
        </div>

        {/* Sidebar: Logged Events in this Hour */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-slate-100 text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Logs in this Hour</span>
          </h3>

          {/* Water */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" /> Water Logged ({hourWater.reduce((s, w) => s + w.amountMl, 0)} ml)
            </div>
            {hourWater.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No water logged in this hour</p>
            ) : (
              hourWater.map((w) => (
                <div key={w.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                  <span className="font-bold text-sky-300">{w.amountMl} ml</span> at {format12Hour(w.time)}
                </div>
              ))
            )}
          </div>

          {/* Meals */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5" /> Meals Logged
            </div>
            {hourMeals.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No meals logged in this hour</p>
            ) : (
              hourMeals.map((m) => (
                <div key={m.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200 space-y-1">
                  <span className="font-bold text-amber-300">{m.title}</span> ({m.mealType}) at {format12Hour(m.time)}
                </div>
              ))
            )}
          </div>

          {/* Restroom */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="text-xs font-bold text-purple-400 flex items-center gap-1">
              <span>🚽</span> Restroom Logs
            </div>
            {hourRestroom.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No restroom entry in this hour</p>
            ) : (
              hourRestroom.map((r) => (
                <div key={r.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                  <span className="font-bold capitalize">{r.type.replace('_', ' ')}</span> at {format12Hour(r.time)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
