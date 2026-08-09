export type ViewLevel = 'month' | 'week' | 'day' | 'hour';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type RestroomType = 'urination' | 'bowel_movement';

export type ActivityCategory = 'work' | 'exercise' | 'rest' | 'walk' | 'learning' | 'routine' | 'social';

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  amountMl: number;
  type?: 'water' | 'tea' | 'coffee' | 'electrolyte';
}

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: MealType;
  title: string;
  notes?: string;
  calories?: number;
  healthRating?: number; // 1 to 5
}

export interface RestroomLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: RestroomType;
  hydrationColor?: number; // 1 (pale/optimal) to 5 (dark/dehydrated)
  bristolScale?: number; // 1 to 7 for bowel movements
  notes?: string;
}

export interface ActivityLog {
  id: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0 to 23
  time: string; // HH:mm
  title: string;
  category: ActivityCategory;
  completed: boolean;
  energyLevel?: number; // 1 to 5
  notes?: string;
}

export interface AnchorNote {
  date: string;
  type: 'monday' | 'thursday';
  focusGoal: string;
  reflection?: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface DayData {
  date: string; // YYYY-MM-DD
  waterLogs: WaterLog[];
  mealLogs: MealLog[];
  restroomLogs: RestroomLog[];
  activityLogs: ActivityLog[];
  anchorNote?: AnchorNote;
  dayNotes?: string;
}

export interface DateContextState {
  selectedDate: Date; // standard JS date
  selectedHour: number; // 0 to 23
  viewLevel: ViewLevel;
}
