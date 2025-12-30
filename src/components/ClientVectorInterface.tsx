/**
 * Erweitertes Klienten-Vektor-Interface mit biometrischer Identifikation
 * Basierend auf René Thoms Feldengine-Theorie
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  FileText, 
  Activity, 
  Target, 
  Brain,
  Heart,
  Zap,
  Save,
  RotateCcw,
  MapPin,
  Calendar,
  Camera,
  Upload,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ThomVectorEngine, type VectorAnalysis, type RecommendedFrequency } from '@/services/feldengine';
import { useClientDatabase, type ClientRecord } from '@/hooks/useClientDatabase';

// Biometrische Klienten-Daten
interface BiometricData {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  photo: File | null;
  photoPreview: string | null;
}

// Zustandsdimensionen
interface StateDimensions {
  physical: number;
  emotional: number;
  mental: number;
  energy: number;
  stress: number;
}

interface ClientVectorInterfaceProps {
  onVectorCreated?: (analysis: VectorAnalysis) => void;
  onFrequencySelect?: (frequency: RecommendedFrequency) => void;
}

const defaultBiometric: BiometricData = {
  firstName: '',
  lastName: '',
  birthDate: '',
  birthPlace: '',
  photo: null,
  photoPreview: null,
};

const defaultDimensions: StateDimensions = {
  physical: 50,
  emotional: 50,
  mental: 50,
  energy: 50,
  stress: 50,
};

const ClientVectorInterface = ({ onVectorCreated, onFrequencySelect }: ClientVectorInterfaceProps) => {
  // State
  const [biometric, setBiometric] = useState<BiometricData>(defaultBiometric);
  const [dimensions, setDimensions] = useState<StateDimensions>(defaultDimensions);
  const [primaryConcern, setPrimaryConcern] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<VectorAnalysis | null>(null);
  const [savedClient, setSavedClient] = useState<ClientRecord | null>(null);
  const [existingClients, setExistingClients] = useState<ClientRecord[]>([]);
  const [showClientList, setShowClientList] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createClient, loadClients, saveClientVector, uploadClientPhoto, isLoading } = useClientDatabase();

  // Klienten laden
  useEffect(() => {
    loadClients().then(setExistingClients);
  }, [loadClients]);

  // Biometrische Daten aktualisieren
  const updateBiometric = useCallback((key: keyof BiometricData, value: unknown) => {
    setBiometric(prev => ({ ...prev, [key]: value }));
  }, []);

  // Foto-Upload Handler
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBiometric(prev => ({
          ...prev,
          photo: file,
          photoPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Klient aus Liste auswählen
  const selectExistingClient = useCallback((client: ClientRecord) => {
    setBiometric({
      firstName: client.firstName,
      lastName: client.lastName,
      birthDate: client.birthDate.toISOString().split('T')[0],
      birthPlace: client.birthPlace,
      photo: null,
      photoPreview: client.photoUrl || null,
    });
    setSavedClient(client);
    setShowClientList(false);
    toast.success(`Klient ${client.firstName} ${client.lastName} geladen`);
  }, []);

  // Vektor-Analyse durchführen
  const analyzeVector = useCallback(async () => {
    // Validierung
    if (!biometric.firstName || !biometric.lastName || !biometric.birthDate || !biometric.birthPlace) {
      toast.error('Bitte füllen Sie alle biometrischen Felder aus');
      return;
    }

    setIsProcessing(true);

    try {
      const birthDate = new Date(biometric.birthDate);
      const sessionId = `session-${Date.now()}`;

      // Thom-Vektor-Analyse
      const analysis = ThomVectorEngine.calculateClientVector(
        {
          firstName: biometric.firstName,
          lastName: biometric.lastName,
          birthDate,
          birthPlace: biometric.birthPlace,
          photoData: biometric.photoPreview || undefined,
        },
        dimensions,
        sessionId
      );

      setCurrentAnalysis(analysis);
      onVectorCreated?.(analysis);

      toast.success('Vektor-Analyse abgeschlossen');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Fehler bei der Vektor-Analyse');
    } finally {
      setIsProcessing(false);
    }
  }, [biometric, dimensions, onVectorCreated]);

  // Klient und Vektor speichern
  const saveToDatabase = useCallback(async () => {
    if (!currentAnalysis) {
      toast.error('Bitte führen Sie zuerst eine Analyse durch');
      return;
    }

    setIsProcessing(true);

    try {
      let clientId = savedClient?.id;

      // Neuen Klienten erstellen falls nötig
      if (!clientId) {
        const newClient = await createClient(
          {
            firstName: biometric.firstName,
            lastName: biometric.lastName,
            birthDate: new Date(biometric.birthDate),
            birthPlace: biometric.birthPlace,
          },
          notes
        );
        if (!newClient) throw new Error('Client creation failed');
        clientId = newClient.id;
        setSavedClient(newClient);

        // Foto hochladen falls vorhanden
        if (biometric.photo) {
          await uploadClientPhoto(clientId, biometric.photo);
        }
      }

      // Vektor speichern
      await saveClientVector(
        clientId,
        dimensions,
        {
          firstName: biometric.firstName,
          lastName: biometric.lastName,
          birthDate: new Date(biometric.birthDate),
          birthPlace: biometric.birthPlace,
        },
        { primaryConcern, notes }
      );

      // Liste aktualisieren
      loadClients().then(setExistingClients);

      toast.success('Klient und Vektor gespeichert');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsProcessing(false);
    }
  }, [currentAnalysis, savedClient, biometric, dimensions, primaryConcern, notes, createClient, saveClientVector, uploadClientPhoto, loadClients]);

  // Formular zurücksetzen
  const resetForm = useCallback(() => {
    setBiometric(defaultBiometric);
    setDimensions(defaultDimensions);
    setPrimaryConcern('');
    setNotes('');
    setCurrentAnalysis(null);
    setSavedClient(null);
  }, []);

  // Dimensions-Konfiguration
  const dimensionConfigs = [
    { key: 'physical' as const, label: 'Körperlich', icon: Heart, color: 'text-red-400' },
    { key: 'emotional' as const, label: 'Emotional', icon: Brain, color: 'text-purple-400' },
    { key: 'mental' as const, label: 'Mental', icon: Target, color: 'text-blue-400' },
    { key: 'energy' as const, label: 'Energie', icon: Zap, color: 'text-yellow-400' },
    { key: 'stress' as const, label: 'Stress', icon: Activity, color: 'text-orange-400' },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Klienten-<span className="text-gradient-primary">Feldanalyse</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Biometrische Identifikation und topologische Zustandsanalyse nach René Thom
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Linke Spalte: Biometrische Daten */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg border border-border p-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                <h3 className="font-display text-xl text-foreground">Klient</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClientList(!showClientList)}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                {existingClients.length}
              </Button>
            </div>

            {/* Bestehende Klienten-Liste */}
            <AnimatePresence>
              {showClientList && existingClients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 max-h-48 overflow-y-auto space-y-2"
                >
                  {existingClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => selectExistingClient(client)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors",
                        "bg-muted/30 hover:bg-primary/10 border border-transparent",
                        savedClient?.id === client.id && "border-primary/50 bg-primary/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {client.photoUrl ? (
                          <img src={client.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {client.firstName} {client.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {client.birthPlace}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {/* Foto-Upload */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <div 
                  className={cn(
                    "w-24 h-24 rounded-full border-2 border-dashed border-border",
                    "flex items-center justify-center overflow-hidden cursor-pointer",
                    "hover:border-primary/50 transition-colors",
                    biometric.photoPreview && "border-solid border-primary/30"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {biometric.photoPreview ? (
                    <img 
                      src={biometric.photoPreview} 
                      alt="Klient" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Foto hochladen
                </Button>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    placeholder="Max"
                    value={biometric.firstName}
                    onChange={(e) => updateBiometric('firstName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    placeholder="Mustermann"
                    value={biometric.lastName}
                    onChange={(e) => updateBiometric('lastName', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Geburtsdatum */}
              <div>
                <Label htmlFor="birthDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Geburtsdatum
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={biometric.birthDate}
                  onChange={(e) => updateBiometric('birthDate', e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Geburtsort */}
              <div>
                <Label htmlFor="birthPlace" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Geburtsort
                </Label>
                <Input
                  id="birthPlace"
                  placeholder="Berlin"
                  value={biometric.birthPlace}
                  onChange={(e) => updateBiometric('birthPlace', e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Feld-Signatur Anzeige */}
              {currentAnalysis && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Feld-Signatur</p>
                  <p className="font-mono text-sm text-primary">
                    {currentAnalysis.fieldSignature.hash}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Mittlere Spalte: Zustandsdimensionen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg border border-border p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl text-foreground">Anamnese</h3>
            </div>

            <div className="space-y-5">
              {/* Dimensionen */}
              {dimensionConfigs.map((dim) => (
                <DimensionSlider
                  key={dim.key}
                  label={dim.label}
                  icon={dim.icon}
                  color={dim.color}
                  value={dimensions[dim.key]}
                  onChange={(val) => setDimensions(prev => ({ ...prev, [dim.key]: val }))}
                />
              ))}

              {/* Hauptanliegen */}
              <div className="pt-4 border-t border-border">
                <Label htmlFor="primaryConcern">Hauptanliegen</Label>
                <Textarea
                  id="primaryConcern"
                  placeholder="Beschreiben Sie das primäre Anliegen..."
                  value={primaryConcern}
                  onChange={(e) => setPrimaryConcern(e.target.value)}
                  className="mt-1 min-h-[60px]"
                />
              </div>

              {/* Notizen */}
              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  placeholder="Weitere Beobachtungen..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 min-h-[40px]"
                />
              </div>

              {/* Aktionen */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={analyzeVector} 
                  disabled={isProcessing || isLoading}
                  className="flex-1 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isProcessing ? 'Analysiere...' : 'Analysieren'}
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={isProcessing}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {currentAnalysis && (
                <Button 
                  onClick={saveToDatabase} 
                  disabled={isProcessing || isLoading}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  In Datenbank speichern
                </Button>
              )}
            </div>
          </motion.div>

          {/* Rechte Spalte: Analyse-Ergebnis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg border border-border p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl text-foreground">Analyse</h3>
            </div>

            {currentAnalysis ? (
              <div className="space-y-6">
                {/* Attraktor-Status */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Attraktor-Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Stabilität</p>
                      <p className="text-xl font-bold text-foreground">
                        {(currentAnalysis.attractorState.stability * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phase</p>
                      <PhaseIndicator phase={currentAnalysis.attractorState.phase} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bifurkationsrisiko</p>
                      <p className={cn(
                        "text-lg font-semibold",
                        currentAnalysis.attractorState.bifurcationRisk > 0.5 
                          ? "text-destructive" 
                          : "text-green-400"
                      )}>
                        {(currentAnalysis.attractorState.bifurcationRisk * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Chreode-Alignment</p>
                      <p className="text-lg font-semibold text-secondary">
                        {(currentAnalysis.attractorState.chreodeAlignment * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dimensionen-Visualisierung */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Vektor-Dimensionen</h4>
                  <div className="space-y-2">
                    {currentAnalysis.clientVector.dimensions.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-6">D{idx + 1}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((val + 1) / 2) * 100}%` }}
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                          />
                        </div>
                        <span className="text-xs font-mono text-foreground w-12 text-right">
                          {val.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empfohlene Frequenzen */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-muted-foreground">Empfohlene Frequenzen</h4>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentAnalysis.recommendedFrequencies.map((freq, idx) => (
                      <button
                        key={idx}
                        onClick={() => onFrequencySelect?.(freq)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-colors",
                          "bg-muted/30 hover:bg-primary/10 border border-transparent hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{freq.name}</span>
                          <span className="text-xs font-mono text-primary">{freq.frequency} Hz</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{freq.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Noch keine Analyse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Füllen Sie die Daten aus und klicken Sie auf "Analysieren"
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

export default ClientVectorInterface;
