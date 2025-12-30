// Frequenz-Output-Modul mit WebAudio und Serial-Kommunikation
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX,
  Radio,
  Waves,
  Settings2,
  Zap,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { FrequencyOutput, ModulationConfig } from '@/types/hardware';

type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';

interface FrequencyOutputModuleProps {
  onFrequencyChange?: (config: FrequencyOutput) => void;
}

// Vordefinierte therapeutische Frequenzen
const THERAPEUTIC_FREQUENCIES = [
  { name: 'Schumann-Resonanz', frequency: 7.83, description: 'Erdresonanz' },
  { name: 'Alpha-Wellen', frequency: 10, description: 'Entspannung' },
  { name: 'Theta-Wellen', frequency: 6, description: 'Meditation' },
  { name: 'Rife - Entgiftung', frequency: 727, description: 'Detox-Frequenz' },
  { name: 'Rife - Immunsystem', frequency: 880, description: 'Immunstärkung' },
  { name: 'Solfeggio UT', frequency: 396, description: 'Befreiung von Angst' },
  { name: 'Solfeggio MI', frequency: 528, description: 'DNA-Reparatur' },
  { name: 'Solfeggio FA', frequency: 639, description: 'Harmonie' },
];

const FrequencyOutputModule = ({ onFrequencyChange }: FrequencyOutputModuleProps) => {
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [frequency, setFrequency] = useState(7.83);
  const [amplitude, setAmplitude] = useState(0.5);
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  
  // Modulation
  const [modulationEnabled, setModulationEnabled] = useState(false);
  const [modulationFreq, setModulationFreq] = useState(1);
  const [modulationDepth, setModulationDepth] = useState(0.3);
  
  // EM-Feld Output
  const [emOutputEnabled, setEmOutputEnabled] = useState(false);
  const [serialConnected, setSerialConnected] = useState(false);

  // WebAudio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const modulatorRef = useRef<OscillatorNode | null>(null);
  const modulationGainRef = useRef<GainNode | null>(null);

  // Serial Port Ref
  const serialPortRef = useRef<SerialPort | null>(null);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      stopAudio();
      disconnectSerial();
    };
  }, []);

  // Audio initialisieren
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Audio starten
  const startAudio = useCallback(() => {
    const ctx = initAudio();
    
    // Haupt-Oszillator
    const osc = ctx.createOscillator();
    osc.type = waveform;
    osc.frequency.value = frequency;
    oscillatorRef.current = osc;

    // Gain-Node für Amplitude
    const gain = ctx.createGain();
    gain.gain.value = isMuted ? 0 : amplitude;
    gainNodeRef.current = gain;

    // Modulation Setup
    if (modulationEnabled) {
      const modulator = ctx.createOscillator();
      modulator.frequency.value = modulationFreq;
      modulatorRef.current = modulator;

      const modGain = ctx.createGain();
      modGain.gain.value = modulationDepth * frequency;
      modulationGainRef.current = modGain;

      modulator.connect(modGain);
      modGain.connect(osc.frequency);
      modulator.start();
    }

    // Verbindungen
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    setIsPlaying(true);
    
    // Callback
    const config: FrequencyOutput = {
      type: emOutputEnabled ? 'dual' : 'audio',
      frequency,
      amplitude,
      waveform,
      modulation: modulationEnabled ? {
        type: 'fm',
        frequency: modulationFreq,
        depth: modulationDepth,
      } : undefined,
    };
    onFrequencyChange?.(config);

    toast.success(`Frequenz gestartet: ${frequency} Hz`);
  }, [frequency, amplitude, waveform, modulationEnabled, modulationFreq, modulationDepth, isMuted, emOutputEnabled, initAudio, onFrequencyChange]);

  // Audio stoppen
  const stopAudio = useCallback(() => {
    oscillatorRef.current?.stop();
    oscillatorRef.current?.disconnect();
    modulatorRef.current?.stop();
    modulatorRef.current?.disconnect();
    
    oscillatorRef.current = null;
    modulatorRef.current = null;
    
    setIsPlaying(false);
  }, []);

  // Frequenz live aktualisieren
  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.frequency.setValueAtTime(
        frequency, 
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [frequency, isPlaying]);

  // Amplitude live aktualisieren
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : amplitude,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [amplitude, isMuted]);

  // Waveform aktualisieren
  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.type = waveform;
    }
  }, [waveform, isPlaying]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Serial verbinden (für EM-Feld-Generatoren)
  const connectSerial = useCallback(async () => {
    if (!('serial' in navigator)) {
      toast.error('WebSerial wird nicht unterstützt');
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPortRef.current = port;
      setSerialConnected(true);
      toast.success('Serial-Port verbunden');
    } catch (error) {
      console.error('Serial connection error:', error);
      toast.error('Verbindung fehlgeschlagen');
    }
  }, []);

  // Serial trennen
  const disconnectSerial = useCallback(async () => {
    if (serialPortRef.current) {
      await serialPortRef.current.close();
      serialPortRef.current = null;
      setSerialConnected(false);
    }
  }, []);

  // Frequenz an Serial senden
  const sendFrequencyToSerial = useCallback(async (freq: number) => {
    if (!serialPortRef.current || !serialConnected) return;

    const encoder = new TextEncoder();
    const writer = serialPortRef.current.writable?.getWriter();
    
    if (writer) {
      const command = `FREQ:${freq.toFixed(2)}\n`;
      await writer.write(encoder.encode(command));
      writer.releaseLock();
    }
  }, [serialConnected]);

  // Frequenz an EM senden wenn aktiv
  useEffect(() => {
    if (emOutputEnabled && serialConnected && isPlaying) {
      sendFrequencyToSerial(frequency);
    }
  }, [frequency, emOutputEnabled, serialConnected, isPlaying, sendFrequencyToSerial]);

  // Preset auswählen
  const selectPreset = useCallback((preset: typeof THERAPEUTIC_FREQUENCIES[0]) => {
    setFrequency(preset.frequency);
    toast.info(`${preset.name}: ${preset.description}`);
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Frequenz-<span className="text-gradient-primary">Output</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Audio- und elektromagnetische Frequenz-Harmonisierung
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Frequenz-Steuerung */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-card rounded-lg border border-border p-6 shadow-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <Waves className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl text-foreground">Frequenz-Steuerung</h3>
            </div>

            {/* Main Controls */}
            <div className="space-y-6">
              {/* Frequenz */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Frequenz</Label>
                  <span className="text-2xl font-mono font-bold text-primary">
                    {frequency.toFixed(2)} Hz
                  </span>
                </div>
                <Slider
                  value={[frequency]}
                  onValueChange={(vals) => setFrequency(vals[0])}
                  min={0.1}
                  max={20000}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.1 Hz</span>
                  <span>20 kHz</span>
                </div>
              </div>

              {/* Amplitude */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Amplitude</Label>
                  <span className="text-sm font-mono text-muted-foreground">
                    {Math.round(amplitude * 100)}%
                  </span>
                </div>
                <Slider
                  value={[amplitude]}
                  onValueChange={(vals) => setAmplitude(vals[0])}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>

              {/* Waveform */}
              <div className="space-y-3">
                <Label>Wellenform</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((wf) => (
                    <Button
                      key={wf}
                      variant={waveform === wf ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setWaveform(wf)}
                      className="capitalize"
                    >
                      {wf === 'sine' && '∿'}
                      {wf === 'square' && '⊓'}
                      {wf === 'triangle' && '△'}
                      {wf === 'sawtooth' && '⩘'}
                      <span className="ml-1 text-xs">{wf}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Modulation */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                    <Label>FM-Modulation</Label>
                  </div>
                  <Switch
                    checked={modulationEnabled}
                    onCheckedChange={setModulationEnabled}
                  />
                </div>
                
                {modulationEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Mod-Frequenz</Label>
                      <Slider
                        value={[modulationFreq]}
                        onValueChange={(vals) => setModulationFreq(vals[0])}
                        min={0.1}
                        max={20}
                        step={0.1}
                        className="mt-2"
                      />
                      <span className="text-xs text-muted-foreground">{modulationFreq} Hz</span>
                    </div>
                    <div>
                      <Label className="text-xs">Mod-Tiefe</Label>
                      <Slider
                        value={[modulationDepth]}
                        onValueChange={(vals) => setModulationDepth(vals[0])}
                        min={0}
                        max={1}
                        step={0.01}
                        className="mt-2"
                      />
                      <span className="text-xs text-muted-foreground">{Math.round(modulationDepth * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Play Controls */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Button
                  size="lg"
                  onClick={isPlaying ? stopAudio : startAudio}
                  className={cn(
                    "flex-1",
                    isPlaying && "bg-destructive hover:bg-destructive/90"
                  )}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-5 h-5 mr-2" />
                      Stopp
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Presets & EM Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Presets */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-foreground">Therapeutische Presets</h4>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {THERAPEUTIC_FREQUENCIES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => selectPreset(preset)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors",
                      "bg-muted/30 hover:bg-primary/10 border border-transparent",
                      frequency === preset.frequency && "border-primary/50 bg-primary/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{preset.name}</span>
                      <span className="text-xs font-mono text-primary">{preset.frequency} Hz</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* EM Output */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="w-5 h-5 text-secondary" />
                <h4 className="font-medium text-foreground">EM-Feld Output</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aktiviert</span>
                  <Switch
                    checked={emOutputEnabled}
                    onCheckedChange={setEmOutputEnabled}
                  />
                </div>

                {emOutputEnabled && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          serialConnected ? "bg-green-400 animate-pulse" : "bg-muted-foreground"
                        )} />
                        <span className="text-sm text-foreground">
                          {serialConnected ? 'Verbunden' : 'Nicht verbunden'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={serialConnected ? disconnectSerial : connectSerial}
                      >
                        {serialConnected ? 'Trennen' : 'Verbinden'}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Verbinden Sie einen Frequenzgenerator (Spooky2, etc.) über WebSerial 
                      für elektromagnetische Feldausgabe.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Status Display */}
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/10 border border-primary/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Aktive Ausgabe</p>
                    <p className="text-xs text-muted-foreground">
                      {emOutputEnabled ? 'Audio + EM-Feld' : 'Nur Audio'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FrequencyOutputModule;
