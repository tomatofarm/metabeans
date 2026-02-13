import type { StatusLevel } from './constants';
import {
  IAQ_THRESHOLDS,
  INLET_TEMP_THRESHOLDS,
  COMM_ERROR_THRESHOLDS,
  STATUS_LEVEL_PRIORITY,
} from './constants';

/**
 * Get the highest severity status from an array of statuses.
 * Used for status propagation: child's highest risk → parent status.
 */
export function propagateStatus(statuses: StatusLevel[]): StatusLevel {
  if (statuses.length === 0) return 'green';
  let maxPriority = 0;
  for (const s of statuses) {
    const p = STATUS_LEVEL_PRIORITY[s];
    if (p > maxPriority) maxPriority = p;
  }
  if (maxPriority >= 2) return 'red';
  if (maxPriority >= 1) return 'yellow';
  return 'green';
}

/**
 * Board temperature status.
 * Uses configurable thresholds from monitoring_thresholds table.
 */
export function getBoardTempStatus(
  ppTemp: number,
  yellowMin: number,
  redMin: number,
): StatusLevel {
  if (ppTemp >= redMin) return 'red';
  if (ppTemp >= yellowMin) return 'yellow';
  return 'green';
}

/**
 * Spark status.
 * Uses configurable thresholds from monitoring_thresholds table.
 */
export function getSparkStatus(
  ppSpark: number,
  yellowMin: number,
  redMin: number,
): StatusLevel {
  if (ppSpark >= redMin) return 'red';
  if (ppSpark >= yellowMin) return 'yellow';
  return 'green';
}

/**
 * Inlet temperature status.
 * Yellow: 70°C+, Red: 100°C+
 */
export function getInletTempStatus(inletTemp: number): StatusLevel {
  if (inletTemp >= INLET_TEMP_THRESHOLDS.redMin) return 'red';
  if (inletTemp >= INLET_TEMP_THRESHOLDS.yellowMin) return 'yellow';
  return 'green';
}

/**
 * Communication connection status.
 * Based on time since last data received.
 * Green: normal, Yellow: 1+ hour disconnected, Red: 1+ day disconnected
 */
export function getCommStatus(lastSeenAt: string | null): StatusLevel {
  if (!lastSeenAt) return 'red';
  const elapsed = Date.now() - new Date(lastSeenAt).getTime();
  if (elapsed >= COMM_ERROR_THRESHOLDS.redMs) return 'red';
  if (elapsed >= COMM_ERROR_THRESHOLDS.yellowMs) return 'yellow';
  return 'green';
}

/**
 * Filter inspection status.
 * Based on differential pressure comparison.
 * Green: normal, Yellow: check needed
 */
export function getFilterStatus(needsCheck: boolean): StatusLevel {
  return needsCheck ? 'yellow' : 'green';
}

/**
 * Dust removal performance (PM2.5).
 * Green: good (≤15), Yellow: normal (16~35), Red: check needed (36+)
 */
export function getDustRemovalPm25Status(pm2_5: number): StatusLevel {
  if (pm2_5 > IAQ_THRESHOLDS.pm2_5.yellowMax) return 'red';
  if (pm2_5 > IAQ_THRESHOLDS.pm2_5.greenMax) return 'yellow';
  return 'green';
}

/**
 * Dust removal performance (PM10).
 * Green: good (≤30), Yellow: normal (31~75), Red: check needed (76+)
 */
export function getDustRemovalPm10Status(pm10: number): StatusLevel {
  if (pm10 > IAQ_THRESHOLDS.pm10.yellowMax) return 'red';
  if (pm10 > IAQ_THRESHOLDS.pm10.greenMax) return 'yellow';
  return 'green';
}

/**
 * Power status.
 * Green: On (1), Red: Off (0)
 */
export function getPowerStatus(ppPower: number): StatusLevel {
  return ppPower === 1 ? 'green' : 'red';
}

/**
 * IAQ metric status by key.
 */
export function getIAQStatus(
  metric: keyof typeof IAQ_THRESHOLDS,
  value: number,
): StatusLevel {
  const threshold = IAQ_THRESHOLDS[metric];
  if (value > threshold.yellowMax) return 'red';
  if (value > threshold.greenMax) return 'yellow';
  return 'green';
}

/**
 * Check if cleaning is needed based on spark threshold formula.
 * Cleaning needed = (avg spark in window >= threshold) AND (current DP >= base * (1 + rate/100))
 */
export function isCleaningNeeded(
  avgSpark: number,
  currentDiffPressure: number,
  sparkThreshold: number,
  pressureBase: number,
  pressureRate: number,
): boolean {
  const sparkExceeded = avgSpark >= sparkThreshold;
  const pressureExceeded = currentDiffPressure >= pressureBase * (1 + pressureRate / 100);
  return sparkExceeded && pressureExceeded;
}

/**
 * Check if gateway status flag bit is set.
 */
export function isStatusFlagSet(flags: number, bitPosition: number): boolean {
  return (flags & (1 << bitPosition)) !== 0;
}
