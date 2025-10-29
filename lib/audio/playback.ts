/**
 * Audio playback using Tone.js
 */

import * as Tone from "tone";
import { Chord, Note } from "../music/composition";
import { mulberry32 } from "../music/utils";

export interface PlaybackOptions {
  tempo: number;
  stepsPerBar: number;
  bars: number;
  humanize?: boolean;
  swing?: boolean;
  seed?: number;
}

let polySynth: Tone.PolySynth | null = null;
let leadSynth: Tone.Synth | null = null;

/**
 * Initialize synths if not already created
 */
function initSynths() {
  if (!polySynth) {
    polySynth = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
      volume: -8,
    }).toDestination();
  }

  if (!leadSynth) {
    leadSynth = new Tone.Synth({
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.4,
      },
      volume: -6,
    }).toDestination();
  }
}

/**
 * Schedules playback of chords and melody using Tone.Transport
 */
export async function schedulePlayback(
  melody: Note[],
  chords: Chord[],
  options: PlaybackOptions
): Promise<void> {
  await Tone.start();
  initSynths();

  // Stop and clear any existing events
  Tone.Transport.stop();
  Tone.Transport.cancel(0);

  // Set tempo
  Tone.Transport.bpm.value = options.tempo;

  // Calculate step duration in seconds
  const stepDuration = (60 / options.tempo / options.stepsPerBar) * 4; // assuming 4/4 time

  const rng = options.humanize && options.seed !== undefined ? mulberry32(options.seed + 1000) : null;

  // Schedule chords
  if (polySynth) {
    chords.forEach((chord) => {
      const startTime = chord.startStep * stepDuration;
      const duration = chord.duration * stepDuration;

      // Convert MIDI to frequency
      const frequencies = chord.notes.map((midi) => Tone.Frequency(midi, "midi").toFrequency());

      Tone.Transport.schedule((time) => {
        polySynth?.triggerAttackRelease(frequencies, duration, time, 0.5);
      }, startTime);
    });
  }

  // Schedule melody
  if (leadSynth) {
    melody.forEach((note) => {
      let startTime = note.startStep * stepDuration;
      const duration = note.duration * stepDuration;

      // Apply swing: delay every 2nd step within the bar
      if (options.swing) {
        const stepInBar = note.startStep % options.stepsPerBar;
        if (stepInBar % 2 === 1) {
          startTime += stepDuration * 0.15; // 15% swing
        }
      }

      // Apply humanization
      if (options.humanize && rng) {
        const timeJitter = (rng() - 0.5) * 0.04; // ±20ms at 120 BPM
        startTime += timeJitter;
      }

      const frequency = Tone.Frequency(note.midi, "midi").toFrequency();
      let velocity = note.velocity;

      if (options.humanize && rng) {
        velocity = Math.max(0.4, Math.min(1, velocity + (rng() - 0.5) * 0.1));
      }

      Tone.Transport.schedule((time) => {
        leadSynth?.triggerAttackRelease(frequency, duration, time, velocity);
      }, startTime);
    });
  }

  // Start playback
  Tone.Transport.start();

  // Schedule stop at the end
  const totalDuration = options.bars * options.stepsPerBar * stepDuration;
  Tone.Transport.schedule(() => {
    Tone.Transport.stop();
  }, totalDuration);
}

/**
 * Stops playback
 */
export function stopPlayback(): void {
  Tone.Transport.stop();
  Tone.Transport.cancel(0);
}

/**
 * Cleanup synths
 */
export function disposeSynths(): void {
  if (polySynth) {
    polySynth.dispose();
    polySynth = null;
  }
  if (leadSynth) {
    leadSynth.dispose();
    leadSynth = null;
  }
}
