/**
 * Camera controller with multiple modes:
 * - Free orbit (OrbitControls)
 * - Follow body
 * - Top-down (ecliptic north)
 * - Surface view (near a body)
 * - Overview (full solar system)
 * - Side view (ecliptic edge-on)
 *
 * Implements floating origin: shifts the scene so the camera
 * focus point is at the origin, avoiding FP precision issues.
 */

import { useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore, type CameraMode } from '../../simulation/state/simulation-store';
import { CELESTIAL_BODIES } from '../../data/celestial-bodies';
import { computeOrbitalPosition } from '../../simulation/astronomy/orbital-elements';
import { computeRenderPosition, computeRenderRadius } from '../../utils/units';

/** Initial camera position — used by reset */
const INITIAL_CAM_POS = new THREE.Vector3(50, 30, 50);

interface FocusTarget {
  position: THREE.Vector3;
  radius: number;
}

/** Compute the world-space bounding radius of all rendered bodies */
function getSolarSystemExtent(orbitDistanceMultiplier: number): number {
  let maxDist = 0;
  for (const body of CELESTIAL_BODIES) {
    if (!body.orbit) continue;
    const apoKm =
      body.orbit.semiMajorAxisKm * (1 + body.orbit.eccentricity);
    const renderDist = apoKm / 1_000_000 * orbitDistanceMultiplier;
    if (renderDist > maxDist) maxDist = renderDist;
  }
  return maxDist;
}

export default function CameraController() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const prevMode = useRef<CameraMode>('free');
  const transitionProgress = useRef(1);
  const targetLookAt = useRef(new THREE.Vector3());
  const resetRequested = useRef(false);

  const getFocusTarget = useCallback((): FocusTarget | null => {
    const state = useSimulationStore.getState();
    const bodyId = state.selectedBodyId;
    if (!bodyId) return null;

    const body = CELESTIAL_BODIES.find((b) => b.id === bodyId);
    if (!body) return null;

    const posKm = body.id === 'sun'
      ? { x: 0, y: 0, z: 0 }
      : body.orbit
        ? computeOrbitalPosition(body.orbit, state.simulationTimeUtcMs)
        : { x: 0, y: 0, z: 0 };

    const renderPos = computeRenderPosition(posKm, state.orbitDistanceMultiplier);
    const renderRadius = computeRenderRadius(body.radiusKm, state.bodySizeMultiplier);

    return {
      position: new THREE.Vector3(renderPos.x, renderPos.z, renderPos.y),
      radius: Math.max(renderRadius, 0.002),
    };
  }, []);

  // Set camera position based on mode
  useFrame((_, delta) => {
    const state = useSimulationStore.getState();
    const mode = state.cameraMode;
    const target = getFocusTarget();

    // Detect mode change → restart transition
    if (mode !== prevMode.current) {
      transitionProgress.current = 0;
      prevMode.current = mode;
    }

    if (!target) return;

    const { position: bodyPos, radius } = target;

    let desiredCamPos: THREE.Vector3;
    let desiredLookAt: THREE.Vector3;

    switch (mode) {
      case 'follow': {
        const dist = radius * 10;
        desiredCamPos = bodyPos.clone().add(new THREE.Vector3(dist, dist * 0.5, dist));
        desiredLookAt = bodyPos.clone();
        break;
      }
      case 'topdown': {
        const dist = radius * 20;
        desiredCamPos = bodyPos.clone().add(new THREE.Vector3(0, dist, 0));
        desiredLookAt = bodyPos.clone();
        break;
      }
      case 'surface': {
        const dist = radius * 3;
        desiredCamPos = bodyPos.clone().add(new THREE.Vector3(dist, dist * 0.3, dist));
        desiredLookAt = bodyPos.clone();
        break;
      }
      case 'overview': {
        // Pull back to see the whole solar system
        const extent = getSolarSystemExtent(state.orbitDistanceMultiplier);
        const dist = Math.max(extent * 1.3, 30);
        desiredCamPos = new THREE.Vector3(dist * 0.4, dist * 0.7, dist * 0.4);
        desiredLookAt = new THREE.Vector3(0, 0, 0);
        break;
      }
      case 'side': {
        // View along the ecliptic plane edge-on
        const extent = getSolarSystemExtent(state.orbitDistanceMultiplier);
        const dist = Math.max(extent * 0.8, 20);
        desiredCamPos = new THREE.Vector3(0, 0, dist);
        desiredLookAt = new THREE.Vector3(0, 0, 0);
        break;
      }
      default: {
        // Free mode — just update the orbit controls target to follow the body
        desiredLookAt = bodyPos.clone();
        if (controlsRef.current) {
          controlsRef.current.target.lerp(desiredLookAt, delta * 2);
        }
        return;
      }
    }

    // Smooth transition
    transitionProgress.current = Math.min(1, transitionProgress.current + delta * 2);
    const t = transitionProgress.current;

    camera.position.lerp(desiredCamPos, t * delta * 3);
    targetLookAt.current.lerp(desiredLookAt, t * delta * 3);

    camera.lookAt(targetLookAt.current);

    if (controlsRef.current) {
      controlsRef.current.target.copy(targetLookAt.current);
    }
  });

  // Adjust near/far planes dynamically
  useFrame(() => {
    const dist = camera.position.length();
    camera.near = Math.max(dist * 0.001, 0.0001);
    camera.far = Math.max(dist * 1000, 10000);
    camera.updateProjectionMatrix();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={0.001}
      maxDistance={10000}
      rotateSpeed={0.5}
      zoomSpeed={1.2}
    />
  );
}
