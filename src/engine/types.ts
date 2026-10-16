import type { ISODate } from './dates.ts';

export type { ISODate };

export const SYMPTOM_IDS = [
  'cramps', 'headache', 'migraine', 'breast_tenderness', 'bloating', 'back_pain', 'nausea',
  'acne', 'fatigue', 'cravings', 'diarrhea', 'constipation', 'insomnia', 'libido_high',
  'libido_low', 'dizziness', 'joint_pain',
] as const;
export type SymptomId = (typeof SYMPTOM_IDS)[number];

export const MOOD_IDS = ['calm', 'happy', 'energetic', 'irritable', 'sad', 'anxious', 'mood_swings', 'stressed'] as const;
export type MoodId = (typeof MOOD_IDS)[number];

export type Flow = 'spotting' | 'light' | 'medium' | 'heavy';
export type Mode = 'track' | 'conceive' | 'hormonal_contraception';

export interface DayLog {
  date: ISODate;
  flow?: Flow;
  symptoms?: SymptomId[];
  mood?: MoodId[];
  energy?: 1 | 2 | 3 | 4 | 5;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'eggwhite';
  /** Basal body temperature in °C. */
  bbt?: { value: number; time?: string; disturbed?: boolean; reason?: string };
  lhTest?: 'negative' | 'positive' | 'peak';
  pregnancyTest?: 'negative' | 'positive';
  sex?: { protected?: boolean }[];
  medication?: string[];
  note?: string;
}

export type ExclusionReason = 'outlier' | 'possible_missed_log' | 'pregnancy' | 'postpartum' | 'user';
export type OvulationSource = 'bbt' | 'lh' | 'bbt+lh';

/** Derived from DayLogs, never stored. */
export interface Cycle {
  startDate: ISODate;
  /** Last bleeding day of the period that opens this cycle. */
  periodEnd: ISODate;
  periodLength: number;
  /** Day before the next start; absent for the ongoing cycle. */
  endDate?: ISODate;
  length?: number;
  ovulationDate?: ISODate;
  ovulationSource?: OvulationSource;
  lutealLength?: number;
  excluded?: { reason: ExclusionReason };
}

export interface Settings {
  mode: Mode;
  birthYear?: number;
  defaultCycleLength?: number;
  defaultPeriodLength?: number;
  /** Inactivity minutes before auto-lock; only applies while a PIN is set. */
  lockMinutes: number;
  theme: 'system' | 'light' | 'dark';
  /** Blur the app while it is in the background (app switcher). */
  privacyShield?: boolean;
}

/** User decisions about flagged cycles, keyed by cycle start date. */
export interface CycleOverrides {
  include?: ReadonlySet<ISODate>;
  exclude?: ReadonlySet<ISODate>;
}
