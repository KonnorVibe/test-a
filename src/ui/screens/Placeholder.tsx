import { de } from '../../i18n/de.ts';
import './Placeholder.css';

/** Shown for tabs whose screens arrive in later phases. */
export function Placeholder({ title }: { title: string }) {
  return (
    <main className="placeholder">
      <h1>{title}</h1>
      <p>{de.comingSoon}</p>
    </main>
  );
}
