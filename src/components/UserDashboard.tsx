import React, { useState } from 'react';
import { DayData, ViewLevel, WaterLog, MealLog, RestroomLog, ActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSolar } from '../context/SolarContext';
import { formatDateKey, isAnchorDay, format12Hour, formatDateTo12Hour, timeToFractionalHours } from '../utils/dateUtils';
import { getAffirmationForSolarPosition } from '../utils/sunAffirmations';
import { LocationSelectorModal } from './LocationSelectorModal';
import {
  Sun,
  Droplets,
  Utensils,
  Activity,
  Calendar,
  Layers,
  Clock,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  CloudCheck,
  MapPin,
  Plus,
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Settings,
  ChevronRight,
  Zap,
  BarChart3,
  Smartphone,
  Quote,
  RotateCw,
  Copy,
  Check,
  SunMedium
} from 'lucide-react';

interface UserDashboardProps {
  dayData: DayData;
  allData: Record<string, DayData>;
  selectedDate: Date;
  viewLevel: ViewLevel;
  onNavigateLevel: (level: ViewLevel) => void;
  onSelectDate: (date: Date) => void;
  onSelectHour: (hour: number) => void;
  onOpenQuickLog: (type?: 'water' | 'meal' | 'restroom' | 'activity') => void;
  onOpenAnalytics: () => void;
  onOpenApkModal?: () => void;
  onUpdateDayData: (updated: DayData) => void;
  isSyncing?: boolean;
  cloudSynced?: boolean;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  dayData,
  allData,
  selectedDate,
  viewLevel,
  onNavigateLevel,
  onSelectDate,
  onSelectHour,
  onOpenQuickLog,
  onOpenAnalytics,
  onOpenApkModal,
  onUpdateDayData,
  isSyncing,
  cloudSynced,
}) => {
  const { user, logout, updateDisplayName } = useAuth();
  const { location, solarTimes, currentSolarPosition, currentTime } = useSolar();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<string>(user?.displayName || '');
  const [waterGoal, setWaterGoal] = useState<number>(2500); // 2500 ml target
  const [nameSaveMessage, setNameSaveMessage] = useState<string | null>(null);
  const [affirmationIndex, setAffirmationIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const currentAffirmation = getAffirmationForSolarPosition(currentSolarPosition, affirmationIndex);

  const handleCopyAffirmation = () => {
    if (!currentAffirmation) return;
    const textToCopy = `"${currentAffirmation.quote}" — ${currentAffirmation.theme} (${currentSolarPosition.phaseName})`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isAnchor = isAnchorDay(selectedDate);
  const isToday = formatDateKey(new Date()) === dayData.date;

  // Hydration calculation
  const totalWaterMl = dayData.waterLogs.reduce((acc, log) => acc + log.amountMl, 0);
  const waterProgressPercent = Math.min(100, Math.round((totalWaterMl / waterGoal) * 100));

  // Quick hydration helper (+250ml or +500ml instant log)
  const handleQuickAddWater = (ml: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: WaterLog = {
      id: `w-${Date.now()}`,
      date: dayData.date,
      time: timeStr,
      amountMl: ml,
      notes: 'Quick logged from Dashboard',
    };
    onUpdateDayData({
      ...dayData,
      waterLogs: [...dayData.waterLogs, newLog],
    });
  };

  // Compile unified chronological timeline for today
  const timelineEvents = [
    ...dayData.waterLogs.map((w) => ({
      id: w.id,
      time: w.time,
      type: 'water' as const,
      title: `${w.amountMl} ml Water`,
      desc: w.notes || 'Hydration intake',
      icon: '💧',
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    })),
    ...dayData.mealLogs.map((m) => ({
      id: m.id,
      time: m.time,
      type: 'meal' as const,
      title: `${m.title} (${m.type.toUpperCase()})`,
      desc: m.notes || (m.calories ? `${m.calories} kcal` : 'Meal nourishment'),
      icon: '🍱',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    })),
    ...dayData.restroomLogs.map((r) => ({
      id: r.id,
      time: r.time,
      type: 'restroom' as const,
      title: `Restroom (${r.type.toUpperCase()})`,
      desc: r.notes || 'Physiological tracking',
      icon: '🚽',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    })),
    ...dayData.activityLogs.map((a) => ({
      id: a.id,
      time: `${String(a.hour).padStart(2, '0')}:00`,
      type: 'activity' as const,
      title: a.title,
      desc: a.notes || `Energy Level: ${a.energyLevel}/5`,
      icon: '⚡',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    })),
  ].sort((a, b) => timeToFractionalHours(a.time) - timeToFractionalHours(b.time));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      await updateDisplayName(editingName.trim());
      setNameSaveMessage('Profile name updated successfully!');
      setTimeout(() => {
        setNameSaveMessage(null);
        setIsProfileModalOpen(false);
      }, 1200);
    }
  };

  const userDisplayName = user?.displayName || (user?.isAnonymous ? 'Guest Explorer' : user?.email?.split('@')[0] || 'Temporal User');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Welcome & User Account Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/70 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* User Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-sky-400 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-black text-amber-300">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={userDisplayName} className="w-full h-full rounded-[14px] object-cover" />
                ) : (
                  userDisplayName.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  Welcome back, {userDisplayName}!
                </h1>
                {user?.isAnonymous ? (
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold">
                    Guest Account
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified User
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="font-mono">{user?.email || 'Anonymous Guest'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CloudCheck className="w-3.5 h-3.5" />
                  {isSyncing ? 'Syncing with Firestore...' : cloudSynced ? 'Cloud Synced' : 'Ready'}
                </span>
                <span>•</span>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{location.city || 'Set Location'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Log Entry, Quick Switchers, Profile & Logout */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => onOpenQuickLog()}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Log</span>
            </button>

            <button
              onClick={onOpenAnalytics}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Analytics</span>
            </button>

            {onOpenApkModal && (
              <button
                onClick={onOpenApkModal}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 text-sky-400 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>APK App</span>
              </button>
            )}

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-300 font-bold p-2.5 rounded-xl text-xs transition-all"
              title="Account Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Vital KPI Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: 180° Solar Phase & Altitude */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Solar Position</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sun className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-300">{currentSolarPosition.phaseName}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Elevation: <strong className="text-amber-400 font-mono">{currentSolarPosition.elevation >= 0 ? `+${currentSolarPosition.elevation}°` : `${currentSolarPosition.elevation}°`}</strong> • Noon: <span className="font-mono">{formatDateTo12Hour(solarTimes.solarNoon)}</span>
            </p>
          </div>

          <button
            onClick={() => onNavigateLevel('day')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 pt-2 border-t border-slate-800"
          >
            <span>Inspect 180° Sun Clock</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Hydration Intake & Target */}
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-sky-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Water Hydration</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Droplets className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-sky-300">{totalWaterMl}</span>
              <span className="text-xs font-semibold text-slate-400">/ {waterGoal} ml ({waterProgressPercent}%)</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800">
              <div
                className="bg-gradient-to-r from-sky-500 to-sky-300 h-full transition-all duration-500"
                style={{ width: `${waterProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
            <button
              onClick={() => handleQuickAddWater(250)}
              className="flex-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-bold py-1 px-2 rounded-lg transition-all"
            >
              +250ml
            </button>
            <button
              onClick={() => handleQuickAddWater(500)}
              className="flex-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-bold py-1 px-2 rounded-lg transition-all"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Card 3: Fueling & Meals */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Meals & Fueling</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300">{dayData.mealLogs.length}</span>
              <span className="text-xs font-semibold text-slate-400">meals recorded</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {dayData.mealLogs.length > 0
                ? dayData.mealLogs.map((m) => m.title).join(', ')
                : 'No meals logged for today yet.'}
            </p>
          </div>

          <button
            onClick={() => onOpenQuickLog('meal')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 pt-2 border-t border-slate-800"
          >
            <span>+ Log Meal Timestamp</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 4: Roadmap Anchor Status */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-purple-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Roadmap Anchor</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-purple-300">
                {isAnchor ? 'Anchor Day' : 'Standard Day'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAnchor
                ? '⭐ Core milestone day (Monday / Thursday cadence)'
                : 'Steady execution day in your weekly cycle'}
            </p>
          </div>

          <button
            onClick={() => onNavigateLevel('week')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 pt-2 border-t border-slate-800"
          >
            <span>View Weekly Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Daily Sun Affirmation Section */}
      {currentAffirmation && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/30 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            {/* Header / Sun Phase Context */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <SunMedium className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">
                    Daily Sun Affirmation
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {currentAffirmation.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Attuned to {currentSolarPosition.phaseName} • Solar Elevation: <span className="text-amber-400 font-mono font-semibold">{currentSolarPosition.elevation >= 0 ? `+${currentSolarPosition.elevation}°` : `${currentSolarPosition.elevation}°`}</span>
                </p>
              </div>
            </div>

            {/* Affirmation Controls: Shuffle & Copy */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setAffirmationIndex((prev) => prev + 1)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
                title="Cycle to next affirmation for this sun phase"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Next Affirmation</span>
              </button>

              <button
                type="button"
                onClick={handleCopyAffirmation}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
                title="Copy affirmation to clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Quote Body & Mindful Guidance */}
          <div className="relative z-10 pt-4 sm:pt-5 space-y-3">
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 text-amber-400/50 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <blockquote className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-relaxed italic">
                  "{currentAffirmation.quote}"
                </blockquote>
                
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    ✨ Theme: {currentAffirmation.theme}
                  </span>
                  <span className="text-xs text-slate-400">
                    💡 <strong className="text-slate-300 font-semibold">Mindful Action:</strong> {currentAffirmation.sourceOrGuidance}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Roadmap Hub Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Quick Temporal Mode Navigation & Today's Summary */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* View Level Quick Tabs Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  Temporal Roadmap Views
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seamlessly drill down from Monthly strategy to 180° Sun Clock daily execution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Day View Button */}
              <button
                onClick={() => onNavigateLevel('day')}
                className={`p-4 rounded-2xl border text-left transition-all group ${
                  viewLevel === 'day'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Sun className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-100">Daily Sun Clock</div>
                <div className="text-[11px] text-slate-400 mt-0.5">180° arc & daylight</div>
              </button>

              {/* Week View Button */}
              <button
                onClick={() => onNavigateLevel('week')}
                className={`p-4 rounded-2xl border text-left transition-all group ${
                  viewLevel === 'week'
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-100">Weekly Anchors</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Mon/Thu dual cadence</div>
              </button>

              {/* Month View Button */}
              <button
                onClick={() => onNavigateLevel('month')}
                className={`p-4 rounded-2xl border text-left transition-all group ${
                  viewLevel === 'month'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Calendar className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-100">Monthly Goals</div>
                <div className="text-[11px] text-slate-400 mt-0.5">High-level milestones</div>
              </button>

              {/* Hour View Button */}
              <button
                onClick={() => onNavigateLevel('hour')}
                className={`p-4 rounded-2xl border text-left transition-all group ${
                  viewLevel === 'hour'
                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-200'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Clock className="w-5 h-5 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-xs text-slate-100">Hourly Drill-Down</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Energy & focus notes</div>
              </button>
            </div>
          </div>

          {/* Today's Activity & Timestamp Chronology */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Today's Journal & Timestamp Log ({dayData.date})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological record of water, meals, restroom events, and hourly activities.
                </p>
              </div>

              <button
                onClick={() => onOpenQuickLog()}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Log</span>
              </button>
            </div>

            {timelineEvents.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-3">
                  <Sun className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">No events logged today yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Start logging your water intake, meal timestamps, or focus activities to visualize your roadmap.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onOpenQuickLog('water')}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs"
                  >
                    💧 Log Water
                  </button>
                  <button
                    onClick={() => onOpenQuickLog('meal')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs"
                  >
                    🍱 Log Meal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {timelineEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-sm border shrink-0 ${evt.color}`}>
                        <span>{evt.icon}</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{evt.title}</div>
                        <div className="text-[11px] text-slate-400">{evt.desc}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-amber-400/90 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        {format12Hour(evt.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 4 Cols: Solar Trajectory Card & Account Card */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Astronomical Solar Status Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Astronomical Phase
              </span>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="text-[10px] text-slate-400 hover:text-amber-300 font-mono underline"
              >
                {location.city}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <div className="text-2xl mb-1">{currentSolarPosition.phaseIcon}</div>
              <h4 className="text-base font-black text-slate-100">{currentSolarPosition.phaseName}</h4>
              <p className="text-xs text-slate-300/90 mt-1">{currentSolarPosition.phaseDescription}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">🌅 Sunrise</span>
                <span className="font-mono font-bold text-slate-200">{formatDateTo12Hour(solarTimes.sunrise)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">☀️ Solar Noon</span>
                <span className="font-mono font-bold text-amber-300">{formatDateTo12Hour(solarTimes.solarNoon)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">🌇 Sunset</span>
                <span className="font-mono font-bold text-orange-400">{formatDateTo12Hour(solarTimes.sunset)}</span>
              </div>
            </div>
          </div>

          {/* User Account Details & Cloud Persistence Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Account & Sync Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Logged-in Identity</div>
                <div className="font-bold text-slate-200 truncate mt-0.5">{user?.email || 'Guest User'}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">UID: {user?.uid}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Cloud Persistence</div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 mt-0.5">
                  <CloudCheck className="w-3.5 h-3.5" />
                  <span>Firestore Cloud Real-Time</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Auto-saved upon any log update</div>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>Configure Profile & Goals</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Profile & Hydration Goals Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-100 mb-1">User Profile & Tracker Settings</h3>
            <p className="text-xs text-slate-400 mb-4">
              Update your account display name and custom daily hydration target.
            </p>

            {nameSaveMessage && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{nameSaveMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Daily Hydration Goal (ml)</label>
                <input
                  type="number"
                  step="100"
                  min="500"
                  max="10000"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-amber-500/10"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
