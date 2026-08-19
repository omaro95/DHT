import React from 'react';
import { ViewLevel } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Plus, RotateCcw, BarChart3, Sun, Layers, Clock, LogIn, LogOut, CloudCheck, Cloud, Smartphone, LayoutDashboard } from 'lucide-react';
import { formatDateKey } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  selectedDate: Date;
  viewLevel: ViewLevel;
  onNavigateLevel: (level: ViewLevel) => void;
  onChangeDate: (newDate: Date) => void;
  onOpenQuickLog: (type?: 'water' | 'meal' | 'restroom' | 'activity') => void;
  onOpenAnalytics: () => void;
  onOpenApkModal?: () => void;
  onResetData: () => void;
  onOpenAuthPage?: () => void;
  isSyncing?: boolean;
  cloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDate,
  viewLevel,
  onNavigateLevel,
  onChangeDate,
  onOpenQuickLog,
  onOpenAnalytics,
  onOpenApkModal,
  onResetData,
  onOpenAuthPage,
  isSyncing,
  cloudSynced
}) => {
  const { user, signInWithGoogle, signInAsGuest, logout } = useAuth();

  // Navigation helpers
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (viewLevel === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewLevel === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (viewLevel === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 1);
    }
    onChangeDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (viewLevel === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewLevel === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (viewLevel === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 1);
    }
    onChangeDate(d);
  };

  const handleToday = () => {
    onChangeDate(new Date());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      onChangeDate(new Date(y, m - 1, d));
    }
  };

  return (
    <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                TEMPORAL <span className="text-amber-400 text-xs font-semibold tracking-normal lowercase bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">Roadmap & Sun Tracker</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Cascade from Monthly goals to 180° Sun Clock daily logs
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onOpenQuickLog()}
              className="bg-amber-500 text-slate-950 font-bold p-2 rounded-lg flex items-center justify-center"
              aria-label="Quick Add Log"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Level Tabs (Dashboard -> Month -> Week -> Day -> Hour) */}
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => onNavigateLevel('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewLevel === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigateLevel('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewLevel === 'month'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Month</span>
          </button>

          <button
            onClick={() => onNavigateLevel('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewLevel === 'week'
                ? 'bg-sky-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Week</span>
          </button>

          <button
            onClick={() => onNavigateLevel('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewLevel === 'day'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Day</span>
          </button>

          <button
            onClick={() => onNavigateLevel('hour')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewLevel === 'hour'
                ? 'bg-violet-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hour</span>
          </button>
        </div>

        {/* Temporal Date Controls & Auth Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Date Picker Group */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
              aria-label="Previous Period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-slate-300 font-semibold hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-all"
            >
              Today
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
              aria-label="Next Period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={formatDateKey(selectedDate)}
              onChange={handleDateInputChange}
              className="bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
            />
          </div>

          {/* Mobile APK / App Download Modal Button */}
          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              className="bg-slate-900 border border-slate-700/80 hover:border-sky-500/50 text-sky-400 font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="Download Android APK or Install App"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">APK & App</span>
            </button>
          )}

          {/* Pattern Analytics Button */}
          <button
            onClick={onOpenAnalytics}
            className="bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {/* Quick Log Button */}
          <button
            onClick={() => onOpenQuickLog()}
            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Entry</span>
          </button>

          {/* Firebase Authentication & Cloud Sync Section */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-2 ml-1">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-900 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-slate-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                      {(user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left hidden lg:flex">
                    <span className="text-[11px] font-medium leading-none max-w-[100px] truncate">{user.displayName || user.email}</span>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                      {isSyncing ? 'Syncing...' : cloudSynced ? <><CloudCheck className="w-2.5 h-2.5" /> Cloud Active</> : 'Cloud Sync'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl border border-slate-800 transition-all flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAuthPage || signInWithGoogle}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Sign Up</span>
                </button>
                <button
                  onClick={signInAsGuest}
                  title="Sign in as Guest"
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-medium px-2.5 py-2 rounded-xl text-xs transition-all"
                >
                  Guest
                </button>
              </div>
            )}
          </div>

          {/* Demo Reset */}
          <button
            onClick={onResetData}
            title="Reset to Demo Data"
            className="p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
