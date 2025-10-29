/**
 * MIDI export using @tonejs/midi
 */

import { Midi } from "@tonejs/midi";
import { Chord, Note } from "../music/composition";

/**
 * Exports chords and melody to a MIDI file and triggers download
 */
export function exportToMIDI(
  melody: Note[],
  chords: Chord[],
  tempo: number,
  stepsPerBar: number,
  bars: number
): void {
  // Create a new MIDI file
  const midi = new Midi();

  // Set tempo
  midi.header.setTempo(tempo);

  // Calculate step duration in seconds (quarter note = 1 beat in 4/4)
  const stepDuration = (60 / tempo / stepsPerBar) * 4;

  // Add chord track
  const chordTrack = midi.addTrack();
  chordTrack.name = "Chords";
  chordTrack.channel = 0;

  chords.forEach((chord) => {
    const startTime = chord.startStep * stepDuration;
    const duration = chord.duration * stepDuration;

    chord.notes.forEach((midiNote) => {
      chordTrack.addNote({
        midi: midiNote,
        time: startTime,
        duration: duration,
        velocity: 0.7,
      });
    });
  });

  // Add melody track
  const melodyTrack = midi.addTrack();
  melodyTrack.name = "Lead";
  melodyTrack.channel = 1;

  melody.forEach((note) => {
    const startTime = note.startStep * stepDuration;
    const duration = note.duration * stepDuration;

    melodyTrack.addNote({
      midi: note.midi,
      time: startTime,
      duration: duration,
      velocity: note.velocity,
    });
  });

  // Convert to array buffer
  const midiArray = midi.toArray();

  // Create blob and download
  const blob = new Blob([midiArray.buffer as ArrayBuffer], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "temposketch.mid";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
