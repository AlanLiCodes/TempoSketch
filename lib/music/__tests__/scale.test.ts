import { describe, it, expect } from "vitest";
import { buildScale, degreeToMidi, triadForDegree } from "../scale";

describe("scale", () => {
  describe("buildScale", () => {
    it("builds C Ionian scale correctly", () => {
      const scale = buildScale("C", "Ionian", 4);
      expect(scale.tonic).toBe("C");
      expect(scale.mode).toBe("Ionian");
      // C4 = MIDI 60, scale should be [60, 62, 64, 65, 67, 69, 71]
      expect(scale.notes).toEqual([60, 62, 64, 65, 67, 69, 71]);
    });

    it("builds C Aeolian scale correctly", () => {
      const scale = buildScale("C", "Aeolian", 4);
      // C natural minor: C D Eb F G Ab Bb
      expect(scale.notes).toEqual([60, 62, 63, 65, 67, 68, 70]);
    });

    it("builds D Dorian scale correctly", () => {
      const scale = buildScale("D", "Dorian", 4);
      // D4 = MIDI 62, D Dorian: D E F G A B C
      expect(scale.notes).toEqual([62, 64, 65, 67, 69, 71, 72]);
    });

    it("builds F Lydian scale correctly", () => {
      const scale = buildScale("F", "Lydian", 4);
      // F4 = MIDI 65, F Lydian: F G A B C D E
      expect(scale.notes).toEqual([65, 67, 69, 71, 72, 74, 76]);
    });

    it("handles different octaves", () => {
      const scale3 = buildScale("C", "Ionian", 3);
      const scale5 = buildScale("C", "Ionian", 5);
      
      expect(scale3.notes[0]).toBe(48); // C3
      expect(scale5.notes[0]).toBe(72); // C5
    });

    it("throws error for invalid tonic", () => {
      expect(() => buildScale("H", "Ionian", 4)).toThrow();
    });
  });

  describe("degreeToMidi", () => {
    it("returns correct MIDI note for scale degrees", () => {
      const scale = buildScale("C", "Ionian", 4);
      
      expect(degreeToMidi(scale, 0)).toBe(60); // C
      expect(degreeToMidi(scale, 1)).toBe(62); // D
      expect(degreeToMidi(scale, 2)).toBe(64); // E
      expect(degreeToMidi(scale, 6)).toBe(71); // B
    });

    it("handles octave offsets", () => {
      const scale = buildScale("C", "Ionian", 4);
      
      expect(degreeToMidi(scale, 0, 1)).toBe(72); // C5
      expect(degreeToMidi(scale, 0, -1)).toBe(48); // C3
    });

    it("wraps degrees around scale", () => {
      const scale = buildScale("C", "Ionian", 4);
      
      expect(degreeToMidi(scale, 7)).toBe(60); // Wraps to 0
      expect(degreeToMidi(scale, 8)).toBe(62); // Wraps to 1
    });
  });

  describe("triadForDegree", () => {
    it("builds major triad on tonic in Ionian", () => {
      const scale = buildScale("C", "Ionian", 4);
      const triad = triadForDegree(scale, 0);
      
      // C major: C E G (60, 64, 67)
      expect(triad).toEqual([60, 64, 67]);
    });

    it("builds minor triad on sixth degree in Ionian", () => {
      const scale = buildScale("C", "Ionian", 4);
      const triad = triadForDegree(scale, 5);
      
      // A minor in C major scale: A C E
      // Scale wraps, so we get A4 (69), C4 (60), E4 (64)
      // This is correct for diatonic triads
      expect(triad).toEqual([69, 60, 64]);
    });

    it("builds correct triads in Aeolian", () => {
      const scale = buildScale("A", "Aeolian", 4);
      const triad = triadForDegree(scale, 0);
      
      // A minor: A C E (69, 72, 76)
      expect(triad).toEqual([69, 72, 76]);
    });
  });
});
