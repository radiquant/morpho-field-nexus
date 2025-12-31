/**
 * Treatment Sequence Hook
 * Automatische Behandlungssequenz für Meridian-Akupunkturpunkte
 * Nutzt die vollständige WHO-409-Punkte-Datenbank
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { MeridianImbalance, EXTRAORDINARY_VESSELS } from './useMeridianDiagnosis';
import { 
  COMPLETE_ACUPUNCTURE_DATABASE, 
  getCompletePointsByMeridian,
  getPointsByIndication 
} from '@/utils/meridianPoints';

export interface TreatmentPoint {
  id: string;
  meridianId: string;
  meridianName: string;
  pointName: string;
  frequency: number;
  duration: number; // Sekunden
  element: string;
  isExtraordinaryVessel?: boolean;
}

export interface TreatmentProgress {
  currentPointIndex: number;
  totalPoints: number;
  currentPoint: TreatmentPoint | null;
  elapsedTime: number;
  remainingTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  overallProgress: number;
}

const DEFAULT_POINT_DURATION = 60; // 60 Sekunden pro Punkt

// Mapping von Symptomen/Zuständen zu außerordentlichen Gefäßen
const VESSEL_INDICATIONS: Record<string, string[]> = {
  DU: ['stress', 'mental', 'spine', 'yang_deficiency'],
  REN: ['emotional', 'yin_deficiency', 'fertility', 'breathing'],
  CHONG: ['blood_deficiency', 'heart', 'menstruation'],
  DAI: ['hip', 'lower_body', 'leukorrhea'],
  YANGQIAO: ['insomnia', 'epilepsy', 'eye', 'yang_excess'],
  YINQIAO: ['hypersomnia', 'yin_deficiency', 'eye'],
  YANGWEI: ['fever', 'external_pathogen', 'neck'],
  YINWEI: ['anxiety', 'heart', 'chest', 'emotional'],
};

export function useTreatmentSequence() {
  const [treatmentPoints, setTreatmentPoints] = useState<TreatmentPoint[]>([]);
  const [progress, setProgress] = useState<TreatmentProgress>({
    currentPointIndex: 0,
    totalPoints: 0,
    currentPoint: null,
    elapsedTime: 0,
    remainingTime: 0,
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    overallProgress: 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopOscillator();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Ermittelt relevante außerordentliche Gefäße basierend auf Imbalancen
   */
  const selectExtraordinaryVessels = useCallback((
    imbalances: MeridianImbalance[]
  ): string[] => {
    const vesselScores: Record<string, number> = {};

    imbalances.forEach((imbalance) => {
      // Prüfe jedes Gefäß auf Relevanz
      Object.entries(VESSEL_INDICATIONS).forEach(([vesselId, indications]) => {
        let score = 0;

        // Stress -> DU, YANGWEI
        if (imbalance.imbalanceType === 'excess' && ['DU', 'YANGWEI', 'YANGQIAO'].includes(vesselId)) {
          score += imbalance.imbalanceScore * 0.3;
        }

        // Deficiency -> REN, YINQIAO, CHONG
        if (imbalance.imbalanceType === 'deficiency' && ['REN', 'YINQIAO', 'CHONG', 'YINWEI'].includes(vesselId)) {
          score += imbalance.imbalanceScore * 0.3;
        }

        // Element-spezifische Zuordnungen
        if (imbalance.element === 'water' && ['REN', 'KI'].includes(imbalance.meridianId)) {
          if (['REN', 'YINQIAO'].includes(vesselId)) score += 0.2;
        }
        if (imbalance.element === 'fire' && ['YINWEI', 'CHONG'].includes(vesselId)) {
          score += 0.15;
        }
        if (imbalance.element === 'wood' && imbalance.imbalanceType === 'stagnation') {
          if (['DAI', 'CHONG'].includes(vesselId)) score += 0.2;
        }

        vesselScores[vesselId] = (vesselScores[vesselId] || 0) + score;
      });
    });

    // Wähle die relevantesten Gefäße (max 3)
    return Object.entries(vesselScores)
      .filter(([_, score]) => score > 0.1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);
  }, []);

  /**
   * Generiert Behandlungspunkte aus Meridian-Imbalancen
   * Nutzt die vollständige WHO-409-Punkte-Datenbank
   */
  const generateTreatmentPoints = useCallback((
    imbalances: MeridianImbalance[],
    pointsPerMeridian: number = 2,
    durationPerPoint: number = DEFAULT_POINT_DURATION,
    includeExtraordinaryVessels: boolean = true
  ): TreatmentPoint[] => {
    const points: TreatmentPoint[] = [];

    // Nimm die Top-Imbalancen (max 5 Meridiane)
    const topImbalances = imbalances.slice(0, 5);

    topImbalances.forEach((imbalance) => {
      // Hole alle Punkte dieses Meridians aus der WHO-Datenbank
      const meridianPoints = getCompletePointsByMeridian(imbalance.meridianId);
      
      // Filtere nach Punkttypen basierend auf Imbalance-Typ
      let selectedPoints = meridianPoints;
      if (imbalance.imbalanceType === 'excess') {
        // Bei Überschuss: Sedierungspunkte und He-Sea-Punkte
        selectedPoints = meridianPoints.filter(p => 
          p.pointTypes?.some(t => ['he_sea', 'xi_cleft', 'luo_connecting'].includes(t))
        );
      } else if (imbalance.imbalanceType === 'deficiency') {
        // Bei Mangel: Tonisierungspunkte und Yuan-Punkte
        selectedPoints = meridianPoints.filter(p => 
          p.pointTypes?.some(t => ['yuan_source', 'shu_stream', 'jing_well'].includes(t))
        );
      }
      
      // Fallback auf empfohlene Punkte wenn keine speziellen gefunden
      if (selectedPoints.length === 0) {
        selectedPoints = meridianPoints.filter(p => 
          imbalance.recommendedPoints.includes(p.id)
        );
      }
      
      // Nimm die ersten X Punkte
      const finalPoints = selectedPoints.length > 0 
        ? selectedPoints.slice(0, pointsPerMeridian)
        : meridianPoints.slice(0, pointsPerMeridian);

      finalPoints.forEach((point) => {
        points.push({
          id: point.id,
          meridianId: imbalance.meridianId,
          meridianName: imbalance.meridianName,
          pointName: `${point.id} - ${point.nameGerman}`,
          frequency: point.frequency, // Nutze die spezifische Punkt-Frequenz aus der WHO-DB
          duration: durationPerPoint,
          element: point.element,
          isExtraordinaryVessel: false,
        });
      });
    });

    // Füge außerordentliche Gefäße hinzu
    if (includeExtraordinaryVessels) {
      const relevantVessels = selectExtraordinaryVessels(imbalances);
      
      relevantVessels.forEach((vesselId) => {
        const vessel = EXTRAORDINARY_VESSELS[vesselId];
        if (vessel) {
          // Öffnungspunkt
          points.push({
            id: `${vesselId}-opening-${vessel.openingPoint}`,
            meridianId: vesselId,
            meridianName: vessel.name,
            pointName: `${vessel.openingPoint} (Öffnungspunkt)`,
            frequency: vessel.frequency,
            duration: durationPerPoint,
            element: 'extraordinary',
            isExtraordinaryVessel: true,
          });

          // Gekoppelter Punkt
          points.push({
            id: `${vesselId}-coupled-${vessel.coupledPoint}`,
            meridianId: vesselId,
            meridianName: vessel.name,
            pointName: `${vessel.coupledPoint} (Gekoppelter Punkt)`,
            frequency: vessel.frequency,
            duration: durationPerPoint,
            element: 'extraordinary',
            isExtraordinaryVessel: true,
          });

          // Ein Schlüsselpunkt
          if (vessel.keyPoints[0]) {
            points.push({
              id: `${vesselId}-key-${vessel.keyPoints[0]}`,
              meridianId: vesselId,
              meridianName: vessel.name,
              pointName: vessel.keyPoints[0],
              frequency: vessel.frequency,
              duration: durationPerPoint,
              element: 'extraordinary',
              isExtraordinaryVessel: true,
            });
          }
        }
      });
    }

    return points;
  }, [selectExtraordinaryVessels]);

  /**
   * Startet den Oszillator für eine Frequenz
   */
  const startOscillator = useCallback((frequency: number) => {
    try {
      // Erstelle AudioContext falls nötig
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Stoppe vorherigen Oszillator
      stopOscillator();

      const ctx = audioContextRef.current;
      
      // Erstelle Oszillator
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Erstelle Gain Node für Lautstärkekontrolle
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5); // Fade in

      // Verbinde Nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Starte
      oscillator.start();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
    } catch (error) {
      console.error('Error starting oscillator:', error);
      toast.error('Audio-Fehler beim Starten');
    }
  }, []);

  /**
   * Stoppt den aktuellen Oszillator
   */
  const stopOscillator = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      try {
        // Fade out
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0,
          audioContextRef.current.currentTime + 0.3
        );
      } catch (e) {
        // Ignore
      }
    }

    if (oscillatorRef.current) {
      try {
        setTimeout(() => {
          oscillatorRef.current?.stop();
          oscillatorRef.current?.disconnect();
          oscillatorRef.current = null;
        }, 300);
      } catch (e) {
        oscillatorRef.current = null;
      }
    }
  }, []);

  /**
   * Wechselt zum nächsten Behandlungspunkt
   */
  const moveToNextPoint = useCallback(() => {
    setProgress((prev) => {
      const nextIndex = prev.currentPointIndex + 1;

      if (nextIndex >= prev.totalPoints) {
        // Behandlung abgeschlossen
        stopOscillator();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        toast.success('Behandlungssequenz abgeschlossen!');
        return {
          ...prev,
          isPlaying: false,
          isComplete: true,
          overallProgress: 100,
        };
      }

      const nextPoint = treatmentPoints[nextIndex];
      if (nextPoint) {
        startOscillator(nextPoint.frequency);
        toast.info(`${nextPoint.meridianName}: ${nextPoint.pointName} (${nextPoint.frequency} Hz)`);
      }

      return {
        ...prev,
        currentPointIndex: nextIndex,
        currentPoint: nextPoint || null,
        elapsedTime: 0,
        remainingTime: nextPoint?.duration || 0,
      };
    });
  }, [treatmentPoints, startOscillator, stopOscillator]);

  /**
   * Timer-Tick für Progress-Update
   */
  const tick = useCallback(() => {
    setProgress((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.isComplete) {
        return prev;
      }

      const newElapsed = prev.elapsedTime + 1;
      const pointDuration = prev.currentPoint?.duration || DEFAULT_POINT_DURATION;

      if (newElapsed >= pointDuration) {
        // Punkt abgeschlossen, zum nächsten wechseln
        setTimeout(() => moveToNextPoint(), 0);
        return prev;
      }

      const totalDuration = treatmentPoints.reduce((sum, p) => sum + p.duration, 0);
      const completedDuration = treatmentPoints
        .slice(0, prev.currentPointIndex)
        .reduce((sum, p) => sum + p.duration, 0);
      const overallProgress = ((completedDuration + newElapsed) / totalDuration) * 100;

      return {
        ...prev,
        elapsedTime: newElapsed,
        remainingTime: pointDuration - newElapsed,
        overallProgress,
      };
    });
  }, [treatmentPoints, moveToNextPoint]);

  /**
   * Startet die Behandlungssequenz
   */
  const startSequence = useCallback((imbalances: MeridianImbalance[], options?: {
    pointsPerMeridian?: number;
    durationPerPoint?: number;
  }) => {
    const points = generateTreatmentPoints(
      imbalances,
      options?.pointsPerMeridian ?? 2,
      options?.durationPerPoint ?? DEFAULT_POINT_DURATION
    );

    if (points.length === 0) {
      toast.warning('Keine Behandlungspunkte verfügbar');
      return;
    }

    setTreatmentPoints(points);

    const firstPoint = points[0];
    startOscillator(firstPoint.frequency);

    setProgress({
      currentPointIndex: 0,
      totalPoints: points.length,
      currentPoint: firstPoint,
      elapsedTime: 0,
      remainingTime: firstPoint.duration,
      isPlaying: true,
      isPaused: false,
      isComplete: false,
      overallProgress: 0,
    });

    toast.success(`Behandlungssequenz gestartet: ${points.length} Punkte`);

    // Starte Timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(tick, 1000);
  }, [generateTreatmentPoints, startOscillator, tick]);

  /**
   * Pausiert die Behandlung
   */
  const pauseSequence = useCallback(() => {
    stopOscillator();
    setProgress((prev) => ({ ...prev, isPaused: true, isPlaying: false }));
    toast.info('Behandlung pausiert');
  }, [stopOscillator]);

  /**
   * Setzt die Behandlung fort
   */
  const resumeSequence = useCallback(() => {
    if (progress.currentPoint) {
      startOscillator(progress.currentPoint.frequency);
    }
    setProgress((prev) => ({ ...prev, isPaused: false, isPlaying: true }));
    toast.info('Behandlung fortgesetzt');
  }, [progress.currentPoint, startOscillator]);

  /**
   * Stoppt die Behandlung
   */
  const stopSequence = useCallback(() => {
    stopOscillator();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress({
      currentPointIndex: 0,
      totalPoints: 0,
      currentPoint: null,
      elapsedTime: 0,
      remainingTime: 0,
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      overallProgress: 0,
    });
    setTreatmentPoints([]);
    toast.info('Behandlung abgebrochen');
  }, [stopOscillator]);

  /**
   * Springt zu einem bestimmten Punkt
   */
  const skipToPoint = useCallback((index: number) => {
    if (index < 0 || index >= treatmentPoints.length) return;

    const point = treatmentPoints[index];
    startOscillator(point.frequency);

    setProgress((prev) => ({
      ...prev,
      currentPointIndex: index,
      currentPoint: point,
      elapsedTime: 0,
      remainingTime: point.duration,
    }));

    toast.info(`Springe zu: ${point.meridianName} - ${point.pointName}`);
  }, [treatmentPoints, startOscillator]);

  return {
    treatmentPoints,
    progress,
    startSequence,
    pauseSequence,
    resumeSequence,
    stopSequence,
    skipToPoint,
    generateTreatmentPoints,
  };
}
