# TempoSketch — Draw → Chords → Melody

A browser-based music creation tool that transforms your drawings into musical compositions. Draw a curve, and TempoSketch automatically generates a chord progression and melody in your chosen key and mode.

![TempoSketch Demo](screenshot-placeholder.png)

## ✨ Features

- 🎨 **Intuitive Drawing Interface**: Draw curves that define melodic contours
- 🎹 **Automatic Harmonization**: Generates chord progressions based on your drawing
- 🎵 **Melody Generation**: Creates melodies that snap to chord tones
- 🎼 **Multiple Modes**: Ionian (Major), Aeolian (Minor), Dorian, Lydian
- 🎚️ **Customizable Parameters**: Tempo, key, bars, steps, and more
- 🎭 **Reharm Toggle**: Instantly flip between major/minor moods
- 🎰 **Humanization**: Add natural timing and velocity variations
- 🎸 **Swing Feel**: Apply swing timing to your compositions
- 💾 **MIDI Export**: Download 2-track MIDI files (chords + lead)
- 🔊 **Live Playback**: Hear your creation using Web Audio API (Tone.js)
- 📱 **Mobile Friendly**: Supports touch input for drawing
- 🌙 **Dark Theme**: Easy on the eyes, judge-friendly UI

## 🎯 How It Works

### Pipeline Overview

1. **Draw a Curve**: Your stroke from left to right defines the melodic contour
   - Vertical position = pitch (higher = higher pitch)
   - Horizontal position = time progression

2. **Quantization**: The curve is sampled at evenly-spaced steps
   - Total steps = bars × steps per bar
   - Each sample point becomes a musical event

3. **Chord Generation**: One chord per bar
   - Analyzes the median pitch degree in each bar
   - Builds a triad (3-note chord) on that degree

4. **Melody Generation**: Creates a lead line from your curve
   - 80% probability: snap to nearest chord tone
   - 20% probability: allow passing tones (scale degrees)
   - Groups similar pitches into longer notes (up to 4 steps)
   - Applies velocity variation (0.6–0.9)

5. **Playback & Export**: 
   - Real-time audio via Tone.js (WebAudio)
   - MIDI export creates 2-track file (chords on track 0, lead on track 1)

### Demo Curves

- **Arc**: Rises then falls in a smooth parabolic arc
- **Wave**: Oscillates in a sine wave pattern
- **Zigzag**: Steps between two pitch levels

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or 20 (see `.nvmrc`)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd TempoSketch

# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Building

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Watch mode
npm run test -- --watch
```

Unit tests cover:
- Utility functions (clamp, lerp, PRNG)
- Scale building and music theory
- Curve quantization
- Chord and melody generation

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run e2e

# Run in UI mode
npm run e2e -- --ui
```

E2E tests cover:
- Loading the app
- Demo curve → Play → Stop flow
- MIDI export functionality
- Parameter changes
- UI interactions

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Type check
npx tsc --noEmit
```

## 🎮 Demo Flow

1. **Load the App**: Open http://localhost:3000
2. **Click a Demo Button**: Try "Arc", "Wave", or "Zigzag"
3. **Adjust Parameters** (optional):
   - Change tempo (60–160 BPM)
   - Select different key (C, D, E, F, G, A, B, with sharps/flats)
   - Try different modes (Ionian, Aeolian, Dorian, Lydian)
   - Toggle Reharm to flip major ↔ minor
4. **Click Play**: Audio starts playing automatically
5. **Experiment**: 
   - Change seed for different melody variations
   - Toggle Humanize for natural feel
   - Toggle Swing for rhythmic groove
6. **Export**: Click "Export MIDI" to download `temposketch.mid`
7. **Draw Your Own**: Clear and draw your own curve on the canvas

## 📂 Project Structure

```
TempoSketch/
├── app/
│   ├── layout.tsx          # Root layout with dark theme
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles with shadcn theme
├── components/
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── slider.tsx
│       ├── select.tsx
│       ├── switch.tsx
│       ├── label.tsx
│       └── input.tsx
├── lib/
│   ├── music/              # Pure music theory functions
│   │   ├── utils.ts        # Utility functions (clamp, lerp, PRNG)
│   │   ├── scale.ts        # Scale building, degrees, triads
│   │   ├── curve.ts        # Polyline quantization
│   │   ├── composition.ts  # Chord & melody generation
│   │   └── __tests__/      # Unit tests
│   ├── audio/              # Audio engine
│   │   ├── playback.ts     # Tone.js playback
│   │   └── midi-export.ts  # MIDI file export
│   └── utils.ts            # UI utilities (cn helper)
├── e2e/
│   └── app.spec.ts         # Playwright E2E tests
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI pipeline
└── config files            # Next.js, TypeScript, Tailwind, etc.
```

## 🛠️ Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Audio**: Tone.js (WebAudio wrapper)
- **MIDI**: @tonejs/midi
- **Icons**: lucide-react
- **Testing**: Vitest + Testing Library + Playwright
- **Linting**: ESLint + Prettier

## 📋 Acceptance Criteria

- ✅ `npm run dev` starts the app; first click enables audio; Demo → Play produces audible output
- ✅ Changing Key/Mode clearly changes both chords and melody pitches
- ✅ Reharm toggle flips mood (Ionian ↔ Aeolian) with audible difference
- ✅ Export MIDI downloads a 2-track .mid that opens correctly in a DAW
- ✅ Unit tests pass (vitest); E2E passes (playwright); CI is green
- ✅ README includes features, how-it-works, scripts, and demo flow

## 🎵 Musical Theory

### Modes

- **Ionian** (Major): W-W-H-W-W-W-H (bright, happy)
- **Aeolian** (Natural Minor): W-H-W-W-H-W-W (dark, sad)
- **Dorian**: W-H-W-W-W-H-W (jazzy, sophisticated)
- **Lydian**: W-W-W-H-W-W-H (dreamy, ethereal)

### Scale Degrees

Each mode has 7 degrees (0-6):
- 0 = Tonic (root)
- 1 = Second
- 2 = Third
- 3 = Fourth
- 4 = Fifth
- 5 = Sixth
- 6 = Seventh

### Chord Building

Triads are built by stacking thirds:
- Root + Third (skip 1 degree) + Fifth (skip 2 degrees)
- Example in C Major: C (root) + E (third) + G (fifth) = C major triad

## 🐛 Known Limitations

- Audio requires user gesture (click) to start due to browser autoplay policies
- MIDI timing is approximate (doesn't account for all edge cases)
- Mobile canvas scaling may need adjustment on very small screens
- Swing and humanization parameters are preset (not user-adjustable amounts)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Tone.js](https://tonejs.github.io/) for WebAudio abstraction
- [shadcn/ui](https://ui.shadcn.com/) for beautiful component primitives
- [Next.js](https://nextjs.org/) for the excellent React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

Built with ❤️ for music and code
