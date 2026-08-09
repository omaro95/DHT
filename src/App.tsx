import React, { useState } from 'react';
import { ViewLevel, DayData, WaterLog, MealLog, RestroomLog, ActivityLog } from './types';
import { resetToDemoData, getDayData } from './utils/storage';
import { isAnchorDay, formatDateKey } from './utils/dateUtils';
import { Navbar } from './components/Navbar';
import { Breadcrumb } from './components/Breadcrumb';
import { MonthlyView } from './components/MonthlyView';
import { WeeklyView } from './components/WeeklyView';
import { DailyView } from './components/DailyView';
import { HourlyView } from './components/HourlyView';
import { PatternAnalytics } from './components/PatternAnalytics';
import { LogModals } from './components/LogModals';
import { AuthErrorModal } from './components/AuthErrorModal';
import { ApkExportModal } from './components/ApkExportModal';
import { useAuth } from './context/AuthContext';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { CloudCheck, ShieldCheck } from 'lucide-react';

export default function App() {
  const { user } = useAuth();
  const { allData, saveDayData, setAllData, isSyncing, cloudSynced } = useFirebaseSync(user);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [viewLevel, setViewLevel] = useState<ViewLevel>('day');

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [quickLogType, setQuickLogType] = useState<'water' | 'meal' | 'restroom' | 'activity'>('water');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);

  const selectedDateStr = formatDateKey(selectedDate);
  const currentDayData = allData[selectedDateStr] || getDayData(selectedDateStr);
  const isAnchorType = isAnchorDay(selectedDate);

  // Updates day data in local state, localStorage, and Firestore if authenticated
  const handleUpdateCurrentDay = (updated: DayData) => {
    saveDayData(updated.date, updated);
  };

  // Level drill-down helpers
  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
    setViewLevel('day');
  };

  const handleSelectWeek = (date: Date) => {
    setSelectedDate(date);
    setViewLevel('week');
  };

  const handleSelectHour = (hour: number) => {
    setSelectedHour(hour);
    setViewLevel('hour');
  };

  const handleOpenQuickLog = (type: 'water' | 'meal' | 'restroom' | 'activity' = 'water') => {
    setQuickLogType(type);
    setIsLogModalOpen(true);
  };

  const handleReset = () => {
    if (window.confirm('Reset all roadmap logs to default demo data?')) {
      const seed = resetToDemoData();
      setAllData(seed);
    }
  };

  // Modal Log Handlers
  const handleAddWater = (wLog: WaterLog) => {
    const updated: DayData = {
      ...currentDayData,
      waterLogs: [...currentDayData.waterLogs, wLog]
    };
    handleUpdateCurrentDay(updated);
  };

  const handleAddMeal = (mLog: MealLog) => {
    const updated: DayData = {
      ...currentDayData,
      mealLogs: [...currentDayData.mealLogs, mLog]
    };
    handleUpdateCurrentDay(updated);
  };

  const handleAddRestroom = (rLog: RestroomLog) => {
    const updated: DayData = {
      ...currentDayData,
      restroomLogs: [...currentDayData.restroomLogs, rLog]
    };
    handleUpdateCurrentDay(updated);
  };

  const handleAddActivity = (aLog: ActivityLog) => {
    const updated: DayData = {
      ...currentDayData,
      activityLogs: [...currentDayData.activityLogs, aLog]
    };
    handleUpdateCurrentDay(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      {/* Top Navbar Header */}
      <Navbar
        selectedDate={selectedDate}
        viewLevel={viewLevel}
        onNavigateLevel={setViewLevel}
        onChangeDate={setSelectedDate}
        onOpenQuickLog={handleOpenQuickLog}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onResetData={handleReset}
        isSyncing={isSyncing}
        cloudSynced={cloudSynced}
      />

      {/* Cloud Sync Status Banner */}
      {user && (
        <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-1.5 text-xs text-emerald-300 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CloudCheck className="w-4 h-4 text-emerald-400" />
              <span>Firebase Firestore Sync active for <strong>{user.email}</strong></span>
            </span>
            <span className="text-[11px] text-emerald-400/80 hidden sm:inline flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure User Storage
            </span>
          </div>
        </div>
      )}

      {/* Cascading Breadcrumb Navigation */}
      <Breadcrumb
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        viewLevel={viewLevel}
        onNavigateLevel={setViewLevel}
        isAnchorDayType={isAnchorType}
      />

      {/* Main Roadmap Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {viewLevel === 'month' && (
          <MonthlyView
            selectedDate={selectedDate}
            allData={allData}
            onSelectDay={handleSelectDay}
            onSelectWeek={handleSelectWeek}
          />
        )}

        {viewLevel === 'week' && (
          <WeeklyView
            selectedDate={selectedDate}
            allData={allData}
            onSelectDay={handleSelectDay}
            onUpdateDayData={(dKey, updated) => {
              saveDayData(dKey, updated);
            }}
          />
        )}

        {viewLevel === 'day' && (
          <DailyView
            dayData={currentDayData}
            selectedHour={selectedHour}
            onSelectHour={handleSelectHour}
            onOpenQuickLog={handleOpenQuickLog}
            onUpdateDayData={handleUpdateCurrentDay}
          />
        )}

        {viewLevel === 'hour' && (
          <HourlyView
            dayData={currentDayData}
            hour={selectedHour}
            onBackToDay={() => setViewLevel('day')}
            onUpdateDayData={handleUpdateCurrentDay}
            onOpenQuickLog={handleOpenQuickLog}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TEMPORAL Roadmap & Personal Tracker • Firebase Cloud Sync Enabled</span>
          <span className="text-slate-600">Mondays & Thursdays Core Anchor Highlights</span>
        </div>
      </footer>

      {/* Quick Add Log Dialog Modal */}
      <LogModals
        isOpen={isLogModalOpen}
        initialType={quickLogType}
        dateStr={selectedDateStr}
        onClose={() => setIsLogModalOpen(false)}
        onAddWater={handleAddWater}
        onAddMeal={handleAddMeal}
        onAddRestroom={handleAddRestroom}
        onAddActivity={handleAddActivity}
      />

      {/* Pattern Analytics Modal */}
      {isAnalyticsOpen && (
        <PatternAnalytics
          allData={allData}
          onClose={() => setIsAnalyticsOpen(false)}
        />
      )}

      {/* Auth Error Guidance Modal */}
      <AuthErrorModal />

      {/* APK & Mobile Export Modal */}
      <ApkExportModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
