import { diffDays, type ISODate } from '../engine/dates.ts';
import type { Confidence, Prediction } from '../engine/prediction.ts';

const dayMonth = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const weekdayLong = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const toDate = (d: ISODate) => new Date(`${d}T00:00:00Z`);

export function formatDayMonth(d: ISODate): string {
  return dayMonth.format(toDate(d));
}

export function formatLongDate(d: ISODate): string {
  return weekdayLong.format(toDate(d));
}

/** "20.–22. Okt." or "30. Okt. – 2. Nov." */
export function formatRange(from: ISODate, to: ISODate): string {
  if (from === to) return formatDayMonth(from);
  if (from.slice(0, 7) === to.slice(0, 7)) return `${Number(from.slice(8))}.–${formatDayMonth(to)}`;
  return `${formatDayMonth(from)} – ${formatDayMonth(to)}`;
}

const days = (n: number) => (n === 1 ? '1 Tag' : `${n} Tagen`);

export const confidenceLabel: Record<Confidence, string> = {
  low: 'Sicherheit\u00a0niedrig',
  medium: 'Sicherheit\u00a0mittel',
  high: 'Sicherheit\u00a0hoch',
};

/** The one sentence the Today screen leads with. */
export function statement(p: Prediction, today: ISODate): string {
  if (p.periodDay) return `Tag ${p.periodDay} deiner Periode`;
  if (p.lateByDays !== undefined) return p.lateByDays === 1 ? 'Periode seit 1 Tag später' : `Periode seit ${p.lateByDays} Tagen später`;
  const until = diffDays(p.nextPeriod.mostLikely, today);
  if (until <= 0) return 'Periode heute erwartet';
  if (p.ovulation && p.fertileWindow && today >= p.fertileWindow.peakStart && today <= p.fertileWindow.peakEnd) {
    return 'Hohe Fruchtbarkeit';
  }
  return until === 1 ? 'Periode morgen' : `Periode in ${days(until)}`;
}

export const de = {
  appName: 'aya',
  periodStarted: 'Periode begonnen',
  periodEnded: 'Periode beendet',
  logToday: 'Heute eintragen',
  expected: 'voraussichtlich',
  cycleDayOf: (n: number) => `Zyklustag von etwa ${n}`,
  ringLabel: (day: number, length: number, range: string) =>
    `Zyklustag ${day} von etwa ${length}. Nächste Periode voraussichtlich ${range}.`,
  legend: {
    period: 'Periode',
    fertile: 'fruchtbar',
    ovulation: 'Eisprung',
    luteal: 'Lutealphase',
    forecast: 'Vorhersage',
    today: 'heute',
    flow: 'Blutung',
    flowLight: 'schwach',
    flowHeavy: 'stark',
  },
  ringPhase: { period: 'Periode', fertile: 'fruchtbar', luteal: 'Lutealphase' },
  preview: { components: 'Bausteine', symptoms: ['Krämpfe', 'Kopfschmerzen', 'Müdigkeit'] },
  theme: { label: 'Darstellung', system: 'System', light: 'Hell', dark: 'Dunkel' },
  sampleData: 'Beispieldaten',
} as const;
