import { describe, expect, it } from 'vitest';
import { addDays } from '../../engine/dates.ts';
import { mergeLogs, periodLogs } from '../../engine/fixtures.ts';
import { predict } from '../../engine/prediction.ts';
import { logSummary, todayNotes } from './todayNotes.ts';

describe('todayNotes', () => {
  const { logs, current } = periodLogs('2026-01-05', Array(6).fill(28));

  it('says nothing on an ordinary day', () => {
    const today = addDays(current, 8);
    const p = predict({ logs, settings: { mode: 'track' }, today })!;
    expect(todayNotes(p, logs, { mode: 'track' }, today)).toEqual([]);
  });

  it('leads with a late period and the test suggestion', () => {
    const p0 = predict({ logs, settings: { mode: 'track' }, today: current })!;
    const withSex = mergeLogs(logs, [{ date: p0.fertileWindow!.peakStart, sex: [{ protected: false }] }]);
    const today = addDays(current, 33);
    const p = predict({ logs: withSex, settings: { mode: 'track' }, today })!;
    const notes = todayNotes(p, withSex, { mode: 'track' }, today);
    expect(notes[0]).toMatch(/5 Tage später/);
    expect(notes[1]).toMatch(/Schwangerschaftstest/);
  });

  it('shows the fertile window in conceive mode', () => {
    const today = addDays(current, 3);
    const p = predict({ logs, settings: { mode: 'conceive' }, today })!;
    expect(todayNotes(p, logs, { mode: 'conceive' }, today)[0]).toMatch(/^Fruchtbares Fenster voraussichtlich/);
  });
});

describe('logSummary', () => {
  it('lists what was logged in plain words', () => {
    expect(logSummary({ date: '2026-01-01', flow: 'light', symptoms: ['cramps'], mood: ['calm'], energy: 2 })).toBe(
      'leicht, Krämpfe, ruhig, Energie wenig',
    );
    expect(logSummary(undefined)).toBeNull();
    expect(logSummary({ date: '2026-01-01' })).toBeNull();
  });
});
