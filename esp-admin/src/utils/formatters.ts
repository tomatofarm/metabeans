import dayjs from 'dayjs';

/**
 * Format date string to localized display format
 */
export function formatDate(date: string | null | undefined, format = 'YYYY-MM-DD'): string {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/**
 * Format datetime string
 */
export function formatDateTime(date: string | null | undefined): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
}

/**
 * Format datetime without seconds
 */
export function formatDateTimeShort(date: string | null | undefined): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

/**
 * Format Unix timestamp (seconds) to datetime
 */
export function formatTimestamp(ts: number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs.unix(ts).format(format);
}

/**
 * Format number with locale-specific separators
 */
export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value == null) return '-';
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format temperature with unit
 */
export function formatTemperature(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '-';
  return `${formatNumber(value, decimals)}°C`;
}

/**
 * Format flow rate (CMH)
 */
export function formatFlow(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '-';
  return `${formatNumber(value, decimals)} CMH`;
}

/**
 * Format velocity (m/s)
 */
export function formatVelocity(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '-';
  return `${formatNumber(value, decimals)} m/s`;
}

/**
 * Format pressure (Pa)
 */
export function formatPressure(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '-';
  return `${formatNumber(value, decimals)} Pa`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number | null | undefined, decimals = 0): string {
  if (value == null) return '-';
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Format currency (KRW)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return `${formatNumber(value, 0)}원`;
}

/**
 * Format PM concentration with unit
 */
export function formatPM(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '-';
  return `${formatNumber(value, decimals)} µg/m³`;
}

/**
 * Format CO2 concentration with unit
 */
export function formatCO2(value: number | null | undefined): string {
  if (value == null) return '-';
  return `${formatNumber(value, 0)} ppm`;
}

/**
 * Format humidity
 */
export function formatHumidity(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '-';
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Format damper opening as percentage
 */
export function formatDamper(value: number | null | undefined): string {
  return formatPercent(value, 1);
}
