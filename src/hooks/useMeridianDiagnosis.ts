/**
 * Meridian-Diagnose Hook
 * Analysiert Client-Vektoren und identifiziert unausgeglichene Meridiane
 */
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { VectorAnalysis } from '@/services/feldengine';

// TCM Elemente mit ihren Zuordnungen
const ELEMENT_MERIDIAN_MAP = {
  wood: { 
    yin: 'LR', yang: 'GB',
    emotions: ['anger', 'frustration', 'resentment'],
    physical: ['eyes', 'tendons', 'nails'],
    season: 'spring'
  },
  fire: { 
    yin: 'HT', yang: 'SI',
    emotions: ['joy', 'anxiety', 'mania'],
    physical: ['tongue', 'blood vessels', 'complexion'],
    season: 'summer'
  },
  fire_ministerial: { 
    yin: 'PC', yang: 'TE',
    emotions: ['elation', 'shock'],
    physical: ['circulation', 'hormones'],
    season: 'summer'
  },
  earth: { 
    yin: 'SP', yang: 'ST',
    emotions: ['worry', 'pensiveness', 'overthinking'],
    physical: ['muscles', 'mouth', 'lips'],
    season: 'late_summer'
  },
  metal: { 
    yin: 'LU', yang: 'LI',
    emotions: ['grief', 'sadness', 'letting_go'],
    physical: ['skin', 'nose', 'body_hair'],
    season: 'autumn'
  },
  water: { 
    yin: 'KI', yang: 'BL',
    emotions: ['fear', 'willpower', 'wisdom'],
    physical: ['bones', 'ears', 'head_hair'],
    season: 'winter'
  },
};

export interface MeridianImbalance {
  meridianId: string;
  meridianName: string;
  element: string;
  yinYang: 'yin' | 'yang';
  imbalanceScore: number;
  imbalanceType: 'excess' | 'deficiency' | 'stagnation';
  affectedOrgan: string;
  recommendedPoints: string[];
  frequency: number;
}

export interface DiagnosisResult {
  imbalances: MeridianImbalance[];
  primaryElement: string;
  controllingElement: string;
  supportingElement: string;
  overallPattern: string;
  aiRecommendation?: string;
}

// Meridian-Daten für die Diagnose
const MERIDIAN_DATA: Record<string, { 
  name: string; 
  organ: string; 
  element: string;
  yinYang: 'yin' | 'yang';
  frequency: number;
  keyPoints: string[];
}> = {
  LU: { name: 'Lungen-Meridian', organ: 'Lunge', element: 'metal', yinYang: 'yin', frequency: 194.7, keyPoints: ['LU1', 'LU7', 'LU9'] },
  LI: { name: 'Dickdarm-Meridian', organ: 'Dickdarm', element: 'metal', yinYang: 'yang', frequency: 174.6, keyPoints: ['LI4', 'LI11', 'LI20'] },
  ST: { name: 'Magen-Meridian', organ: 'Magen', element: 'earth', yinYang: 'yang', frequency: 126.2, keyPoints: ['ST36', 'ST25', 'ST44'] },
  SP: { name: 'Milz-Meridian', organ: 'Milz', element: 'earth', yinYang: 'yin', frequency: 117.3, keyPoints: ['SP6', 'SP9', 'SP3'] },
  HT: { name: 'Herz-Meridian', organ: 'Herz', element: 'fire', yinYang: 'yin', frequency: 250.6, keyPoints: ['HT7', 'HT3', 'HT5'] },
  SI: { name: 'Dünndarm-Meridian', organ: 'Dünndarm', element: 'fire', yinYang: 'yang', frequency: 185.0, keyPoints: ['SI3', 'SI19', 'SI11'] },
  BL: { name: 'Blasen-Meridian', organ: 'Blase', element: 'water', yinYang: 'yang', frequency: 194.2, keyPoints: ['BL23', 'BL40', 'BL60'] },
  KI: { name: 'Nieren-Meridian', organ: 'Niere', element: 'water', yinYang: 'yin', frequency: 160.0, keyPoints: ['KI1', 'KI3', 'KI7'] },
  PC: { name: 'Perikard-Meridian', organ: 'Perikard', element: 'fire_ministerial', yinYang: 'yin', frequency: 183.6, keyPoints: ['PC6', 'PC8', 'PC3'] },
  TE: { name: 'Dreifacher Erwärmer', organ: 'San Jiao', element: 'fire_ministerial', yinYang: 'yang', frequency: 176.0, keyPoints: ['TE5', 'TE17', 'TE3'] },
  GB: { name: 'Gallenblasen-Meridian', organ: 'Gallenblase', element: 'wood', yinYang: 'yang', frequency: 164.8, keyPoints: ['GB20', 'GB34', 'GB41'] },
  LR: { name: 'Leber-Meridian', organ: 'Leber', element: 'wood', yinYang: 'yin', frequency: 183.6, keyPoints: ['LR3', 'LR14', 'LR8'] },
};

