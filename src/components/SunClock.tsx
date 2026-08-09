import React, { useState } from 'react';
import { DayData } from '../types';
import { format12Hour, timeToFractionalHours } from '../utils/dateUtils';
import { Droplets, Utensils, Activity, Sun, Sunset, Sunrise, Clock, Sparkles } from 'lucide-react';

interface SunClockProps {
  dayData: DayData;
  selectedHour: number;
  onSelectHour: (hour: number) => void;
  onQuickLog?: (type: 'water' | 'meal' | 'restroom' | 'activity') => void;
}

export const SunClock: React.FC<SunClockProps> = ({
  dayData,
  selectedHour,
  onSelectHour,
  onQuickLog
}) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // SVG Geometry Constants
  const cx = 300;
  const cy = 260;
  const R = 190;

  // Daylight hours range: 7:00 AM (7) to 7:00 PM (19)
  const daylightHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  // Helper to calculate coordinates on the 180° arc for fractional hour
  const getArcCoords = (fHour: number, radius = R) => {
    // Clamp to 7..19
    const clamped = Math.max(7, Math.min(19, fHour));
    const fraction = (clamped - 7) / 12; // 0 to 1
    const angleDeg = fraction * 180;
    const theta = Math.PI - (angleDeg * Math.PI / 180);
    const x = cx + radius * Math.cos(theta);
    const y = cy - radius * Math.sin(theta);
    return { x, y, angleDeg };
  };

  // Convert current real time or selected hour to sun position angle
  const now = new Date();
  const currentFractionalHour = now.getHours() + now.getMinutes() / 60;
  // If viewing today, show live position; else position at selectedHour
  const sunFractional = (currentFractionalHour >= 7 && currentFractionalHour <= 19)
    ? currentFractionalHour
    : Math.max(7, Math.min(19, selectedHour + 0.5));

  const sunPos = getArcCoords(sunFractional, R);

  // Filter logs that fall in daylight hours (07:00 - 19:00)
  const daylightWater = dayData.waterLogs.filter((w) => {
    const fh = timeToFractionalHours(w.time);
    return fh >= 7 && fh <= 19;
  });

  const daylightMeals = dayData.mealLogs.filter((m) => {
    const fh = timeToFractionalHours(m.time);
    return fh >= 7 && fh <= 19;
  });

  const daylightRestroom = dayData.restroomLogs.filter((r) => {
    const fh = timeToFractionalHours(r.time);
    return fh >= 7 && fh <= 19;
  });

  const daylightActivities = dayData.activityLogs.filter((a) => a.hour >= 7 && a.hour <= 19);

  const totalDaylightWater = daylightWater.reduce((acc, curr) => acc + curr.amountMl, 0);

  // Generate SVG path for semi-circle arc from 7 AM (x=cx-R, y=cy) to 7 PM (x=cx+R, y=cy)
  const startPt = getArcCoords(7, R);
  const endPt = getArcCoords(19, R);
  const arcPathD = `M ${startPt.x} ${startPt.y} A ${R} ${R} 0 0 1 ${endPt.x} ${endPt.y}`;

  // Active display hour details
  const activeHourIndex = hoveredHour !== null ? hoveredHour : selectedHour;
  const hourWater = dayData.waterLogs.filter((w) => Math.floor(timeToFractionalHours(w.time)) === activeHourIndex);
  const hourMeals = dayData.mealLogs.filter((m) => Math.floor(timeToFractionalHours(m.time)) === activeHourIndex);
  const hourRestrooms = dayData.restroomLogs.filter((r) => Math.floor(timeToFractionalHours(r.time)) === activeHourIndex);
  const hourActivities = dayData.activityLogs.filter((a) => a.hour === activeHourIndex);

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-amber-500/20 shadow-2xl p-4 md:p-6 relative overflow-hidden">
      {/* Subtle Solar Glow background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">180° Sun Clock</h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium border border-amber-500/30">
              07:00 AM – 07:00 PM Daylight Arc
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Plotting hydration, meals, restroom logs & activities along the solar trajectory
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3 text-xs bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl">
          <div className="flex items-center gap-1 text-sky-400 font-semibold">
            <Droplets className="w-3.5 h-3.5" />
            <span>{totalDaylightWater} ml</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Utensils className="w-3.5 h-3.5" />
            <span>{daylightMeals.length} Meals</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-purple-400 font-semibold">
            <span className="text-xs font-bold">🚽</span>
            <span>{daylightRestroom.length} Logs</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Sun Arc Container */}
      <div className="relative w-full max-w-2xl mx-auto aspect-[2/1.15] mt-2 flex items-center justify-center">
        <svg viewBox="0 0 600 320" className="w-full h-full overflow-visible">
          <defs>
            {/* Arc Gradient */}
            <linearGradient id="sunArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.8" />
            </linearGradient>

            {/* Sun Rays Radial Glow */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Horizon Glow */}
            <linearGradient id="horizonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Horizon Line */}
          <line x1="50" y1={cy} x2="550" y2={cy} stroke="url(#horizonGradient)" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Horizon Labels */}
          <g className="text-[11px] font-semibold fill-slate-400">
            <text x="60" y={cy + 22} textAnchor="start" fill="#f59e0b" className="flex items-center">
              🌅 Sunrise (07:00 AM)
            </text>
            <text x="300" y={cy + 22} textAnchor="middle" fill="#fbbf24">
              ☀️ Zenith (01:00 PM)
            </text>
            <text x="540" y={cy + 22} textAnchor="end" fill="#ea580c">
              🌇 Sunset (07:00 PM)
            </text>
          </g>

          {/* Semi-Circle Outer Background Guide Arc */}
          <path d={arcPathD} fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" opacity="0.5" />

          {/* Active Semi-Circle Gradient Arc */}
          <path d={arcPathD} fill="none" stroke="url(#sunArcGradient)" strokeWidth="4" strokeLinecap="round" />

          {/* Hour Tick Markers along Arc */}
          {daylightHours.map((h) => {
            const isSelected = selectedHour === h;
            const isHovered = hoveredHour === h;
            const outerPt = getArcCoords(h, R + 12);
            const innerPt = getArcCoords(h, R - 12);
            const textPt = getArcCoords(h, R + 32);

            const labelStr = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;

            return (
              <g
                key={h}
                onClick={() => onSelectHour(h)}
                onMouseEnter={() => setHoveredHour(h)}
                onMouseLeave={() => setHoveredHour(null)}
                className="cursor-pointer group transition-all"
              >
                {/* Radial Tick Line */}
                <line
                  x1={innerPt.x}
                  y1={innerPt.y}
                  x2={outerPt.x}
                  y2={outerPt.y}
                  stroke={isSelected ? '#fbbf24' : isHovered ? '#38bdf8' : '#64748b'}
                  strokeWidth={isSelected || isHovered ? '3' : '1.5'}
                />

                {/* Hour Label */}
                <text
                  x={textPt.x}
                  y={textPt.y + 4}
                  textAnchor="middle"
                  className={`text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'fill-amber-300 text-sm'
                      : isHovered
                      ? 'fill-sky-300'
                      : 'fill-slate-400 group-hover:fill-slate-200'
                  }`}
                >
                  {labelStr}
                </text>

                {/* Hour Point Dot */}
                <circle
                  cx={getArcCoords(h, R).x}
                  cy={getArcCoords(h, R).y}
                  r={isSelected ? 6 : isHovered ? 5 : 3.5}
                  fill={isSelected ? '#fbbf24' : '#1e293b'}
                  stroke={isSelected ? '#f59e0b' : '#64748b'}
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Plotted Events along Arc */}

          {/* 1. Water Drops */}
          {daylightWater.map((w) => {
            const fh = timeToFractionalHours(w.time);
            const pt = getArcCoords(fh, R - 28);
            return (
              <g key={w.id} className="cursor-pointer">
                <circle cx={pt.x} cy={pt.y} r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" className="text-[9px] font-bold fill-white pointer-events-none">
                  💧
                </text>
              </g>
            );
          })}

          {/* 2. Meal Stamps */}
          {daylightMeals.map((m) => {
            const fh = timeToFractionalHours(m.time);
            const pt = getArcCoords(fh, R + 26);
            return (
              <g key={m.id} className="cursor-pointer">
                <circle cx={pt.x} cy={pt.y} r="9" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
                <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" className="text-[10px] font-bold fill-white pointer-events-none">
                  🍱
                </text>
              </g>
            );
          })}

          {/* 3. Restroom Stamps */}
          {daylightRestroom.map((r) => {
            const fh = timeToFractionalHours(r.time);
            const pt = getArcCoords(fh, R - 48);
            return (
              <g key={r.id} className="cursor-pointer">
                <circle cx={pt.x} cy={pt.y} r="8" fill="#7e22ce" stroke="#c084fc" strokeWidth="1.5" />
                <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" className="text-[9px] font-bold fill-white pointer-events-none">
                  🚽
                </text>
              </g>
            );
          })}

          {/* Animated Sun Position Marker */}
          <g>
            {/* Sun Rays Aura */}
            <circle cx={sunPos.x} cy={sunPos.y} r="22" fill="url(#sunGlow)" className="animate-ping opacity-75" />
            <circle cx={sunPos.x} cy={sunPos.y} r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2.5" className="shadow-lg" />
            <circle cx={sunPos.x} cy={sunPos.y} r="8" fill="#fef08a" />
          </g>

          {/* Center Sun Info Core */}
          <g transform={`translate(${cx}, ${cy - 50})`}>
            <text textAnchor="middle" y="-20" className="text-[12px] font-semibold fill-slate-400">
              Active Focus Hour
            </text>
            <text textAnchor="middle" y="6" className="text-[20px] font-extrabold fill-amber-300">
              {format12Hour(`${String(activeHourIndex).padStart(2, '0')}:00`)}
            </text>
            <text textAnchor="middle" y="24" className="text-[10px] font-medium fill-slate-400">
              {activeHourIndex >= 7 && activeHourIndex <= 11
                ? '🌅 Morning Solar Energy'
                : activeHourIndex >= 12 && activeHourIndex <= 15
                ? '☀️ Midday Peak Energy'
                : '🌇 Evening Wind-Down'}
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Hour Summary Bar */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">
            Hour Slot {format12Hour(`${String(activeHourIndex).padStart(2, '0')}:00`)} Summary:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hourWater.length > 0 && (
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
              <Droplets className="w-3 h-3 text-sky-400" />
              {hourWater.reduce((sum, w) => sum + w.amountMl, 0)} ml
            </span>
          )}

          {hourMeals.length > 0 && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
              <Utensils className="w-3 h-3 text-amber-400" />
              {hourMeals.map((m) => m.title).join(', ')}
            </span>
          )}

          {hourRestrooms.length > 0 && (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
              <span>🚽</span>
              {hourRestrooms.length} Restroom Log
            </span>
          )}

          {hourActivities.length > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
              <Activity className="w-3 h-3 text-emerald-400" />
              {hourActivities[0].title}
            </span>
          )}

          {hourWater.length === 0 && hourMeals.length === 0 && hourRestrooms.length === 0 && hourActivities.length === 0 && (
            <span className="text-slate-500 italic">No logs recorded for this hour slot yet</span>
          )}

          <button
            onClick={() => onSelectHour(activeHourIndex)}
            className="ml-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            Drill Into Hour
          </button>
        </div>
      </div>
    </div>
  );
};
