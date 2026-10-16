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
  log: {
    title: (date: string, isToday: boolean) => (isToday ? 'Heute' : date),
    done: 'Fertig',
    flow: 'Blutung',
    flows: { none: 'keine', spotting: 'Schmierblutung', light: 'leicht', medium: 'mittel', heavy: 'stark' },
    symptoms: 'Symptome',
    mood: 'Stimmung',
    energy: 'Energie',
    energyLevels: ['sehr wenig', 'wenig', 'mittel', 'viel', 'sehr viel'],
    sleep: 'Schlaf',
    sleepLevels: ['sehr schlecht', 'schlecht', 'okay', 'gut', 'sehr gut'],
    sex: 'Sex',
    sexProtected: 'geschützt',
    sexUnprotected: 'ungeschützt',
    note: 'Notiz',
    notePlaceholder: 'Was dir heute auffällt',
    summary: 'Heute eingetragen',
  },
  symptomLabels: {
    cramps: 'Krämpfe',
    headache: 'Kopfschmerzen',
    migraine: 'Migräne',
    breast_tenderness: 'Brustspannen',
    bloating: 'Blähungen',
    back_pain: 'Rückenschmerzen',
    nausea: 'Übelkeit',
    acne: 'Akne',
    fatigue: 'Müdigkeit',
    cravings: 'Heißhunger',
    diarrhea: 'Durchfall',
    constipation: 'Verstopfung',
    insomnia: 'Schlafprobleme',
    libido_high: 'Libido hoch',
    libido_low: 'Libido niedrig',
    dizziness: 'Schwindel',
    joint_pain: 'Gelenkschmerzen',
  },
  moodLabels: {
    calm: 'ruhig',
    happy: 'glücklich',
    energetic: 'energiegeladen',
    irritable: 'gereizt',
    sad: 'traurig',
    anxious: 'ängstlich',
    mood_swings: 'Stimmungsschwankungen',
    stressed: 'gestresst',
  },
  notes: {
    late: (n: number) => (n === 1 ? 'Deine Periode ist 1 Tag später als erwartet. Das kommt oft vor.' : `Deine Periode ist ${n} Tage später als erwartet. Das kommt oft vor.`),
    pregnancyTest:
      'Du hast in deinem fruchtbaren Fenster ungeschützten Sex eingetragen. Ab jetzt ist ein Schwangerschaftstest aussagekräftig.',
    refinedBbt: 'Vorhersage verfeinert durch deinen Temperaturanstieg.',
    refinedLh: 'Vorhersage verfeinert durch deinen positiven LH-Test.',
    irregular: 'Deine Zyklen schwanken stärker als üblich, deshalb ist die Spanne breiter.',
    fertileWindow: (range: string) => `Fruchtbares Fenster voraussichtlich ${range}.`,
    upcoming: (list: string) => `Erfahrungsgemäß könnten in den nächsten Tagen ${list} auftreten.`,
    health: {
      short_cycles: 'Deine Zyklen sind meist kürzer als 24 Tage. Sprich bei Gelegenheit mit deiner Ärztin darüber.',
      long_cycles: 'Deine Zyklen sind meist länger als 38 Tage. Sprich bei Gelegenheit mit deiner Ärztin darüber.',
      long_periods: 'Deine Perioden dauerten zuletzt öfter länger als 8 Tage. Sprich bei Gelegenheit mit deiner Ärztin darüber.',
      high_variability: 'Deine Zykluslängen schwanken stark. Sprich bei Gelegenheit mit deiner Ärztin darüber.',
      absent_period: 'Deine letzte Periode liegt über 90 Tage zurück. Sprich mit deiner Ärztin darüber.',
    },
  },
  theme: { label: 'Darstellung', system: 'System', light: 'Hell', dark: 'Dunkel' },
  disclaimer: 'aya ist kein Verhütungsmittel und kein Medizinprodukt.',
  tabs: { today: 'Heute', calendar: 'Kalender', insights: 'Einblicke', settings: 'Einstellungen' },
  comingSoon: 'Dieser Bereich kommt mit einem der nächsten Updates.',
  emptyToday: {
    title: 'Noch keine Periode eingetragen',
    body: 'Trag den ersten Tag deiner Periode ein. Danach zeigt dir aya, wann die nächste wahrscheinlich kommt.',
  },
  loadError: 'aya konnte deine Daten nicht öffnen. Schließ die App und öffne sie noch einmal.',
  onboarding: {
    step: (n: number, of: number) => `Schritt ${n} von ${of}`,
    next: 'Weiter',
    back: 'Zurück',
    skip: 'Überspringen',
    finish: 'Los geht’s',
    welcome: {
      title: 'Deine Daten bleiben bei dir',
      points: [
        'Kein Konto, kein Server, keine Cloud.',
        'Alles wird verschlüsselt auf diesem Gerät gespeichert.',
        'aya sendet nichts ins Internet. Nie.',
      ],
      homeScreen:
        'Tipp: Tippe in Safari auf Teilen und dann auf „Zum Home-Bildschirm“. Nur so bleiben deine Daten dauerhaft erhalten.',
    },
    period: {
      title: 'Wann hat deine letzte Periode begonnen?',
      body: 'Ungefähr reicht. Du kannst das auch überspringen und später eintragen.',
      startLabel: 'Erster Tag',
      cycleLabel: 'Zykluslänge',
      periodLabel: 'Periodendauer',
      unknown: 'Weiß ich nicht',
      days: (n: number) => `${n} Tage`,
      decrease: (label: string) => `${label} verringern`,
      increase: (label: string) => `${label} erhöhen`,
    },
    mode: {
      title: 'Wofür möchtest du aya nutzen?',
      options: {
        track: { label: 'Zyklus verfolgen', hint: 'Periode, Symptome und Vorhersagen.' },
        conceive: { label: 'Kinderwunsch', hint: 'Fruchtbare Tage stehen im Vordergrund.' },
        hormonal_contraception: { label: 'Hormonelle Verhütung', hint: 'Blutungen und Symptome, ohne Eisprung-Vorhersage.' },
      },
    },
    note: {
      title: 'Bevor es losgeht',
      body: 'Die Vorhersagen beruhen auf Statistik und zeigen immer eine Spanne. Sie ersetzen weder Verhütung noch ärztlichen Rat.',
      pin: 'Wenn du möchtest, kannst du später in den Einstellungen eine PIN festlegen.',
    },
  },
  lock: {
    title: 'Gib deine PIN ein',
    wrong: 'Diese PIN stimmt nicht.',
    wait: (s: number) => `Zu viele Versuche. Bitte warte noch ${s} Sekunden.`,
    delete: 'Letzte Ziffer löschen',
    entered: (n: number, of: number) => `${n} von ${of} Ziffern eingegeben`,
  },
  settings: {
    title: 'Einstellungen',
    lockSection: 'App-Sperre',
    pin: 'PIN',
    pinOn: 'An',
    pinOff: 'Aus',
    setPin: 'PIN festlegen',
    changePin: 'PIN ändern',
    removePin: 'PIN entfernen',
    pinHint: 'Die PIN schützt vor neugierigen Blicken. Sie ersetzt nicht die Sperre deines iPhones.',
    newPin: 'Neue PIN eingeben',
    confirmPin: 'PIN wiederholen',
    mismatch: 'Die PINs stimmen nicht überein. Versuch es noch einmal.',
    cancel: 'Abbrechen',
    autoLock: 'Automatisch sperren nach',
    minutes: (n: number) => (n === 1 ? '1 Minute' : `${n} Minuten`),
    autoLockHint: 'Und immer, wenn aya länger als eine Minute im Hintergrund war.',
    shield: 'Sichtschutz',
    shieldHint: 'Macht den Inhalt unscharf, sobald aya in den Hintergrund geht.',
    aboutSection: 'Über aya',
  },
} as const;
