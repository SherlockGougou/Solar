/**
 * Compute 3D position of a celestial body from its orbital elements
 * at a given simulation time.
 *
 * Uses Kepler's equation for elliptical orbits and rotates
 * from the orbital plane to the ecliptic reference frame.
 */

import type { OrbitalElements } from '../../data/celestial-bodies';
import { solveKepler, degToRad } from './kepler';
import { elapsedSecondsSinceJ2000, meanAnomalyAtTime } from './time';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Compute the heliocentric ecliptic position of a body at a given time.
 *
 * @param orbit  Orbital elements
 * @param simTimeUtcMs  Simulation time in UTC milliseconds
 * @returns Position in km (heliocentric ecliptic coordinates)
 */
export function computeOrbitalPosition(
  orbit: OrbitalElements,
  simTimeUtcMs: number,
): Vec3 {
  const dt = elapsedSecondsSinceJ2000(simTimeUtcMs);

  // 1. Mean anomaly
  const M = meanAnomalyAtTime(
    orbit.meanAnomalyAtEpochDeg,
    orbit.orbitalPeriodDays,
    dt,
  );

  // 2. Solve Kepler's equation for eccentric anomaly
  const E = solveKepler(M, orbit.eccentricity);

  // 3. Position in orbital plane
  const a = orbit.semiMajorAxisKm;
  const e = orbit.eccentricity;
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);

  const xOrb = a * (cosE - e);
  const yOrb = a * Math.sqrt(1 - e * e) * sinE;

  // 4. Rotate to ecliptic coordinates
  // Using the 3 orbital angles: Ω (ascending node), i (inclination), ω (argument of periapsis)
  const Omega = degToRad(orbit.longitudeOfAscendingNodeDeg);
  const inc = degToRad(orbit.inclinationDeg);
  const omega = degToRad(orbit.argumentOfPeriapsisDeg);

  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosInc = Math.cos(inc);
  const sinInc = Math.sin(inc);
  const cosOmega_omega = Math.cos(omega);
  const sinOmega_omega = Math.sin(omega);

  // Rotation matrix elements (orbital plane → ecliptic)
  // This is the standard rotation using the three Euler angles
  const xx = cosOmega * cosOmega_omega - sinOmega * sinOmega_omega * cosInc;
  const xy = sinOmega * cosOmega_omega + cosOmega * sinOmega_omega * cosInc;
  const xz = sinOmega_omega * sinInc;

  const yx = -cosOmega * sinOmega_omega - sinOmega * cosOmega_omega * cosInc;
  const yy = -sinOmega * sinOmega_omega + cosOmega * cosOmega_omega * cosInc;
  const yz = cosOmega_omega * sinInc;

  return {
    x: xx * xOrb + yx * yOrb,
    y: xy * xOrb + yy * yOrb,
    z: xz * xOrb + yz * yOrb,
  };
}

/**
 * Compute the current distance from the Sun for a body.
 */
export function distanceFromSun(
  orbit: OrbitalElements,
  simTimeUtcMs: number,
): number {
  const pos = computeOrbitalPosition(orbit, simTimeUtcMs);
  return Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
}

/**
 * Generate points along an orbit ellipse for rendering orbit lines.
 *
 * @param orbit  Orbital elements
 * @param segments  Number of line segments
 * @returns Array of Vec3 points in km
 */
export function computeOrbitPath(
  orbit: OrbitalElements,
  segments = 256,
): Vec3[] {
  const points: Vec3[] = [];
  const a = orbit.semiMajorAxisKm;
  const e = orbit.eccentricity;

  const Omega = degToRad(orbit.longitudeOfAscendingNodeDeg);
  const inc = degToRad(orbit.inclinationDeg);
  const omega = degToRad(orbit.argumentOfPeriapsisDeg);

  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosInc = Math.cos(inc);
  const sinInc = Math.sin(inc);
  const cosOmega_omega = Math.cos(omega);
  const sinOmega_omega = Math.sin(omega);

  const xx = cosOmega * cosOmega_omega - sinOmega * sinOmega_omega * cosInc;
  const xy = sinOmega * cosOmega_omega + cosOmega * sinOmega_omega * cosInc;
  const xz = sinOmega_omega * sinInc;

  const yx = -cosOmega * sinOmega_omega - sinOmega * cosOmega_omega * cosInc;
  const yy = -sinOmega * sinOmega_omega + cosOmega * cosOmega_omega * cosInc;
  const yz = cosOmega_omega * sinInc;

  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * 2 * Math.PI;
    const cosE = Math.cos(E);
    const sinE = Math.sin(E);

    const xOrb = a * (cosE - e);
    const yOrb = a * Math.sqrt(1 - e * e) * sinE;

    points.push({
      x: xx * xOrb + yx * yOrb,
      y: xy * xOrb + yy * yOrb,
      z: xz * xOrb + yz * yOrb,
    });
  }

  return points;
}
