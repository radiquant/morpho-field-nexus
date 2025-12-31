/**
 * Treatment Sequence Hook
 * Automatische Behandlungssequenz für Meridian-Akupunkturpunkte
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { MeridianImbalance } from './useMeridianDiagnosis';

interface TreatmentPoint {
  id: string;
  meridianId: string;
  meridianName: string;
  pointName: string;
  frequency: number;
  duration: number; // Sekunden
  element: string;
}

interface TreatmentProgress {
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
   * Generiert Behandlungspunkte aus Meridian-Imbalancen
   */
  const generateTreatmentPoints = useCallback((
    imbalances: MeridianImbalance[],
    pointsPerMeridian: number = 2,
    durationPerPoint: number = DEFAULT_POINT_DURATION
  ): TreatmentPoint[] => {
    const points: TreatmentPoint[] = [];

    // Nimm die Top-Imbalancen (max 5 Meridiane)
    const topImbalances = imbalances.slice(0, 5);

    topImbalances.forEach((imbalance) => {
      // Wähle die wichtigsten Punkte pro Meridian
      const selectedPoints = imbalance.recommendedPoints.slice(0, pointsPerMeridian);

      selectedPoints.forEach((pointName, idx) => {
        points.push({
          id: `${imbalance.meridianId}-${pointName}`,
          meridianId: imbalance.meridianId,
          meridianName: imbalance.meridianName,
          pointName,
          frequency: imbalance.frequency,
          duration: durationPerPoint,
          element: imbalance.element,
        });
      });
    });

    return points;
  }, []);

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
