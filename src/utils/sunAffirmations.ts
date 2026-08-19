import { SunPhaseType, SolarPosition } from './solarCalculator';

export interface SunAffirmation {
  id: string;
  quote: string;
  theme: string;
  sourceOrGuidance: string;
  accentColor: string;
  badge: string;
}

export const SUN_PHASE_AFFIRMATIONS: Record<string, SunAffirmation[]> = {
  sunrise: [
    {
      id: 'sr-1',
      quote: 'With every sunrise comes a fresh horizon. Let your intentions rise with the morning light.',
      theme: 'Renewal & Awakening',
      sourceOrGuidance: 'Breathe deeply, absorb the early rays, and set one meaningful priority for today.',
      accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
      badge: 'Sunrise Ascent',
    },
    {
      id: 'sr-2',
      quote: 'The dawn breaks unconditionally. You possess unlimited potential to begin anew today.',
      theme: 'Fresh Beginning',
      sourceOrGuidance: 'Hydrate early and welcome the calm quiet of the morning.',
      accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
      badge: 'Dawn Awakening',
    },
    {
      id: 'sr-3',
      quote: 'Light returns to the earth gently and purposefully. Approach your day with matching grace.',
      theme: 'Patience & Poise',
      sourceOrGuidance: 'Take 3 steady breaths before engaging with screens or tasks.',
      accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
      badge: 'Morning Horizon',
    },
  ],
  morning_golden_hour: [
    {
      id: 'mgh-1',
      quote: 'Golden rays illuminate the path. Focus your energy where your heart finds highest purpose.',
      theme: 'Clarity & Vitality',
      sourceOrGuidance: 'Prime time for creative flow, strategic planning, or deep uninterrupted work.',
      accentColor: 'from-amber-400/20 to-yellow-500/10 border-amber-400/40 text-amber-200',
      badge: 'Golden Morning',
    },
    {
      id: 'mgh-2',
      quote: 'Your mind is clear and primed for momentum. Step forward with calm confidence.',
      theme: 'Momentum',
      sourceOrGuidance: 'Tackle your single most impactful task during this golden window.',
      accentColor: 'from-amber-400/20 to-yellow-500/10 border-amber-400/40 text-amber-200',
      badge: 'Golden Hour',
    },
  ],
  daylight: [
    {
      id: 'dl-1',
      quote: 'The sun shines with steady constancy. Channel focused energy into meaningful execution.',
      theme: 'Vigor & Presence',
      sourceOrGuidance: 'Maintain steady pacing, regular hydration, and clear boundaries.',
      accentColor: 'from-sky-500/20 to-amber-500/10 border-sky-500/40 text-sky-200',
      badge: 'Active Daylight',
    },
    {
      id: 'dl-2',
      quote: 'In full light, everything becomes actionable. Trust the process and take purposeful steps.',
      theme: 'Purposeful Action',
      sourceOrGuidance: 'Check in on your posture, drink water, and keep moving forward.',
      accentColor: 'from-sky-500/20 to-amber-500/10 border-sky-500/40 text-sky-200',
      badge: 'Full Daylight',
    },
  ],
  solar_noon: [
    {
      id: 'sn-1',
      quote: 'At the solar zenith, the light reaches peak elevation. Stand tall in your strength and accomplishments.',
      theme: 'Zenith & Mastery',
      sourceOrGuidance: 'Acknowledge your morning progress, refuel with nourishment, and recalibrate your focus.',
      accentColor: 'from-amber-400/25 to-orange-500/15 border-amber-400/60 text-amber-200',
      badge: 'Solar Noon Zenith',
    },
    {
      id: 'sn-2',
      quote: 'No shadows can overpower this meridian light. You are fully capable, resilient, and centered.',
      theme: 'Peak Strength',
      sourceOrGuidance: 'Step away for a nourishing meal and a mindful pause in natural light.',
      accentColor: 'from-amber-400/25 to-orange-500/15 border-amber-400/60 text-amber-200',
      badge: 'Meridian Peak',
    },
  ],
  afternoon_daylight: [
    {
      id: 'ad-1',
      quote: 'As the sun charts its descent, steady perseverance transforms effort into lasting triumph.',
      theme: 'Endurance & Completion',
      sourceOrGuidance: 'Protect your energy, close open loops, and stay hydrated through the afternoon.',
      accentColor: 'from-amber-500/15 to-indigo-500/10 border-amber-500/30 text-amber-200',
      badge: 'Afternoon Flow',
    },
    {
      id: 'ad-2',
      quote: 'Each hour holds quiet opportunity. Finish what you started with pride and diligence.',
      theme: 'Persistence',
      sourceOrGuidance: 'Take a brisk 5-minute stretch or walk to re-energize your mind.',
      accentColor: 'from-amber-500/15 to-indigo-500/10 border-amber-500/30 text-amber-200',
      badge: 'Afternoon Arc',
    },
  ],
  sunset: [
    {
      id: 'ss-1',
      quote: 'The day’s labors come to rest as the sky turns to fire and rose. Celebrate the progress you made.',
      theme: 'Gratitude & Reflection',
      sourceOrGuidance: 'Release unfinished worries. What you accomplished today is worthy and sufficient.',
      accentColor: 'from-orange-500/20 to-rose-500/15 border-orange-500/40 text-orange-200',
      badge: 'Sunset Glow',
    },
    {
      id: 'ss-2',
      quote: 'Sunset is proof that endings can be beautiful. Transition into stillness and peaceful reflection.',
      theme: 'Tranquility',
      sourceOrGuidance: 'Log your final thoughts for the day and let your mind unwind.',
      accentColor: 'from-orange-500/20 to-rose-500/15 border-orange-500/40 text-orange-200',
      badge: 'Golden Dusk',
    },
  ],
  twilight: [
    {
      id: 'tw-1',
      quote: 'Twilight invites calm surrender. Let the soft gradient skies soften any residual tension.',
      theme: 'Peace & Serenity',
      sourceOrGuidance: 'Dim overhead lights, step away from bright screens, and enjoy calm connection.',
      accentColor: 'from-indigo-500/20 to-purple-500/15 border-indigo-500/40 text-indigo-200',
      badge: 'Evening Twilight',
    },
    {
      id: 'tw-2',
      quote: 'Between day and night lies deep tranquility. Honor your body’s rhythm for rest.',
      theme: 'Restoration',
      sourceOrGuidance: 'Prepare your resting environment for deep restorative recovery.',
      accentColor: 'from-indigo-500/20 to-purple-500/15 border-indigo-500/40 text-indigo-200',
      badge: 'Dusk Stillness',
    },
  ],
  night: [
    {
      id: 'nt-1',
      quote: 'Beneath the calm night sky, your mind and body heal. Rest deeply and trust tomorrow’s return.',
      theme: 'Rest & Restoration',
      sourceOrGuidance: 'Disconnect fully, embrace quiet stillness, and let sleep restore your inner light.',
      accentColor: 'from-slate-800/80 to-indigo-950/50 border-slate-700/60 text-slate-300',
      badge: 'Night Constellation',
    },
    {
      id: 'nt-2',
      quote: 'Rest is not lost time; it is the sacred soil where tomorrow’s strength takes root.',
      theme: 'Deep Sleep & Healing',
      sourceOrGuidance: 'Breathe slowly, let go of today, and allow peace to fill your space.',
      accentColor: 'from-slate-800/80 to-indigo-950/50 border-slate-700/60 text-slate-300',
      badge: 'Nocturnal Calm',
    },
  ],
};

