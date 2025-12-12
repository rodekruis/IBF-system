export const firstCharOfWordsToUpper = (input: string) => {
  return input
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const bboxCentroid = (
  bbox: [number, number, number, number],
): [number, number] => {
  const [minx, miny, maxx, maxy] = bbox;
  const centroidX = (minx + maxx) / 2;
  const centroidY = (miny + maxy) / 2;
  return [centroidX, centroidY];
};
