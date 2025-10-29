/**
 * Functions for processing drawn curves into musical data
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Quantizes a polyline (array of points) to a fixed number of steps
 * Densifies the curve and samples y values at evenly spaced x positions
 * @param polyline - Array of {x, y} points from user drawing
 * @param totalSteps - Number of steps to sample (bars * stepsPerBar)
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @returns Array of y values (in pixels) for each step
 */
export function quantizePolyline(
  polyline: Point[],
  totalSteps: number,
  width: number,
  height: number
): number[] {
  if (polyline.length === 0) {
    // Return middle height for all steps if no polyline
    return Array(totalSteps).fill(height / 2);
  }

  if (polyline.length === 1) {
    // Single point - use it for all steps
    return Array(totalSteps).fill(polyline[0].y);
  }

  // Sort points by x to ensure left-to-right order
  const sorted = [...polyline].sort((a, b) => a.x - b.x);

  // Sample at evenly spaced x positions
  const samples: number[] = [];
  for (let i = 0; i < totalSteps; i++) {
    const targetX = (i / (totalSteps - 1)) * width;

    // Find the two points that bracket this x position
    let leftPoint = sorted[0];
    let rightPoint = sorted[sorted.length - 1];

    for (let j = 0; j < sorted.length - 1; j++) {
      if (sorted[j].x <= targetX && sorted[j + 1].x >= targetX) {
        leftPoint = sorted[j];
        rightPoint = sorted[j + 1];
        break;
      }
    }

    // Linear interpolation between the two points
    let y: number;
    if (rightPoint.x === leftPoint.x) {
      y = leftPoint.y;
    } else {
      const t = (targetX - leftPoint.x) / (rightPoint.x - leftPoint.x);
      y = leftPoint.y + (rightPoint.y - leftPoint.y) * t;
    }

    samples.push(y);
  }

  return samples;
}

/**
 * Maps a y pixel position to a scale degree index (0-6)
 * Top of canvas (y=0) maps to degree 6 (highest note)
 * Bottom of canvas (y=height) maps to degree 0 (lowest note)
 * @param y - Y position in pixels
 * @param height - Canvas height in pixels
 * @returns Scale degree index (0-6)
 */
export function yToDegreeIndex(y: number, height: number): number {
  // Invert: top = high degree, bottom = low degree
  const normalized = 1 - y / height; // 0 to 1, where 1 is top
  const degree = Math.floor(normalized * 7);
  return Math.max(0, Math.min(6, degree));
}
