import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { hashPin, remainingLockoutMs, verifyPin, type LockoutState } from '../crypto/pin.ts';
import type { ISODate } from '../engine/dates.ts';
import type { DayLog, Settings } from '../engine/types.ts';
import { Repository, requestPersistence } from '../storage/repository.ts';
import { buildOnboarding, type OnboardingInput } from './onboarding.ts';

export type Status = 'loading' | 'onboarding' | 'locked' | 'ready' | 'error';
export type UnlockResult = { result: 'ok' } | { result: 'wrong'; waitMs: number } | { result: 'wait'; waitMs: number };

export interface AppState {
  status: Status;
  logs: DayLog[];
  settings?: Settings;
  pinSet: boolean;
  init: (dbName?: string) => Promise<void>;
  completeOnboarding: (input: OnboardingInput, today: ISODate) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  saveDayLog: (log: DayLog) => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  removePin: () => Promise<void>;
  lock: () => void;
  unlock: (pin: string, now?: number) => Promise<UnlockResult>;
  /** Milliseconds until the next PIN attempt is allowed. */
  lockoutRemaining: (now?: number) => Promise<number>;
}

/**
 * App state. Plaintext health data lives only here and in the Repository's memory; every write
 * goes through the Repository, which encrypts before touching IndexedDB.
 */
export function createAppStore() {
  let repo: Repository | undefined;
  const need = () => {
    if (!repo) throw new Error('Repository not open');
    return repo;
  };

  return createStore<AppState>()((set, get) => ({
    status: 'loading',
    logs: [],
    pinSet: false,

    async init(dbName) {
      try {
        repo = await Repository.open(dbName);
        const settings = repo.settings();
        const pinSet = !!(await repo.getMeta('pin'));
        set({
          logs: repo.dayLogs(),
          pinSet,
          status: !settings ? 'onboarding' : pinSet ? 'locked' : 'ready',
          ...(settings ? { settings } : {}),
        });
      } catch {
        set({ status: 'error' });
      }
    },

    async completeOnboarding(input, today) {
      const r = need();
      const { settings, logs } = buildOnboarding(input, today);
      for (const log of logs) await r.saveDayLog(log);
      await r.saveSettings(settings);
      void requestPersistence();
      set({ settings, logs: r.dayLogs(), status: 'ready' });
    },

    async updateSettings(patch) {
      const r = need();
      const settings = { ...get().settings!, ...patch };
      await r.saveSettings(settings);
      set({ settings });
    },

    async saveDayLog(log) {
      const r = need();
      await r.saveDayLog(log);
      set({ logs: r.dayLogs() });
    },

    async setPin(pin) {
      const r = need();
      await r.setMeta('pin', await hashPin(pin));
      await r.setMeta('lockout', undefined);
      set({ pinSet: true });
    },

    async removePin() {
      const r = need();
      await r.setMeta('pin', undefined);
      await r.setMeta('lockout', undefined);
      set({ pinSet: false });
    },

    lock() {
      if (get().pinSet && get().status === 'ready') set({ status: 'locked' });
    },

    async lockoutRemaining(now = Date.now()) {
      const lockout = (await need().getMeta('lockout')) ?? { failures: 0 };
      return remainingLockoutMs(lockout, now);
    },

    async unlock(pin, now = Date.now()) {
      const r = need();
      const record = await r.getMeta('pin');
      if (!record) {
        set({ status: 'ready' });
        return { result: 'ok' };
      }
      const lockout: LockoutState = (await r.getMeta('lockout')) ?? { failures: 0 };
      const waiting = remainingLockoutMs(lockout, now);
      if (waiting > 0) return { result: 'wait', waitMs: waiting };
      if (await verifyPin(pin, record)) {
        await r.setMeta('lockout', undefined);
        set({ status: 'ready' });
        return { result: 'ok' };
      }
      const next = { failures: lockout.failures + 1, lastFailureAt: now };
      await r.setMeta('lockout', next);
      return { result: 'wrong', waitMs: remainingLockoutMs(next, now) };
    },
  }));
}

export const appStore = createAppStore();

export function useApp<T>(selector: (s: AppState) => T): T {
  return useStore(appStore, selector);
}
