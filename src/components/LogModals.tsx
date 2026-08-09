import React, { useState } from 'react';
import { MealType, RestroomType, WaterLog, MealLog, RestroomLog, ActivityLog, ActivityCategory } from '../types';
import { Droplets, Utensils, X, Plus, Clock, Activity, Check } from 'lucide-react';

interface LogModalsProps {
  isOpen: boolean;
  initialType?: 'water' | 'meal' | 'restroom' | 'activity';
  dateStr: string;
  onClose: () => void;
  onAddWater: (log: WaterLog) => void;
  onAddMeal: (log: MealLog) => void;
  onAddRestroom: (log: RestroomLog) => void;
  onAddActivity: (log: ActivityLog) => void;
}

export const LogModals: React.FC<LogModalsProps> = ({
  isOpen,
  initialType = 'water',
  dateStr,
  onClose,
  onAddWater,
  onAddMeal,
  onAddRestroom,
  onAddActivity
}) => {
  const [activeTab, setActiveTab] = useState<'water' | 'meal' | 'restroom' | 'activity'>(initialType);

  // Get current time formatted HH:mm
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Water form state
  const [waterAmount, setWaterAmount] = useState<number>(300);
  const [waterTime, setWaterTime] = useState<string>(defaultTime);
  const [waterType, setWaterType] = useState<'water' | 'tea' | 'coffee' | 'electrolyte'>('water');

  // Meal form state
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [mealTitle, setMealTitle] = useState<string>('');
  const [mealTime, setMealTime] = useState<string>(defaultTime);
  const [mealNotes, setMealNotes] = useState<string>('');
  const [mealCalories, setMealCalories] = useState<number>(450);

  // Restroom form state
  const [restroomType, setRestroomType] = useState<RestroomType>('urination');
  const [restroomTime, setRestroomTime] = useState<string>(defaultTime);
  const [hydrationColor, setHydrationColor] = useState<number>(2);
  const [bristolScale, setBristolScale] = useState<number>(4);
  const [restroomNotes, setRestroomNotes] = useState<string>('');

  // Activity form state
  const [actTitle, setActTitle] = useState<string>('');
  const [actHour, setActHour] = useState<number>(now.getHours());
  const [actCategory, setActCategory] = useState<ActivityCategory>('work');
  const [actEnergy, setActEnergy] = useState<number>(4);

  if (!isOpen) return null;

  const handleSubmitWater = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWater({
      id: `w_${Date.now()}`,
      date: dateStr,
      time: waterTime,
      amountMl: Number(waterAmount),
      type: waterType
    });
    onClose();
  };

  const handleSubmitMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealTitle.trim()) return;
    onAddMeal({
      id: `m_${Date.now()}`,
      date: dateStr,
      time: mealTime,
      mealType,
      title: mealTitle.trim(),
      notes: mealNotes.trim(),
      calories: Number(mealCalories),
      healthRating: 5
    });
    onClose();
  };

  const handleSubmitRestroom = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRestroom({
      id: `r_${Date.now()}`,
      date: dateStr,
      time: restroomTime,
      type: restroomType,
      hydrationColor: restroomType === 'urination' ? hydrationColor : undefined,
      bristolScale: restroomType === 'bowel_movement' ? bristolScale : undefined,
      notes: restroomNotes.trim()
    });
    onClose();
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;
    onAddActivity({
      id: `a_${Date.now()}`,
      date: dateStr,
      hour: actHour,
      time: `${String(actHour).padStart(2, '0')}:00`,
      title: actTitle.trim(),
      category: actCategory,
      completed: true,
      energyLevel: actEnergy
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <span>Add Roadmap Entry</span>
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('water')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'water' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> Water
          </button>

          <button
            onClick={() => setActiveTab('meal')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'meal' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" /> Meal
          </button>

          <button
            onClick={() => setActiveTab('restroom')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'restroom' ? 'bg-purple-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🚽</span> Restroom
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'activity' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Task
          </button>
        </div>

        {/* TAB 1: WATER FORM */}
        {activeTab === 'water' && (
          <form onSubmit={handleSubmitWater} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Amount (ml)</label>
              <div className="flex gap-2 mb-2">
                {[250, 350, 500, 750].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setWaterAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg border font-extrabold ${
                      waterAmount === amt
                        ? 'bg-sky-500 text-slate-950 border-sky-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {amt}ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={waterAmount}
                onChange={(e) => setWaterAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Time</label>
              <input
                type="time"
                value={waterTime}
                onChange={(e) => setWaterTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Beverage Type</label>
              <select
                value={waterType}
                onChange={(e) => setWaterType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="water">Pure Water</option>
                <option value="tea">Herbal Tea</option>
                <option value="electrolyte">Electrolytes</option>
                <option value="coffee">Coffee</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all"
            >
              Log Water Intake
            </button>
          </form>
        )}

        {/* TAB 2: MEAL FORM */}
        {activeTab === 'meal' && (
          <form onSubmit={handleSubmitMeal} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Meal Title / Food Item</label>
              <input
                type="text"
                required
                value={mealTitle}
                onChange={(e) => setMealTitle(e.target.value)}
                placeholder="e.g. Grilled Chicken & Quinoa Salad"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Meal Category</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 capitalize"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Exact Time</label>
                <input
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Notes / Feeling</label>
              <input
                type="text"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                placeholder="e.g. High fiber, light feeling"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all"
            >
              Log Meal Timestamp
            </button>
          </form>
        )}

        {/* TAB 3: RESTROOM FORM */}
        {activeTab === 'restroom' && (
          <form onSubmit={handleSubmitRestroom} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRestroomType('urination')}
                  className={`flex-1 py-2 rounded-xl font-bold border ${
                    restroomType === 'urination'
                      ? 'bg-purple-500 text-slate-950 border-purple-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Urination
                </button>
                <button
                  type="button"
                  onClick={() => setRestroomType('bowel_movement')}
                  className={`flex-1 py-2 rounded-xl font-bold border ${
                    restroomType === 'bowel_movement'
                      ? 'bg-purple-500 text-slate-950 border-purple-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Bowel Movement
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Exact Time</label>
              <input
                type="time"
                value={restroomTime}
                onChange={(e) => setRestroomTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            {restroomType === 'urination' && (
              <div>
                <label className="block font-bold text-slate-300 mb-1">Hydration Clarity Color (1 - 5)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setHydrationColor(col)}
                      className={`flex-1 py-1.5 rounded-lg font-extrabold ${
                        hydrationColor === col
                          ? 'bg-purple-400 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {col} {col <= 2 ? '💧' : '⚠️'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {restroomType === 'bowel_movement' && (
              <div>
                <label className="block font-bold text-slate-300 mb-1">Bristol Stool Scale (Type 1 - 7)</label>
                <select
                  value={bristolScale}
                  onChange={(e) => setBristolScale(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value={1}>Type 1 - Separate hard lumps</option>
                  <option value={2}>Type 2 - Lumpy sausage</option>
                  <option value={3}>Type 3 - Sausage with cracks</option>
                  <option value={4}>Type 4 - Smooth & soft (Optimal)</option>
                  <option value={5}>Type 5 - Soft blobs with clear edges</option>
                  <option value={6}>Type 6 - Fluffy pieces</option>
                  <option value={7}>Type 7 - Entirely liquid</option>
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-300 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={restroomNotes}
                onChange={(e) => setRestroomNotes(e.target.value)}
                placeholder="e.g. Optimal hydration morning entry"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all"
            >
              Log Restroom Entry
            </button>
          </form>
        )}

        {/* TAB 4: ACTIVITY FORM */}
        {activeTab === 'activity' && (
          <form onSubmit={handleSubmitActivity} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Task / Activity Title</label>
              <input
                type="text"
                required
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="e.g. Midday Walk & Hydration Stretch"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Hour Slot (0-23)</label>
                <select
                  value={actHour}
                  onChange={(e) => setActHour(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i}:00 ({i >= 12 ? 'PM' : 'AM'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={actCategory}
                  onChange={(e) => setActCategory(e.target.value as ActivityCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 capitalize"
                >
                  <option value="work">Work Focus</option>
                  <option value="exercise">Exercise</option>
                  <option value="walk">Walk</option>
                  <option value="routine">Routine</option>
                  <option value="rest">Rest</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all"
            >
              Add Activity
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
