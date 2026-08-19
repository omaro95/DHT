export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isMonday(date: Date): boolean {
  return date.getDay() === 1;
}

export function isThursday(date: Date): boolean {
  return date.getDay() === 4;
}

export function isAnchorDay(date: Date): 'monday' | 'thursday' | null {
  const day = date.getDay();
  if (day === 1) return 'monday';
  if (day === 4) return 'thursday';
  return null;
}

export function getWeekRange(date: Date): { start: Date; end: Date; days: Date[] } {
  const curr = new Date(date);
  const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon...
  // Calculate distance to Monday
  const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distanceToMon);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  const sunday = days[6];
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday, days };
}

export function getMonthDays(date: Date): { days: Date[]; weeks: Date[][] } {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Date[] = [];
  const totalDays = lastDay.getDate();

  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  // Group into weeks starting from Monday
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Pad first week if 1st of month isn't Monday
  const startDayOfWeek = firstDay.getDay();
  const leadingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  for (let i = leadingDays; i > 0; i--) {
    const prevDate = new Date(year, month, 1 - i);
    currentWeek.push(prevDate);
  }

  days.forEach((d) => {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    // Pad end of last week
    const remaining = 7 - currentWeek.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      currentWeek.push(nextDate);
    }
    weeks.push(currentWeek);
  }

  return { days, weeks };
}

export function format12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // hour 0 is 12
  return `${h}:${m} ${ampm}`;
}

export function formatDateTo12Hour(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '--:--';
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export function timeToFractionalHours(timeStr: string): number {
  if (!timeStr) return 0;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return h + m / 60;
}

/**
 * Calculates Sun Clock angle (in degrees) for a time between 7:00 (7.0) and 19:00 (19.0)
 * 7:00 AM -> 0° (Left)
 * 1:00 PM -> 90° (Top zenith)
 * 7:00 PM -> 180° (Right)
 */
export function timeToSunAngle(timeStr: string): number | null {
  const fHours = timeToFractionalHours(timeStr);
  // Daylight span: 7:00 AM (7) to 7:00 PM (19)
  if (fHours < 7 || fHours > 19) return null;
  const fraction = (fHours - 7) / 12; // 0 to 1
  return fraction * 180;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const SHORT_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
