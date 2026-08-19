/**
 * NOAA Solar Calculation Algorithm
 * Calculates accurate solar position, phases (Sunrise, Solar Noon, Sunset, Twilight),
 * sun elevation and azimuth based on time, date, and geographic coordinates.
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  source?: 'gps' | 'preset' | 'custom' | 'default';
}

export type SunPhaseType = 
  | 'night'
  | 'astronomical_dawn'
  | 'nautical_dawn'
  | 'civil_dawn'
  | 'sunrise'
  | 'morning_golden_hour'
  | 'daylight'
  | 'solar_noon'
  | 'afternoon_daylight'
  | 'evening_golden_hour'
  | 'sunset'
  | 'civil_dusk'
  | 'nautical_dusk'
  | 'astronomical_dusk';

export interface SolarTimes {
  astronomicalDawn: Date | null;
  nauticalDawn: Date | null;
  civilDawn: Date | null;
  sunrise: Date | null;
  goldenHourMorningEnd: Date | null;
  solarNoon: Date | null;
  goldenHourEveningStart: Date | null;
  sunset: Date | null;
  civilDusk: Date | null;
  nauticalDusk: Date | null;
  astronomicalDusk: Date | null;
  daylightDurationMinutes: number;
  maxSolarElevation: number; // Elevation at Solar Noon in degrees
}

export interface SolarPosition {
  elevation: number; // Altitude above horizon in degrees (-90 to +90)
  azimuth: number; // 0=North, 90=East, 180=South, 270=West
  declination: number;
  equationOfTime: number;
  phase: SunPhaseType;
  phaseName: string;
  phaseCategory: 'Sunrise' | 'Solar Noon' | 'Sunset' | 'Twilight' | 'Daylight' | 'Night';
  phaseDescription: string;
  phaseIcon: string;
  isDaylight: boolean;
  sunClockAngleDeg: number; // 0° (Dawn/Sunrise) -> 90° (Solar Noon) -> 180° (Sunset/Dusk)
  fractionalProgress: number; // 0 to 1 across active daylight/sun cycle
  nextPhaseTime: { name: string; time: Date } | null;
}

// Helpers
const deg2rad = (deg: number) => (deg * Math.PI) / 180.0;
const rad2deg = (rad: number) => (rad * 180.0) / Math.PI;

function getJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function getJulianCentury(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/**
 * Calculates Solar Parameters for a Julian Century T
 */
function calculateSolarParameters(T: number) {
  const L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  const C =
    Math.sin(deg2rad(M)) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(deg2rad(2 * M)) * (0.019993 - 0.000101 * T) +
    Math.sin(deg2rad(3 * M)) * 0.000289;

  const sunTrueLong = L0 + C;
  const sunAppLong =
    sunTrueLong - 0.00569 - 0.00478 * Math.sin(deg2rad(125.04 - 1934.136 * T));

  const meanObliqEcliptic =
    23 +
    (26 +
      (21.448 -
        T * (46.815 + T * (0.00059 - T * 0.001813)))) /
      60 /
      60;
  const obliqCorr =
    meanObliqEcliptic + 0.00256 * Math.cos(deg2rad(125.04 - 1934.136 * T));

  const declination = rad2deg(
    Math.asin(Math.sin(deg2rad(obliqCorr)) * Math.sin(deg2rad(sunAppLong)))
  );

  const y = Math.tan(deg2rad(obliqCorr / 2)) * Math.tan(deg2rad(obliqCorr / 2));
  const EoT =
    4 *
    rad2deg(
      y * Math.sin(2 * deg2rad(L0)) -
        2 * e * Math.sin(deg2rad(M)) +
        4 * e * y * Math.sin(deg2rad(M)) * Math.cos(2 * deg2rad(L0)) -
        0.5 * y * y * Math.sin(4 * deg2rad(L0)) -
        1.25 * e * e * Math.sin(2 * deg2rad(M))
    );

  return { declination, EoT };
}

/**
 * Calculates Solar Times for a date and location
 */
