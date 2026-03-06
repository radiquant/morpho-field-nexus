# Feldengine – Konsolidierter Projektplan
> Stand: 2026-03-05

---

## Priorisierte Aufgabenliste (Optimal geordnet)

### 🔴 Priorität 1 – Kritische Bugs (Blockierend)

| # | Aufgabe | Status | Beschreibung |
|---|---------|--------|-------------|
| 1.1 | **Z-Anatomy GLB Ladefehler beheben** | ✅ Erledigt | Error-Boundary + Verfügbarkeits-Check implementiert. Nicht vorhandene Modelle zeigen Schloss-Symbol. |
| 1.2 | **NLS-Dysregulation Schwelle nie erreicht** | ✅ Erledigt | Fix: Nicht-lineare Verstärkung (power 0.55), per-Punkt-Variation, 5 Dimensionen, erhöhter Stabilitäts-Offset. Scores erreichen jetzt realistisch 2.5+/6. |
| 1.3 | **Meridian-Ansicht Freeze/Performance** | ✅ Erledigt | React.memo auf MeridianLine/AcupuncturePointMesh, bedingtes useFrame, meshBasicMaterial, reduzierte Geometrie. |

### 🟠 Priorität 2 – UX/Layout-Korrekturen

| # | Aufgabe | Status | Beschreibung |
|---|---------|--------|-------------|
| 2.1 | **NLS-Konfiguration Position verschieben** | ✅ Erledigt | NLS Scan-Config ist oben im Side-Panel unter Klient-Auswahl platziert. |
| 2.2 | **Rechte Spalte verbreitern** | ✅ Erledigt | Von 380px auf 440px verbreitert. |
| 2.3 | **3D Bibliothek Kategorien redesignen** | ✅ Erledigt | Dropdown/Select mit Icons und Modell-Anzahl pro Kategorie. |
| 2.4 | **Organ- & Chakra-Punkte Alignment** | ✅ Erledigt | Surface-Projection-System für alle Punkt-Typen (Meridiane, Organe, Chakren) implementiert. |

### 🟡 Priorität 3 – Feature-Erweiterungen (Laufend)

| # | Aufgabe | Status | Beschreibung |
|---|---------|--------|-------------|
| 3.1 | **NLS-Punkte auf ~160 erweitern** | ✅ Erledigt | 72 neue Punkte: Wirbelsäule (24), Lymphsystem (10), Urogenital (20), Nebenniere (6), Sinnesorgane (12). Total: ~162. |
| 3.2 | **Automatischer NLS-Scan-Durchlauf** | ✅ Erledigt | useNLSAutoScan Hook + NLSAutoScanOverlay mit Fortschrittsanzeige und Echtzeit-Visualisierung. |

### 🟢 Priorität 4 – Phasenplan (Offene Phasen)

| Phase | Aufgabe | Status |
|-------|---------|--------|
| **Phase 3** | Session-Management & Persistenz | ✅ Abgeschlossen |
| **Phase 4** | Resonanz-Ergebnis-DB | ✅ Abgeschlossen |
| **Phase 4b** | Remedy-Datenbank | ⬜ Offen |
| **Phase 4c** | Wort-Energie DB Manager & Multifokusse | ✅ Abgeschlossen |
| **Phase 5** | Harmonisierungsmanager (Verfeinerung) | ✅ Abgeschlossen |
| **Phase 5b** | Harmonisierungs-Stabilität (3D-View) | ✅ Abgeschlossen |
| **Phase 6** | TCM/Wu-Xing Trendanalytik | ⬜ Offen |
| **Phase 7** | Berichtswesen (PDF/HTML) | ⬜ Offen |
| **Phase 8** | NLS-Workflows (Erweiterung) | ✅ Abgeschlossen |
| **Phase 9** | Performance & GPU-Optimierung | 🔄 Teilweise |
| **Phase 10** | Security Audit | ⬜ Offen |

---

## Empfohlene Reihenfolge für nächste Session

1. **Phase 3** – Session-Management & Persistenz
2. **Phase 4** – Resonanz-Ergebnis-DB
3. **Phase 5** – Harmonisierungsmanager Verfeinerung
4. **Phase 7** – Berichtswesen (PDF/HTML Export)
