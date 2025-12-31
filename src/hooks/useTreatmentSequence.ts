/**
 * Treatment Sequence Hook
 * Automatische Behandlungssequenz für Meridian-Akupunkturpunkte
 * Mit Impulse/Pause-Verhältnis und zyklischer Wiederholung
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
  dysregulationScore?: number;
  explanation?: string;
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
  // Neu: Impulse/Pause Status
  isImpulsePhase: boolean;
  currentCycle: number;
  totalCycles: number;
  totalTreatmentTime: number; // Gesamtzeit in Sekunden
  elapsedTotalTime: number;
}

export interface TreatmentOptions {
  pointsPerMeridian?: number;
  durationPerPoint?: number;
  totalTreatmentMinutes?: number; // Gesamtbehandlungszeit in Minuten
  impulseSeconds?: number; // Impulsdauer pro Punkt
  pauseSeconds?: number; // Pausendauer zwischen Punkten
  includeExtraordinaryVessels?: boolean;
}

const DEFAULT_POINT_DURATION = 60;
const DEFAULT_IMPULSE_SECONDS = 30;
const DEFAULT_PAUSE_SECONDS = 5;
const DEFAULT_TOTAL_TREATMENT_MINUTES = 15;

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
    isImpulsePhase: true,
    currentCycle: 1,
    totalCycles: 1,
    totalTreatmentTime: 0,
    elapsedTotalTime: 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const treatmentOptionsRef = useRef<TreatmentOptions>({});

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
      Object.entries(VESSEL_INDICATIONS).forEach(([vesselId, indications]) => {
        let score = 0;

        if (imbalance.imbalanceType === 'excess' && ['DU', 'YANGWEI', 'YANGQIAO'].includes(vesselId)) {
          score += imbalance.imbalanceScore * 0.3;
        }

        if (imbalance.imbalanceType === 'deficiency' && ['REN', 'YINQIAO', 'CHONG', 'YINWEI'].includes(vesselId)) {
          score += imbalance.imbalanceScore * 0.3;
        }

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

    return Object.entries(vesselScores)
      .filter(([_, score]) => score > 0.1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);
  }, []);

  /**
   * Generiert Erklärung für dysregulierten Punkt
   */
  const generatePointExplanation = useCallback((
    point: typeof COMPLETE_ACUPUNCTURE_DATABASE[number],
    imbalance: MeridianImbalance
  ): string => {
    const typeLabels = {
      excess: 'Überschuss',
      deficiency: 'Mangel',
      stagnation: 'Stagnation'
    };
    
    return `${typeLabels[imbalance.imbalanceType]} im ${imbalance.meridianName} (${imbalance.element}). ` +
           `Punkt ${point.id} harmonisiert bei ${point.frequency.toFixed(1)} Hz. ` +
           `${point.indications?.slice(0, 2).join(', ') || point.nameGerman}`;
  }, []);

  /**
   * Generiert Behandlungspunkte aus Meridian-Imbalancen
   * Bis zu 9 Punkte pro Meridian möglich
   */
  const generateTreatmentPoints = useCallback((
    imbalances: MeridianImbalance[],
    pointsPerMeridian: number = 3,
    durationPerPoint: number = DEFAULT_POINT_DURATION,
    includeExtraordinaryVessels: boolean = true
  ): TreatmentPoint[] => {
    const points: TreatmentPoint[] = [];
    
    // Limitiere auf max 9 Punkte pro Meridian
    const effectivePointsPerMeridian = Math.min(9, Math.max(1, pointsPerMeridian));

    // Nimm die Top-Imbalancen (max 5 Meridiane)
    const topImbalances = imbalances.slice(0, 5);

    topImbalances.forEach((imbalance) => {
      const meridianPoints = getCompletePointsByMeridian(imbalance.meridianId);
      
      let selectedPoints = meridianPoints;
      if (imbalance.imbalanceType === 'excess') {
        selectedPoints = meridianPoints.filter(p => 
          p.pointTypes?.some(t => ['he_sea', 'xi_cleft', 'luo_connecting'].includes(t))
        );
      } else if (imbalance.imbalanceType === 'deficiency') {
        selectedPoints = meridianPoints.filter(p => 
          p.pointTypes?.some(t => ['yuan_source', 'shu_stream', 'jing_well'].includes(t))
        );
      }
      
      if (selectedPoints.length === 0) {
        selectedPoints = meridianPoints.filter(p => 
          imbalance.recommendedPoints.includes(p.id)
        );
      }
      
      // Bis zu 9 Punkte pro Meridian
      const finalPoints = selectedPoints.length > 0 
        ? selectedPoints.slice(0, effectivePointsPerMeridian)
        : meridianPoints.slice(0, effectivePointsPerMeridian);

      finalPoints.forEach((point) => {
        points.push({
          id: point.id,
          meridianId: imbalance.meridianId,
          meridianName: imbalance.meridianName,
          pointName: `${point.id} - ${point.nameGerman}`,
          frequency: point.frequency,
          duration: durationPerPoint,
          element: point.element,
          isExtraordinaryVessel: false,
          dysregulationScore: imbalance.imbalanceScore,
          explanation: generatePointExplanation(point, imbalance),
        });
      });
    });

    // Füge außerordentliche Gefäße hinzu
    if (includeExtraordinaryVessels) {
      const relevantVessels = selectExtraordinaryVessels(imbalances);
      
      relevantVessels.forEach((vesselId) => {
        const vessel = EXTRAORDINARY_VESSELS[vesselId];
        if (vessel) {
          points.push({
            id: `${vesselId}-opening-${vessel.openingPoint}`,
            meridianId: vesselId,
            meridianName: vessel.name,
            pointName: `${vessel.openingPoint} (Öffnungspunkt)`,
            frequency: vessel.frequency,
            duration: durationPerPoint,
            element: 'extraordinary',
            isExtraordinaryVessel: true,
            explanation: `Außerordentliches Gefäß ${vessel.name}: Öffnet den Energiefluss`,
          });

          points.push({
            id: `${vesselId}-coupled-${vessel.coupledPoint}`,
            meridianId: vesselId,
            meridianName: vessel.name,
            pointName: `${vessel.coupledPoint} (Gekoppelter Punkt)`,
            frequency: vessel.frequency,
            duration: durationPerPoint,
            element: 'extraordinary',
            isExtraordinaryVessel: true,
            explanation: `Gekoppelter Punkt verstärkt die Wirkung von ${vessel.openingPoint}`,
          });

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
              explanation: `Schlüsselpunkt für ${vessel.name}`,
            });
          }
        }
      });
    }

    return points;
  }, [selectExtraordinaryVessels, generatePointExplanation]);

  /**
   * Startet den Oszillator für eine Frequenz
   */
  const startOscillator = useCallback((frequency: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      stopOscillator();

      const ctx = audioContextRef.current;
      
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
    } catch (error) {
      console.error('Error starting oscillator:', error);
      toast.error('Audio-Fehler beim Starten');
    }
  }, []);

  /**
   * Stoppt den aktuellen Oszillator (mit Fade-out)
   */
  const stopOscillator = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      try {
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
   * Wechselt zum nächsten Behandlungspunkt oder startet neuen Zyklus
   */
  const moveToNextPoint = useCallback(() => {
    setProgress((prev) => {
      const options = treatmentOptionsRef.current;
      const totalTreatmentSeconds = (options.totalTreatmentMinutes || DEFAULT_TOTAL_TREATMENT_MINUTES) * 60;
      
      const nextIndex = prev.currentPointIndex + 1;

      // Prüfe ob Gesamtzeit erreicht ist
      if (prev.elapsedTotalTime >= totalTreatmentSeconds) {
        stopOscillator();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        toast.success('Behandlungssequenz abgeschlossen!', {
          description: `${prev.currentCycle} Zyklen durchlaufen`
        });
        return {
          ...prev,
          isPlaying: false,
          isComplete: true,
          overallProgress: 100,
        };
      }

      // Ende eines Zyklus - starte neuen Zyklus
      if (nextIndex >= prev.totalPoints) {
        const firstPoint = treatmentPoints[0];
        if (firstPoint) {
          startOscillator(firstPoint.frequency);
          toast.info(`Zyklus ${prev.currentCycle + 1} gestartet`);
        }
        
        return {
          ...prev,
          currentPointIndex: 0,
          currentPoint: firstPoint || null,
          elapsedTime: 0,
          remainingTime: firstPoint?.duration || 0,
          currentCycle: prev.currentCycle + 1,
          isImpulsePhase: true,
        };
      }

      // Nächster Punkt im aktuellen Zyklus
      const nextPoint = treatmentPoints[nextIndex];
      if (nextPoint) {
        startOscillator(nextPoint.frequency);
        toast.info(`${nextPoint.meridianName}: ${nextPoint.pointName}`);
      }

      return {
        ...prev,
        currentPointIndex: nextIndex,
        currentPoint: nextPoint || null,
        elapsedTime: 0,
        remainingTime: nextPoint?.duration || 0,
        isImpulsePhase: true,
      };
    });
  }, [treatmentPoints, startOscillator, stopOscillator]);

  /**
   * Timer-Tick mit Impulse/Pause-Logik
   */
  const tick = useCallback(() => {
    setProgress((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.isComplete) {
        return prev;
      }

      const options = treatmentOptionsRef.current;
      const impulseSeconds = options.impulseSeconds || DEFAULT_IMPULSE_SECONDS;
      const pauseSeconds = options.pauseSeconds || DEFAULT_PAUSE_SECONDS;
      const pointDuration = impulseSeconds + pauseSeconds;
      const totalTreatmentSeconds = (options.totalTreatmentMinutes || DEFAULT_TOTAL_TREATMENT_MINUTES) * 60;

      const newElapsed = prev.elapsedTime + 1;
      const newTotalElapsed = prev.elapsedTotalTime + 1;

      // Wechsel zwischen Impuls und Pause
      const isImpulsePhase = newElapsed <= impulseSeconds;
      
      // Audio entsprechend steuern
      if (!isImpulsePhase && prev.isImpulsePhase && gainNodeRef.current && audioContextRef.current) {
        // Wechsel zu Pause - Audio leiser
        gainNodeRef.current.gain.linearRampToValueAtTime(0.05, audioContextRef.current.currentTime + 0.2);
      } else if (isImpulsePhase && !prev.isImpulsePhase && gainNodeRef.current && audioContextRef.current) {
        // Wechsel zu Impuls - Audio lauter
        gainNodeRef.current.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.2);
      }

      // Punkt abgeschlossen
      if (newElapsed >= pointDuration) {
        setTimeout(() => moveToNextPoint(), 0);
        return { ...prev, elapsedTotalTime: newTotalElapsed };
      }

      // Gesamtfortschritt berechnen
      const overallProgress = (newTotalElapsed / totalTreatmentSeconds) * 100;

      return {
        ...prev,
        elapsedTime: newElapsed,
        remainingTime: pointDuration - newElapsed,
        elapsedTotalTime: newTotalElapsed,
        overallProgress: Math.min(100, overallProgress),
        isImpulsePhase,
      };
    });
  }, [moveToNextPoint]);

  /**
   * Startet die Behandlungssequenz mit Impulse/Pause-Logik
   */
  const startSequence = useCallback((imbalances: MeridianImbalance[], options?: TreatmentOptions) => {
    const effectiveOptions: TreatmentOptions = {
      pointsPerMeridian: options?.pointsPerMeridian ?? 3,
      durationPerPoint: (options?.impulseSeconds || DEFAULT_IMPULSE_SECONDS) + (options?.pauseSeconds || DEFAULT_PAUSE_SECONDS),
      totalTreatmentMinutes: options?.totalTreatmentMinutes ?? DEFAULT_TOTAL_TREATMENT_MINUTES,
      impulseSeconds: options?.impulseSeconds ?? DEFAULT_IMPULSE_SECONDS,
      pauseSeconds: options?.pauseSeconds ?? DEFAULT_PAUSE_SECONDS,
      includeExtraordinaryVessels: options?.includeExtraordinaryVessels ?? true,
    };
    
    treatmentOptionsRef.current = effectiveOptions;
    
    const points = generateTreatmentPoints(
      imbalances,
      effectiveOptions.pointsPerMeridian,
      effectiveOptions.durationPerPoint,
      effectiveOptions.includeExtraordinaryVessels
    );

    if (points.length === 0) {
      toast.warning('Keine Behandlungspunkte verfügbar');
      return;
    }

    setTreatmentPoints(points);

    const firstPoint = points[0];
    startOscillator(firstPoint.frequency);
    
    const totalTreatmentSeconds = (effectiveOptions.totalTreatmentMinutes || DEFAULT_TOTAL_TREATMENT_MINUTES) * 60;
    const pointDuration = (effectiveOptions.impulseSeconds || DEFAULT_IMPULSE_SECONDS) + 
                          (effectiveOptions.pauseSeconds || DEFAULT_PAUSE_SECONDS);
    const estimatedCycles = Math.ceil(totalTreatmentSeconds / (points.length * pointDuration));

    setProgress({
      currentPointIndex: 0,
      totalPoints: points.length,
      currentPoint: firstPoint,
      elapsedTime: 0,
      remainingTime: pointDuration,
      isPlaying: true,
      isPaused: false,
      isComplete: false,
      overallProgress: 0,
      isImpulsePhase: true,
      currentCycle: 1,
      totalCycles: estimatedCycles,
      totalTreatmentTime: totalTreatmentSeconds,
      elapsedTotalTime: 0,
    });

    toast.success(`Behandlung gestartet`, {
      description: `${points.length} Punkte, ${effectiveOptions.totalTreatmentMinutes} Min. Gesamtzeit`
    });

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
      isImpulsePhase: true,
      currentCycle: 1,
      totalCycles: 1,
      totalTreatmentTime: 0,
      elapsedTotalTime: 0,
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
      isImpulsePhase: true,
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
