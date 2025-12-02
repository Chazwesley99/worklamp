/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Convert an array of objects to CSV format
 * All values are wrapped in quotes for proper CSV formatting
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) {
    return '';
  }

  // Create header row - all headers wrapped in quotes
  const headerRow = headers.map((h) => `"${escapeCSVValue(h.label)}"`).join(',');

  // Create data rows - all values wrapped in quotes
  const dataRows = data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header.key];
        return `"${escapeCSVValue(formatValue(value))}"`;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape special characters in CSV values
 * Escapes double quotes by doubling them (standard CSV format)
 */
function escapeCSVValue(value: string): string {
  // Escape any double quotes by doubling them
  return value.replace(/"/g, '""');
}

/**
 * Format a value for CSV output
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string
): void {
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, filename);
}
