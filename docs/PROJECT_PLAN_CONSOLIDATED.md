# Feldengine – Konsolidierter Projektplan
> Stand: 2026-03-05

---

## Priorisierte Aufgabenliste (Optimal geordnet)

### 🔴 Priorität 1 – Kritische Bugs (Blockierend)

| # | Aufgabe | Status | Beschreibung |
|---|---------|--------|-------------|
| 1.1 | **Z-Anatomy GLB Ladefehler beheben** | ⬜ Offen | Wechsel auf Z-Anatomy Modell erzeugt 400-Error + Crash + Auto-Logout. Ursache: Datei `z-anatomy-male-full.glb` fehlt im Storage-Bucket oder Pfad falsch. Muss Error-Boundary + Fallback implementieren. |
| 1.2 | **NLS-Dysregulation Schwelle nie erreicht** | ⬜ Offen | Harmonisierungs-Panel zeigt immer "Keine signifikant dysregulierten NLS-Punkte (Schwelle > 2.5/6)". Scan-Ergebnisse werden nicht korrekt an Harmonisierung weitergegeben oder Schwelle zu hoch. Debugging + Fix erforderlich. |
| 1.3 | **Meridian-Ansicht Freeze/Performance** | ⬜ Offen | Aktivierung der Meridiane im Ganzkörpermodell lässt den View einfrieren (Überlastung durch zu viele/große Punkte). Meridianpunkte zu groß skaliert → verkleinern + Performance-Optimierung (Instancing/LOD). |

### 🟠 Priorität 2 – UX/Layout-Korrekturen

| # | Aufgabe | Status | Beschreibung |
|---|---------|--------|-------------|
| 2.1 | **NLS-Konfiguration Position verschieben** | ⬜ Offen | NLS Scan-Config Panel muss oben links unter Klient-Auswahl platziert werden, nicht innerhalb des 3D-Viewers, damit die Zuordnung klar ist. |
| 2.2 | **Rechte Spalte verbreitern** | ⬜ Offen | "3D Anatomie-Resonanz" und "3D Trajektorien-Visualisierung" – rechte Spalte leicht verbreitern für bessere 3D-Darstellung. |
| 2.3 | **3D Bibliothek Kategorien redesignen** | ⬜ Offen | Gruppen "Ganzkörper, Organe etc." kaum lesbar, nebeneinander gequetscht. → Dropdown/Select oder vertikale Tabs mit klaren Labels und Icons. |
| 2.4 | **Organ- & Chakra-Punkte Alignment** | ⬜ Offen | Punkte stimmen im Standard-Vollkörpermodell nicht mit dem Körper überein. Surface-Projection-System (`surfaceProjection.ts`) konsequent für alle Punkt-Typen nutzen, nicht nur Meridiane. |

### 🟡 Priorität 3 – Feature-Erweiterungen (Laufend)

| # | Aufgabe | Status | Beschreibung |
|---|---------|--------|-------------|
| 3.1 | **NLS-Punkte auf ~160 erweitern** | ⬜ Offen | Neue Organsysteme: Wirbelsäule (24), Lymphsystem (10), Urogenital (20), Nebenniere (6), Sinnesorgane (12). Basierend auf BodyParts3D Koordinaten. |
| 3.2 | **Automatischer NLS-Scan-Durchlauf** | ⬜ Offen | Sequenziell alle konfigurierten Punkte scannen mit Fortschrittsanzeige und Echtzeit-Visualisierung im 3D-Viewer (Metatron-Style). |

### 🟢 Priorität 4 – Phasenplan (Offene Phasen)

| Phase | Aufgabe | Status |
|-------|---------|--------|
| **Phase 3** | Session-Management & Persistenz | ⬜ Offen |
| **Phase 4** | Resonanz-Ergebnis-DB | ⬜ Offen |
| **Phase 4b** | Remedy-Datenbank | ⬜ Offen |
| **Phase 5** | Harmonisierungsmanager (Verfeinerung) | 🔄 In Arbeit |
| **Phase 6** | TCM/Wu-Xing Trendanalytik | ⬜ Offen |
| **Phase 7** | Berichtswesen (PDF/HTML) | ⬜ Offen |
| **Phase 8** | NLS-Workflows (Erweiterung) | 🔄 In Arbeit |
| **Phase 9** | Performance & GPU-Optimierung | ⬜ Offen |
| **Phase 10** | Security Audit | ⬜ Offen |

---

## Empfohlene Reihenfolge für nächste Session

1. **1.1** Z-Anatomy Fehler + Error-Boundary (verhindert Crash)
2. **1.2** NLS-Dysregulation Datenfluss fixen (Kernfunktionalität)
3. **1.3** Meridian-Freeze + Punkt-Skalierung (Performance)
4. **2.4** Organ/Chakra Surface-Projection Alignment
5. **2.1** NLS-Config Position verschieben
6. **2.2** Rechte Spalte verbreitern
7. **2.3** Bibliothek-Kategorien Redesign
8. **3.1** NLS-Punkte erweitern (Migration)
9. **3.2** Automatischer Scan-Durchlauf
