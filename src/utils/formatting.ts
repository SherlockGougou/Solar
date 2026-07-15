/**
 * Formatting utilities for display.
 */

import { SPEED_OF_LIGHT_KM_S } from '../data/celestial-bodies';

/** Format a large number with locale-appropriate separators */
export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('zh-CN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

/** Format distance in km to a human-readable string */
export function formatDistance(km: number): string {
  if (km >= 1e9) {
    return `${(km / 1e9).toFixed(2)} × 10⁹ km`;
  }
  if (km >= 1e6) {
    return `${(km / 1e6).toFixed(2)} × 10⁶ km`;
  }
  return `${formatNumber(km)} km`;
}

/** Format a distance in km as light-time */
export function formatLightTime(km: number): string {
  const seconds = km / SPEED_OF_LIGHT_KM_S;
  if (seconds < 60) {
    return `约 ${seconds.toFixed(1)} 秒`;
  }
  const minutes = seconds / 60;
  if (minutes < 60) {
    const m = Math.floor(minutes);
    const s = Math.round(seconds % 60);
    return `约 ${m} 分 ${s} 秒`;
  }
  const hours = minutes / 60;
  return `约 ${hours.toFixed(1)} 小时`;
}

/** Format a rotation period in hours */
export function formatPeriod(hours: number): string {
  if (hours < 48) {
    return `${hours.toFixed(2)} 小时`;
  }
  const days = hours / 24;
  return `${days.toFixed(2)} 天`;
}

/** Format an orbital period in days */
export function formatOrbitalPeriod(days: number): string {
  if (days < 365.25) {
    return `${Math.round(days)} 天`;
  }
  const years = days / 365.25;
  return `${years.toFixed(2)} 年`;
}

/** Format a Date to local datetime string */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Format a Date to UTC datetime string */
export function formatDateTimeUTC(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

/** Format multiplier for display */
export function formatMultiplier(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M×`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K×`;
  return `${value}×`;
}
