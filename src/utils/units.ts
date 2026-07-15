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
 * Apply a diminishing-returns scale factor for very large bodies (e.g. the Sun).
 *
 * In non-realistic modes with high bodySizeMultiplier, the Sun's physical radius
 * (696,340 km) inflates so much that it visually swallows inner planets.
 * This function applies a logarithmic taper: the larger the body, the less
 * its multiplier scales, keeping large bodies dominant but not overwhelming.
 *
 * @param baseMultiplier  The raw bodySizeMultiplier from the store
 * @param radiusKm        The body's physical radius in km
 * @returns               An effective multiplier with diminishing returns for large bodies
 */
export function applySizeScaleFactor(baseMultiplier: number, radiusKm: number): number {
  if (baseMultiplier <= 1) return baseMultiplier;

  // Logarithmic taper: bodies > 10,000 km get progressively less scaling.
  // Factor ranges from ~1.0 (tiny bodies like asteroids) down to ~0.15 (Sun).
  const lnRatio = Math.log(radiusKm / 10_000) / Math.log(1000);
  const scaleFactor = Math.max(0.15, Math.min(1.0, 1 - lnRatio));

  return 1 + (baseMultiplier - 1) * scaleFactor;
}

/**
 * Compute the adaptive corona glow scale for the Sun.
 *
 * At high bodySizeMultiplier the standard 2.5× glow becomes enormous.
 * This function scales the glow radius inversely with the multiplier
 * so the corona stays visible but doesn't engulf the inner solar system.
 *
 * @param bodySizeMultiplier  Current size multiplier from the store
 * @returns                   Glow radius multiplier (1.0 = no glow, 2.5 = default)
 */
export function getSunGlowScale(bodySizeMultiplier: number): number {
  if (bodySizeMultiplier <= 10) return 2.5;
  // Gradually shrink from 2.5 toward 1.0 as multiplier grows
  return 1.0 + 1.5 * (10 / bodySizeMultiplier);
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
