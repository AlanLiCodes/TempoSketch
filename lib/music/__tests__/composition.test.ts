import { describe, it, expect } from "vitest";
import { chooseChords, melodyFromSamples } from "../composition";
import { buildScale } from "../scale";

describe("composition", () => {
  describe("chooseChords", () => {
    it("creates one chord per bar", () => {
      const samples01 = [0.5, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.6];
      const scale = buildScale("C", "Ionian", 4);
      
      const chords = chooseChords(samples01, 2, 4, scale);
      
      expect(chords).toHaveLength(2);
      expect(chords[0].startStep).toBe(0);
      expect(chords[0].duration).toBe(4);
      expect(chords[1].startStep).toBe(4);
      expect(chords[1].duration).toBe(4);
    });

    it("generates triads with 3 notes", () => {
      const samples01 = [0.5, 0.5, 0.5, 0.5];
      const scale = buildScale("C", "Ionian", 4);
      
      const chords = chooseChords(samples01, 1, 4, scale);
      
      expect(chords[0].notes).toHaveLength(3);
    });

    it("chooses chord based on median degree", () => {
      // High values (top of canvas) = high degrees
      const samplesHigh = [0.9, 0.9, 0.9, 0.9];
      const samplesLow = [0.1, 0.1, 0.1, 0.1];
      const scale = buildScale("C", "Ionian", 4);
      
      const chordsHigh = chooseChords(samplesHigh, 1, 4, scale);
      const chordsLow = chooseChords(samplesLow, 1, 4, scale);
      
      // High samples should produce higher chord notes
      const avgHigh = chordsHigh[0].notes.reduce((a, b) => a + b, 0) / 3;
      const avgLow = chordsLow[0].notes.reduce((a, b) => a + b, 0) / 3;
      
      expect(avgHigh).toBeGreaterThan(avgLow);
    });
  });

  describe("melodyFromSamples", () => {
    it("generates notes for all steps", () => {
      const samples01 = [0.5, 0.5, 0.5, 0.5];
      const scale = buildScale("C", "Ionian", 4);
      const chords = chooseChords(samples01, 1, 4, scale);
      
      const melody = melodyFromSamples(samples01, chords, 4, scale, 42);
      
      expect(melody.length).toBeGreaterThan(0);
      
      // Total duration should cover all steps
      const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
      expect(totalDuration).toBe(4);
    });

    it("generates deterministic melodies with same seed", () => {
      const samples01 = [0.5, 0.6, 0.4, 0.7];
      const scale = buildScale("C", "Ionian", 4);
      const chords = chooseChords(samples01, 1, 4, scale);
      
      const melody1 = melodyFromSamples(samples01, chords, 4, scale, 42);
      const melody2 = melodyFromSamples(samples01, chords, 4, scale, 42);
      
      expect(melody1).toEqual(melody2);
    });

    it("generates different melodies with different seeds", () => {
      const samples01 = [0.5, 0.6, 0.4, 0.7];
      const scale = buildScale("C", "Ionian", 4);
      const chords = chooseChords(samples01, 1, 4, scale);
      
      const melody1 = melodyFromSamples(samples01, chords, 4, scale, 42);
      const melody2 = melodyFromSamples(samples01, chords, 4, scale, 43);
      
      expect(melody1).not.toEqual(melody2);
    });

    it("assigns velocities between 0.6 and 0.9", () => {
      const samples01 = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const scale = buildScale("C", "Ionian", 4);
      const chords = chooseChords(samples01, 1, 8, scale);
      
      const melody = melodyFromSamples(samples01, chords, 8, scale, 42);
      
      melody.forEach((note) => {
        expect(note.velocity).toBeGreaterThanOrEqual(0.6);
        expect(note.velocity).toBeLessThanOrEqual(0.9);
      });
    });

    it("groups similar pitches into longer notes", () => {
      // All same height - should create fewer, longer notes
      const samples01 = Array(8).fill(0.5);
      const scale = buildScale("C", "Ionian", 4);
      const chords = chooseChords(samples01, 1, 8, scale);
      
      const melody = melodyFromSamples(samples01, chords, 8, scale, 42);
      
      // Should have fewer notes than steps due to grouping
      expect(melody.length).toBeLessThan(8);
    });
  });
});
