import React, { useState, useMemo } from 'react';
import { DayData } from '../types';
import { format12Hour, formatDateTo12Hour, timeToFractionalHours, formatDateKey } from '../utils/dateUtils';
import { useSolar } from '../context/SolarContext';
import { LocationSelectorModal } from './LocationSelectorModal';
import {
  Droplets,
  Utensils,
  Activity,
  Sun,
  Sunset,
  Sunrise,
  Clock,
  Sparkles,
  MapPin,
  Compass,
  Navigation,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Eye
} from 'lucide-react';

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
  onQuickLog,
}) => {
  const {
    location,
    solarTimes: todaySolarTimes,
    currentSolarPosition: liveSolarPos,
    getSolarTimesForDate,
    getSolarPositionForDate,
    currentTime,
  } = useSolar();

  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'live' | 'hour'>('live');

  // Parse day date
  const dayDateObj = useMemo(() => {
    return new Date(dayData.date + 'T12:00:00');
  }, [dayData.date]);

  const isToday = useMemo(() => {
    return formatDateKey(new Date()) === dayData.date;
  }, [dayData.date]);

  // Calculate accurate Solar Times for the selected date
  const daySolarTimes = useMemo(() => {
    return isToday ? todaySolarTimes : getSolarTimesForDate(dayDateObj);
  }, [isToday, todaySolarTimes, dayDateObj, getSolarTimesForDate]);

  // Determine active displayed solar position (Live if viewing today in live mode, or evaluated at selected hour)
  const activeSolarPos = useMemo(() => {
    if (isToday && viewMode === 'live') {
      return liveSolarPos;
    }
    // Calculate for selected hour of the day
    const hourDate = new Date(dayData.date + 'T00:00:00');
    hourDate.setHours(selectedHour, 30, 0, 0);
    return getSolarPositionForDate(hourDate);
  }, [isToday, viewMode, liveSolarPos, dayData.date, selectedHour, getSolarPositionForDate]);

  // SVG Geometry Constants
  const cx = 300;
  const cy = 260;
  const R = 185;

  // Daylight standard hours range for clock markers: 07:00 AM (7) to 07:00 PM (19)
  const daylightHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  // Coordinate mapper along the 180° semi-circle arc
  // angleDeg: 0° = 7 AM / Sunrise Horizon (Left) -> 90° = Solar Noon Zenith (Top) -> 180° = 7 PM / Sunset Horizon (Right)
  const getArcCoordsFromAngle = (angleDeg: number, radius = R) => {
    const clampedAngle = Math.max(0, Math.min(180, angleDeg));
    const theta = Math.PI - (clampedAngle * Math.PI) / 180;
    const x = cx + radius * Math.cos(theta);
    const y = cy - radius * Math.sin(theta);
    return { x, y, angleDeg: clampedAngle };
  };

  // Convert fractional hour (7..19) to arc coordinates
  const getArcCoordsFromHour = (fHour: number, radius = R) => {
    const clamped = Math.max(7, Math.min(19, fHour));
    const fraction = (clamped - 7) / 12; // 0 to 1
    const angleDeg = fraction * 180;
    return getArcCoordsFromAngle(angleDeg, radius);
  };

  // Calculate arc position for sunrise, solar noon, and sunset based on actual calculated times
  const getSunAngleForDateEvent = (dateEvent: Date | null): number | null => {
    if (!dateEvent) return null;
    const fHour = dateEvent.getHours() + dateEvent.getMinutes() / 60;
    // Map between 6 AM (0°) to 8 PM (180°) or 7 AM to 7 PM
    if (fHour < 6 || fHour > 20) return null;
    const fraction = (fHour - 6) / 14; // 6am to 8pm scale for astronomical events
    return Math.max(0, Math.min(180, fraction * 180));
  };

  // Calculate sun position marker along the arc
  const currentFractionalHour = isToday && viewMode === 'live'
    ? currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600
    : selectedHour + 0.5;

  const sunAngleDeg = activeSolarPos.sunClockAngleDeg;
  // If activeSolarPos has an angle, use it mapped directly to the arc
  const sunPos = getArcCoordsFromAngle(
    Math.max(0, Math.min(180, (currentFractionalHour - 7) / 12 * 180)),
    R
  );

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

  const daylightActivities = dayData.activityLogs.filter(
    (a) => a.hour >= 7 && a.hour <= 19
  );

  const totalDaylightWater = daylightWater.reduce((acc, curr) => acc + curr.amountMl, 0);

  // Generate SVG path for semi-circle arc
  const startPt = getArcCoordsFromHour(7, R);
  const endPt = getArcCoordsFromHour(19, R);
  const arcPathD = `M ${startPt.x} ${startPt.y} A ${R} ${R} 0 0 1 ${endPt.x} ${endPt.y}`;

  // Active display hour details
  const activeHourIndex = hoveredHour !== null ? hoveredHour : selectedHour;
  const hourWater = dayData.waterLogs.filter(
    (w) => Math.floor(timeToFractionalHours(w.time)) === activeHourIndex
  );
  const hourMeals = dayData.mealLogs.filter(
    (m) => Math.floor(timeToFractionalHours(m.time)) === activeHourIndex
  );
  const hourRestrooms = dayData.restroomLogs.filter(
    (r) => Math.floor(timeToFractionalHours(r.time)) === activeHourIndex
  );
  const hourActivities = dayData.activityLogs.filter(
    (a) => a.hour === activeHourIndex
  );

  // Helper for daylight duration in hours & minutes
  const daylightHoursCount = Math.floor(daySolarTimes.daylightDurationMinutes / 60);
  const daylightMinsCount = Math.round(daySolarTimes.daylightDurationMinutes % 60);

  // Format azimuth as compass cardinal (e.g. 185° S, 90° E)
  const getCardinal = (deg: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return `${deg}° ${directions[index]}`;
  };

  // Phase Theme Colors & Glows
  const getPhaseColorBadge = () => {
    switch (activeSolarPos.phaseCategory) {
      case 'Sunrise':
        return 'from-amber-500/30 to-orange-500/20 text-amber-300 border-amber-500/50';
      case 'Solar Noon':
        return 'from-yellow-400/30 to-amber-500/20 text-yellow-300 border-yellow-400/60';
      case 'Sunset':
        return 'from-orange-500/30 to-rose-500/20 text-orange-300 border-orange-500/50';
      case 'Twilight':
        return 'from-indigo-500/30 to-purple-500/20 text-indigo-300 border-indigo-400/50';
      case 'Night':
        return 'from-slate-800 to-indigo-950 text-slate-300 border-slate-700';
      default:
        return 'from-sky-500/30 to-amber-500/20 text-sky-300 border-sky-400/50';
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl border border-amber-500/30 shadow-2xl p-5 md:p-7 relative overflow-hidden">
      {/* Background Solar Aura Glow */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-72 blur-3xl rounded-full pointer-events-none transition-all duration-1000 ${
          activeSolarPos.phaseCategory === 'Solar Noon'
            ? 'bg-amber-400/20'
            : activeSolarPos.phaseCategory === 'Sunrise' || activeSolarPos.phaseCategory === 'Sunset'
            ? 'bg-orange-500/20'
            : activeSolarPos.phaseCategory === 'Twilight'
            ? 'bg-indigo-600/20'
            : 'bg-amber-500/10'
        }`}
      />

      {/* Top Header & Solar Location Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              180° Solar Clock & Astronomical Phases
            </h2>
            <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/40">
              07:00 AM – 07:00 PM Daylight Trajectory
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Real-time NOAA solar algorithm calculates precise sunrise, solar noon, sunset, and twilight phases.
          </p>
        </div>

        {/* Location & Mode Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Badge & Switcher Button */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm group"
            title="Configure Solar Location & Coordinates"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="max-w-[130px] truncate">{location.city || 'Set Location'}</span>
            <span className="text-[10px] font-mono text-slate-400">
              ({Math.round(location.latitude)}°, {Math.round(location.longitude)}°)
            </span>
          </button>

          {/* Live vs Selected Hour View Switcher (if today) */}
          {isToday && (
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('live')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'live'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Sun</span>
              </button>
              <button
                onClick={() => setViewMode('hour')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'hour'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Hour Slot</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Active Sun Phase Banner */}
      <div className={`p-4 rounded-2xl bg-gradient-to-r ${getPhaseColorBadge()} border shadow-xl mb-6 relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl p-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 shrink-0 shadow-inner">
              {activeSolarPos.phaseIcon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-widest font-black text-amber-400">
                  Current Solar Phase
                </span>
                <span className="bg-slate-950/80 px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-300 border border-slate-800">
                  {activeSolarPos.phaseCategory}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-100 tracking-tight mt-0.5">
                {activeSolarPos.phaseName}
              </h3>
              <p className="text-xs text-slate-300/90 mt-1 max-w-xl leading-relaxed">
                {activeSolarPos.phaseDescription}
              </p>
            </div>
          </div>

          {/* Solar Metrics telemetry pill */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0 text-xs">
            <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Solar Elevation</span>
              <span className={`font-mono font-black text-sm ${activeSolarPos.elevation >= 0 ? 'text-amber-400' : 'text-indigo-400'}`}>
                {activeSolarPos.elevation >= 0 ? `+${activeSolarPos.elevation}°` : `${activeSolarPos.elevation}°`}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Solar Azimuth</span>
              <span className="font-mono font-black text-sm text-sky-300">
                {getCardinal(activeSolarPos.azimuth)}
              </span>
            </div>

            {activeSolarPos.nextPhaseTime ? (
              <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Next Transition</span>
                <span className="font-mono font-bold text-xs text-emerald-300 truncate block">
                  {activeSolarPos.nextPhaseTime.name} ({formatDateTo12Hour(activeSolarPos.nextPhaseTime.time)})
                </span>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Max Noon Zenith</span>
                <span className="font-mono font-bold text-xs text-amber-300">
                  {Math.round(daySolarTimes.maxSolarElevation)}° Elevation
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive 180° Sun Clock SVG Stage */}
      <div className="relative w-full max-w-3xl mx-auto aspect-[2/1.12] my-3 flex items-center justify-center">
        <svg viewBox="0 0 600 320" className="w-full h-full overflow-visible select-none">
          <defs>
            {/* Daylight Arc Sun Gradient */}
            <linearGradient id="solarArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="50%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="75%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.8" />
            </linearGradient>

            {/* Twilight Dawn Atmospheric Gradient */}
            <linearGradient id="twilightDawnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#312e81" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>

            {/* Twilight Dusk Atmospheric Gradient */}
            <linearGradient id="twilightDuskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.8" />
            </linearGradient>

            {/* Sun Rays Radial Aura */}
            <radialGradient id="liveSunAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>

            {/* Horizon Guideline Gradient */}
            <linearGradient id="horizonLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="20%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#ea580c" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Horizon Base Line */}
          <line
            x1="30"
            y1={cy}
            x2="570"
            y2={cy}
            stroke="url(#horizonLineGradient)"
            strokeWidth="2.5"
            strokeDasharray="5 4"
          />

          {/* Twilight Horizon Atmospheric Bands */}
          {/* Dawn Twilight (Left of Sunrise) */}
          <rect
            x="30"
            y={cy - 12}
            width="80"
            height="24"
            fill="url(#twilightDawnGradient)"
            rx="6"
            className="opacity-70"
          />
          <text x="70" y={cy - 16} textAnchor="middle" fill="#818cf8" className="text-[9px] font-bold">
            Civil Dawn ({formatDateTo12Hour(daySolarTimes.civilDawn)})
          </text>

          {/* Dusk Twilight (Right of Sunset) */}
          <rect
            x="490"
            y={cy - 12}
            width="80"
            height="24"
            fill="url(#twilightDuskGradient)"
            rx="6"
            className="opacity-70"
          />
          <text x="530" y={cy - 16} textAnchor="middle" fill="#c084fc" className="text-[9px] font-bold">
            Civil Dusk ({formatDateTo12Hour(daySolarTimes.civilDusk)})
          </text>

          {/* 3 Major Calculated Astronomical Phase Labels along Horizon */}
          <g className="text-[11px] font-extrabold fill-slate-300">
            {/* Sunrise Phase Label */}
            <g transform={`translate(${startPt.x - 30}, ${cy + 24})`}>
              <text x="0" y="0" textAnchor="start" fill="#f59e0b" className="font-bold">
                🌅 Sunrise
              </text>
              <text x="0" y="14" textAnchor="start" fill="#fbbf24" className="font-mono text-[10px]">
                {formatDateTo12Hour(daySolarTimes.sunrise)}
              </text>
            </g>

            {/* Solar Noon (Zenith) Phase Label */}
            <g transform={`translate(${cx}, ${cy + 24})`}>
              <text x="0" y="0" textAnchor="middle" fill="#fef08a" className="font-bold">
                ☀️ Solar Noon (Zenith)
              </text>
              <text x="0" y="14" textAnchor="middle" fill="#fbbf24" className="font-mono text-[10px]">
                {formatDateTo12Hour(daySolarTimes.solarNoon)} ({Math.round(daySolarTimes.maxSolarElevation)}° Alt)
              </text>
            </g>

            {/* Sunset Phase Label */}
            <g transform={`translate(${endPt.x + 30}, ${cy + 24})`}>
              <text x="0" y="0" textAnchor="end" fill="#ea580c" className="font-bold">
                🌇 Sunset
              </text>
              <text x="0" y="14" textAnchor="end" fill="#fbbf24" className="font-mono text-[10px]">
                {formatDateTo12Hour(daySolarTimes.sunset)}
              </text>
            </g>
          </g>

          {/* Outer Guide Arc */}
          <path
            d={arcPathD}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Active 180° Solar Arc Gradient */}
          <path
            d={arcPathD}
            fill="none"
            stroke="url(#solarArcGradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Radial Hour Ticks along the 180° Arc */}
          {daylightHours.map((h) => {
            const isSelected = selectedHour === h;
            const isHovered = hoveredHour === h;
            const outerPt = getArcCoordsFromHour(h, R + 14);
            const innerPt = getArcCoordsFromHour(h, R - 12);
            const textPt = getArcCoordsFromHour(h, R + 34);

            const labelStr = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;

            return (
              <g
                key={h}
                onClick={() => {
                  onSelectHour(h);
                  if (isToday) setViewMode('hour');
                }}
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
                  stroke={isSelected ? '#fbbf24' : isHovered ? '#38bdf8' : '#475569'}
                  strokeWidth={isSelected || isHovered ? '3' : '1.5'}
                />

                {/* Hour Label */}
                <text
                  x={textPt.x}
                  y={textPt.y + 4}
                  textAnchor="middle"
                  className={`text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'fill-amber-300 text-xs font-black'
                      : isHovered
                      ? 'fill-sky-300'
                      : 'fill-slate-400 group-hover:fill-slate-200'
                  }`}
                >
                  {labelStr}
                </text>

                {/* Hour Point Dot */}
                <circle
                  cx={getArcCoordsFromHour(h, R).x}
                  cy={getArcCoordsFromHour(h, R).y}
                  r={isSelected ? 6 : isHovered ? 5 : 3.5}
                  fill={isSelected ? '#fbbf24' : '#0f172a'}
                  stroke={isSelected ? '#f59e0b' : '#64748b'}
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Plotted Events along Arc */}

          {/* 1. Water Intake Drops */}
          {daylightWater.map((w) => {
            const fh = timeToFractionalHours(w.time);
            const pt = getArcCoordsFromHour(fh, R - 28);
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
            const pt = getArcCoordsFromHour(fh, R + 26);
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
            const pt = getArcCoordsFromHour(fh, R - 48);
            return (
              <g key={r.id} className="cursor-pointer">
                <circle cx={pt.x} cy={pt.y} r="8" fill="#7e22ce" stroke="#c084fc" strokeWidth="1.5" />
                <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" className="text-[9px] font-bold fill-white pointer-events-none">
                  🚽
                </text>
              </g>
            );
          })}

          {/* Sun Ray Line from Origin to Sun */}
          <line
            x1={cx}
            y1={cy}
            x2={sunPos.x}
            y2={sunPos.y}
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.6"
          />

          {/* Animated Sun Position Marker */}
          <g>
            {/* Outer Pulsing Aura */}
            <circle
              cx={sunPos.x}
              cy={sunPos.y}
              r="26"
              fill="url(#liveSunAura)"
              className="animate-pulse opacity-90"
            />
            {/* Core Glowing Sun Disc */}
            <circle
              cx={sunPos.x}
              cy={sunPos.y}
              r="14"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="2.5"
              className="shadow-xl"
            />
            <circle cx={sunPos.x} cy={sunPos.y} r="8" fill="#fffbeb" />

            {/* Sun Position Elevation Badge */}
            <g transform={`translate(${sunPos.x}, ${sunPos.y - 22})`}>
              <rect
                x="-32"
                y="-14"
                width="64"
                height="16"
                rx="8"
                fill="#0f172a"
                stroke="#f59e0b"
                strokeWidth="1"
                className="opacity-95"
              />
              <text
                x="0"
                y="-2.5"
                textAnchor="middle"
                fill="#fef08a"
                className="text-[9px] font-black font-mono"
              >
                {activeSolarPos.elevation >= 0 ? `+${activeSolarPos.elevation}°` : `${activeSolarPos.elevation}°`} Alt
              </text>
            </g>
          </g>

          {/* Center Sun Info Core in SVG */}
          <g transform={`translate(${cx}, ${cy - 52})`}>
            <text textAnchor="middle" y="-22" className="text-[11px] font-bold uppercase tracking-wider fill-slate-400">
              {isToday && viewMode === 'live' ? 'Live Sun Tracking' : 'Selected Focus Slot'}
            </text>
            <text textAnchor="middle" y="6" className="text-[22px] font-black fill-amber-300 tracking-tight">
              {isToday && viewMode === 'live'
                ? formatDateTo12Hour(currentTime)
                : format12Hour(`${String(activeHourIndex).padStart(2, '0')}:00`)}
            </text>
            <text textAnchor="middle" y="24" className="text-[11px] font-semibold fill-slate-300">
              {activeSolarPos.phaseName}
            </text>
          </g>
        </svg>
      </div>

      {/* 4-Card Astronomical Times Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
        {/* Card 1: Sunrise */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
            <Sunrise className="w-4 h-4" />
            <span>Sunrise</span>
          </div>
          <div>
            <div className="text-base font-black text-slate-100 font-mono">
              {formatDateTo12Hour(daySolarTimes.sunrise)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Dawn: {formatDateTo12Hour(daySolarTimes.civilDawn)}
            </div>
          </div>
        </div>

        {/* Card 2: Solar Noon */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-yellow-300 font-bold mb-1">
            <Sun className="w-4 h-4" />
            <span>Solar Noon</span>
          </div>
          <div>
            <div className="text-base font-black text-slate-100 font-mono">
              {formatDateTo12Hour(daySolarTimes.solarNoon)}
            </div>
            <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
              Zenith: {Math.round(daySolarTimes.maxSolarElevation)}° Altitude
            </div>
          </div>
        </div>

        {/* Card 3: Sunset */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-orange-400 font-bold mb-1">
            <Sunset className="w-4 h-4" />
            <span>Sunset</span>
          </div>
          <div>
            <div className="text-base font-black text-slate-100 font-mono">
              {formatDateTo12Hour(daySolarTimes.sunset)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Dusk: {formatDateTo12Hour(daySolarTimes.civilDusk)}
            </div>
          </div>
        </div>

        {/* Card 4: Total Daylight */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1">
            <Compass className="w-4 h-4" />
            <span>Daylight Span</span>
          </div>
          <div>
            <div className="text-base font-black text-slate-100 font-mono">
              {daylightHoursCount}h {daylightMinsCount}m
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              {activeSolarPos.isDaylight ? '☀️ Sun Above Horizon' : '🌙 Below Horizon'}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Hour Summary Toolbar */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">
            Hour Slot {format12Hour(`${String(activeHourIndex).padStart(2, '0')}:00`)} Roadmap Logs:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hourWater.length > 0 && (
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
              <Droplets className="w-3 h-3 text-sky-400" />
              {hourWater.reduce((sum, w) => sum + w.amountMl, 0)} ml
            </span>
          )}

          {hourMeals.length > 0 && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
              <Utensils className="w-3 h-3 text-amber-400" />
              {hourMeals.map((m) => m.title).join(', ')}
            </span>
          )}

          {hourRestrooms.length > 0 && (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
              <span>🚽</span>
              {hourRestrooms.length} Restroom Log
            </span>
          )}

          {hourActivities.length > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
              <Activity className="w-3 h-3 text-emerald-400" />
              {hourActivities[0].title}
            </span>
          )}

          {hourWater.length === 0 &&
            hourMeals.length === 0 &&
            hourRestrooms.length === 0 &&
            hourActivities.length === 0 && (
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

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};