export function calculateSolarTimes(
  date: Date,
  lat: number,
  lng: number
): SolarTimes {
  // Midnight UTC of target date
  const startOfDay = new Date(date);
  startOfDay.setHours(12, 0, 0, 0); // Use noon as baseline for day calculation
  const jd = getJulianDay(startOfDay);
  const T = getJulianCentury(jd);

  const { declination, EoT } = calculateSolarParameters(T);

  // Solar Noon in minutes from midnight UTC
  const solarNoonUTCMinutes = 720 - 4 * lng - EoT;

  const getEventTime = (zenithAngle: number, isMorning: boolean): Date | null => {
    const latRad = deg2rad(lat);
    const decRad = deg2rad(declination);
    const cosHA =
      (Math.cos(deg2rad(zenithAngle)) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));

    if (cosHA > 1 || cosHA < -1) {
      // Polar day or polar night
      return null;
    }

    const haDeg = rad2deg(Math.acos(cosHA));
    const eventMinutesUTC = isMorning
      ? solarNoonUTCMinutes - haDeg * 4
      : solarNoonUTCMinutes + haDeg * 4;

    const baseUTC = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    );
    return new Date(baseUTC.getTime() + eventMinutesUTC * 60 * 1000);
  };

  const sunrise = getEventTime(90.833, true); // 90°50' accounting for atmospheric refraction
  const sunset = getEventTime(90.833, false);

  const civilDawn = getEventTime(96.0, true); // -6°
  const civilDusk = getEventTime(96.0, false);

  const nauticalDawn = getEventTime(102.0, true); // -12°
  const nauticalDusk = getEventTime(102.0, false);

  const astronomicalDawn = getEventTime(108.0, true); // -18°
  const astronomicalDusk = getEventTime(108.0, false);

  const goldenHourMorningEnd = getEventTime(84.0, true); // +6° elevation
  const goldenHourEveningStart = getEventTime(84.0, false);

  const baseUTC = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  );
  const solarNoon = new Date(baseUTC.getTime() + solarNoonUTCMinutes * 60 * 1000);

  // Maximum solar elevation at solar noon: 90° - |lat - declination|
  const maxSolarElevation = 90 - Math.abs(lat - declination);

  const daylightDurationMinutes =
    sunrise && sunset
      ? (sunset.getTime() - sunrise.getTime()) / (60 * 1000)
      : 0;

  return {
    astronomicalDawn,
    nauticalDawn,
    civilDawn,
    sunrise,
    goldenHourMorningEnd,
    solarNoon,
    goldenHourEveningStart,
    sunset,
    civilDusk,
    nauticalDusk,
    astronomicalDusk,
    daylightDurationMinutes,
    maxSolarElevation,
  };
}

/**
 * Calculates current instantaneous sun position (elevation, azimuth, current phase)
 */
