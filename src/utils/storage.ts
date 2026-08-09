import { DayData, WaterLog, MealLog, RestroomLog, ActivityLog, AnchorNote } from '../types';
import { formatDateKey } from './dateUtils';

const STORAGE_KEY = 'temporal_roadmap_data_v1';

// Seed realistic data for a given date
function createSeedDay(dateStr: string): DayData {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();

  const isMon = dayOfWeek === 1;
  const isThu = dayOfWeek === 4;

  let anchorNote: AnchorNote | undefined = undefined;
  if (isMon) {
    anchorNote = {
      date: dateStr,
      type: 'monday',
      focusGoal: '🚀 Monday Anchor: Set Weekly Intentions, Hydration Benchmark & Sprint Priorities',
      reflection: 'Strong start to the week. Clean morning routine completed.',
      status: 'completed'
    };
  } else if (isThu) {
    anchorNote = {
      date: dateStr,
      type: 'thursday',
      focusGoal: '⚡ Thursday Anchor: Mid-Week Momentum Audit & Meal Timing Alignment',
      reflection: 'Energy levels holding high. Hydration consistency hit 90%.',
      status: 'completed'
    };
  }

  const waterLogs: WaterLog[] = [
    { id: `w1_${dateStr}`, date: dateStr, time: '07:30', amountMl: 400, type: 'water' },
    { id: `w2_${dateStr}`, date: dateStr, time: '10:15', amountMl: 300, type: 'tea' },
    { id: `w3_${dateStr}`, date: dateStr, time: '12:45', amountMl: 500, type: 'water' },
    { id: `w4_${dateStr}`, date: dateStr, time: '15:30', amountMl: 350, type: 'electrolyte' },
    { id: `w5_${dateStr}`, date: dateStr, time: '18:15', amountMl: 450, type: 'water' },
    { id: `w6_${dateStr}`, date: dateStr, time: '20:30', amountMl: 250, type: 'water' }
  ];

  const mealLogs: MealLog[] = [
    {
      id: `m1_${dateStr}`,
      date: dateStr,
      time: '08:15',
      mealType: 'breakfast',
      title: 'Avocado Toast & Boiled Eggs',
      notes: 'High protein, clean fuel',
      calories: 420,
      healthRating: 5
    },
    {
      id: `m2_${dateStr}`,
      date: dateStr,
      time: '13:00',
      mealType: 'lunch',
      title: 'Mediterranean Salmon & Quinoa Bowl',
      notes: 'Rich in Omega-3 and fiber',
      calories: 650,
      healthRating: 5
    },
    {
      id: `m3_${dateStr}`,
      date: dateStr,
      time: '16:15',
      mealType: 'snack',
      title: 'Greek Yogurt with Blueberries & Walnuts',
      notes: 'Sustained afternoon focus',
      calories: 220,
      healthRating: 4
    },
    {
      id: `m4_${dateStr}`,
      date: dateStr,
      time: '19:00',
      mealType: 'dinner',
      title: 'Herb Roasted Chicken & Veggies',
      notes: 'Light dinner before sunset',
      calories: 580,
      healthRating: 5
    }
  ];

  const restroomLogs: RestroomLog[] = [
    { id: `r1_${dateStr}`, date: dateStr, time: '07:10', type: 'urination', hydrationColor: 2, notes: 'Morning check - pale yellow' },
    { id: `r2_${dateStr}`, date: dateStr, time: '08:45', type: 'bowel_movement', bristolScale: 4, notes: 'Smooth, healthy digestion' },
    { id: `r3_${dateStr}`, date: dateStr, time: '11:30', type: 'urination', hydrationColor: 1, notes: 'Optimal clarity' },
    { id: `r4_${dateStr}`, date: dateStr, time: '14:45', type: 'urination', hydrationColor: 2, notes: 'Good hydration' },
    { id: `r5_${dateStr}`, date: dateStr, time: '18:00', type: 'urination', hydrationColor: 1, notes: 'Optimal clarity' },
    { id: `r6_${dateStr}`, date: dateStr, time: '21:15', type: 'urination', hydrationColor: 2 }
  ];

  const activityLogs: ActivityLog[] = [
    { id: `a7_${dateStr}`, date: dateStr, hour: 7, time: '07:00', title: 'Morning Light & Hydration', category: 'routine', completed: true, energyLevel: 4 },
    { id: `a8_${dateStr}`, date: dateStr, hour: 8, time: '08:00', title: 'Breakfast & Planning', category: 'routine', completed: true, energyLevel: 4 },
    { id: `a9_${dateStr}`, date: dateStr, hour: 9, time: '09:00', title: 'Deep Work: Core Roadmap Tasks', category: 'work', completed: true, energyLevel: 5 },
    { id: `a10_${dateStr}`, date: dateStr, hour: 10, time: '10:00', title: 'Team Sync & Strategy Review', category: 'work', completed: true, energyLevel: 4 },
    { id: `a11_${dateStr}`, date: dateStr, hour: 11, time: '11:00', title: 'Deep Work: Architecture & Specs', category: 'work', completed: true, energyLevel: 5 },
    { id: `a12_${dateStr}`, date: dateStr, hour: 12, time: '12:00', title: 'Midday Walk & Mindful Movement', category: 'walk', completed: true, energyLevel: 4 },
    { id: `a13_${dateStr}`, date: dateStr, hour: 13, time: '13:00', title: 'Nutritious Lunch & Rest', category: 'rest', completed: true, energyLevel: 4 },
    { id: `a14_${dateStr}`, date: dateStr, hour: 14, time: '14:00', title: 'Focus Sprint: Design Systems', category: 'work', completed: true, energyLevel: 4 },
    { id: `a15_${dateStr}`, date: dateStr, hour: 15, time: '15:00', title: 'Hydration Break & Stretch', category: 'exercise', completed: true, energyLevel: 3 },
    { id: `a16_${dateStr}`, date: dateStr, hour: 16, time: '16:00', title: 'Code Review & Documentation', category: 'work', completed: true, energyLevel: 4 },
    { id: `a17_${dateStr}`, date: dateStr, hour: 17, time: '17:00', title: 'Evening Workout / Run', category: 'exercise', completed: true, energyLevel: 5 },
    { id: `a18_${dateStr}`, date: dateStr, hour: 18, time: '18:00', title: 'Wind Down & Evening Hydration', category: 'routine', completed: true, energyLevel: 4 },
    { id: `a19_${dateStr}`, date: dateStr, hour: 19, time: '19:00', title: 'Sunset Dinner & Family Time', category: 'social', completed: true, energyLevel: 4 }
  ];

  return {
    date: dateStr,
    waterLogs,
    mealLogs,
    restroomLogs,
    activityLogs,
    anchorNote,
    dayNotes: isMon ? 'Monday Anchor Day: Focused sprint launch.' : isThu ? 'Thursday Anchor Day: Mid-week alignment check.' : 'Balanced routine day.'
  };
}

export function generateSeedDatabase(): Record<string, DayData> {
  const db: Record<string, DayData> = {};
  const today = new Date();
  
  // Seed 30 days around today
  for (let i = -15; i <= 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = formatDateKey(d);
    db[dateStr] = createSeedDay(dateStr);
  }

  return db;
}

export function loadAllData(): Record<string, DayData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored roadmap data', e);
  }

  const seed = generateSeedDatabase();
  saveAllData(seed);
  return seed;
}

export function saveAllData(data: Record<string, DayData>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save roadmap data to localStorage', e);
  }
}

export function getDayData(dateStr: string): DayData {
  const all = loadAllData();
  if (all[dateStr]) {
    return all[dateStr];
  }
  // Create default day if not present
  const newDay = createSeedDay(dateStr);
  all[dateStr] = newDay;
  saveAllData(all);
  return newDay;
}

export function updateDayData(dateStr: string, updated: DayData): void {
  const all = loadAllData();
  all[dateStr] = updated;
  saveAllData(all);
}

export function resetToDemoData(): Record<string, DayData> {
  const seed = generateSeedDatabase();
  saveAllData(seed);
  return seed;
}
