/**
 * 3D Anatomie-Resonanz-Visualisierung
 * Interaktives 3D-Modell mit resonierenden Körperpunkten
 */
import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Brain, 
  Zap, 
  Volume2,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResonanceDatabase, type AnatomyResonancePoint } from '@/hooks/useResonanceDatabase';
import type { VectorAnalysis } from '@/services/feldengine';

interface AnatomyResonanceViewerProps {
  vectorAnalysis?: VectorAnalysis | null;
  onFrequencySelect?: (frequency: number) => void;
}

// Anatomie-Modell Typen
type AnatomyModelType = 'full_body' | 'heart' | 'brain';

interface ModelConfig {
  id: AnatomyModelType;
  name: string;
  icon: typeof Heart;
  description: string;
  cameraPosition: [number, number, number];
  scale: number;
}

const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'full_body',
    name: 'Ganzkörper',
    icon: Activity,
    description: 'Vollständige Körperansicht mit allen Resonanzpunkten',
    cameraPosition: [0, 0, 3],
    scale: 1,
  },
  {
    id: 'heart',
    name: 'Herz',
    icon: Heart,
    description: 'Detaillierte Herzansicht mit kardialen Resonanzen',
    cameraPosition: [0, 0, 2],
    scale: 1.5,
  },
  {
    id: 'brain',
    name: 'Gehirn',
    icon: Brain,
    description: 'Neurologische Zentren und Gehirnwellen-Resonanzen',
    cameraPosition: [0, 0.2, 2],
    scale: 1.5,
  },
];

