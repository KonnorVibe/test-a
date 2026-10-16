import { useState } from 'react';
import { de } from '../../i18n/de.ts';
import { useApp } from '../../state/store.ts';
import { Button } from '../components/Button.tsx';
import { PinPad } from '../components/PinPad.tsx';
import './Settings.css';

const LOCK_OPTIONS = [1, 5, 15] as const;
const t = de.settings;

type PinFlow = { step: 'enter' } | { step: 'confirm'; first: string; mismatch?: false } | { step: 'enter'; mismatch: true };

export function Settings() {
  const settings = useApp((s) => s.settings)!;
  const pinSet = useApp((s) => s.pinSet);
  const updateSettings = useApp((s) => s.updateSettings);
  const setPin = useApp((s) => s.setPin);
  const removePin = useApp((s) => s.removePin);
  const [flow, setFlow] = useState<PinFlow | null>(null);

  if (flow) {
    const done = async (pin: string) => {
      if (flow.step === 'enter') return setFlow({ step: 'confirm', first: pin });
      if (pin !== flow.first) return setFlow({ step: 'enter', mismatch: true });
      await setPin(pin);
      setFlow(null);
    };
    return (
      <main className="settings settings-pin">
        <PinPad
          key={flow.step}
          title={flow.step === 'enter' ? t.newPin : t.confirmPin}
          {...('mismatch' in flow && flow.mismatch ? { message: t.mismatch } : {})}
          onComplete={done}
        />
        <Button variant="quiet" onClick={() => setFlow(null)}>
          {t.cancel}
        </Button>
      </main>
    );
  }

  return (
    <main className="settings">
      <h1>{t.title}</h1>

      <section aria-labelledby="set-lock">
        <h2 id="set-lock">{t.lockSection}</h2>
        <div className="row">
          <span>{t.pin}</span>
          <span className="row-value">{pinSet ? t.pinOn : t.pinOff}</span>
        </div>
        <div className="row-actions">
          <Button variant="secondary" onClick={() => setFlow({ step: 'enter' })}>
            {pinSet ? t.changePin : t.setPin}
          </Button>
          {pinSet && (
            <Button variant="quiet" onClick={() => void removePin()}>
              {t.removePin}
            </Button>
          )}
        </div>
        <p className="row-hint">{t.pinHint}</p>

        {pinSet && (
          <>
            <label className="row">
              <span>{t.autoLock}</span>
              <select
                value={settings.lockMinutes}
                onChange={(e) => void updateSettings({ lockMinutes: Number(e.target.value) })}
              >
                {LOCK_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {t.minutes(m)}
                  </option>
                ))}
              </select>
            </label>
            <p className="row-hint">{t.autoLockHint}</p>
          </>
        )}

        <label className="row">
          <span>{t.shield}</span>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            checked={!!settings.privacyShield}
            onChange={(e) => void updateSettings({ privacyShield: e.target.checked })}
          />
        </label>
        <p className="row-hint">{t.shieldHint}</p>
      </section>

      <section aria-labelledby="set-about">
        <h2 id="set-about">{t.aboutSection}</h2>
        <p className="settings-disclaimer">{de.disclaimer}</p>
      </section>
    </main>
  );
}
