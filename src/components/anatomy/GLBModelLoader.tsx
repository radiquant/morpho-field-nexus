/**
 * GLB Model Loader Komponente
 * Lädt und rendert GLB/GLTF 3D-Modelle mit Draco-Kompression
 * Fallback auf prozedurales Modell wenn kein GLB verfügbar
 */
import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

interface GLBModelLoaderProps {
  modelPath: string;
  opacity?: number;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  pulseIntensity?: number;
  wireframe?: boolean;
  highlightColor?: string;
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

// Verfügbare Modelle
export const AVAILABLE_MODELS = {
  fullBody: '/models/human-body.glb',
} as const;

export function GLBModelLoader({
  modelPath,
  opacity = 0.4,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  pulseIntensity = 0.01,
  wireframe = false,
  highlightColor,
  onLoaded,
  onError,
}: GLBModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  // Clone scene to avoid shared state issues
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    
    // Apply materials
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = new THREE.MeshStandardMaterial({
          color: highlightColor || '#a78bfa',
          transparent: true,
          opacity,
          metalness: 0.15,
          roughness: 0.75,
          wireframe,
          side: THREE.DoubleSide,
          depthWrite: true,
        });
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clone;
  }, [scene, opacity, wireframe, highlightColor]);

  useEffect(() => {
    onLoaded?.();
  }, [clonedScene, onLoaded]);

  // Breathing animation
  useFrame((state) => {
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 0.8) * pulseIntensity;
      groupRef.current.scale.y = scale * (1 + breath);
      groupRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.15) * 0.06;
    }
  });

  return (
    <Float speed={0.3} rotationIntensity={0} floatIntensity={0.05}>
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={[scale, scale, scale]}
      >
        <primitive object={clonedScene} />
      </group>
    </Float>
  );
}

// Preload models
export function preloadModels() {
  Object.values(AVAILABLE_MODELS).forEach((path) => {
    try {
      useGLTF.preload(path);
    } catch {
      // Model not available yet
    }
  });
}

export default GLBModelLoader;
