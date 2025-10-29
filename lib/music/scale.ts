/**
 * Music theory functions for scales, degrees, and chords
 */

export type Mode = "Ionian" | "Aeolian" | "Dorian" | "Lydian";

export interface Scale {
  tonic: string;
  mode: Mode;
  notes: number[]; // MIDI note numbers for the scale degrees
}

// Semitone intervals for each mode (from tonic)
const MODE_INTERVALS: Record<Mode, number[]> = {
  Ionian: [0, 2, 4, 5, 7, 9, 11], // Major scale
  Aeolian: [0, 2, 3, 5, 7, 8, 10], // Natural minor
  Dorian: [0, 2, 3, 5, 7, 9, 10], // Dorian mode
  Lydian: [0, 2, 4, 6, 7, 9, 11], // Lydian mode
};

// Note names to semitones from C
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

/**
 * Builds a scale given a tonic note, mode, and base octave
 * Returns an array of MIDI note numbers for the 7 scale degrees
 */
export function buildScale(tonic: string, mode: Mode, baseOctave = 4): Scale {
  const tonicSemitone = NOTE_TO_SEMITONE[tonic];
  if (tonicSemitone === undefined) {
    throw new Error(`Invalid tonic: ${tonic}`);
  }

  const intervals = MODE_INTERVALS[mode];
  const baseMidi = 12 * (baseOctave + 1) + tonicSemitone; // MIDI note for tonic at base octave

  const notes = intervals.map((interval) => baseMidi + interval);

  return { tonic, mode, notes };
}

/**
 * Converts a scale degree (0-6) to a MIDI note number
 * @param scale - The scale to use
 * @param degree - Scale degree (0-6, where 0 is tonic)
 * @param octaveOffset - Octave offset from base octave
 */
export function degreeToMidi(scale: Scale, degree: number, octaveOffset = 0): number {
  const normalizedDegree = ((degree % 7) + 7) % 7; // Ensure 0-6
  return scale.notes[normalizedDegree] + octaveOffset * 12;
}

/**
 * Returns a triad (three-note chord) for a given scale degree
 * Triad is built using root, third (skip 1), and fifth (skip 2) from that degree
 * Returns array of MIDI note numbers
 */
export function triadForDegree(scale: Scale, degree: number): number[] {
  const root = degreeToMidi(scale, degree);
  const third = degreeToMidi(scale, degree + 2); // Skip one degree
  const fifth = degreeToMidi(scale, degree + 4); // Skip two degrees

  return [root, third, fifth];
}
