# TempoSketch Build Progress

## Project Setup
- [ ] Initialize Next.js 14 with TypeScript and App Router
- [ ] Configure Tailwind CSS
- [ ] Install shadcn/ui and add required components
- [ ] Setup ESLint, Prettier, .editorconfig, .nvmrc
- [ ] Add MIT LICENSE
- [ ] Setup GitHub Actions CI (lint, typecheck, vitest, Playwright)

## Dependencies
- [ ] Install Tone.js for audio playback
- [ ] Install @tonejs/midi for MIDI export
- [ ] Install lucide-react for icons
- [ ] Install Vitest and Testing Library
- [ ] Install Playwright for E2E testing

## Music Theory Library (/lib/music/)
- [ ] Implement utility functions (clamp, lerp, mulberry32)
- [ ] Implement buildScale function with modes
- [ ] Implement degreeToMidi and triadForDegree
- [ ] Implement quantizePolyline for stroke processing
- [ ] Implement yToDegreeIndex for vertical mapping
- [ ] Implement chooseChords for chord progression
- [ ] Implement melodyFromSamples for lead generation
- [ ] Write unit tests for all music functions

## Audio Engine (/lib/audio/)
- [ ] Implement schedulePlayback with Tone.js
- [ ] Implement MIDI export with @tonejs/midi
- [ ] Handle humanization (timing jitter, velocity variation)
- [ ] Handle swing (delayed 2nd steps)

## UI Components
- [ ] Create Canvas component for drawing
- [ ] Implement pointer-based drawing (mouse + touch)
- [ ] Render grid and polyline
- [ ] Add Demo curve generators (Arc, Wave, Zigzag)
- [ ] Create Controls panel with all parameters
- [ ] Implement dark theme with shadcn/ui

## Main Application
- [ ] Build app/page.tsx with layout
- [ ] Wire up drawing → quantize → chords → melody pipeline
- [ ] Connect Play/Stop buttons to audio engine
- [ ] Connect Export MIDI button
- [ ] Add status indicators and accessibility features
- [ ] Handle edge cases (no stroke, short stroke)

## Testing
- [ ] Write Vitest unit tests for /lib functions
- [ ] Create Playwright E2E test suite
- [ ] Test Demo → Play → Stop flow
- [ ] Test MIDI export generation

## Polish & Documentation
- [ ] Optimize performance (memoization, RAF)
- [ ] Ensure mobile responsiveness
- [ ] Add "How it works" explanation card
- [ ] Write comprehensive README
- [ ] Add screenshot placeholder
- [ ] Verify all scripts work

## Final Verification
- [ ] Run `npm run dev` and test manually
- [ ] Run `npm run lint`
- [ ] Run `npm run test`
- [ ] Run `npm run e2e`
- [ ] Verify MIDI export in DAW
- [ ] Check CI passes
