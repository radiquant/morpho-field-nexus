// Klienten-Vektor-Interface mit Anamnese-Formular
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  FileText, 
  Activity, 
  Target, 
  Brain,
  Heart,
  Zap,
  Save,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import type { ClientVector, ClientMetadata } from '@/types/hardware';
import { cn } from '@/lib/utils';

interface AnamneseData {
  // Basisdaten
  clientId: string;
  sessionDate: string;
  
  // Symptomatik (5 Dimensionen)
  physicalSymptoms: number; // 0-100
  emotionalState: number;
  mentalClarity: number;
  energyLevel: number;
  stressLevel: number;
  
  // Zusätzliche Eingaben
  primaryConcern: string;
  notes: string;
  
  // Sensor-Daten (falls vorhanden)
  hrvValue?: number;
  gsrValue?: number;
}

const defaultAnamnese: AnamneseData = {
  clientId: '',
  sessionDate: new Date().toISOString().split('T')[0],
  physicalSymptoms: 50,
  emotionalState: 50,
  mentalClarity: 50,
  energyLevel: 50,
  stressLevel: 50,
  primaryConcern: '',
  notes: '',
};

interface ClientVectorInterfaceProps {
  onVectorCreated?: (vector: ClientVector) => void;
}

const ClientVectorInterface = ({ onVectorCreated }: ClientVectorInterfaceProps) => {
  const [anamnese, setAnamnese] = useState<AnamneseData>(defaultAnamnese);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVector, setCurrentVector] = useState<ClientVector | null>(null);

  // Dimension Labels
  const dimensions = [
    { key: 'physicalSymptoms', label: 'Körperliche Symptome', icon: Heart, color: 'text-red-400' },
    { key: 'emotionalState', label: 'Emotionaler Zustand', icon: Brain, color: 'text-purple-400' },
    { key: 'mentalClarity', label: 'Mentale Klarheit', icon: Target, color: 'text-blue-400' },
    { key: 'energyLevel', label: 'Energielevel', icon: Zap, color: 'text-yellow-400' },
    { key: 'stressLevel', label: 'Stresslevel', icon: Activity, color: 'text-orange-400' },
  ];

  // Anamnese-Wert aktualisieren
  const updateAnamnese = useCallback((key: keyof AnamneseData, value: unknown) => {
    setAnamnese(prev => ({ ...prev, [key]: value }));
  }, []);

  // Vektor aus Anamnese berechnen
  const calculateVector = useCallback((): number[] => {
    // Normalisiere auf [-1, 1] für topologische Berechnung
    const normalize = (val: number) => (val - 50) / 50;
    
    return [
      normalize(anamnese.physicalSymptoms),
      normalize(anamnese.emotionalState),
      normalize(anamnese.mentalClarity),
      normalize(anamnese.energyLevel),
      normalize(anamnese.stressLevel),
    ];
  }, [anamnese]);

  // Klienten-Vektor erstellen
  const createClientVector = useCallback(async () => {
    if (!anamnese.clientId.trim()) {
      toast.error('Bitte geben Sie eine Klienten-ID ein');
      return;
    }

    setIsProcessing(true);

    try {
      const dimensions = calculateVector();
      
      const metadata: ClientMetadata = {
        sessionId: `session-${Date.now()}`,
        clientId: anamnese.clientId,
        inputMethod: 'manual',
        sensorData: [],
      };

      // Optional: Sensor-Daten hinzufügen
      if (anamnese.hrvValue !== undefined) {
        metadata.sensorData?.push({
          type: 'hrv',
          value: anamnese.hrvValue,
          unit: 'ms',
          timestamp: new Date(),
          quality: 0.9,
        });
      }

      if (anamnese.gsrValue !== undefined) {
        metadata.sensorData?.push({
          type: 'gsr',
          value: anamnese.gsrValue,
          unit: 'µS',
          timestamp: new Date(),
          quality: 0.85,
        });
      }

      const vector: ClientVector = {
        id: `vec-${Date.now()}`,
        timestamp: new Date(),
        dimensions,
        metadata,
        trajectory: {
          points: [{ position: dimensions, timestamp: new Date() }],
          attractorDistance: calculateAttractorDistance(dimensions),
          phase: determinePhase(dimensions),
        },
      };

      setCurrentVector(vector);
      onVectorCreated?.(vector);
      
      toast.success('Klienten-Vektor erfolgreich erstellt');
    } catch (error) {
      toast.error('Fehler beim Erstellen des Vektors');
    } finally {
      setIsProcessing(false);
    }
  }, [anamnese, calculateVector, onVectorCreated]);

  // Reset Formular
  const resetForm = useCallback(() => {
    setAnamnese(defaultAnamnese);
    setCurrentVector(null);
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Klienten-<span className="text-gradient-primary">Vektor</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Erfassen Sie den aktuellen Zustand für die topologische Feldanalyse
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Anamnese-Formular */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg border border-border p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl text-foreground">Anamnese</h3>
            </div>

            <div className="space-y-6">
              {/* Basisdaten */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">Klienten-ID</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="clientId"
                      placeholder="K-001"
                      value={anamnese.clientId}
                      onChange={(e) => updateAnamnese('clientId', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sessionDate">Datum</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={anamnese.sessionDate}
                    onChange={(e) => updateAnamnese('sessionDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* 5-Dimensionen Slider */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Zustandsdimensionen</h4>
                {dimensions.map((dim) => (
                  <DimensionSlider
                    key={dim.key}
                    label={dim.label}
                    icon={dim.icon}
                    color={dim.color}
                    value={anamnese[dim.key as keyof AnamneseData] as number}
                    onChange={(val) => updateAnamnese(dim.key as keyof AnamneseData, val)}
                  />
                ))}
              </div>

              {/* Hauptanliegen */}
              <div>
                <Label htmlFor="primaryConcern">Hauptanliegen</Label>
                <Textarea
                  id="primaryConcern"
                  placeholder="Beschreiben Sie das primäre Anliegen..."
                  value={anamnese.primaryConcern}
                  onChange={(e) => updateAnamnese('primaryConcern', e.target.value)}
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {/* Notizen */}
              <div>
                <Label htmlFor="notes">Zusätzliche Notizen</Label>
                <Textarea
                  id="notes"
                  placeholder="Weitere Beobachtungen..."
                  value={anamnese.notes}
                  onChange={(e) => updateAnamnese('notes', e.target.value)}
                  className="mt-1 min-h-[60px]"
                />
              </div>

              {/* Aktionen */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={createClientVector} 
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Berechne...' : 'Vektor erstellen'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Vektor-Visualisierung */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg border border-border p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl text-foreground">Vektor-Status</h3>
            </div>

            {currentVector ? (
              <div className="space-y-6">
                {/* Vektor-Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vektor-ID:</span>
                      <p className="font-mono text-foreground">{currentVector.id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Zeitstempel:</span>
                      <p className="text-foreground">
                        {currentVector.timestamp.toLocaleTimeString('de-DE')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dimensionen-Visualisierung */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Dimensionen</h4>
                  {currentVector.dimensions.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">D{idx + 1}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((val + 1) / 2) * 100}%` }}
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                      <span className="text-xs font-mono text-foreground w-16 text-right">
                        {val.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Trajektorie-Info */}
                {currentVector.trajectory && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="text-sm font-medium text-primary mb-3">Trajektorie</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Attraktor-Distanz:</span>
                        <p className="text-lg font-semibold text-foreground">
                          {currentVector.trajectory.attractorDistance.toFixed(3)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phase:</span>
                        <PhaseIndicator phase={currentVector.trajectory.phase} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Noch kein Vektor erstellt</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Füllen Sie die Anamnese aus und klicken Sie auf "Vektor erstellen"
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Dimension Slider Komponente
interface DimensionSliderProps {
  label: string;
  icon: React.ElementType;
  color: string;
  value: number;
  onChange: (value: number) => void;
}

const DimensionSlider = ({ label, icon: Icon, color, value, onChange }: DimensionSliderProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-mono text-muted-foreground">{value}%</span>
    </div>
    <Slider
      value={[value]}
      onValueChange={(vals) => onChange(vals[0])}
      max={100}
      step={1}
      className="w-full"
    />
  </div>
);

// Phase Indicator Komponente
const PhaseIndicator = ({ phase }: { phase: 'approach' | 'transition' | 'stable' }) => {
  const config = {
    approach: { label: 'Annäherung', color: 'text-orange-400', bg: 'bg-orange-400/20' },
    transition: { label: 'Transition', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
    stable: { label: 'Stabil', color: 'text-green-400', bg: 'bg-green-400/20' },
  };
  
  const { label, color, bg } = config[phase];
  
  return (
    <span className={cn("inline-flex items-center px-2 py-1 rounded text-sm font-medium", color, bg)}>
      {label}
    </span>
  );
};

// Hilfsfunktionen
function calculateAttractorDistance(dimensions: number[]): number {
  // Euklidische Distanz zum Ursprung (gesunder Attraktor bei 0,0,0...)
  return Math.sqrt(dimensions.reduce((sum, d) => sum + d * d, 0));
}

function determinePhase(dimensions: number[]): 'approach' | 'transition' | 'stable' {
  const distance = calculateAttractorDistance(dimensions);
  if (distance > 1.2) return 'approach';
  if (distance > 0.5) return 'transition';
  return 'stable';
}

export default ClientVectorInterface;
