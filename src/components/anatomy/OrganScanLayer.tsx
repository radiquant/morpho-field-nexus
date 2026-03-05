/**
 * NLS Organ-Scan-Punkte 3D-Layer
 * Visualisiert die vordefinierten NLS-Scan-Punkte als interaktive 3D-Elemente
 */
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { type OrganScanPoint, getOrganColor, getTissueIcon } from '@/hooks/useOrganScanPoints';

interface OrganScanLayerProps {
  points: OrganScanPoint[];
  activePointId: string | null;
  onPointClick: (point: OrganScanPoint) => void;
  selectedOrgan: string | null;
}

function ScanPointMesh({
  point,
  isActive,
  onClick,
}: {
  point: OrganScanPoint;
  isActive: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const color = getOrganColor(point.organSystem);
  const depthOpacity = point.layerDepth === 'deep' ? 0.6 : point.layerDepth === 'middle' ? 0.8 : 1.0;

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * (3 + point.scanFrequency * 0.1)) * 0.15 + 1;
      const scale = isActive ? 1.5 : isHovered ? 1.3 : 1;
      meshRef.current.scale.setScalar(pulse * scale);
    }
    if (ringRef.current && isActive) {
      ringRef.current.rotation.z += 0.02;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <group position={[point.x, point.y, point.z]}>
      {/* Scan-Ring bei aktiv */}
      {isActive && (
        <mesh ref={ringRef}>
          <torusGeometry args={[0.018, 0.002, 8, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Outer Glow */}
      <mesh>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2 * depthOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* Inner Glow */}
      <mesh>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.35 * depthOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* Punkt */}
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
        {/* Verschiedene Formen je nach Gewebetyp */}
        {point.tissueType === 'vessel' ? (
          <octahedronGeometry args={[0.01]} />
        ) : point.tissueType === 'node' || point.tissueType === 'conduction' ? (
          <dodecahedronGeometry args={[0.01]} />
        ) : (
          <sphereGeometry args={[0.008, 8, 8]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 2.0 : isHovered ? 1.4 : 0.9}
          transparent
          opacity={depthOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* Label */}
      {(isHovered || isActive) && (
        <Html center distanceFactor={3} position={[0, 0.025, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-background/95 backdrop-blur-sm px-2 py-1 rounded border border-primary/40 shadow-lg whitespace-nowrap">
            <div className="flex items-center gap-1">
              <span className="text-[8px]">{getTissueIcon(point.tissueType)}</span>
              <span className="text-[8px] font-bold text-foreground">{point.pointName}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[7px] font-mono text-primary">{point.scanFrequency.toFixed(1)} Hz</span>
              <span className="text-[7px] text-muted-foreground">• {point.layerDepth}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function OrganScanLayer({
  points,
  activePointId,
  onPointClick,
  selectedOrgan,
}: OrganScanLayerProps) {
  const visiblePoints = selectedOrgan
    ? points.filter(p => p.organSystem === selectedOrgan)
    : points;

  return (
    <group>
      {visiblePoints.map((point) => (
        <ScanPointMesh
          key={point.id}
          point={point}
          isActive={activePointId === point.id}
          onClick={() => onPointClick(point)}
        />
      ))}
    </group>
  );
}

export default OrganScanLayer;
