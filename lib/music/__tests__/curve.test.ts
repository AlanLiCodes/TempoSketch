import { describe, it, expect } from "vitest";
import { quantizePolyline, yToDegreeIndex } from "../curve";

describe("curve", () => {
  describe("quantizePolyline", () => {
    it("returns middle height for empty polyline", () => {
      const result = quantizePolyline([], 8, 720, 280);
      expect(result).toHaveLength(8);
      expect(result.every((y) => y === 140)).toBe(true);
    });

    it("returns same y for single point", () => {
      const result = quantizePolyline([{ x: 100, y: 50 }], 8, 720, 280);
      expect(result).toHaveLength(8);
      expect(result.every((y) => y === 50)).toBe(true);
    });

    it("samples evenly spaced x positions", () => {
      const polyline = [
        { x: 0, y: 0 },
        { x: 720, y: 280 },
      ];
      const result = quantizePolyline(polyline, 3, 720, 280);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe(0);
      expect(result[1]).toBeCloseTo(140, 0);
      expect(result[2]).toBe(280);
    });

    it("interpolates between points", () => {
      const polyline = [
        { x: 0, y: 100 },
        { x: 360, y: 200 },
        { x: 720, y: 100 },
      ];
      const result = quantizePolyline(polyline, 5, 720, 280);
      
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(100);
      expect(result[2]).toBe(200);
      expect(result[4]).toBe(100);
    });

    it("handles unsorted points", () => {
      const polyline = [
        { x: 360, y: 150 },
        { x: 0, y: 100 },
        { x: 720, y: 200 },
      ];
      const result = quantizePolyline(polyline, 3, 720, 280);
      
      expect(result).toHaveLength(3);
      // Should sort by x first
      expect(result[0]).toBe(100);
      expect(result[2]).toBe(200);
    });
  });

  describe("yToDegreeIndex", () => {
    it("maps top to degree 6", () => {
      expect(yToDegreeIndex(0, 280)).toBe(6);
    });

    it("maps bottom to degree 0", () => {
      expect(yToDegreeIndex(280, 280)).toBe(0);
    });

    it("maps middle to degree 3", () => {
      const y = 280 / 2;
      const degree = yToDegreeIndex(y, 280);
      expect(degree).toBe(3);
    });

    it("clamps to valid range", () => {
      expect(yToDegreeIndex(-10, 280)).toBe(6);
      expect(yToDegreeIndex(300, 280)).toBe(0);
    });

    it("maps quarter points correctly", () => {
      expect(yToDegreeIndex(280 * 0.25, 280)).toBeGreaterThanOrEqual(4);
      expect(yToDegreeIndex(280 * 0.75, 280)).toBeLessThanOrEqual(2);
    });
  });
});
