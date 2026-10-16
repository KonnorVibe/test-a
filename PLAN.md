# PLAN – aya

Private Zyklus-App als installierbare PWA. Grundlage: [`docs/zyklus-app-prompt.md`](docs/zyklus-app-prompt.md) (im Prompt noch „Luna“, hier überall **aya** (kleingeschrieben)). Dieses Dokument hält fest, was gebaut wird, in welcher Reihenfolge und wo wir bewusst vom Prompt abweichen.

Stand: 2026-10-16 · Phasen 0–2 (Setup, Engine, Crypto + Storage) abgeschlossen.

---

## 1. Rahmen

| Punkt | Entscheidung |
|---|---|
| Entwickler | Konstantin (allein) |
| Nutzerinnen | Freundinnen und Bekannte, Gelegenheitsnutzerinnen, iPhone, keine Technik-Affinität vorausgesetzt |
| Infrastruktur | Kein Server, kein Account, keine Cloud, kein Tracking. Daten nur auf dem Gerät |
| Hosting | GitHub Pages aus Repo `KonnorVibe/test-a` (statische Dateien) |
| Sprache | UI Deutsch, Code/Kommentare Englisch |
| Altdaten/Flo-Import | vorerst nicht |

---

## 2. Abweichungen vom Prompt (bewusst)

### 2.1 Sicherheitsmodell: Geräteschlüssel statt Passphrase

Der Prompt verlangt Passphrase/PIN mit PBKDF2 (600k Iterationen) plus Wiederherstellungscode. Für Gelegenheitsnutzerinnen ist das zu viel Reibung: vergessene Passphrase = Daten weg, Code wird nicht notiert, Entsperren dauert spürbar.

**Neues Modell:**

1. **Data Key:** AES-GCM 256, beim ersten Start per `crypto.subtle.generateKey(..., extractable: false)` erzeugt.
2. Der `CryptoKey` wird direkt in IndexedDB abgelegt (Structured Clone). Er bleibt **nicht exportierbar**: Kein JS-Code, auch nicht unser eigener, kann die Rohbytes auslesen.
3. Jeder Datensatz: eigener 12-Byte-IV, AES-GCM, nur Ciphertext in IndexedDB.
4. **Optionale PIN als App-Sperre** (Standard: aus). Die PIN ist eine Zugangshürde in der UI, keine Verschlüsselungsstufe. Gespeichert als PBKDF2-Hash (ca. 100k Iterationen, < 150 ms auf dem iPhone), Wartezeit nach 5 Fehlversuchen. Auto-Lock nur bei aktiver PIN.
5. **Sichtschutz** (Blur im Hintergrund) bleibt optional.
6. **Panik-Löschen** wie im Prompt (Eintippen von „LÖSCHEN“), löscht Datenbank inklusive Schlüssel.

**Was das ehrlich bedeutet (kommt so in die README):**

- Schützt vor: anderen Webseiten, Datenabfluss an Dritte, Klartext in Backups von Browser-Daten, neugierigem Blick ins entsperrte Handy (mit PIN).
- Schützt **nicht** vor: jemandem mit voller Kontrolle über das entsperrte Gerät und technischem Wissen. Dort hilft nur die iPhone-Gerätesperre.
- Die Verschlüsselung macht den Datenbestand an das Gerät und den Browser-Speicher gebunden. Ohne Backup gibt es keine Wiederherstellung.

**Entfällt:** Wiederherstellungscode, Pflicht-Passphrase, „PIN ändern ohne Neuverschlüsselung“ (trivial, weil PIN nicht mitverschlüsselt).

### 2.2 Backup

Ein Backup muss auf einem neuen Gerät lesbar sein, der Geräteschlüssel taugt dafür nicht. Daher:

- Export als `.aya`-Datei: JSON mit `version`, `salt`, `iv`, `ciphertext`.
- Beim Export wählt die Nutzerin ein **Backup-Passwort** (PBKDF2-SHA256, 600k Iterationen, nur hier, einmalig, darf langsam sein). Hinweis: „Ohne dieses Passwort lässt sich das Backup nicht öffnen.“
- Import: Datei wählen, Passwort eingeben, Daten werden mit dem neuen Geräteschlüssel neu verschlüsselt.
- Erinnerung auf „Heute“, wenn das letzte Backup älter als 30 Tage ist (wichtiger als im Prompt, weil es der einzige Weg zurück ist).
- Auf iOS: Export über Teilen-Sheet (`navigator.share` mit Datei, Fallback Download), sodass „In Dateien sichern“ oder AirDrop möglich ist.