export function calculateSolarPosition(
  date: Date,
  lat: number,
  lng: number,
  solarTimes?: SolarTimes
): SolarPosition {
  const times = solarTimes || calculateSolarTimes(date, lat, lng);
  const jd = getJulianDay(date);
  const T = getJulianCentury(jd);
  const { declination, EoT } = calculateSolarParameters(T);

  // Fractional time in minutes from UTC midnight
  const utcHours = date.getUTCHours();
  const utcMins = date.getUTCMinutes();
  const utcSecs = date.getUTCSeconds();
  const timeMinutesUTC = utcHours * 60 + utcMins + utcSecs / 60;

  // True Solar Time
  const trueSolarTime = (timeMinutesUTC + 4 * lng + EoT + 1440) % 1440;
  let hourAngle = trueSolarTime / 4 - 180;
  if (hourAngle < -180) hourAngle += 360;

  // Solar Zenith & Elevation
  const latRad = deg2rad(lat);
  const decRad = deg2rad(declination);
  const haRad = deg2rad(hourAngle);

  const cosZenith =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);

  const zenithDeg = rad2deg(Math.acos(Math.max(-1, Math.min(1, cosZenith))));
  const elevation = 90 - zenithDeg;

  // Solar Azimuth Angle (clockwise from North: 0°=North, 90°=East, 180°=South, 270°=West)
  const sinAzimuth = (-Math.sin(haRad) * Math.cos(decRad)) / Math.sin(deg2rad(zenithDeg));
  const cosAzimuth =
    (Math.sin(decRad) - Math.sin(latRad) * Math.cos(deg2rad(zenithDeg))) /
    (Math.cos(latRad) * Math.sin(deg2rad(zenithDeg)));

  let azimuth = rad2deg(Math.atan2(sinAzimuth, cosAzimuth));
  if (azimuth < 0) azimuth += 360;

  // Determine current phase
  const currentTime = date.getTime();
  const isBeforeNoon = times.solarNoon ? currentTime < times.solarNoon.getTime() : hourAngle < 0;

  let phase: SunPhaseType = 'daylight';
  let phaseName = 'Daylight';
  let phaseCategory: SolarPosition['phaseCategory'] = 'Daylight';
  let phaseDescription = 'The sun is illuminating the sky.';
  let phaseIcon = '☀️';
  let isDaylight = elevation >= -0.833;

  if (elevation < -18) {
    phase = 'night';
    phaseName = 'Night';
    phaseCategory = 'Night';
    phaseDescription = 'Astronomical darkness. Stars and galaxies are fully visible.';
    phaseIcon = '🌙';
    isDaylight = false;
  } else if (elevation >= -18 && elevation < -12) {
    phase = isBeforeNoon ? 'astronomical_dawn' : 'astronomical_dusk';
    phaseName = isBeforeNoon ? 'Astronomical Dawn' : 'Astronomical Dusk';
    phaseCategory = 'Twilight';
    phaseDescription = isBeforeNoon
      ? 'Faint morning glow in the upper atmosphere.'
      : 'Evening twilight fading into deep night sky.';
    phaseIcon = '🌌';
    isDaylight = false;
  } else if (elevation >= -12 && elevation < -6) {
    phase = isBeforeNoon ? 'nautical_dawn' : 'nautical_dusk';
    phaseName = isBeforeNoon ? 'Nautical Dawn' : 'Nautical Dusk';
    phaseCategory = 'Twilight';
    phaseDescription = isBeforeNoon
      ? 'Sea horizon becomes distinguishable; early twilight.'
      : 'First stars appear; horizon begins to fade.';
    phaseIcon = '⛵';
    isDaylight = false;
  } else if (elevation >= -6 && elevation < -0.833) {
    phase = isBeforeNoon ? 'civil_dawn' : 'civil_dusk';
    phaseName = isBeforeNoon ? 'Civil Dawn (Twilight)' : 'Civil Dusk (Twilight)';
    phaseCategory = 'Twilight';
    phaseDescription = isBeforeNoon
      ? 'Sky is bright enough for outdoor activities before sunrise.'
      : 'Post-sunset twilight glow with warm ambient sky colors.';
    phaseIcon = '✨';
    isDaylight = false;
  } else if (elevation >= -0.833 && elevation < 2.0) {
    if (isBeforeNoon) {
      phase = 'sunrise';
      phaseName = 'Sunrise';
      phaseCategory = 'Sunrise';
      phaseDescription = 'Solar disc breaches the horizon with intense warm light.';
      phaseIcon = '🌅';
    } else {
      phase = 'sunset';
      phaseName = 'Sunset';
      phaseCategory = 'Sunset';
      phaseDescription = 'Solar disc descends below the horizon line.';
      phaseIcon = '🌇';
    }
  } else if (elevation >= 2.0 && elevation < 6.0) {
    if (isBeforeNoon) {
      phase = 'morning_golden_hour';
      phaseName = 'Morning Golden Hour';
      phaseCategory = 'Daylight';
      phaseDescription = 'Soft, warm directional sunlight ideal for circadian alignment.';
      phaseIcon = '🌤️';
    } else {
      phase = 'evening_golden_hour';
      phaseName = 'Evening Golden Hour';
      phaseCategory = 'Sunset';
      phaseDescription = 'Warm golden hues and elongated shadows before dusk.';
      phaseIcon = '🌆';
    }
  } else {
    // Elevation >= 6.0
    // Check if within 20 mins of Solar Noon
    const isSolarNoonWindow = times.solarNoon
      ? Math.abs(currentTime - times.solarNoon.getTime()) < 20 * 60 * 1000
      : Math.abs(hourAngle) < 5;

    if (isSolarNoonWindow) {
      phase = 'solar_noon';
      phaseName = 'Solar Noon (Zenith)';
      phaseCategory = 'Solar Noon';
      phaseDescription = 'Sun achieves its highest point and maximum UV intensity today.';
      phaseIcon = '☀️';
    } else if (isBeforeNoon) {
      phase = 'daylight';
      phaseName = 'Morning Daylight';
      phaseCategory = 'Daylight';
      phaseDescription = 'Rising solar elevation energizing daytime alertness.';
      phaseIcon = '☀️';
    } else {
      phase = 'afternoon_daylight';
      phaseName = 'Afternoon Daylight';
      phaseCategory = 'Daylight';
      phaseDescription = 'Descending solar arc transitioning towards evening.';
      phaseIcon = '☀️';
    }
  }

  // Calculate 180° clock angle (0° at Sunrise/Dawn to 180° at Sunset/Dusk)
  // If we have calculated sunrise and sunset times for this day:
  let sunClockAngleDeg = 90;
  let fractionalProgress = 0.5;

  if (times.sunrise && times.sunset) {
    const sunriseMs = times.sunrise.getTime();
    const sunsetMs = times.sunset.getTime();
    const spanMs = sunsetMs - sunriseMs;

    if (spanMs > 0) {
      const prog = (currentTime - sunriseMs) / spanMs;
      fractionalProgress = Math.max(0, Math.min(1, prog));
      sunClockAngleDeg = fractionalProgress * 180;
    }
  } else {
    // Fallback: 7:00 AM to 7:00 PM
    const localHours = date.getHours() + date.getMinutes() / 60;
    const prog = (localHours - 7) / 12;
    fractionalProgress = Math.max(0, Math.min(1, prog));
    sunClockAngleDeg = fractionalProgress * 180;
  }

  // Next Upcoming Phase Finder
  const upcomingCandidates: { name: string; time: Date | null }[] = [
    { name: 'Astronomical Dawn', time: times.astronomicalDawn },
    { name: 'Nautical Dawn', time: times.nauticalDawn },
    { name: 'Civil Dawn', time: times.civilDawn },
    { name: 'Sunrise', time: times.sunrise },
    { name: 'Solar Noon', time: times.solarNoon },
    { name: 'Golden Hour (Evening)', time: times.goldenHourEveningStart },
    { name: 'Sunset', time: times.sunset },
    { name: 'Civil Dusk', time: times.civilDusk },
    { name: 'Nautical Dusk', time: times.nauticalDusk },
    { name: 'Astronomical Dusk', time: times.astronomicalDusk },
  ];

  const nextPhase = upcomingCandidates
    .filter((c) => c.time !== null && c.time.getTime() > currentTime)
    .sort((a, b) => (a.time!.getTime() - b.time!.getTime()))[0] || null;

  return {
    elevation: Math.round(elevation * 10) / 10,
    azimuth: Math.round(azimuth * 10) / 10,
    declination: Math.round(declination * 100) / 100,
    equationOfTime: Math.round(EoT * 10) / 10,
    phase,
    phaseName,
    phaseCategory,
    phaseDescription,
    phaseIcon,
    isDaylight,
    sunClockAngleDeg: Math.round(sunClockAngleDeg * 10) / 10,
    fractionalProgress: Math.round(fractionalProgress * 1000) / 1000,
    nextPhaseTime: nextPhase && nextPhase.time ? { name: nextPhase.name, time: nextPhase.time } : null,
  };
}