// Wu Xing Zyklen
const GENERATION_CYCLE = ['wood', 'fire', 'earth', 'metal', 'water']; // Sheng-Zyklus
const CONTROL_CYCLE = { // Ke-Zyklus
  wood: 'earth',
  fire: 'metal',
  earth: 'water',
  metal: 'wood',
  water: 'fire',
};

export function useMeridianDiagnosis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  /**
   * Berechnet Meridian-Imbalancen basierend auf dem Client-Vektor
   */
  const calculateImbalances = useCallback((vectorAnalysis: VectorAnalysis): MeridianImbalance[] => {
    const imbalances: MeridianImbalance[] = [];
    const dimensions = vectorAnalysis.clientVector.dimensions;
    
    // Extrahiere Dimensionswerte
    const physical = dimensions[0] || 0;
    const emotional = dimensions[1] || 0;
    const stress = dimensions[2] || 0;
    const energy = dimensions[3] || 0;
    const mental = dimensions[4] || 0;

    // Analysiere jeden Meridian basierend auf den Dimensionen
    Object.entries(MERIDIAN_DATA).forEach(([id, data]) => {
      let score = 0;
      let type: 'excess' | 'deficiency' | 'stagnation' = 'stagnation';

      switch (data.element) {
        case 'wood':
          // Holz: beeinflusst durch Stress und unterdrückte Emotionen
          score = Math.abs(stress) * 0.4 + Math.abs(emotional) * 0.3 + Math.abs(physical) * 0.2;
          type = stress > 0.3 ? 'excess' : (emotional < -0.3 ? 'stagnation' : 'deficiency');
          break;
        
        case 'fire':
        case 'fire_ministerial':
          // Feuer: beeinflusst durch emotionale Zustände und Energie
          score = Math.abs(emotional) * 0.4 + Math.abs(energy) * 0.3 + Math.abs(mental) * 0.2;
          type = emotional > 0.3 ? 'excess' : (energy < -0.3 ? 'deficiency' : 'stagnation');
          break;
        
        case 'earth':
          // Erde: beeinflusst durch mentale Aktivität und Verdauung
          score = Math.abs(mental) * 0.4 + Math.abs(physical) * 0.3 + Math.abs(stress) * 0.2;
          type = mental > 0.3 ? 'excess' : (physical < -0.3 ? 'deficiency' : 'stagnation');
          break;
        
        case 'metal':
          // Metall: beeinflusst durch Trauer, Loslassen, Atmung
          score = Math.abs(emotional) * 0.3 + Math.abs(physical) * 0.4 + Math.abs(energy) * 0.2;
          type = physical > 0.2 && emotional < 0 ? 'deficiency' : (stress > 0.3 ? 'stagnation' : 'excess');
          break;
        
        case 'water':
          // Wasser: beeinflusst durch Angst, Willenskraft, Essenz
          score = Math.abs(stress) * 0.3 + Math.abs(energy) * 0.4 + Math.abs(mental) * 0.2;
          type = energy < -0.3 ? 'deficiency' : (stress > 0.4 ? 'excess' : 'stagnation');
          break;
      }

      // Adjustiere Score basierend auf Bifurkationsrisiko
      const attractorFactor = vectorAnalysis.attractorState.bifurcationRisk * 0.3;
      score = Math.min(1, score + attractorFactor);

      // Nur signifikante Imbalancen hinzufügen
      if (score > 0.2) {
        imbalances.push({
          meridianId: id,
          meridianName: data.name,
          element: data.element,
          yinYang: data.yinYang,
          imbalanceScore: score,
          imbalanceType: type,
          affectedOrgan: data.organ,
          recommendedPoints: data.keyPoints,
          frequency: data.frequency,
        });
      }
    });

    // Sortiere nach Score (höchste zuerst)
    return imbalances.sort((a, b) => b.imbalanceScore - a.imbalanceScore);
  }, []);

  /**
   * Identifiziert das primäre Element-Muster
   */
  const identifyElementPattern = useCallback((imbalances: MeridianImbalance[]): { 
    primary: string; 
    controlling: string; 
    supporting: string; 
    pattern: string;
  } => {
    // Zähle Element-Häufigkeiten gewichtet nach Score
    const elementScores: Record<string, number> = {};
    
    imbalances.forEach(imb => {
      const elem = imb.element === 'fire_ministerial' ? 'fire' : imb.element;
      elementScores[elem] = (elementScores[elem] || 0) + imb.imbalanceScore;
    });

    // Finde primäres Element
    const sortedElements = Object.entries(elementScores)
      .sort(([, a], [, b]) => b - a);
    
    const primary = sortedElements[0]?.[0] || 'earth';
    const primaryIndex = GENERATION_CYCLE.indexOf(primary);
    
    // Kontrollierendes Element (Ke-Zyklus)
    const controlling = CONTROL_CYCLE[primary as keyof typeof CONTROL_CYCLE] || 'water';
    
    // Unterstützendes Element (Sheng-Zyklus - vorheriges Element)
    const supportingIndex = (primaryIndex - 1 + 5) % 5;
    const supporting = GENERATION_CYCLE[supportingIndex];

    // Bestimme Muster
    let pattern = 'Gemischtes Muster';
    const topImbalance = imbalances[0];
    if (topImbalance) {
      if (topImbalance.imbalanceType === 'excess') {
        pattern = `${primary.charAt(0).toUpperCase() + primary.slice(1)}-Überschuss mit ${controlling}-Kontrolle`;
      } else if (topImbalance.imbalanceType === 'deficiency') {
        pattern = `${primary.charAt(0).toUpperCase() + primary.slice(1)}-Mangel, ${supporting} stärken`;
      } else {
        pattern = `${primary.charAt(0).toUpperCase() + primary.slice(1)}-Stagnation, Qi bewegen`;
      }
    }

    return { primary, controlling, supporting, pattern };
  }, []);

  /**
   * Führt die vollständige Diagnose durch
   */
  const analyzeMeridians = useCallback(async (vectorAnalysis: VectorAnalysis) => {
    setIsAnalyzing(true);
    setAiRecommendation('');

    try {
      // Berechne Imbalancen
      const imbalances = calculateImbalances(vectorAnalysis);
      
      // Identifiziere Element-Muster
      const { primary, controlling, supporting, pattern } = identifyElementPattern(imbalances);

      const result: DiagnosisResult = {
        imbalances,
        primaryElement: primary,
        controllingElement: controlling,
        supportingElement: supporting,
        overallPattern: pattern,
      };

      setDiagnosisResult(result);

      // Hole KI-Empfehlung
      await fetchAIRecommendation(vectorAnalysis, imbalances);

      return result;
    } catch (error) {
      console.error('Meridian analysis error:', error);
      toast.error('Fehler bei der Meridian-Analyse');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [calculateImbalances, identifyElementPattern]);

  /**
   * Holt KI-basierte Behandlungsempfehlungen
   */
  const fetchAIRecommendation = useCallback(async (
    vectorAnalysis: VectorAnalysis,
    imbalances: MeridianImbalance[]
  ) => {
    setIsLoadingAI(true);

    try {
      const clientVector = {
        physical: vectorAnalysis.clientVector.dimensions[0] || 0,
        emotional: vectorAnalysis.clientVector.dimensions[1] || 0,
        stress: vectorAnalysis.clientVector.dimensions[2] || 0,
        energy: vectorAnalysis.clientVector.dimensions[3] || 0,
        mental: vectorAnalysis.clientVector.dimensions[4] || 0,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meridian-diagnosis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ clientVector, imbalances }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate-Limit erreicht. Bitte warten Sie einen Moment.');
          return;
        }
        if (response.status === 402) {
          toast.error('KI-Guthaben erschöpft.');
          return;
        }
        throw new Error('Failed to fetch AI recommendation');
      }

      // Stream verarbeiten
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setAiRecommendation(fullText);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

    } catch (error) {
      console.error('AI recommendation error:', error);
      toast.error('Fehler beim Laden der KI-Empfehlung');
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  return {
    isAnalyzing,
    isLoadingAI,
    diagnosisResult,
    aiRecommendation,
    analyzeMeridians,
    calculateImbalances,
  };
}
