import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Grid, Line } from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Info, Layers } from "lucide-react";
import * as THREE from "three";

// Create the cusp surface mesh
const CuspSurface = ({ showBifurcationSet }: { showBifurcationSet: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Create cusp surface geometry
  // The surface is defined by: 4x³ + 2ax + b = 0 (equilibrium condition)
  // We parametrize it as x = t, a = -6t², b = 8t³ for the fold curve
  // But we want the full surface, so we solve for x given a and b
  const geometry = useMemo(() => {
    const segments = 80;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Range for a and b
    const aMin = -3, aMax = 1;
    const bMin = -4, bMax = 4;

    // For each (a, b), find x values where dV/dx = 0
    // 4x³ + 2ax + b = 0
    const findRoots = (a: number, b: number): number[] => {
      const roots: number[] = [];
      // Numerical root finding
      for (let x = -3; x <= 3; x += 0.05) {
        const f1 = 4 * Math.pow(x, 3) + 2 * a * x + b;
        const f2 = 4 * Math.pow(x + 0.05, 3) + 2 * a * (x + 0.05) + b;
        if (f1 * f2 < 0) {
          // Newton-Raphson refinement
          let xr = x + 0.025;
          for (let i = 0; i < 5; i++) {
            const f = 4 * Math.pow(xr, 3) + 2 * a * xr + b;
            const df = 12 * Math.pow(xr, 2) + 2 * a;
            if (Math.abs(df) > 0.001) {
              xr -= f / df;
            }
          }
          roots.push(xr);
        }
      }
      return roots;
    };

    // Create surface points
    const pointMap: Map<string, number> = new Map();
    let vertexIndex = 0;

    for (let i = 0; i <= segments; i++) {
      const a = aMin + (aMax - aMin) * (i / segments);
      
      for (let j = 0; j <= segments; j++) {
        const b = bMin + (bMax - bMin) * (j / segments);
        
        const roots = findRoots(a, b);
        
        roots.forEach((x, rootIdx) => {
          // Check stability (second derivative)
          const d2V = 12 * x * x + 2 * a;
          const isStable = d2V > 0;
          
          // Position: (a, x, b) - x is the vertical axis
          vertices.push(a, x, b);
          
          // Color based on stability
          if (isStable) {
            colors.push(0.2, 0.8, 0.9); // Cyan for stable
          } else {
            colors.push(0.9, 0.3, 0.3); // Red for unstable
          }
          
          const key = `${i},${j},${rootIdx}`;
          pointMap.set(key, vertexIndex);
          vertexIndex++;
        });
      }
    }

    // Create faces by connecting adjacent points
    // This is simplified - we create the surface as points
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  // Create bifurcation set points for Line component
  const bifurcationPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    
    // Upper branch
    for (let a = -3; a <= 0; a += 0.05) {
      const b = Math.sqrt(-8 * Math.pow(a, 3) / 27);
      if (!isNaN(b)) {
        points.push([a, -3, b]);
      }
    }
    // Lower branch (reverse to connect)
    for (let a = 0; a >= -3; a -= 0.05) {
      const b = -Math.sqrt(-8 * Math.pow(a, 3) / 27);
      if (!isNaN(b)) {
        points.push([a, -3, b]);
      }
    }

    return points;
  }, []);

  // Slow rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cusp surface as points */}
      <points geometry={geometry}>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Bifurcation set curve using drei Line */}
      {showBifurcationSet && bifurcationPoints.length > 1 && (
        <Line
          points={bifurcationPoints}
          color="#f59e0b"
          lineWidth={2}
        />
      )}

      {/* Axes labels */}
      <Text
        position={[2, 0, 0]}
        fontSize={0.3}
        color="#06b6d4"
        anchorX="left"
      >
        a
      </Text>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="#8b5cf6"
        anchorX="center"
      >
        x
      </Text>
      <Text
        position={[0, 0, 3]}
        fontSize={0.3}
        color="#f59e0b"
        anchorX="center"
      >
        b
      </Text>
    </group>
  );
};

