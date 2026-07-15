/**
 * Individual celestial body mesh.
 *
 * Renders a colored sphere with:
 * - Correct axial tilt
 * - Rotation animation from simulation time
 * - Equator ring to observe rotation direction
 * - Rim glow for edge visibility
 * - Sun corona glow
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CelestialBody } from '../../data/celestial-bodies';
import { computeRenderRadius } from '../../utils/units';
import { computeRotationAngle } from '../../simulation/astronomy/rotation';
import { useSimulationStore } from '../../simulation/state/simulation-store';

interface Props {
  body: CelestialBody;
  worldPosition: [number, number, number];
  onClick?: () => void;
}

/**
 * Fresnel rim-glow shader material.
 * Renders a transparent shell that brightens at glancing angles,
 * making planets visible even when backlit.
 */
function RimGlowMaterial({ color, intensity = 0.6 }: { color: string; intensity?: number }) {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
    }),
    [color, intensity],
  );

  return (
    <shaderMaterial
      uniforms={uniforms}
      transparent
      depthWrite={false}
      side={THREE.BackSide}
      vertexShader={`
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `}
      fragmentShader={`
        uniform vec3 glowColor;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float fresnel = 1.0 - abs(dot(vNormal, vViewDir));
          fresnel = pow(fresnel, 2.5) * intensity;
          gl_FragColor = vec4(glowColor, fresnel);
        }
      `}
    />
  );
}

/**
 * Sun corona glow - a larger transparent sphere with additive blending
 * that simulates a bloom/corona effect around the Sun.
 */
function SunGlow({ radius, color }: { radius: number; color: string }) {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
    }),
    [color],
  );

  return (
    <mesh>
      <sphereGeometry args={[radius * 2.5, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mvPosition.xyz);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 glowColor;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            float rim = 1.0 - abs(dot(vNormal, vViewDir));
            rim = pow(rim, 3.0);
            // Blend between core glow and outer corona
            float core = pow(rim, 1.5) * 0.8;
            float corona = pow(rim, 4.0) * 0.4;
            float alpha = core + corona;
            gl_FragColor = vec4(glowColor * 1.5, alpha);
          }
        `}
      />
    </mesh>
  );
}

export default function CelestialBodyMesh({ body, worldPosition, onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  const bodySizeMultiplier = useSimulationStore((s) => s.bodySizeMultiplier);
  const renderRadius = computeRenderRadius(body.radiusKm, bodySizeMultiplier);

  // Minimum visible radius so planets are clickable
  const effectiveRadius = Math.max(renderRadius, 0.003);

  const isEmissive = body.display.emissive ?? false;

  // Animate rotation each frame
  useFrame(() => {
    if (!meshRef.current) return;
    const simTime = useSimulationStore.getState().simulationTimeUtcMs;
    const angle = computeRotationAngle(
      body.rotationPeriodHours,
      body.rotationDirection,
      simTime,
    );
    meshRef.current.rotation.y = angle;
  });

  return (
    <group position={worldPosition}>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[effectiveRadius, 32, 32]} />
        {isEmissive ? (
          <meshStandardMaterial
            color={body.display.color}
            emissive={body.display.color}
            emissiveIntensity={3}
            roughness={1}
          />
        ) : (
          <meshStandardMaterial
            color={body.display.color}
            emissive={body.display.color}
            emissiveIntensity={0.2}
            roughness={0.7}
            metalness={0.1}
          />
        )}

        {/* Equator ring for rotation visibility */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[effectiveRadius * 1.01, effectiveRadius * 1.03, 64]} />
          <meshBasicMaterial color="white" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </mesh>

      {/* Rim glow - visible edge lighting for all bodies */}
      {isEmissive ? (
        <SunGlow radius={effectiveRadius} color={body.display.glowColor ?? body.display.color} />
      ) : (
        <mesh scale={1.15}>
          <sphereGeometry args={[effectiveRadius, 32, 32]} />
          <RimGlowMaterial color={body.display.glowColor ?? body.display.color} intensity={0.7} />
        </mesh>
      )}

      {/* Axial tilt indicator */}
      <group rotation={[THREE.MathUtils.degToRad(body.axialTiltDeg), 0, 0]}>
        <mesh>
          <cylinderGeometry args={[effectiveRadius * 0.008, effectiveRadius * 0.008, effectiveRadius * 3, 6]} />
          <meshBasicMaterial color="white" transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
}
