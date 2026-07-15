/**
 * Main 3D solar system scene.
 *
 * Renders all celestial bodies, orbit lines, lighting, camera,
 * and labels inside a React Three Fiber Canvas.
 *
 * Coordinate mapping: Ecliptic (X,Y,Z) → Three.js (X,Z,Y)
 * - Ecliptic X → Three.js X
 * - Ecliptic Y → Three.js Z
 * - Ecliptic Z (north ecliptic pole) → Three.js Y (up)
 */

import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CELESTIAL_BODIES } from '../../data/celestial-bodies';
import { computeOrbitalPosition } from '../../simulation/astronomy/orbital-elements';
import { computeRenderPosition } from '../../utils/units';
import { useSimulationStore } from '../../simulation/state/simulation-store';
import CelestialBodyMesh from './CelestialBodyMesh';
import OrbitLine from './OrbitLine';
import CameraController from './CameraController';
import StarBackground from './StarBackground';
import Lighting from './Lighting';
import BodyPointer from './BodyPointer';

/**
 * Wrapper that tracks a single body's position each frame and
 * provides it to the mesh and label children via a shared group.
 */
function TrackedBody({ bodyId }: { bodyId: string }) {
  const groupRef = useRef<THREE.Group>(null!);
  const body = CELESTIAL_BODIES.find((b) => b.id === bodyId)!;

  useFrame(() => {
    if (!groupRef.current) return;
    const state = useSimulationStore.getState();
    const isSun = body.id === 'sun' || !body.orbit;
    const posKm = isSun
      ? { x: 0, y: 0, z: 0 }
      : computeOrbitalPosition(body.orbit!, state.simulationTimeUtcMs);

    const renderPos = computeRenderPosition(posKm, state.orbitDistanceMultiplier);
    // Ecliptic → Three.js: swap Y↔Z
    groupRef.current.position.set(renderPos.x, renderPos.z, renderPos.y);
  });

  const showLabels = useSimulationStore((s) => s.showLabels);

  return (
    <group ref={groupRef}>
      <CelestialBodyMesh
        body={body}
        worldPosition={[0, 0, 0]}
        onClick={() => useSimulationStore.getState().selectBody(body.id)}
      />
      {showLabels && (
        <BodyPointer body={body} worldPosition={[0, 0, 0]} />
      )}
    </group>
  );
}

/** Grid helper for the ecliptic plane */
function EclipticGrid() {
  const showGrid = useSimulationStore((s) => s.showGrid);
  if (!showGrid) return null;

  return (
    <gridHelper
      args={[100, 50, '#333333', '#1a1a1a']}
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}

/** Time ticker: advances simulation time each frame using R3F's useFrame */
function TimeTicker() {
  const prevTime = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const delta = (now - prevTime.current) / 1000;
    prevTime.current = now;
    useSimulationStore.getState().advanceTime(delta);
  });

  return null;
}

function SceneContent() {
  const showOrbitLines = useSimulationStore((s) => s.showOrbitLines);

  return (
    <>
      <TimeTicker />
      <Lighting />
      <StarBackground />
      <EclipticGrid />
      <CameraController />

      {/* Orbit lines */}
      {showOrbitLines &&
        CELESTIAL_BODIES.map((body) =>
          body.orbit ? (
            <OrbitLine
              key={`orbit-${body.id}`}
              orbit={body.orbit}
              bodyId={body.id}
              color={body.display.glowColor ?? body.display.color}
            />
          ) : null,
        )}

      {/* Tracked celestial bodies */}
      {CELESTIAL_BODIES.map((body) => (
        <TrackedBody key={body.id} bodyId={body.id} />
      ))}
    </>
  );
}

export default function SolarScene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{
          position: [50, 30, 50],
          fov: 60,
          near: 0.0001,
          far: 100000,
        }}
        gl={{
          antialias: true,
          logarithmicDepthBuffer: true,
        }}
        style={{ background: '#000000' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
