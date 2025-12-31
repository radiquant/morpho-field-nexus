/**
 * Interaktive Meridianpunkte für 3D-Anatomie-Modell
 * WHO-409-Punkte mit Frequenz-Interaktion
 * Hover-only Labels zur besseren Übersicht
 */
import { useRef, useMemo, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Zap } from 'lucide-react';
import { COMPLETE_ACUPUNCTURE_DATABASE } from '@/utils/meridianPoints';
import { getDysregulationColor, getDysregulationLevel } from './DysregulationLegend';

// Lokaler Typ basierend auf der Datenbank
type MeridianPoint = typeof COMPLETE_ACUPUNCTURE_DATABASE[number];

interface InteractiveMeridianPointsProps {
  visibleMeridians?: string[];
  activePointId?: string | null;
  onPointClick?: (point: MeridianPoint) => void;
  showLabels?: boolean;
  dysregulationScores?: Map<string, number>; // Punkt-ID -> Dysregulations-Score (0-1)
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
  isHovered,
  dysregulationScore,
  showLabel,
  onClick,
  onHover,
  onUnhover,
}: {
  point: MeridianPoint;
  position: THREE.Vector3;
  isActive: boolean;
  isHovered: boolean;
  dysregulationScore: number;
  showLabel: boolean;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Farbe basierend auf Dysregulations-Score (5 Stufen)
  const color = dysregulationScore > 0 
    ? getDysregulationColor(dysregulationScore)
    : ELEMENT_COLORS[point.element] || '#8b5cf6';
  
  const dysLevel = getDysregulationLevel(dysregulationScore);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Stärkeres Pulsieren bei höherer Dysregulation
      const pulseSpeed = 3 + dysregulationScore * 4;
      const pulseIntensity = 0.002 + dysregulationScore * 0.004;
      const pulse = Math.sin(state.clock.elapsedTime * pulseSpeed) * pulseIntensity + 0.012;
      
      const scaleFactor = isActive ? 1.8 : isHovered ? 1.4 : 1;
      meshRef.current.scale.setScalar(pulse * scaleFactor);
    }
  });
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          document.body.style.cursor = 'pointer'; 
          onHover();
        }}
        onPointerOut={() => { 
          document.body.style.cursor = 'default'; 
          onUnhover();
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1.2 : isHovered ? 0.8 : 0.3 + dysregulationScore * 0.5}
        />
      </mesh>
      
      {/* Label nur bei Hover oder aktiv - nicht dauerhaft */}
      {(isHovered || isActive) && (
        <Html center distanceFactor={8} position={[0, 0.03, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/40 shadow-lg min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary">{point.id}</span>
              <span 
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${color}20`, 
                  color: color 
                }}
              >
                {dysLevel.label}
              </span>
            </div>
            <span className="text-xs text-foreground">{point.nameGerman}</span>
            <div className="flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-mono text-primary">{point.frequency.toFixed(1)} Hz</span>
            </div>
            {dysregulationScore > 0 && (
              <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${dysregulationScore * 100}%`,
                    backgroundColor: color 
                  }}
                />
              </div>
            )}
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
  dysregulationScores = new Map(),
}: InteractiveMeridianPointsProps) {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  
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
          isHovered={hoveredPointId === point.id}
          dysregulationScore={dysregulationScores.get(point.id) || 0}
          showLabel={showLabels}
          onClick={() => handleClick(point)}
          onHover={() => setHoveredPointId(point.id)}
          onUnhover={() => setHoveredPointId(null)}
        />
      ))}
    </group>
  );
}

export default InteractiveMeridianPoints;
