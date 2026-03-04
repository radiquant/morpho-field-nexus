/**
 * 7-Chakra Visualisierung
 * Pulsierende Energiekugeln an den traditionellen Chakra-Positionen
 * Mit Solfeggio-Frequenzen und farbcodierter Darstellung
 * Positionen sind auf das normalisierte GLB-Modell (y: -0.15 bis 0.95) abgestimmt
 */
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface ChakraData {
  id: string;
  name: string;
  nameSanskrit: string;
  color: string;
  /** y-Position auf dem normalisierten Körpermodell (-0.15 bis 0.95) */
  yPosition: number;
  /** Solfeggio-Frequenz in Hz */
  frequency: number;
  element: string;
  description: string;
}

// Positionen abgestimmt auf das normalisierte GLB-Modell
// Körper: Füße ~-0.10, Knie ~0.15, Becken ~0.28, Nabel ~0.38, Herz ~0.52, Hals ~0.65, Stirn ~0.78, Scheitel ~0.88
export const CHAKRAS: ChakraData[] = [
  {
    id: 'muladhara',
    name: 'Wurzel-Chakra',
    nameSanskrit: 'Mūlādhāra',
    color: '#ef4444',
    yPosition: 0.27,
    frequency: 396,
    element: 'Erde',
    description: 'Erdung, Stabilität, Überlebensinstinkt',
  },
  {
    id: 'svadhisthana',
    name: 'Sakral-Chakra',
    nameSanskrit: 'Svādhiṣṭhāna',
    color: '#f97316',
    yPosition: 0.33,
    frequency: 417,
    element: 'Wasser',
    description: 'Kreativität, Sexualität, Emotionen',
  },
  {
    id: 'manipura',
    name: 'Solarplexus-Chakra',
    nameSanskrit: 'Maṇipūra',
    color: '#eab308',
    yPosition: 0.42,
    frequency: 528,
    element: 'Feuer',
    description: 'Willenskraft, Selbstbewusstsein, Transformation',
  },
  {
    id: 'anahata',
    name: 'Herz-Chakra',
    nameSanskrit: 'Anāhata',
    color: '#22c55e',
    yPosition: 0.52,
    frequency: 639,
    element: 'Luft',
    description: 'Liebe, Mitgefühl, Verbundenheit',
  },
  {
    id: 'vishuddha',
    name: 'Hals-Chakra',
    nameSanskrit: 'Viśuddha',
    color: '#06b6d4',
    yPosition: 0.65,
    frequency: 741,
    element: 'Äther',
    description: 'Kommunikation, Ausdruck, Wahrheit',
  },
  {
    id: 'ajna',
    name: 'Stirn-Chakra',
    nameSanskrit: 'Ājñā',
    color: '#6366f1',
    yPosition: 0.78,
    frequency: 852,
    element: 'Licht',
    description: 'Intuition, Weisheit, innere Schau',
  },
  {
    id: 'sahasrara',
    name: 'Kronen-Chakra',
    nameSanskrit: 'Sahasrāra',
    color: '#a855f7',
    yPosition: 0.88,
    frequency: 963,
    element: 'Kosmische Energie',
    description: 'Spiritualität, Erleuchtung, Einheit',
  },
];

function ChakraSphere({
  chakra,
  isActive,
  onClick,
  sizeFactor = 1,
}: {
  chakra: ChakraData;
  isActive: boolean;
  onClick: () => void;
  sizeFactor?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (meshRef.current) {
      const offset = CHAKRAS.indexOf(chakra) * 0.9;
      const pulse = Math.sin(t * 2 + offset) * 0.08 + 1;
      const scale = isActive ? 1.4 : isHovered ? 1.2 : 1;
      meshRef.current.scale.setScalar(pulse * scale);
    }
    
    if (glowRef.current) {
      const glowPulse = Math.sin(t * 1.5 + CHAKRAS.indexOf(chakra)) * 0.15 + 1;
      glowRef.current.scale.setScalar(glowPulse * (isActive ? 1.6 : 1));
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 
        0.06 + Math.sin(t * 2) * 0.03 + (isActive ? 0.08 : 0);
    }
  });

  // Smaller sizes to fit body proportions
  const innerRadius = 0.008 * sizeFactor;
  const glowRadius = 0.022 * sizeFactor;

  return (
    <group position={[0, chakra.yPosition, 0.04]}>
      {/* Äußerer Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[glowRadius, 16, 16]} />
        <meshBasicMaterial
          color={chakra.color}
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Innere Energiekugel */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setIsHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setIsHovered(false);
        }}
      >
        <sphereGeometry args={[innerRadius, 24, 24]} />
        <meshStandardMaterial
          color={chakra.color}
          emissive={chakra.color}
          emissiveIntensity={isActive ? 1.5 : isHovered ? 0.8 : 0.4}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>

      {/* Hover-Label */}
      {(isHovered || isActive) && (
        <Html center distanceFactor={3} position={[0, 0.03, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-background/95 backdrop-blur-sm px-1.5 py-0.5 rounded border border-primary/40 shadow-sm whitespace-nowrap">
            <span className="text-[8px] font-bold" style={{ color: chakra.color }}>{chakra.nameSanskrit}</span>
            <span className="text-[7px] text-foreground ml-1">{chakra.name}</span>
            <span className="text-[7px] text-primary font-mono ml-1">{chakra.frequency}Hz</span>
          </div>
        </Html>
      )}
    </group>
  );
}

interface ChakraVisualizationProps {
  onChakraClick?: (chakra: ChakraData) => void;
  activeChakraId?: string | null;
  bodyHalfWidth?: number;
}

export function ChakraVisualization({
  onChakraClick,
  activeChakraId,
  bodyHalfWidth = 0.12,
}: ChakraVisualizationProps) {
  const sizeFactor = Math.min(1.2, Math.max(0.6, bodyHalfWidth / 0.12));

  return (
    <group>
      {CHAKRAS.map((chakra) => (
        <ChakraSphere
          key={chakra.id}
          chakra={chakra}
          isActive={activeChakraId === chakra.id}
          onClick={() => onChakraClick?.(chakra)}
          sizeFactor={sizeFactor}
        />
      ))}
    </group>
  );
}

export default ChakraVisualization;
