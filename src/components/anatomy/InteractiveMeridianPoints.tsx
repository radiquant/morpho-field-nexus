/**
 * Interaktive Meridianpunkte für 3D-Anatomie-Modell
 * WHO-409-Punkte mit Frequenz-Interaktion
 */
import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Zap } from 'lucide-react';
import { COMPLETE_ACUPUNCTURE_DATABASE } from '@/utils/meridianPoints';

// Lokaler Typ basierend auf der Datenbank
type MeridianPoint = typeof COMPLETE_ACUPUNCTURE_DATABASE[number];

interface InteractiveMeridianPointsProps {
  visibleMeridians?: string[];
  activePointId?: string | null;
  onPointClick?: (point: MeridianPoint) => void;
  showLabels?: boolean;
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: '#22c55e',
  fire: '#ef4444',
  earth: '#f59e0b',
  metal: '#94a3b8',
  water: '#3b82f6',
};

function PointMesh({
  point,
  position,
  isActive,
  showLabel,
  onClick,
}: {
  point: MeridianPoint;
  position: THREE.Vector3;
  isActive: boolean;
  showLabel: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = ELEMENT_COLORS[point.element] || '#8b5cf6';
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.002 + 0.012;
      meshRef.current.scale.setScalar(isActive ? pulse * 1.8 : pulse);
    }
  });
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1 : 0.4}
        />
      </mesh>
      
      {(showLabel || isActive) && (
        <Html center distanceFactor={8} position={[0, 0.03, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-background/95 backdrop-blur-sm px-2 py-1 rounded border border-primary/40 shadow-lg">
            <span className="text-xs font-bold text-primary">{point.id}</span>
            <span className="text-xs text-foreground ml-1">{point.nameGerman}</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-mono text-primary">{point.frequency.toFixed(1)} Hz</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function InteractiveMeridianPoints({
  visibleMeridians,
  activePointId,
  onPointClick,
  showLabels = false,
}: InteractiveMeridianPointsProps) {
  
  const filteredPoints = useMemo(() => {
    if (!visibleMeridians || visibleMeridians.length === 0) {
      return COMPLETE_ACUPUNCTURE_DATABASE.slice(0, 50); // Limit für Performance
    }
    return COMPLETE_ACUPUNCTURE_DATABASE.filter(p => visibleMeridians.includes(p.meridian));
  }, [visibleMeridians]);
  
  const pointsWithPositions = useMemo(() => {
    return filteredPoints.map((point, index) => {
      const y = 0.8 - (index / filteredPoints.length) * 1.2;
      const x = (index % 2 === 0 ? -0.15 : 0.15) + Math.sin(index * 0.5) * 0.05;
      return { point, position: new THREE.Vector3(x, y, 0.05) };
    });
  }, [filteredPoints]);
  
  const handleClick = useCallback((point: MeridianPoint) => {
    onPointClick?.(point);
  }, [onPointClick]);
  
  return (
    <group>
      {pointsWithPositions.map(({ point, position }) => (
        <PointMesh
          key={point.id}
          point={point}
          position={position}
          isActive={activePointId === point.id}
          showLabel={showLabels}
          onClick={() => handleClick(point)}
        />
      ))}
    </group>
  );
}

export default InteractiveMeridianPoints;
