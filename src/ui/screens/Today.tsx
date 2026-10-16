import type { ISODate } from '../../engine/dates.ts';
import type { Prediction } from '../../engine/prediction.ts';
import type { DayLog } from '../../engine/types.ts';
import { confidenceLabel, de, formatLongDate, formatRange, statement } from '../../i18n/de.ts';
import { Button } from '../components/Button.tsx';
import { CycleRing } from '../components/CycleRing.tsx';
import { Legend } from '../components/Legend.tsx';
import { ringModel } from '../components/ringModel.ts';
import './Today.css';

const shortDay = (d: ISODate) => `${Number(d.slice(8))}.`;

interface Props {
  prediction: Prediction;
  logs: readonly DayLog[];
  today: ISODate;
  onPeriodToggle: () => void;
  onLog: () => void;
}

export function Today({ prediction, logs, today, onPeriodToggle, onLog }: Props) {
  const model = ringModel(prediction, logs, today);
  const range = formatRange(prediction.nextPeriod.earliest, prediction.nextPeriod.latest);
  const inPeriod = prediction.periodDay !== undefined;
  return (
    <main className="today">
      <header className="today-head">
        <span className="wordmark">{de.appName}</span>
        <span>{formatLongDate(today)}</span>
      </header>

      <section className="today-statement" aria-live="polite">
        <h1>{statement(prediction, today)}</h1>
        <p>
          {de.expected} {range}
          <br />
          {confidenceLabel[prediction.confidence]}
        </p>
      </section>

      <figure className="today-chart">
        <CycleRing
          model={model}
          cycleDay={prediction.cycleDay}
          dayCaption={de.cycleDayOf(model.length)}
          label={de.ringLabel(prediction.cycleDay, model.length, range)}
          rangeLabels={[shortDay(prediction.nextPeriod.earliest), shortDay(prediction.nextPeriod.latest)]}
        />
        <figcaption>
          <Legend showFertility={!!prediction.fertileWindow} />
        </figcaption>
      </figure>

      <div className="today-actions">
        <Button onClick={onPeriodToggle}>{inPeriod ? de.periodEnded : de.periodStarted}</Button>
        <Button variant="secondary" onClick={onLog}>
          {de.logToday}
        </Button>
      </div>
    </main>
  );
}
