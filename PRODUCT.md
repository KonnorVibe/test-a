# Product

<!-- impeccable:product-schema 1 -->

> Entwurf aus `docs/app-plan.md`. Punkte mit **[offen]** warten auf Bestätigung.

## Platform

web

Installierbare PWA, gedacht für den Standalone-Modus auf dem iPhone (Safari → Zum Home-Bildschirm). Die Designsprache ist Web, orientiert sich aber an iOS-Gewohnheiten (Bottom Sheets, große Touch-Ziele, Safe Areas).

## Stack

Vorgegeben im Plan: Vite, React, TypeScript (strict), vite-plugin-pwa, IndexedDB über `idb`, Web Crypto API, date-fns, Vitest, Playwright. Systemschriften. Deployment auf GitHub Pages mit relativer `base`.

## Users

Eine einzelne Nutzerin, die ihren Zyklus auf dem iPhone verfolgt. **[offen: Bist du das selbst oder baust du die App für jemand anderen?]**

Situation: kurze Einträge im Alltag (Ziel unter 10 Sekunden), gelegentlich ein Blick auf Vorhersage und Muster, ab und zu eine Übersicht für einen Arzttermin. Kennt Flo und erwartet ähnliche Bedienqualität.

## Product Purpose

Zyklus-Tracking mit der Qualität von Flo, aber ohne dass Gesundheitsdaten das Gerät verlassen. Erfolg heißt: Die Vorhersagen sind nachweislich gut (Backtest), ehrlich in ihrer Unsicherheit und werden mit jedem Zyklus besser. Die Nutzerin muss niemandem vertrauen außer ihrem eigenen Gerät.

## Positioning

Kein Server, kein Account, keine Cloud, kein Tracking. Alle Daten verschlüsselt auf dem Gerät. Vorhersagen beruhen auf veröffentlichter Forschung (Bull 2019, FIGO 2018, Wilcox 1995) statt auf der Annahme „Eisprung an Tag 14“, und die App zeigt offen, wie genau sie bisher lag.

## Operating Context

- Einträge oft unterwegs, mit einer Hand, morgens (Basaltemperatur) oder abends
- Entsperren per PIN oder Passphrase, automatische Sperre nach Inaktivität
- Erinnerungen über einen `.ics`-Export in den eigenen Kalender, weil iOS-PWAs ohne Server keine zuverlässigen Benachrichtigungen planen können
- Druckansicht für Arzttermine

## Capabilities and Constraints

- Vollständiger Funktionsumfang laut `docs/app-plan.md` (Abschnitte 4 bis 8)
- Null Netzwerkanfragen nach dem Laden, strikte CSP
- Kein Klartext-Gesundheitsdatum in IndexedDB, localStorage oder Cache
- Export, Import und vollständiges Löschen jederzeit
- Modi: Zyklus verfolgen, Kinderwunsch, hormonelle Verhütung
- Kein Verhütungsmittel und kein Medizinprodukt, das wird im Onboarding und in den Einstellungen gesagt

## Brand Commitments

- Name: **Aya**
- Sprache der Oberfläche: Deutsch. Ansprache: du **[offen: bestätigen]**
- Charakter: warm, ruhig, erwachsen, kein Kitsch
- App-Icon und Splashscreen diskret, kein erkennbares Perioden-Symbol auf dem Homescreen
- Farbrollen aus dem Plan: Periode gedecktes Rosé/Rot, fruchtbares Fenster Türkis, Eisprung kräftiger Akzent, Lutealphase sanftes Violett (genaue Werte folgen in Phase 4)

## Evidence on Hand

- Wissenschaftliche Quellen der Vorhersage-Engine (siehe Plan Abschnitt 6.1)
- Keine echten Zyklusdaten zum Testen. Tests nutzen synthetische Datensätze. **[offen: Gibt es Altdaten, etwa einen Flo-Export, die später importiert werden sollen?]**
- Keine Nutzerstimmen, keine Vergleichszahlen gegen Flo außer dem im Plan genannten Orientierungswert. Nichts davon erfinden.

## Product Principles

1. Die Daten gehören der Nutzerin und bleiben auf ihrem Gerät.
2. Ehrlich statt beruhigend: Jede Vorhersage zeigt Spanne und Konfidenz, die App sagt, wie oft sie danebenlag.
3. Schnell eintragen ist wichtiger als viel eintragen.
4. Diskret nach außen, warm nach innen.
5. Hinweise sanft und ohne Diagnose, mit Verweis auf die Ärztin.

## Accessibility & Inclusion

WCAG AA Kontrast, Touch-Ziele ab 44 px, ARIA-Labels, Farbe nie als einzige Information, `prefers-reduced-motion` respektieren, vollwertiger Dark Mode.
