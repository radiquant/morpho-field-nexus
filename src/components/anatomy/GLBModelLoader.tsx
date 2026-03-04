/**
 * GLB Model Loader Komponente
 * Lädt GLB/GLTF 3D-Modelle und normalisiert sie automatisch
 * auf die Koordinaten des prozeduralen Modells (y: -0.15 bis 0.95)
 */
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

interface GLBModelLoaderProps {
  modelPath: string;
  opacity?: number;
  pulseIntensity?: number;
  wireframe?: boolean;
  highlightColor?: string;
  onLoaded?: () => void;
}

// Zielkoordinaten passend zum prozeduralen Modell und den Meridianpunkten
// Kopf ~0.85-0.95, Torso ~0.3-0.7, Becken ~0.2-0.3, Beine bis ~ -0.15
const TARGET_BOUNDS = {
  minY: -0.15,
  maxY: 0.95,
  centerX: 0,
  centerZ: 0,
};

export const AVAILABLE_MODELS = {
  fullBody: '/models/human-body.glb',
} as const;

export function GLBModelLoader({
  modelPath,
  opacity = 0.4,
  pulseIntensity = 0.01,
  wireframe = false,
  highlightColor,
  onLoaded,
}: GLBModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  // Clone, normalize bounds, apply materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // 1. Compute original bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // 2. Calculate scale to fit target height
    const targetHeight = TARGET_BOUNDS.maxY - TARGET_BOUNDS.minY; // 1.1
    const normalizeScale = targetHeight / size.y;

    // 3. Apply transform: center horizontally, align vertically
    clone.scale.setScalar(normalizeScale);
    clone.position.set(
      -center.x * normalizeScale + TARGET_BOUNDS.centerX,
      -box.min.y * normalizeScale + TARGET_BOUNDS.minY,
      -center.z * normalizeScale + TARGET_BOUNDS.centerZ,
    );

    // 4. Apply materials
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: highlightColor || '#a78bfa',
          transparent: true,
          opacity,
          metalness: 0.15,
          roughness: 0.75,
          wireframe,
          side: THREE.DoubleSide,
          depthWrite: true,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clone;
  }, [scene, opacity, wireframe, highlightColor]);

  useEffect(() => { onLoaded?.(); }, [clonedScene, onLoaded]);

  // Subtle breathing
  useFrame((state) => {
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 0.8) * pulseIntensity;
      groupRef.current.scale.set(1, 1 + breath, 1);
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.06;
    }
  });

  return (
    <Float speed={0.3} rotationIntensity={0} floatIntensity={0.05}>
      <group ref={groupRef}>
        <primitive object={clonedScene} />
      </group>
    </Float>
  );
}

// Preload
export function preloadModels() {
  Object.values(AVAILABLE_MODELS).forEach((path) => {
    try { useGLTF.preload(path); } catch { /* not yet available */ }
  });
}

export default GLBModelLoader;