/**
 * Standard preset cities for easy testing and location switching
 */
export const PRESET_CITIES: LocationCoordinates[] = [
  { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, source: 'preset' },
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, source: 'preset' },
  { city: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194, source: 'preset' },
  { city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, source: 'preset' },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, source: 'preset' },
  { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, source: 'preset' },
  { city: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, source: 'preset' },
  { city: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426, source: 'preset' },
  { city: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, source: 'preset' },
];

/**
 * Default location fallback (based on system timezone estimate or San Francisco)
 */
export function getDefaultLocation(): LocationCoordinates {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Europe/London')) return PRESET_CITIES[0];
    if (tz.includes('New_York') || tz.includes('America/Detroit')) return PRESET_CITIES[1];
    if (tz.includes('Los_Angeles') || tz.includes('America/Tijuana')) return PRESET_CITIES[2];
    if (tz.includes('Tokyo') || tz.includes('Asia/Tokyo')) return PRESET_CITIES[3];
    if (tz.includes('Paris') || tz.includes('Europe/Paris')) return PRESET_CITIES[4];
    if (tz.includes('Sydney') || tz.includes('Australia/Sydney')) return PRESET_CITIES[5];
    if (tz.includes('Dubai') || tz.includes('Asia/Dubai')) return PRESET_CITIES[6];
  } catch {
    // fallback
  }
  return PRESET_CITIES[2]; // San Francisco default
}
