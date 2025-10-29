import { describe, it, expect } from "vitest";
import { clamp, lerp, mulberry32 } from "../utils";

describe("utils", () => {
  describe("clamp", () => {
    it("clamps value to minimum", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("clamps value to maximum", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("returns value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("works with negative ranges", () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });
  });

  describe("lerp", () => {
    it("returns a when t=0", () => {
      expect(lerp(10, 20, 0)).toBe(10);
    });

    it("returns b when t=1", () => {
      expect(lerp(10, 20, 1)).toBe(20);
    });

    it("interpolates correctly at t=0.5", () => {
      expect(lerp(10, 20, 0.5)).toBe(15);
    });

    it("works with negative values", () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
    });

    it("extrapolates when t > 1", () => {
      expect(lerp(0, 10, 2)).toBe(20);
    });
  });

  describe("mulberry32", () => {
    it("returns a deterministic sequence", () => {
      const rng1 = mulberry32(42);
      const rng2 = mulberry32(42);

      const values1 = [rng1(), rng1(), rng1()];
      const values2 = [rng2(), rng2(), rng2()];

      expect(values1).toEqual(values2);
    });

    it("returns different sequences for different seeds", () => {
      const rng1 = mulberry32(42);
      const rng2 = mulberry32(43);

      expect(rng1()).not.toBe(rng2());
    });

    it("returns values in range [0, 1)", () => {
      const rng = mulberry32(12345);

      for (let i = 0; i < 100; i++) {
        const value = rng();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });
});
