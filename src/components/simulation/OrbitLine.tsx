/**
 * Orbit line rendered as an elliptical path.
 *
 * Generated from orbital elements, not circles.
 * Highlighted when the parent body is selected.
 * Uses drei Line for proper screen-space line width.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitalElements } from '../../data/celestial-bodies';
import { computeOrbitPath } from '../../simulation/astronomy/orbital-elements';
import { computeRenderPosition } from '../../utils/units';
import { useSimulationStore } from '../../simulation/state/simulation-store';

interface Props {
  orbit: OrbitalElements;
  bodyId: string;
  color?: string;
}

/** Default opacity when body is not selected */
const OPACITY_NORMAL = 0.3;
/** Opacity when the body is selected */
const OPACITY_SELECTED = 0.75;
/** Line width in pixels */
const LINE_WIDTH = 1.2;

export default function OrbitLine({ orbit, bodyId, color = '#ffffff' }: Props) {
  const orbitDistanceMultiplier = useSimulationStore((s) => s.orbitDistanceMultiplier);
  const lineRef = useRef<any>(null);

  const points = useMemo(() => {
    const pathPoints = computeOrbitPath(orbit, 256);
    return pathPoints.map((p) => {
      const rp = computeRenderPosition(p, orbitDistanceMultiplier);
      // Ecliptic (x,y,z) → Three.js (x,z,y)
      return [rp.x, rp.z, rp.y] as [number, number, number];
    });
  }, [orbit, orbitDistanceMultiplier]);

  // Update opacity on selection change
  useFrame(() => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.Material & { opacity: number };
    if (!mat) return;
    const sel = useSimulationStore.getState().selectedBodyId;
    mat.opacity = sel === bodyId ? OPACITY_SELECTED : OPACITY_NORMAL;
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={LINE_WIDTH}
      transparent
      opacity={OPACITY_NORMAL}
      depthWrite={false}
    />
  );
}
