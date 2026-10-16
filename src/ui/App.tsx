import { useCallback, useEffect, useState } from 'react';
import { todayLocal } from '../engine/dates.ts';
import { predict } from '../engine/prediction.ts';
import { de } from '../i18n/de.ts';
import { useApp } from '../state/store.ts';
import { DayLogSheet } from './components/DayLogSheet.tsx';
import { TabBar, type TabId } from './components/TabBar.tsx';
import { useAutoLock, usePrivacyShield, useTheme } from './hooks/useAppEnvironment.ts';
import { LockScreen } from './screens/LockScreen.tsx';
import { Onboarding } from './screens/Onboarding.tsx';
import { Placeholder } from './screens/Placeholder.tsx';
import { Settings } from './screens/Settings.tsx';
import { Today } from './screens/Today.tsx';
import './theme/tokens.css';
import './theme/base.css';

export function App({ dbName }: { dbName?: string }) {
  const status = useApp((s) => s.status);
  const settings = useApp((s) => s.settings);
  const logs = useApp((s) => s.logs);
  const pinSet = useApp((s) => s.pinSet);
  const init = useApp((s) => s.init);
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const saveDayLog = useApp((s) => s.saveDayLog);
  const startPeriod = useApp((s) => s.startPeriod);
  const endPeriod = useApp((s) => s.endPeriod);
  const [sheetDate, setSheetDate] = useState<string | null>(null);
  const lockNow = useApp((s) => s.lock);
  const [tab, setTab] = useState<TabId>('today');
  const today = todayLocal();

  useEffect(() => {
    void init(dbName);
  }, [init, dbName]);

  const lock = useCallback(() => lockNow(), [lockNow]);
  useTheme(settings?.theme);
  useAutoLock(pinSet && status === 'ready', settings?.lockMinutes ?? 5, lock);
  usePrivacyShield(!!settings?.privacyShield);

  if (status === 'loading') return null;
  if (status === 'error') return <p className="load-error">{de.loadError}</p>;
  if (status === 'onboarding') return <Onboarding today={today} onDone={(input) => void completeOnboarding(input, today)} />;
  if (status === 'locked') return <LockScreen />;

  const prediction = settings ? predict({ logs, settings, today }) : null;
  return (
    <>
      {tab === 'today' && (
        <Today
          prediction={prediction}
          logs={logs}
          settings={settings!}
          today={today}
          onPeriodStart={() => void startPeriod(today)}
          onPeriodEnd={() => void endPeriod(today)}
          onLog={() => setSheetDate(today)}
        />
      )}
      {tab === 'calendar' && <Placeholder title={de.tabs.calendar} />}
      {tab === 'insights' && <Placeholder title={de.tabs.insights} />}
      {tab === 'settings' && <Settings />}
      <TabBar active={tab} onSelect={setTab} />
      {sheetDate && (
        <DayLogSheet
          date={sheetDate}
          today={today}
          log={logs.find((l) => l.date === sheetDate)}
          history={logs}
          onSave={(log) => void saveDayLog(log)}
          onClose={() => setSheetDate(null)}
        />
      )}
    </>
  );
}
