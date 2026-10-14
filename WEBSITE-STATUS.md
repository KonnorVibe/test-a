# Website-Status: Aya

Diese Datei hält fest, wo das Projekt steht. Der Skill `website-bauen` liest sie bei jedem Aufruf und macht dort weiter.

Status: ✅ erledigt · 🔄 läuft · ⬜ offen

Aya ist keine öffentliche Website, sondern eine private Zyklus-App (PWA). Der Skill dient als Rahmen, der Inhalt kommt aus `docs/app-plan.md`. Die Phasen sind deshalb angepasst.

| Phase | Name | Für Aya angepasst | Status | Datum |
|---|---|---|---|---|
| 0 | Einrichten | Repo, impeccable, Playwright, Statusdatei | ✅ | 2026-10-14 |
| 1 | Fundament | Name, neutrales Icon, `PRODUCT.md` | ⬜ | |
| 2 | Recherche | nur Design-Vorbilder, keine Keywords | ⬜ | |
| 3 | Texte | alle Oberflächentexte für `src/i18n/de.ts` | ⬜ | |
| 4 | Design-Richtung | Farbwelt, Zyklusring, Stil | ⬜ | |
| 5 | Bauen | Reihenfolge aus `docs/app-plan.md` Abschnitt 11 | ⬜ | |
| 6 | Prüfen und Feinschliff | Prüfung mit Screenshots und Selbst-Audit | ⬜ | |
| 7 | Livegang | GitHub Pages, Privacy-Check, `noindex`, iPhone-Installation | ⬜ | |
| 8 | Danach | Genauigkeit per Backtest nach echten Zyklen nachmessen | ⬜ | |

## Ausgangslage

- Bestehende Website oder Marke: keine. Name steht fest: **Aya**
- Hauptziel: private Zyklus-Tracking-App für eine Nutzerin auf dem iPhone, alle Daten verschlüsselt auf dem Gerät
- Hosting: GitHub Pages aus `KonnorVibe/test-a`
- Werkzeuge: impeccable ✅ (Anleitungen im Projekt, automatische Prüfungen eingeschränkt, siehe unten) · Playwright ✅ · DataForSEO ➖ bewusst weggelassen · Hosting-MCP ➖ nicht nötig · Formular-Ziel ➖ nicht nötig

### Hinweise zur Umgebung

- impeccable konnte nicht über `npx impeccable install` installiert werden, weil der Download von impeccable.style im Netzwerk der Cloud-Umgebung blockiert ist. Der Skill wurde stattdessen aus dem GitHub-Repo `pbakaus/impeccable` (v4.5.2) nach `.claude/skills/impeccable` kopiert. Regeln und Anleitungen funktionieren, das Prüfprogramm (`detect`) eventuell nicht.
- Playwright für Python braucht hier den vorinstallierten Browser: `executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`.
- Die Cloud-Umgebung ist nicht dauerhaft. Nach jeder Phase wird ins Repo gepusht.

## Marke

| Rolle | Wert |
|---|---|
| Periode | gedecktes Rosé/Rot (aus Plan, Wert offen) |
| Fruchtbares Fenster | Türkis (Wert offen) |
| Eisprung | kräftiger Akzent (Wert offen) |
| Lutealphase | sanftes Violett (Wert offen) |
| Schrift | Systemschrift (`-apple-system`, `system-ui`) |
| Merkmale | warm, ruhig, erwachsen, kein Kitsch, diskretes Icon |

## Entscheidungen

- 2026-10-14: Skill `website-bauen` als Rahmen, `docs/app-plan.md` als Inhalt. Phasen wie oben angepasst.
- 2026-10-14: Repo `KonnorVibe/test-a`, Veröffentlichung über GitHub Pages.
- 2026-10-14: App heißt **Aya** (im Plan noch „Luna“).
- 2026-10-14: Kein DataForSEO.

## Offene Fragen an die Person

-

## Update-Ablauf nach dem Livegang

1. Änderung im Code
2. `npm test` und `npm run privacy-check`
3. Push auf `main`, GitHub Pages baut neu
4. Auf dem iPhone die App einmal schließen und neu öffnen, damit der Service Worker die neue Version lädt