### 2.3 Umfang: schlanke erste Version (v1) und „Erweitert“ (v2)

**v1 (Kern):**
- Onboarding (≤ 4 Schritte: Datenschutz-Versprechen → letzte Periode + ungefähre Länge, überspringbar → Modus → Hinweis „Kein Verhütungsmittel, kein Medizinprodukt“; PIN-Angebot als „optional, später in den Einstellungen“)
- Heute-Screen mit Zyklusring, Hauptaussage, Spanne, Konfidenz, „Periode begonnen/beendet“
- Tagesprotokoll: Blutung, Symptome, Stimmung, Energie, Schlaf, Sex, Notiz
- Kalender inkl. Schnellnachtrag vergangener Periodentage
- Vorhersage-Engine A–E aus Prompt §6.2 (inkl. vergessene Periode, Bayes-Kaltstart, 80-%-Intervall, Lutealphase-Default, verspätete Periode, Modi, Gesundheitshinweise)
- Insights: Zykluslänge, Periodendauer, Regularität, Symptom-Muster (F)
- Einstellungen, optionale PIN, Theme, Löschen, Methodik/Quellen
- Backup-Export/-Import, `.ics`-Export
- PWA, offline, Privacy-Check

**v2 (Erweitert, per Schalter „Erweiterte Funktionen“ in den Einstellungen):**
- BBT-Eingabe + 3-über-6-Auswertung + BBT-Kurve
- LH-Test, Schwangerschaftstest, Ausfluss, Medikamente
- Vorhersage-Verfeinerung durch bestätigten Eisprung
- Backtest-Anzeige in den Insights
- CSV-Import/-Export, Druckansicht für Arzttermine

**Wichtig:** Die Engine wird trotzdem **vollständig in v1** gebaut und getestet (inkl. BBT, LH, Backtest), weil die Logik zusammenhängt und Tests billig sind. v2 ist nur UI. Backtest läuft in v1 als Test (Trefferquote 70–90 %), nicht als Anzeige.

### 2.4 Engine-Details (Phase 1)

- **Schrumpfung mit auslaufendem Prior:** Der Prompt nennt `k = 3` fest. Damit würde ein stabiler 32-Tage-Zyklus dauerhaft auf 31 Tage geschätzt. Das Prior-Gewicht für den Mittelwert sinkt deshalb linear von 3 auf 0 bei 6 Zyklen; die Streuung behält `k = 3` (bleibt vorsichtig).
- **Ausschlussgrund `outlier`** ergänzt (Zyklen < 15 oder > 90 Tage), weil das Datenmodell im Prompt dafür keinen Grund hat.
- **FIGO-Regularität ohne Alter:** Grenze 9 Tage (die großzügige), um Fehlalarme zu vermeiden.
- **Symptom-Muster** zusätzlich nur, wenn das Symptom in mindestens der Hälfte der Zyklen in der Phase vorkam.
- **Backtest** auf synthetischen Daten (Normalverteilung 29 ± 2 Tage, 5 Seeds × 40 Zyklen): Intervall-Trefferquote im Zielkorridor 70–90 %, MAE 1–3 Tage.

---

## 3. Architektur

```
src/
  engine/        reine Funktionen: cycles, prediction, ovulation, insights, backtest (+ Tests)
  crypto/        deviceKey, encrypt/decrypt, pin, backupCrypto (+ Tests)
  storage/       idb-Repository, speichert nur {id, iv, ciphertext}
  import-export/ backup (.aya), ics, später csv (+ Tests)
  ui/            screens/, components/, theme/
  i18n/de.ts     alle Texte
scripts/
  privacy-check.ts
```

- **Stack:** Vite, React, TypeScript strict, `vite-plugin-pwa`, `idb`, `date-fns`, Zustand, eigene SVG-Charts (kein recharts, kleiner Bundle).
- **Datenfluss:** UI → Zustand-Store (Klartext nur im RAM) → Repository → encrypt → IndexedDB. Zyklen werden immer aus `DayLog`s abgeleitet (memoisiert), nie gespeichert.
- **Datum:** nur `YYYY-MM-DD`-Strings, Rechnen über eigene Helfer auf UTC-Mitternacht, um DST-Fehler auszuschließen.
- **CSP** wie im Prompt per Meta-Tag. `connect-src 'none'`.
- **Service Worker:** cached nur App-Shell (`globPatterns` ohne Daten), keine Runtime-Caching-Regeln.
- **`navigator.storage.persist()`** beim ersten Eintrag anfragen.
- **Base:** `./` für GitHub Pages.