/**
 * Maps any SolarPosition to the appropriate affirmation category
 */
export function getAffirmationForSolarPosition(solarPos: SolarPosition, indexSeed = 0): SunAffirmation {
  const phase = solarPos.phase;
  const category = solarPos.phaseCategory;

  let key = 'daylight';

  if (phase === 'sunrise' || phase === 'civil_dawn' || phase === 'nautical_dawn' || phase === 'astronomical_dawn') {
    key = 'sunrise';
  } else if (phase === 'morning_golden_hour') {
    key = 'morning_golden_hour';
  } else if (phase === 'solar_noon') {
    key = 'solar_noon';
  } else if (phase === 'afternoon_daylight') {
    key = 'afternoon_daylight';
  } else if (phase === 'evening_golden_hour' || phase === 'sunset') {
    key = 'sunset';
  } else if (phase === 'civil_dusk' || phase === 'nautical_dusk' || phase === 'astronomical_dusk' || category === 'Twilight') {
    key = 'twilight';
  } else if (phase === 'night' || category === 'Night' || !solarPos.isDaylight) {
    key = 'night';
  }

  const list = SUN_PHASE_AFFIRMATIONS[key] || SUN_PHASE_AFFIRMATIONS.daylight;
  const idx = Math.abs(indexSeed) % list.length;
  return list[idx];
}
