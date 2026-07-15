/**
 * Unit conversion utilities.
 *
 * Internal data model uses kilometers.
 * Rendering uses world units where 1 world unit = DISTANCE_SCALE_KM_PER_UNIT km.
 *
 * The two multipliers (bodySizeMultiplier, orbitDistanceMultiplier) are applied
 * independently at render time.
 */

/** 1 world unit = 1,000,000 km (1 million km) */
export const DISTANCE_SCALE_KM_PER_UNIT = 1_000_000;

/** Convert physical km to world units (without any multiplier) */
export function kmToWorldUnits(km: number): number {
  return km / DISTANCE_SCALE_KM_PER_UNIT;
}

/** Convert world units back to km */
export function worldUnitsToKm(wu: number): number {
  return wu * DISTANCE_SCALE_KM_PER_UNIT;
}

/**
 * Compute the render radius of a body in world units.
 *
 * renderRadius = physicalRadiusKm / scale * bodySizeMultiplier
 */
export function computeRenderRadius(
  radiusKm: number,
  bodySizeMultiplier: number,
): number {
  return (radiusKm / DISTANCE_SCALE_KM_PER_UNIT) * bodySizeMultiplier;
}

/**
 * Compute the render position of a body in world units.
 *
 * renderPosition = physicalPositionKm / scale * orbitDistanceMultiplier
 */
export function computeRenderPosition(
  positionKm: { x: number; y: number; z: number },
  orbitDistanceMultiplier: number,
): { x: number; y: number; z: number } {
  const scale = orbitDistanceMultiplier / DISTANCE_SCALE_KM_PER_UNIT;
  return {
    x: positionKm.x * scale,
    y: positionKm.y * scale,
    z: positionKm.z * scale,
  };
}
