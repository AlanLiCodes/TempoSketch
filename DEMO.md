# TempoSketch Demo Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Demo Script

### 1. First Impression (30 seconds)
1. Load the app - observe the dark, clean interface
2. Click **"Arc"** demo button
3. Click **"Play"** - hear the generated music
4. Click **"Stop"**

### 2. Drawing Your Own (1 minute)
1. Click **"Clear"**
2. Draw your own curve from left to right on the canvas
   - Higher = higher pitch
   - Shape defines melodic contour
3. Click **"Play"** to hear your composition

### 3. Musical Parameters (2 minutes)
1. Load **"Wave"** demo
2. Change **Tempo** slider (try 80 BPM, then 140 BPM)
3. Change **Key** to "G"
4. Change **Mode** to "Aeolian (Minor)" - notice darker mood
5. Toggle **"Reharm"** on/off - hear major↔minor flip
6. Change **Seed** value - get different melody variations
7. Toggle **"Humanize"** - adds natural timing variations
8. Toggle **"Swing"** - adds rhythmic groove

### 4. Advanced Features (1 minute)
1. Adjust **Bars** (try 2, then 6)
2. Adjust **Steps per Bar** (try 4, then 12)
3. Observe the status line showing:
   - Total steps
   - Current key and mode
   - Number of notes generated

### 5. MIDI Export (30 seconds)
1. Click **"Export MIDI"**
2. File `temposketch.mid` downloads
3. Open in your DAW (Ableton, Logic, FL Studio, etc.)
4. See 2 tracks: Chords (Track 0) and Lead (Track 1)

## Key Features to Highlight

### For Judges
- **No server required** - runs entirely in browser
- **Real-time audio** - immediate feedback via WebAudio
- **Music theory** - proper scale degrees, diatonic triads
- **MIDI export** - professional workflow integration
- **Deterministic** - same seed = same melody
- **Tested** - 42 unit tests, E2E coverage
- **Accessible** - keyboard navigation, ARIA labels

### For Musicians
- **4 Modes**: Major (Ionian), Minor (Aeolian), Dorian, Lydian
- **12 Keys**: All major and minor keys
- **Reharm Toggle**: Instant mood flip
- **Humanization**: Natural timing and velocity
- **Swing Feel**: Jazz/groove rhythms

### For Developers
- **TypeScript** - Full type safety
- **Pure Functions** - Testable music logic
- **Modular Architecture** - Clear separation of concerns
- **Well-Tested** - Unit + E2E coverage
- **Clean Code** - ESLint + Prettier enforced

## Technical Highlights

### Music Generation Pipeline
1. **User draws curve** → polyline of {x, y} points
2. **Quantization** → sample at evenly-spaced steps
3. **Vertical mapping** → y position → scale degree (0-6)
4. **Chord generation** → one triad per bar (median degree)
5. **Melody generation** → 80% chord tones, 20% passing tones
6. **Note grouping** → similar pitches → longer durations
7. **Playback** → Tone.js schedules all events
8. **MIDI export** → standard format, 2 tracks

### Stack
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tone.js (WebAudio)
- @tonejs/midi (MIDI export)
- Tailwind CSS + shadcn/ui
- Vitest (unit tests)
- Playwright (E2E tests)

## Files Structure

```
📁 app/
  └─ page.tsx         # Main UI component (460 lines)
  
📁 lib/
  📁 music/
    ├─ utils.ts       # clamp, lerp, PRNG
    ├─ scale.ts       # Music theory (scales, degrees, triads)
    ├─ curve.ts       # Curve quantization
    ├─ composition.ts # Chord & melody generation
    └─ __tests__/     # 42 unit tests
  
  📁 audio/
    ├─ playback.ts    # Tone.js WebAudio
    └─ midi-export.ts # MIDI file generation

📁 components/ui/     # shadcn/ui components

📁 e2e/
  └─ app.spec.ts      # Playwright tests

📁 .github/workflows/
  └─ ci.yml           # Automated testing
```

## Running Tests

```bash
# Unit tests
npm test

# E2E tests (builds and tests full app)
npm run e2e

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Known Limitations

- Audio requires user click (browser autoplay policy)
- MIDI timing is approximate for swing/humanize
- Mobile canvas may need scaling on very small screens
- No undo/redo for drawings

## Future Enhancements

- More modes (Phrygian, Mixolydian, Locrian)
- Custom chord progressions
- Multiple instruments/sounds
- Save/load presets
- Collaborative drawing
- Audio recording/export
- More sophisticated melody algorithms
- Microtonal support

## Credits

Built for a 48-hour hackathon demonstrating:
- Music theory knowledge
- Audio programming
- React/TypeScript proficiency
- Testing best practices
- Clean, maintainable code

---

🎵 Draw. Generate. Export. Enjoy! 🎵