// Axes helper component
const Axes = () => {
  return (
    <group>
      {/* X axis (a) - cyan */}
      <Line
        points={[[-4, 0, 0], [2, 0, 0]]}
        color="#06b6d4"
        lineWidth={1}
      />
      
      {/* Y axis (x - state variable) - purple */}
      <Line
        points={[[0, -3, 0], [0, 3, 0]]}
        color="#8b5cf6"
        lineWidth={1}
      />
      
      {/* Z axis (b) - amber */}
      <Line
        points={[[0, 0, -5], [0, 0, 5]]}
        color="#f59e0b"
        lineWidth={1}
      />
    </group>
  );
};

const CuspSurface3D = () => {
  const [showBifurcationSet, setShowBifurcationSet] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-field-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-bifurkation text-sm font-medium uppercase tracking-wider mb-4 block">
            3D Visualisierung
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Die <span className="text-gradient-secondary">Kuspen-Fläche</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Interaktive 3D-Darstellung der Gleichgewichtsfläche im (a, x, b)-Raum. 
            Ziehen Sie zum Drehen, scrollen Sie zum Zoomen.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative bg-card border border-border rounded-2xl overflow-hidden"
          style={{ height: "500px" }}
        >
          <Canvas
            camera={{ position: [5, 4, 8], fov: 50 }}
            style={{ background: "hsl(222, 47%, 4%)" }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
            
            <CuspSurface showBifurcationSet={showBifurcationSet} />
            <Axes />
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={false}
              minDistance={3}
              maxDistance={20}
            />
            
            <Grid
              position={[0, -3, 0]}
              args={[10, 10]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#1e3a5f"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#2563eb"
              fadeDistance={25}
              fadeStrength={1}
              followCamera={false}
            />
          </Canvas>

          {/* Controls overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="field"
              size="icon"
              onClick={() => setShowBifurcationSet(!showBifurcationSet)}
              title="Bifurkationsset anzeigen"
            >
              <Layers className={`w-4 h-4 ${showBifurcationSet ? "text-chreode" : ""}`} />
            </Button>
            <Button
              variant="field"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>

          {/* Info overlay */}
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-16 right-4 w-80 bg-popover/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-elevated"
            >
              <h4 className="font-display text-sm font-semibold text-foreground mb-3">
                Die Kuspen-Fläche erklärt
              </h4>
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>
                  Diese Fläche zeigt alle Gleichgewichtspunkte der Potenzialfunktion 
                  V(x) = x⁴ + ax² + bx im dreidimensionalen (a, x, b)-Raum.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Stabile Gleichgewichte (Minima)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-katastrophe" />
                  <span>Instabile Gleichgewichte (Maxima)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chreode" />
                  <span>Bifurkationsset: 8a³ + 27b² = 0</span>
                </div>
                <p className="pt-2 border-t border-border">
                  Die gefaltete Struktur ("Kuspe") entsteht, wo drei Gleichgewichte 
                  existieren – zwei stabile und eines instabiles.
                </p>
              </div>
            </motion.div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Stabil</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border">
              <div className="w-2 h-2 rounded-full bg-katastrophe" />
              <span className="text-muted-foreground">Instabil</span>
            </div>
            {showBifurcationSet && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border">
                <div className="w-2 h-2 rounded-full bg-chreode" />
                <span className="text-muted-foreground">Bifurkation</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Explanation cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h4 className="font-display text-lg font-semibold text-foreground mb-3">
              Die Faltstruktur
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bei negativem a (links) faltet sich die Fläche und bildet drei Schichten: 
              zwei stabile (oben und unten) und eine instabile (Mitte). 
              Ein System, das sich auf der oberen Schicht befindet, kann bei 
              Variation von b plötzlich auf die untere "fallen" – das ist die Katastrophe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h4 className="font-display text-lg font-semibold text-foreground mb-3">
              Das Bifurkationsset
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die goldene Kurve auf der Grundebene zeigt das <em>Bifurkationsset</em> – 
              die Projektion der Faltenkante. Innerhalb dieser Kuspen-Form existieren 
              zwei stabile Zustände. An der Kurve selbst verschwinden Gleichgewichte 
              und Sprünge werden erzwungen.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CuspSurface3D;
