/**
 * Scene lighting:
 * - Point light at the Sun (origin)
 * - Ambient light for minimum visibility
 * - Toggle between scientific and assisted lighting
 */

import { useSimulationStore } from '../../simulation/state/simulation-store';

export default function Lighting() {
  const lightingMode = useSimulationStore((s) => s.lightingMode);

  const ambientIntensity = lightingMode === 'assisted' ? 0.5 : 0.15;
  const sunIntensity = lightingMode === 'assisted' ? 4 : 3;

  return (
    <>
      {/* Sun as point light at origin */}
      <pointLight
        position={[0, 0, 0]}
        color="#FDB813"
        intensity={sunIntensity}
        distance={0}
        decay={2}
      />

      {/* Ambient for minimum visibility — keeps backlit planets readable */}
      <ambientLight color="#505070" intensity={ambientIntensity} />
    </>
  );
}
