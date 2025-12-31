/**
 * Meridian-Diagnose Panel
 * Zeigt die Diagnose-Ergebnisse, KI-Empfehlungen und automatische Behandlungssequenz an
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Volume2,
  Play,
  Pause,
  Square,
  SkipForward,
  Timer,
  Waves,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useMeridianDiagnosis, type MeridianImbalance, type DiagnosisResult } from '@/hooks/useMeridianDiagnosis';
import { useTreatmentSequence } from '@/hooks/useTreatmentSequence';
import type { VectorAnalysis } from '@/services/feldengine';

interface MeridianDiagnosisPanelProps {
  vectorAnalysis: VectorAnalysis | null;
  onFrequencySelect?: (frequency: number) => void;
}

// Element-Farben
const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  wood: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  fire: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  fire_ministerial: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  earth: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  metal: { bg: 'bg-gray-400/20', text: 'text-gray-300', border: 'border-gray-400/30' },
  water: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
};

// Element-Namen auf Deutsch
const ELEMENT_NAMES: Record<string, string> = {
  wood: 'Holz',
  fire: 'Feuer',
  fire_ministerial: 'Minister-Feuer',
  earth: 'Erde',
  metal: 'Metall',
  water: 'Wasser',
};

// Imbalance-Typ Icons und Farben
const IMBALANCE_CONFIG = {
  excess: { icon: TrendingUp, color: 'text-red-400', label: 'Überschuss' },
  deficiency: { icon: TrendingDown, color: 'text-blue-400', label: 'Mangel' },
  stagnation: { icon: Minus, color: 'text-yellow-400', label: 'Stagnation' },
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MeridianDiagnosisPanel = ({ vectorAnalysis, onFrequencySelect }: MeridianDiagnosisPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [treatmentDuration, setTreatmentDuration] = useState(60);
  const [pointsPerMeridian, setPointsPerMeridian] = useState(2);
  
  const {
    isAnalyzing,
    isLoadingAI,
    diagnosisResult,
    aiRecommendation,
    analyzeMeridians,
  } = useMeridianDiagnosis();

  const {
    treatmentPoints,
    progress,
    startSequence,
    pauseSequence,
    resumeSequence,
    stopSequence,
    skipToPoint,
  } = useTreatmentSequence();

  // Automatische Analyse bei neuem Vektor
  useEffect(() => {
    if (vectorAnalysis && !diagnosisResult) {
      analyzeMeridians(vectorAnalysis);
    }
  }, [vectorAnalysis, diagnosisResult, analyzeMeridians]);

  const handleStartTreatment = () => {
    if (diagnosisResult?.imbalances) {
      startSequence(diagnosisResult.imbalances, {
        pointsPerMeridian,
        durationPerPoint: treatmentDuration,
      });
    }
  };

  const handleReanalyze = () => {
    if (vectorAnalysis) {
      analyzeMeridians(vectorAnalysis);
    }
  };

  if (!vectorAnalysis) {
    return (
      <Card className="border-border bg-card/50">
        <CardContent className="py-8 text-center">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Erstellen Sie einen Client-Vektor für die Meridian-Diagnose
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            <span className="text-gradient-primary">Meridian</span>-Diagnose
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            KI-gestützte Analyse der Meridian-Imbalancen mit Behandlungsempfehlungen
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diagnose-Übersicht */}
          <div className="lg:col-span-2 space-y-4">
            {/* Element-Muster */}
            {diagnosisResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Energetisches Muster
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-medium text-foreground mb-4">
                      {diagnosisResult.overallPattern}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <div className={`px-3 py-2 rounded-lg ${ELEMENT_COLORS[diagnosisResult.primaryElement]?.bg} ${ELEMENT_COLORS[diagnosisResult.primaryElement]?.border} border`}>
                        <p className="text-xs text-muted-foreground">Primär</p>
                        <p className={`font-medium ${ELEMENT_COLORS[diagnosisResult.primaryElement]?.text}`}>
                          {ELEMENT_NAMES[diagnosisResult.primaryElement]}
                        </p>
                      </div>
                      <div className={`px-3 py-2 rounded-lg ${ELEMENT_COLORS[diagnosisResult.controllingElement]?.bg} ${ELEMENT_COLORS[diagnosisResult.controllingElement]?.border} border`}>
                        <p className="text-xs text-muted-foreground">Kontrolliert</p>
                        <p className={`font-medium ${ELEMENT_COLORS[diagnosisResult.controllingElement]?.text}`}>
                          {ELEMENT_NAMES[diagnosisResult.controllingElement]}
                        </p>
                      </div>
                      <div className={`px-3 py-2 rounded-lg ${ELEMENT_COLORS[diagnosisResult.supportingElement]?.bg} ${ELEMENT_COLORS[diagnosisResult.supportingElement]?.border} border`}>
                        <p className="text-xs text-muted-foreground">Unterstützt</p>
                        <p className={`font-medium ${ELEMENT_COLORS[diagnosisResult.supportingElement]?.text}`}>
                          {ELEMENT_NAMES[diagnosisResult.supportingElement]}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Meridian-Imbalancen */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Identifizierte Imbalancen
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReanalyze}
                    disabled={isAnalyzing}
                  >
                    <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : diagnosisResult?.imbalances.length ? (
                  <div className="space-y-3">
                    {diagnosisResult.imbalances.slice(0, 5).map((imbalance, index) => (
                      <ImbalanceCard
                        key={imbalance.meridianId}
                        imbalance={imbalance}
                        rank={index + 1}
                        onFrequencySelect={onFrequencySelect}
                      />
                    ))}

                    {diagnosisResult.imbalances.length > 5 && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Weniger anzeigen
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            {diagnosisResult.imbalances.length - 5} weitere anzeigen
                          </>
                        )}
                      </Button>
                    )}

                    <AnimatePresence>
                      {isExpanded && diagnosisResult.imbalances.slice(5).map((imbalance, index) => (
                        <motion.div
                          key={imbalance.meridianId}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <ImbalanceCard
                            imbalance={imbalance}
                            rank={index + 6}
                            onFrequencySelect={onFrequencySelect}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-10 h-10 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">Keine signifikanten Imbalancen gefunden</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Automatische Behandlungssequenz */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Waves className="w-5 h-5 text-primary" />
                  Automatische Behandlungssequenz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Behandlung läuft */}
                {(progress.isPlaying || progress.isPaused) && !progress.isComplete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Aktueller Punkt */}
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                            <Waves className="w-4 h-4 text-primary animate-pulse" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {progress.currentPoint?.meridianName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Punkt: {progress.currentPoint?.pointName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-mono text-primary">
                            {progress.currentPoint?.frequency} Hz
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(progress.remainingTime)} verbleibend
                          </p>
                        </div>
                      </div>

                      {/* Point Progress */}
                      <Progress 
                        value={(progress.elapsedTime / (progress.currentPoint?.duration || 60)) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Gesamt-Fortschritt */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Punkt {progress.currentPointIndex + 1} von {progress.totalPoints}
                        </span>
                        <span className="text-foreground font-mono">
                          {progress.overallProgress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={progress.overallProgress} className="h-1" />
                    </div>

                    {/* Kontrollen */}
                    <div className="flex items-center gap-2">
                      {progress.isPaused ? (
                        <Button onClick={resumeSequence} className="flex-1 gap-2">
                          <Play className="w-4 h-4" />
                          Fortsetzen
                        </Button>
                      ) : (
                        <Button onClick={pauseSequence} variant="secondary" className="flex-1 gap-2">
                          <Pause className="w-4 h-4" />
                          Pause
                        </Button>
                      )}
                      <Button onClick={stopSequence} variant="destructive" size="icon">
                        <Square className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => skipToPoint(progress.currentPointIndex + 1)} 
                        variant="outline" 
                        size="icon"
                        disabled={progress.currentPointIndex >= progress.totalPoints - 1}
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Punkt-Liste */}
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {treatmentPoints.map((point, idx) => {
                        const elementColor = ELEMENT_COLORS[point.element] || ELEMENT_COLORS.earth;
                        const isActive = idx === progress.currentPointIndex;
                        const isDone = idx < progress.currentPointIndex;

                        return (
                          <button
                            key={point.id}
                            onClick={() => skipToPoint(idx)}
                            className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                              isActive 
                                ? 'bg-primary/20 border border-primary/40' 
                                : isDone 
                                  ? 'bg-green-500/10 text-muted-foreground' 
                                  : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                              isDone ? 'bg-green-500/30 text-green-400' : isActive ? 'bg-primary/30 text-primary' : 'bg-muted'
                            }`}>
                              {isDone ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                            </div>
                            <span className={isDone ? 'line-through' : ''}>
                              {point.meridianName} - {point.pointName}
                            </span>
                            <span className={`ml-auto text-xs ${elementColor.text}`}>
                              {point.frequency} Hz
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Behandlung abgeschlossen */}
                {progress.isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <h4 className="text-lg font-medium text-foreground mb-1">
                      Behandlung abgeschlossen
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Alle {treatmentPoints.length} Akupunkturpunkte wurden harmonisiert
                    </p>
                    <Button onClick={handleStartTreatment} variant="outline">
                      Erneut starten
                    </Button>
                  </motion.div>
                )}

                {/* Behandlung starten */}
                {!progress.isPlaying && !progress.isPaused && !progress.isComplete && diagnosisResult?.imbalances.length && (
                  <div className="space-y-4">
                    {/* Einstellungen */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          Dauer pro Punkt
                        </label>
                        <div className="flex items-center gap-3">
                          <Slider
                            value={[treatmentDuration]}
                            onValueChange={(v) => setTreatmentDuration(v[0])}
                            min={15}
                            max={180}
                            step={15}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-12">{treatmentDuration}s</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Punkte pro Meridian
                        </label>
                        <div className="flex items-center gap-3">
                          <Slider
                            value={[pointsPerMeridian]}
                            onValueChange={(v) => setPointsPerMeridian(v[0])}
                            min={1}
                            max={3}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-8">{pointsPerMeridian}</span>
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Behandlungsplan:</p>
                      <p className="text-foreground">
                        <span className="font-mono text-primary">
                          {Math.min(5, diagnosisResult.imbalances.length) * pointsPerMeridian}
                        </span> Akupunkturpunkte • Gesamtdauer: {' '}
                        <span className="font-mono text-primary">
                          {formatTime(Math.min(5, diagnosisResult.imbalances.length) * pointsPerMeridian * treatmentDuration)}
                        </span>
                      </p>
                    </div>

                    <Button 
                      onClick={handleStartTreatment} 
                      className="w-full gap-2"
                      size="lg"
                    >
                      <Play className="w-5 h-5" />
                      Behandlungssequenz starten
                    </Button>
                  </div>
                )}

                {/* Keine Imbalancen */}
                {!diagnosisResult?.imbalances.length && !progress.isPlaying && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Keine Behandlung erforderlich
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* KI-Empfehlung */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  KI-Behandlungsempfehlung
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAI ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Analysiere mit TCM-KI...
                    </div>
                    {aiRecommendation && (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm text-foreground/90">
                          {aiRecommendation}
                          <span className="animate-pulse">▊</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : aiRecommendation ? (
                  <div className="prose prose-sm prose-invert max-w-none max-h-[500px] overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                      {aiRecommendation}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Starten Sie die Analyse für KI-Empfehlungen
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

// Einzelne Imbalance-Karte
function ImbalanceCard({ 
  imbalance, 
  rank,
  onFrequencySelect 
}: { 
  imbalance: MeridianImbalance; 
  rank: number;
  onFrequencySelect?: (frequency: number) => void;
}) {
  const config = IMBALANCE_CONFIG[imbalance.imbalanceType];
  const Icon = config.icon;
  const elementColor = ELEMENT_COLORS[imbalance.element] || ELEMENT_COLORS.earth;

  return (
    <div className={`p-3 rounded-lg border ${elementColor.border} ${elementColor.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-background/50 flex items-center justify-center text-xs font-bold">
            {rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{imbalance.meridianName}</span>
              <Badge variant="outline" className={`text-xs ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {imbalance.affectedOrgan} • {ELEMENT_NAMES[imbalance.element]} • {imbalance.yinYang === 'yin' ? '陰 Yin' : '陽 Yang'}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {imbalance.recommendedPoints.slice(0, 3).map(point => (
                <span 
                  key={point} 
                  className="text-xs px-1.5 py-0.5 rounded bg-background/50 text-foreground/80"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className={`text-lg font-mono ${elementColor.text}`}>
              {(imbalance.imbalanceScore * 100).toFixed(0)}%
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => onFrequencySelect?.(imbalance.frequency)}
          >
            <Volume2 className="w-3 h-3" />
            {imbalance.frequency} Hz
          </Button>
        </div>
      </div>

      <div className="mt-2">
        <Progress 
          value={imbalance.imbalanceScore * 100} 
          className="h-1"
        />
      </div>
    </div>
  );
}

export default MeridianDiagnosisPanel;
