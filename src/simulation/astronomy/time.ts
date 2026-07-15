/**
 * Time simulation utilities.
 *
 * Simulation time is stored as UTC milliseconds (same as Date.now()).
 * All position calculations use this timestamp directly — never frame accumulation.
 */

/** J2000.0 epoch: 2000-01-01T12:00:00 UTC in milliseconds */
export const J2000_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

/** Milliseconds per second */
export const MS_PER_S = 1000;

/** Seconds per day */
export const SEC_PER_DAY = 86_400;

/** Seconds per year (Julian year = 365.25 days) */
export const SEC_PER_YEAR = 365.25 * SEC_PER_DAY;

/**
 * Preset time scales: simulation seconds per real second.
 */
export const TIME_SCALES = [
  { label: '实时', value: 1 },
  { label: '1 分钟/秒', value: 60 },
  { label: '1 小时/秒', value: 3600 },
  { label: '1 天/秒', value: 86_400 },
  { label: '10 天/秒', value: 864_000 },
  { label: '30 天/秒', value: 2_592_000 },
  { label: '1 年/秒', value: 31_557_600 },
] as const;

/**
 * Compute elapsed seconds since J2000.0 epoch for a given simulation time.
 * This is the core value used in all orbital calculations.
 */
export function elapsedSecondsSinceJ2000(simTimeUtcMs: number): number {
  return (simTimeUtcMs - J2000_EPOCH_MS) / MS_PER_S;
}

/**
 * Compute mean anomaly at a given time.
 *
 * @param meanAnomalyAtEpochDeg  Mean anomaly at J2000.0 in degrees
 * @param orbitalPeriodDays  Orbital period in days
 * @param elapsedSeconds  Seconds since J2000.0
 * @returns Mean anomaly in radians
 */
export function meanAnomalyAtTime(
  meanAnomalyAtEpochDeg: number,
  orbitalPeriodDays: number,
  elapsedSeconds: number,
): number {
  const M0 = (meanAnomalyAtEpochDeg * Math.PI) / 180;
  const n = (2 * Math.PI) / (orbitalPeriodDays * SEC_PER_DAY); // mean motion (rad/s)
  return M0 + n * elapsedSeconds;
}
