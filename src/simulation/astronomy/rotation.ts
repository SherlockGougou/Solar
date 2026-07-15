/**
 * Compute the rotation angle of a celestial body at a given time.
 *
 * The rotation angle is used to spin the body mesh around its axis.
 */

import type { RotationDirection } from '../../data/celestial-bodies';
import { elapsedSecondsSinceJ2000 } from './time';

const TWO_PI = 2 * Math.PI;

/**
 * Compute the current rotation angle (in radians) for a body.
 *
 * @param rotationPeriodHours  Sidereal rotation period in hours
 * @param rotationDirection  'prograde' or 'retrograde'
 * @param simTimeUtcMs  Simulation time in UTC milliseconds
 * @returns Rotation angle in radians (Y-axis rotation)
 */
export function computeRotationAngle(
  rotationPeriodHours: number,
  rotationDirection: RotationDirection,
  simTimeUtcMs: number,
): number {
  const elapsed = elapsedSecondsSinceJ2000(simTimeUtcMs);
  const periodSeconds = rotationPeriodHours * 3600;
  const directionSign = rotationDirection === 'prograde' ? 1 : -1;

  return directionSign * TWO_PI * (elapsed / periodSeconds);
}