---

## 4. Design

Über den Skill `Julian-Ivanov/website-bauen`, nur:
- **Phase 1** (Briefing/Richtung), **Phase 3** (Design-System), **Phase 4** (Umsetzung), **Phase 6** (Feinschliff/QA)
- plus `schreibregeln.md` für alle UI-Texte
- SEO und Livegang werden übersprungen (App ist privat, keine Indexierung; zusätzlich `noindex`).

Vorgaben aus Prompt §9 bleiben gültig: warm, ruhig, erwachsen; Rosé/Türkis/Violett; Dark Mode; ≥ 44 px Touch-Ziele; `prefers-reduced-motion`; WCAG AA; neutrales Icon ohne Perioden-Symbol; Systemschriften (keine Webfonts, wegen Zero Network).

Konflikt-Regel: Wenn der Skill etwas Netzwerkabhängiges vorschlägt (Google Fonts, CDN, Analytics), gewinnt Zero Network.

---

## 5. Phasen

| # | Phase | Ergebnis | Check |
|---|---|---|---|
| 0 | Setup | Vite-Projekt, Lint, Vitest, Privacy-Check-Skript, Git | `npm test`, `npm run privacy-check` |
| 1 | Engine | `src/engine` komplett inkl. BBT/LH/Backtest, alle Tests aus Prompt §6.3 | `npm test` |
| 2 | Crypto + Storage | Geräteschlüssel, Repository, Backup-Krypto; Test: kein Klartext in IDB | `npm test` |
| 3 | Design-Grundlage | Skill Phasen 1+3: Richtung, Tokens, Farben, Typo, Komponenten-Basis | Review durch dich |
| 4 | Onboarding + App-Sperre | Onboarding, optionale PIN, Auto-Lock, Sichtschutz | manuell + Tests |
| 5 | Heute + Tagesprotokoll | | |
| 6 | Kalender | inkl. Schnellnachtrag | |
| 7 | Insights | v1-Umfang | |
| 8 | Einstellungen, Backup, ICS, Löschen | | E2E-Teil |
| 9 | PWA + Feinschliff | Skill Phase 4+6, Icons, Offline, iPhone-Test | Flugmodus-Test |
| 10 | E2E + Audit | Playwright-Smoke, Selbst-Audit §2/§4/§6, README | alle Checks grün |
| 11 | v2 „Erweitert“ | BBT/LH-UI, Backtest-Anzeige, CSV, Druckansicht | |

Nach jeder Phase: `npm test`, Commit, kurze Rückmeldung an dich.

---

## 6. Annahmen (selbst getroffen, bitte widersprechen falls falsch)

1. App-Name in UI und auf Homescreen: „aya“. Dateiendung Backup: `.aya`. ICS-Termintitel Standard: „a“.
2. Ein Gerät pro Nutzerin, keine Synchronisation.
3. Keine Altersabfrage im Onboarding (Geburtsjahr optional in Einstellungen, nur für FIGO-Regularitätsgrenze).
4. Standard-Modus: „Zyklus verfolgen“.
5. Kein Server heißt auch: keine Absturzberichte. Fehler sehen wir nur, wenn Nutzerinnen sie melden.
6. iOS löscht Website-Daten nach 7 Tagen ohne Nutzung nur bei Safari-Tabs, nicht bei installierten Homescreen-Apps. Onboarding weist daher deutlich auf „Zum Home-Bildschirm“ hin, und die App erkennt, ob sie im Standalone-Modus läuft.

---

## 7. Offene Punkte

| Punkt | Status |
|---|---|
| Plugin **impeccable** installiert? | **Nein**, lokal nicht gefunden. Muss vor Phase 3 installiert werden. |
| Repo `KonnorVibe/test-a` leer? | **Ja**, verbunden (origin/main). Dateibaum leer, Historie eines Vorprojekts bleibt erhalten. |
| GitHub Pages = öffentlicher Code | Aus meiner Sicht **okay**: Es gibt keine Geheimnisse im Code, die Sicherheit hängt nicht davon ab, dass der Code geheim bleibt. Kostenloses Pages braucht ein öffentliches Repo (privat nur mit GitHub Pro). Daten der Nutzerinnen sind nie im Repo. |
| Schlanke v1, Rest „erweitert“? | **Ja**, empfohlen, siehe §2.3. Engine trotzdem komplett. |
