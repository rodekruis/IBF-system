export function formatActionUnitValue(
  value: number,
  numberFormat: string,
): string {
  if (value === null) {
    return null;
  } else if (numberFormat === 'perc') {
    return Math.round(value * 100).toLocaleString() + '%';
  } else if (numberFormat === 'decimal2') {
    return (Math.round(value * 100) / 100).toLocaleString();
  } else if (numberFormat === 'decimal0') {
    return Math.round(value).toLocaleString();
  } else {
    return Math.round(value).toLocaleString();
  }
}
