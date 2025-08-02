import { format } from 'date-fns';
import { FeatureCollection, Point } from 'geojson';

// sort array ascending
const asc = (arr: number[]) => arr.sort((a: number, b: number) => a - b);

export const quantile = (arr: number[], q: number) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

export const firstCharOfWordsToUpper = (input: string) => {
  return input
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const downloadFile = (
  fileName: string,
  content: string,
  type: string,
) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = format(new Date(), 'yyyyMMddHHmmss');

  a.href = url;
  a.download = `${dateStr}-${fileName}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Converts a GeoJSON FeatureCollection of Point features to a CSV string.
 * The CSV will include columns for longitude, latitude, and all properties.
 * @param featureCollection GeoJSON FeatureCollection<Point>
 * @returns CSV string
 */
export function geojsonToCsv({ features }: FeatureCollection<Point>) {
  if (!features.length) return '';

  // collect all property keys
  const propertyKeys = Array.from(
    new Set(
      features.flatMap(({ properties }) =>
        properties ? Object.keys(properties) : [],
      ),
    ),
  ).filter((key) => !['pointDataId', 'dynamicData'].includes(key)); // exclude keys
  // header
  const header = ['lon', 'lat', ...propertyKeys].join(',');
  // rows
  const rows = features.map(({ geometry, properties }) => {
    const [longitude, latitude] = geometry.coordinates;
    const props = propertyKeys.map((key) => {
      if (properties && key in properties) {
        if (properties[key] === null) {
          return ''; // return empty string for null values
        }

        return JSON.stringify(properties[key]); // stringify to handle special characters
      }

      return ''; // return empty string if property is missing
    });

    return [longitude, latitude, ...props].join(',');
  });

  return [header, ...rows].join('\n');
}