// Resonanz-Punkt Visualisierung
function ResonancePoint({
  point,
  isActive,
  resonanceScore,
  onClick,
}: {
  point: AnatomyResonancePoint;
  isActive: boolean;
  resonanceScore: number;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      // Pulsieren basierend auf Resonanz-Score
      const pulse = Math.sin(state.clock.elapsedTime * (2 + resonanceScore * 3)) * 0.15 + 1;
      const baseScale = 0.02 + resonanceScore * 0.03;
      meshRef.current.scale.setScalar(baseScale * pulse);
      glowRef.current.scale.setScalar(baseScale * pulse * 2.5);
      
      // Rotation bei aktivem Punkt
      if (isActive) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });

  // Farbe basierend auf Frequenz
  const getFrequencyColor = (freq: number) => {
    if (freq < 100) return '#22c55e'; // Niedrig - Grün
    if (freq < 300) return '#3b82f6'; // Mittel - Blau
    if (freq < 600) return '#a855f7'; // Hoch - Lila
    return '#f59e0b'; // Sehr hoch - Orange
  };

  const color = getFrequencyColor(point.primaryFrequency);
  const position: [number, number, number] = [
    point.position.x,
    point.position.y,
    point.position.z
  ];

  return (
    <group position={position}>
      {/* Glow-Effekt */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2 + resonanceScore * 0.3}
        />
      </mesh>

      {/* Haupt-Punkt */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1 : 0.5 + resonanceScore * 0.5}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Label */}
      {isActive && (
        <Html center distanceFactor={6} position={[0, 0.1, 0]}>
          <div className="bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/30 shadow-lg min-w-[150px]">
            <p className="text-sm font-medium text-foreground">{point.name}</p>
            {point.nameLatin && (
              <p className="text-xs text-muted-foreground italic">{point.nameLatin}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-mono text-primary">
                {point.primaryFrequency.toFixed(2)} Hz
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Stilisiertes Körper-Modell (Prozedural)
function HumanBodyModel({ opacity = 0.3 }: { opacity?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Kopf */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          transparent 
          opacity={opacity}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Hals */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.08, 16]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={opacity} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.12, 0.25, 8, 16]} />
        <meshStandardMaterial 
          color="#6366f1" 
          transparent 
          opacity={opacity}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* Becken */}
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="#818cf8" transparent opacity={opacity} />
      </mesh>

      {/* Arme */}
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`}>
          {/* Oberarm */}
          <mesh position={[side * 0.18, 0.6, 0]} rotation={[0, 0, side * 0.3]}>
            <capsuleGeometry args={[0.025, 0.12, 8, 16]} />
            <meshStandardMaterial color="#a5b4fc" transparent opacity={opacity} />
          </mesh>
          {/* Unterarm */}
          <mesh position={[side * 0.25, 0.45, 0]} rotation={[0, 0, side * 0.2]}>
            <capsuleGeometry args={[0.02, 0.1, 8, 16]} />
            <meshStandardMaterial color="#c7d2fe" transparent opacity={opacity} />
          </mesh>
        </group>
      ))}

      {/* Beine */}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`}>
          {/* Oberschenkel */}
          <mesh position={[side * 0.06, 0.18, 0]}>
            <capsuleGeometry args={[0.04, 0.15, 8, 16]} />
            <meshStandardMaterial color="#a5b4fc" transparent opacity={opacity} />
          </mesh>
          {/* Unterschenkel */}
          <mesh position={[side * 0.06, -0.02, 0]}>
            <capsuleGeometry args={[0.03, 0.15, 8, 16]} />
            <meshStandardMaterial color="#c7d2fe" transparent opacity={opacity} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Stilisiertes Herz-Modell
function HeartModel({ opacity = 0.5 }: { opacity?: number }) {
  const heartRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (heartRef.current) {
      // Herzschlag-Animation
      const beat = Math.sin(state.clock.elapsedTime * 4) * 0.03 + 1;
      heartRef.current.scale.setScalar(beat * 0.3);
      heartRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  // Herz-Form mit Kugeln approximieren
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={heartRef} position={[0, 0.5, 0]}>
        {/* Hauptkörper */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#dc2626"
            transparent
            opacity={opacity}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>

        {/* Obere Wölbungen */}
        <mesh position={[-0.4, 0.5, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#b91c1c" transparent opacity={opacity} />
        </mesh>
        <mesh position={[0.4, 0.5, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#b91c1c" transparent opacity={opacity} />
        </mesh>

        {/* Arterien/Venen-Andeutungen */}
        <mesh position={[0, 0.8, 0]} rotation={[0.3, 0, 0.2]}>
          <cylinderGeometry args={[0.1, 0.15, 0.4, 16]} />
          <meshStandardMaterial color="#7f1d1d" transparent opacity={opacity * 0.8} />
        </mesh>
      </group>
    </Float>
  );
}

// Stilisiertes Gehirn-Modell
function BrainModel({ opacity = 0.5 }: { opacity?: number }) {
  const brainRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (brainRef.current) {
      // Sanfte Gehirnwellen-Animation
      const wave = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      brainRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      brainRef.current.position.y = 0.5 + wave;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={brainRef} position={[0, 0.5, 0]} scale={0.4}>
        {/* Linke Hemisphäre */}
        <mesh position={[-0.3, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color="#f472b6"
            transparent
            opacity={opacity}
            metalness={0.2}
            roughness={0.7}
          />
        </mesh>

        {/* Rechte Hemisphäre */}
        <mesh position={[0.3, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color="#e879f9"
            transparent
            opacity={opacity}
            metalness={0.2}
            roughness={0.7}
          />
        </mesh>

        {/* Kleinhirn */}
        <mesh position={[0, -0.5, -0.2]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#c084fc" transparent opacity={opacity} />
        </mesh>

        {/* Hirnstamm */}
        <mesh position={[0, -0.8, 0]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.4, 16]} />
          <meshStandardMaterial color="#a855f7" transparent opacity={opacity * 0.8} />
        </mesh>

        {/* Windungen-Andeutung */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(i * Math.PI / 4) * 0.5 + (i % 2 === 0 ? -0.2 : 0.2),
              Math.sin(i * Math.PI / 3) * 0.3,
              Math.sin(i * Math.PI / 4) * 0.3
            ]}
          >
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#f0abfc' : '#d8b4fe'}
              transparent
              opacity={opacity * 0.6}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Szene mit Modell und Punkten
function AnatomyScene({
  modelType,
  anatomyPoints,
  activePointId,
  resonanceScores,
  onPointClick,
}: {
  modelType: AnatomyModelType;
  anatomyPoints: AnatomyResonancePoint[];
  activePointId: string | null;
  resonanceScores: Map<string, number>;
  onPointClick: (point: AnatomyResonancePoint) => void;
}) {
  // Filter Punkte basierend auf Modell-Typ
  const visiblePoints = useMemo(() => {
    switch (modelType) {
      case 'heart':
        return anatomyPoints.filter(p => 
          p.organAssociations.some(o => ['heart', 'pericardium'].includes(o)) ||
          p.bodyRegion === 'thorax'
        );
      case 'brain':
        return anatomyPoints.filter(p => 
          p.organAssociations.some(o => ['brain', 'pineal', 'pituitary'].includes(o)) ||
          p.bodyRegion === 'head'
        );
      default:
        return anatomyPoints;
    }
  }, [modelType, anatomyPoints]);

  return (
    <>
      {/* Beleuchtung */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.4} color="#60a5fa" />
      
      {/* Umgebung */}
      <Environment preset="city" />
      <ContactShadows 
        position={[0, -0.15, 0]} 
        opacity={0.3} 
        scale={3} 
        blur={2.5} 
      />

      {/* Anatomie-Modell */}
      <group>
        {modelType === 'full_body' && <HumanBodyModel />}
        {modelType === 'heart' && <HeartModel />}
        {modelType === 'brain' && <BrainModel />}
      </group>

      {/* Resonanz-Punkte */}
      {visiblePoints.map((point) => (
        <ResonancePoint
          key={point.id}
          point={point}
          isActive={activePointId === point.id}
          resonanceScore={resonanceScores.get(point.id) || 0.5}
          onClick={() => onPointClick(point)}
        />
      ))}

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={5}
        autoRotate={!activePointId}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Haupt-Komponente
const AnatomyResonanceViewer = ({
  vectorAnalysis,
  onFrequencySelect,
}: AnatomyResonanceViewerProps) => {
  const [activeModel, setActiveModel] = useState<AnatomyModelType>('full_body');
  const [activePoint, setActivePoint] = useState<AnatomyResonancePoint | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const { 
    anatomyPoints, 
    loadAnatomyPoints, 
    isLoading,
    analyzeResonance 
  } = useResonanceDatabase();

  // Punkte laden
  useEffect(() => {
    loadAnatomyPoints();
  }, [loadAnatomyPoints]);

  // Resonanz-Scores berechnen
  const resonanceScores = useMemo(() => {
    const scores = new Map<string, number>();
    
    if (vectorAnalysis) {
      anatomyPoints.forEach(point => {
        // Score basierend auf Vektor-Dimensionen
        const physicalMatch = 1 - Math.abs(vectorAnalysis.clientVector.dimensions[0] || 0);
        const energyMatch = 1 - Math.abs(vectorAnalysis.clientVector.dimensions[3] || 0);
        
        let score = (physicalMatch + energyMatch) / 2;
        
        // Bonus für passende Organe
        if (point.organAssociations.includes('heart') && vectorAnalysis.attractorState.phase === 'stable') {
          score += 0.2;
        }
        
        scores.set(point.id, Math.min(1, score));
      });
    } else {
      // Default-Scores
      anatomyPoints.forEach(point => {
        scores.set(point.id, 0.5);
      });
    }
    
    return scores;
  }, [vectorAnalysis, anatomyPoints]);

  // Modell wechseln
  const currentModelIndex = MODEL_CONFIGS.findIndex(m => m.id === activeModel);
  const prevModel = () => {
    const newIndex = (currentModelIndex - 1 + MODEL_CONFIGS.length) % MODEL_CONFIGS.length;
    setActiveModel(MODEL_CONFIGS[newIndex].id);
    setActivePoint(null);
  };
  const nextModel = () => {
    const newIndex = (currentModelIndex + 1) % MODEL_CONFIGS.length;
    setActiveModel(MODEL_CONFIGS[newIndex].id);
    setActivePoint(null);
  };

  const currentConfig = MODEL_CONFIGS[currentModelIndex];
  const Icon = currentConfig.icon;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            3D <span className="text-gradient-primary">Anatomie</span>-Resonanz
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Interaktive Visualisierung der Resonanzpunkte mit Frequenz-Zuordnungen
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Viewer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 h-[550px] bg-card rounded-lg border border-border overflow-hidden relative"
          >
            {/* Model Selector */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
              <Button variant="ghost" size="icon" onClick={prevModel}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2 min-w-[120px] justify-center">
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{currentConfig.name}</span>
              </div>
              
              <Button variant="ghost" size="icon" onClick={nextModel}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Canvas */}
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            }>
              <Canvas
                camera={{ 
                  position: currentConfig.cameraPosition, 
                  fov: 50 
                }}
                gl={{ antialias: true, alpha: true }}
              >
                <AnatomyScene
                  modelType={activeModel}
                  anatomyPoints={anatomyPoints}
                  activePointId={activePoint?.id || null}
                  resonanceScores={resonanceScores}
                  onPointClick={setActivePoint}
                />
              </Canvas>
            </Suspense>

            {/* Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePoint(null)}
                className="bg-background/80 backdrop-blur-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="bg-background/80 backdrop-blur-sm"
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>

            {/* Info Overlay */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-16 left-4 right-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border"
                >
                  <p className="text-sm text-muted-foreground">
                    {currentConfig.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Klicken Sie auf die leuchtenden Punkte, um Details und Frequenzen zu sehen.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Aktiver Punkt Details */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">Ausgewählter Punkt</h3>
              </div>

              {activePoint ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-medium text-foreground">{activePoint.name}</p>
                    {activePoint.nameLatin && (
                      <p className="text-sm text-muted-foreground italic">{activePoint.nameLatin}</p>
                    )}
                  </div>

                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Primärfrequenz</span>
                      <span className="font-mono text-primary text-lg">
                        {activePoint.primaryFrequency.toFixed(2)} Hz
                      </span>
                    </div>
                  </div>

                  {activePoint.harmonicFrequencies.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Harmonische</p>
                      <div className="flex flex-wrap gap-1">
                        {activePoint.harmonicFrequencies.slice(0, 4).map((freq, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                          >
                            {freq.toFixed(0)} Hz
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Organ-Zuordnung</p>
                    <div className="flex flex-wrap gap-1">
                      {activePoint.organAssociations.map((organ, i) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-0.5 bg-primary/20 rounded-full text-primary capitalize"
                        >
                          {organ}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => onFrequencySelect?.(activePoint.primaryFrequency)}
                    className="w-full gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Frequenz anwenden
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Klicken Sie auf einen Resonanzpunkt im 3D-Modell
                </p>
              )}
            </div>

            {/* Resonanz-Punkte Liste */}
            <div className="bg-card rounded-lg border border-border p-4 max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">Alle Punkte</h3>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {anatomyPoints.map((point) => (
                    <button
                      key={point.id}
                      onClick={() => setActivePoint(point)}
                      className={`w-full p-2 rounded-lg text-left transition-colors ${
                        activePoint?.id === point.id
                          ? 'bg-primary/20 border border-primary/30'
                          : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{point.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {point.primaryFrequency.toFixed(0)} Hz
                        </span>
                      </div>
                      <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/50"
                          style={{ width: `${(resonanceScores.get(point.id) || 0.5) * 100}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnatomyResonanceViewer;
