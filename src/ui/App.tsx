import { useEffect, useState } from 'react';
import { addDays, todayLocal } from '../engine/dates.ts';
import { predict } from '../engine/prediction.ts';
import type { DayLog, Flow } from '../engine/types.ts';
import { de } from '../i18n/de.ts';
import { Chip } from './components/Chip.tsx';
import { TabBar, type TabId } from './components/TabBar.tsx';
import { Today } from './screens/Today.tsx';
import './theme/tokens.css';
import './theme/base.css';
import './App.css';

type Theme = 'system' | 'light' | 'dark';

/** Synthetic sample: six ~29-day cycles, today 5 days before the expected period. */
function sampleLogs(today: string): DayLog[] {
  const lengths = [29, 28, 30, 29, 28, 29];
  const flows: Flow[] = ['medium', 'heavy', 'medium', 'light', 'spotting'];
  const currentStart = addDays(today, -24);
  let start = addDays(currentStart, -lengths.reduce((a, b) => a + b));
  const logs: DayLog[] = [];
  for (const len of [...lengths, 0]) {
    flows.forEach((flow, i) => logs.push({ date: addDays(start, i), flow }));
    start = addDays(start, len);
  }
  return logs;
}

export function App() {
  const today = todayLocal();
  const [logs] = useState(() => sampleLogs(today));
  const [tab, setTab] = useState<TabId>('today');
  const [theme, setTheme] = useState<Theme>('system');
  const [picked, setPicked] = useState<string[]>(['Krämpfe']);
  const prediction = predict({ logs, settings: { mode: 'track' }, today });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <div className="preview-bar" role="group" aria-label={de.theme.label}>
        <span>{de.sampleData}</span>
        {(['system', 'light', 'dark'] as const).map((t) => (
          <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
            {de.theme[t]}
          </button>
        ))}
      </div>
      {prediction && (
        <Today prediction={prediction} logs={logs} today={today} onPeriodToggle={() => {}} onLog={() => {}} />
      )}
      <section className="preview-components" aria-label={de.preview.components}>
        <h2>{de.preview.components}</h2>
        <div>
          {de.preview.symptoms.map((s) => (
            <Chip
              key={s}
              selected={picked.includes(s)}
              onToggle={() => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))}
            >
              {s}
            </Chip>
          ))}
        </div>
      </section>
      <TabBar active={tab} onSelect={setTab} />
    </>
  );
}
