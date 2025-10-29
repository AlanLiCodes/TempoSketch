/**
 * Functions for generating chords and melodies from quantized curve data
 */

import { Scale, degreeToMidi, triadForDegree } from "./scale";
import { yToDegreeIndex } from "./curve";
import { clamp, mulberry32 } from "./utils";

export interface Chord {
  notes: number[]; // MIDI note numbers
  startStep: number;
  duration: number; // in steps
}

export interface Note {
  midi: number;
  startStep: number;
  duration: number; // in steps
  velocity: number; // 0-1
}

/**
 * Generates chord progression from curve samples
 * Takes one chord per bar based on the median degree in that bar
 * @param samples01 - Y values normalized to 0-1 (1 = top, 0 = bottom)
 * @param bars - Number of bars
 * @param stepsPerBar - Steps per bar
 * @param scale - Musical scale to use
 * @returns Array of chords
 */
export function chooseChords(
  samples01: number[],
  bars: number,
  stepsPerBar: number,
  scale: Scale
): Chord[] {
  const chords: Chord[] = [];

  for (let bar = 0; bar < bars; bar++) {
    const startStep = bar * stepsPerBar;
    const endStep = startStep + stepsPerBar;
    const barSamples = samples01.slice(startStep, endStep);

    // Get median degree for this bar
    const degrees = barSamples.map((y01) => yToDegreeIndex((1 - y01) * 280, 280));
    const sorted = [...degrees].sort((a, b) => a - b);
    const medianDegree = sorted[Math.floor(sorted.length / 2)];

    // Build triad for this degree
    const notes = triadForDegree(scale, medianDegree);

    chords.push({
      notes,
      startStep,
      duration: stepsPerBar,
    });
  }

  return chords;
}

/**
 * Generates melody from curve samples
 * Snaps to chord tones with 80% probability, allows passing tones otherwise
 * Groups consecutive similar pitches into longer notes
 * @param samples01 - Y values normalized to 0-1
 * @param chords - Chord progression
 * @param stepsPerBar - Steps per bar
 * @param scale - Musical scale
 * @param seed - Random seed for deterministic generation
 * @returns Array of melody notes
 */
export function melodyFromSamples(
  samples01: number[],
  chords: Chord[],
  stepsPerBar: number,
  scale: Scale,
  seed: number
): Note[] {
  const rng = mulberry32(seed);
  const melody: Note[] = [];

  let i = 0;
  while (i < samples01.length) {
    const y01 = samples01[i];
    const targetDegree = yToDegreeIndex((1 - y01) * 280, 280);

    // Find which chord we're in
    const chordIndex = Math.floor(i / stepsPerBar);
    const currentChord = chords[chordIndex];

    // Snap to chord tone with 80% probability
    let noteMidi: number;
    if (rng() < 0.8 && currentChord) {
      // Choose closest chord tone
      const targetMidi = degreeToMidi(scale, targetDegree);
      const distances = currentChord.notes.map((n) => Math.abs(n - targetMidi));
      const minIndex = distances.indexOf(Math.min(...distances));
      noteMidi = currentChord.notes[minIndex];
    } else {
      // Use scale degree directly (passing tone)
      noteMidi = degreeToMidi(scale, targetDegree);
    }

    // Extend duration while pitch doesn't change much and we're within the same bar
    let duration = 1;
    const currentBar = Math.floor(i / stepsPerBar);
    while (
      i + duration < samples01.length &&
      duration < 4 &&
      Math.floor((i + duration) / stepsPerBar) === currentBar
    ) {
      const nextY01 = samples01[i + duration];
      const nextDegree = yToDegreeIndex((1 - nextY01) * 280, 280);
      const deltaDegree = Math.abs(nextDegree - targetDegree);

      // If the pitch change is small, extend the note
      if (deltaDegree === 0 || (deltaDegree === 1 && duration < 2)) {
        duration++;
      } else {
        break;
      }
    }

    // Velocity between 0.6 and 0.9
    const velocity = 0.6 + rng() * 0.3;

    melody.push({
      midi: noteMidi,
      startStep: i,
      duration,
      velocity,
    });

    i += duration;
  }

  return melody;
}
