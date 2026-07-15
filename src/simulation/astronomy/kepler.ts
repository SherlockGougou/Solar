/**
 * Kepler equation solver and orbital mechanics utilities.
 *
 * All angles in radians internally. Input/output conversions
 * are handled at the boundary.
 */

/** Degrees to radians */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Radians to degrees */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Solve Kepler's equation M = E - e * sin(E) for E using Newton-Raphson.
 *
 * @param M  Mean anomaly in radians
 * @param e  Orbital eccentricity (0 <= e < 1)
 * @param tolerance  Convergence tolerance
 * @param maxIterations  Maximum iterations
 * @returns Eccentric anomaly in radians
 */
export function solveKepler(
  M: number,
  e: number,
  tolerance = 1e-12,
  maxIterations = 50,
): number {
  // Normalize M to [0, 2π)
  const twoPi = 2 * Math.PI;
  M = ((M % twoPi) + twoPi) % twoPi;

  // Initial guess
  let E = M;

  // For high eccentricity, use a better initial guess
  if (e > 0.8) {
    E = Math.PI;
  }

  for (let i = 0; i < maxIterations; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tolerance) break;
  }

  return E;
}

/**
 * Compute true anomaly from eccentric anomaly.
 *
 * @param E  Eccentric anomaly in radians
 * @param e  Orbital eccentricity
 * @returns True anomaly in radians
 */
export function trueAnomalyFromEccentric(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2),
  );
}

/**
 * Compute heliocentric distance from eccentric anomaly.
 *
 * @param a  Semi-major axis
 * @param e  Eccentricity
 * @param E  Eccentric anomaly in radians
 * @returns Distance from central body
 */
export function orbitalRadius(a: number, e: number, E: number): number {
  return a * (1 - e * Math.cos(E));
}
