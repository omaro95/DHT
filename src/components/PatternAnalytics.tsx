import React from 'react';
import { DayData } from '../types';
import { isMonday, isThursday } from '../utils/dateUtils';
import { BarChart3, Droplets, Utensils, Anchor, X, Activity, Award, CheckCircle2, TrendingUp } from 'lucide-react';

interface PatternAnalyticsProps {
  allData: Record<string, DayData>;
  onClose: () => void;
}

export const PatternAnalytics: React.FC<PatternAnalyticsProps> = ({ allData, onClose }) => {
  const dayKeys = Object.keys(allData);
  const totalDays = dayKeys.length || 1;

  let totalWater = 0;
  let totalMeals = 0;
  let totalRestroom = 0;

  let monCount = 0;
  let monWaterTotal = 0;
  let monMealTotal = 0;

  let thuCount = 0;
  let thuWaterTotal = 0;
  let thuMealTotal = 0;

  let otherCount = 0;
  let otherWaterTotal = 0;

  // Hydration Clarity breakdown
  let hydrationOptimal = 0; // scale 1-2
  let hydrationDehydrated = 0; // scale 3-5

  dayKeys.forEach((key) => {
    const day = allData[key];
    const dateObj = new Date(key + 'T00:00:00');

    const dayWater = day.waterLogs.reduce((acc, w) => acc + w.amountMl, 0);
    const dayMealCount = day.mealLogs.length;

    totalWater += dayWater;
    totalMeals += dayMealCount;
    totalRestroom += day.restroomLogs.length;

    day.restroomLogs.forEach((r) => {
      if (r.type === 'urination' && r.hydrationColor) {
        if (r.hydrationColor <= 2) hydrationOptimal++;
        else hydrationDehydrated++;
      }
    });

    if (isMonday(dateObj)) {
      monCount++;
      monWaterTotal += dayWater;
      monMealTotal += dayMealCount;
    } else if (isThursday(dateObj)) {
      thuCount++;
      thuWaterTotal += dayWater;
      thuMealTotal += dayMealCount;
    } else {
      otherCount++;
      otherWaterTotal += dayWater;
    }
  });

  const avgDailyWater = Math.round(totalWater / totalDays);
  const avgDailyMeals = (totalMeals / totalDays).toFixed(1);
  const avgRestroom = (totalRestroom / totalDays).toFixed(1);

  const avgMonWater = monCount > 0 ? Math.round(monWaterTotal / monCount) : 0;
  const avgThuWater = thuCount > 0 ? Math.round(thuWaterTotal / thuCount) : 0;
  const avgOtherWater = otherCount > 0 ? Math.round(otherWaterTotal / otherCount) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100">Temporal Pattern Analytics</h2>
              <p className="text-xs text-slate-400">
                Data insights across {totalDays} recorded days. Analyzing anchor day consistency & biometrics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            aria-label="Close Analytics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High Level Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Average Daily Water</span>
              <Droplets className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">{avgDailyWater} ml</p>
            <span className="text-[10px] text-sky-400/80">Target: 2,500 ml/day</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Average Daily Meals</span>
              <Utensils className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">{avgDailyMeals} Meals</p>
            <span className="text-[10px] text-amber-400/80">Consistent meal timing</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Restroom Frequency</span>
              <span className="text-sm">🚽</span>
            </div>
            <p className="text-2xl font-black text-slate-100">{avgRestroom} / day</p>
            <span className="text-[10px] text-purple-400/80">Hydration indicator</span>
          </div>
        </div>

        {/* Anchor Day Performance Comparison */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Anchor Day Comparison (Mondays & Thursdays)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Monday Anchor */}
            <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between text-indigo-300 font-extrabold">
                <span>🎯 Monday Anchor</span>
                <span className="bg-indigo-500/20 px-2 py-0.5 rounded text-[10px]">Kickoff</span>
              </div>
              <p className="text-xl font-black text-slate-100">{avgMonWater} ml water</p>
              <p className="text-slate-400">Avg {monCount > 0 ? (monMealTotal / monCount).toFixed(1) : 0} meals/day</p>
            </div>

            {/* Thursday Anchor */}
            <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-extrabold">
                <span>⚡ Thursday Anchor</span>
                <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">Audit</span>
              </div>
              <p className="text-xl font-black text-slate-100">{avgThuWater} ml water</p>
              <p className="text-slate-400">Avg {thuCount > 0 ? (thuMealTotal / thuCount).toFixed(1) : 0} meals/day</p>
            </div>

            {/* Non-Anchor Days */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-bold">
                <span>Other Weekdays</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">Standard</span>
              </div>
              <p className="text-xl font-black text-slate-100">{avgOtherWater} ml water</p>
              <p className="text-slate-500">Baseline tracking days</p>
            </div>
          </div>
        </div>

        {/* Hydration Health Indicator */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-400" />
            Hydration Quality Index (Restroom Logs Analysis)
          </h3>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Optimal Pale Clear (Levels 1-2):</span>
              <span className="text-lg font-black text-emerald-400">{hydrationOptimal} Logs</span>
            </div>

            <div className="flex-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Dehydrated Darker (Levels 3-5):</span>
              <span className="text-lg font-black text-amber-400">{hydrationDehydrated} Logs</span>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md"
          >
            Close Analytics
          </button>
        </div>

      </div>
    </div>
  );
};
