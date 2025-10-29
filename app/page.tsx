"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Play, Square, Download, Trash2, Wand2 } from "lucide-react";

import { Point, quantizePolyline } from "@/lib/music/curve";
import { buildScale, Mode } from "@/lib/music/scale";
import { chooseChords, melodyFromSamples } from "@/lib/music/composition";
import { schedulePlayback, stopPlayback } from "@/lib/audio/playback";
import { exportToMIDI } from "@/lib/audio/midi-export";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 280;

export default function Home() {
  // Drawing state
  const [polyline, setPolyline] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Music parameters
  const [tempo, setTempo] = useState(120);
  const [key, setKey] = useState("C");
  const [mode, setMode] = useState<Mode>("Ionian");
  const [bars, setBars] = useState(4);
  const [stepsPerBar, setStepsPerBar] = useState(8);
  const [reharm, setReharm] = useState(false);
  const [humanize, setHumanize] = useState(false);
  const [swing, setSwing] = useState(false);
  const [seed, setSeed] = useState(42);

  // Status
  const [status, setStatus] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // Compute music data
  const musicData = useMemo(() => {
    if (polyline.length === 0) {
      return null;
    }

    const totalSteps = bars * stepsPerBar;
    const ySamplesPx = quantizePolyline(polyline, totalSteps, CANVAS_WIDTH, CANVAS_HEIGHT);
    const ySamples01 = ySamplesPx.map((y) => y / CANVAS_HEIGHT);

    // Apply reharm: flip Ionian <-> Aeolian
    let useMode = mode;
    if (reharm) {
      if (mode === "Ionian") useMode = "Aeolian";
      else if (mode === "Aeolian") useMode = "Ionian";
    }

    const scale = buildScale(key, useMode, 4);
    const chords = chooseChords(ySamples01, bars, stepsPerBar, scale);
    const melody = melodyFromSamples(ySamples01, chords, stepsPerBar, scale, seed);

    return { scale, chords, melody, totalSteps };
  }, [polyline, bars, stepsPerBar, key, mode, reharm, seed]);

  // Draw grid and polyline
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;

    // Vertical lines (bars)
    for (let i = 0; i <= bars; i++) {
      const x = (i / bars) * CANVAS_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Horizontal lines (scale degrees)
    for (let i = 0; i <= 7; i++) {
      const y = (i / 7) * CANVAS_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw polyline
    if (polyline.length > 0) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(polyline[0].x, polyline[0].y);
      for (let i = 1; i < polyline.length; i++) {
        ctx.lineTo(polyline[i].x, polyline[i].y);
      }
      ctx.stroke();
    }
  }, [polyline, bars]);

  // Redraw whenever polyline or bars changes
  useMemo(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse/touch handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setPolyline([{ x, y }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPolyline((prev) => [...prev, { x, y }]);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  // Demo curves
  const loadDemoCurve = (type: "arc" | "wave" | "zigzag") => {
    const points: Point[] = [];
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = t * CANVAS_WIDTH;
      let y01 = 0.5;

      if (type === "arc") {
        y01 = 0.15 + 0.7 * (1 - Math.pow(2 * t - 1, 2));
      } else if (type === "wave") {
        y01 = 0.5 + 0.35 * Math.sin(2 * Math.PI * (t * 2));
      } else if (type === "zigzag") {
        y01 = t < 0.25 ? 0.3 : t < 0.5 ? 0.7 : t < 0.75 ? 0.3 : 0.7;
      }

      const y = y01 * CANVAS_HEIGHT;
      points.push({ x, y });
    }

    setPolyline(points);
  };

  // Playback
  const handlePlay = async () => {
    if (!musicData) {
      setStatus("Draw a curve first!");
      return;
    }

    try {
      setIsPlaying(true);
      setStatus("Playing...");

      await schedulePlayback(musicData.melody, musicData.chords, {
        tempo,
        stepsPerBar,
        bars,
        humanize,
        swing,
        seed,
      });

      // Auto-stop after duration
      const totalDuration = (bars * stepsPerBar * (60 / tempo / stepsPerBar) * 4) * 1000;
      setTimeout(() => {
        setIsPlaying(false);
        setStatus("");
      }, totalDuration);
    } catch (error) {
      setStatus("Error playing audio");
      setIsPlaying(false);
      console.error(error);
    }
  };

  const handleStop = () => {
    stopPlayback();
    setIsPlaying(false);
    setStatus("");
  };

  const handleExport = () => {
    if (!musicData) {
      setStatus("Draw a curve first!");
      return;
    }

    try {
      exportToMIDI(musicData.melody, musicData.chords, tempo, stepsPerBar, bars);
      setStatus("MIDI exported!");
      setTimeout(() => setStatus(""), 2000);
    } catch (error) {
      setStatus("Error exporting MIDI");
      console.error(error);
    }
  };

  const totalSteps = bars * stepsPerBar;
  const totalNotes = musicData ? musicData.melody.length : 0;

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">TempoSketch</h1>
          <p className="text-muted-foreground">Draw → Chords → Melody</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Draw Your Melody</CardTitle>
              <CardDescription>
                Draw from left to right. Height = pitch, curve shape = musical contour
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border rounded-md cursor-crosshair touch-none w-full"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ maxWidth: "100%", height: "auto" }}
              />

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setPolyline([])} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={() => loadDemoCurve("arc")} variant="outline" size="sm">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Arc
                </Button>
                <Button onClick={() => loadDemoCurve("wave")} variant="outline" size="sm">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Wave
                </Button>
                <Button onClick={() => loadDemoCurve("zigzag")} variant="outline" size="sm">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Zigzag
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handlePlay} disabled={isPlaying || !musicData} size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
                <Button onClick={handleStop} disabled={!isPlaying} variant="secondary" size="lg">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                <Button onClick={handleExport} disabled={!musicData} variant="outline" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Export MIDI
                </Button>
              </div>

              {status && (
                <div className="text-sm font-medium text-primary" role="status" aria-live="polite">
                  {status}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {bars} bars × {stepsPerBar} steps = {totalSteps} steps | Key: {key} {mode} | Notes: {totalNotes}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Adjust musical parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tempo">Tempo: {tempo} BPM</Label>
                <Slider
                  id="tempo"
                  min={60}
                  max={160}
                  step={1}
                  value={[tempo]}
                  onValueChange={([v]) => setTempo(v)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Select value={key} onValueChange={setKey}>
                  <SelectTrigger id="key">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"].map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ionian">Ionian (Major)</SelectItem>
                    <SelectItem value="Aeolian">Aeolian (Minor)</SelectItem>
                    <SelectItem value="Dorian">Dorian</SelectItem>
                    <SelectItem value="Lydian">Lydian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bars">Bars: {bars}</Label>
                <Slider
                  id="bars"
                  min={1}
                  max={8}
                  step={1}
                  value={[bars]}
                  onValueChange={([v]) => setBars(v)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stepsPerBar">Steps per Bar: {stepsPerBar}</Label>
                <Slider
                  id="stepsPerBar"
                  min={2}
                  max={16}
                  step={1}
                  value={[stepsPerBar]}
                  onValueChange={([v]) => setStepsPerBar(v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reharm">Reharm (Ionian ↔ Aeolian)</Label>
                <Switch id="reharm" checked={reharm} onCheckedChange={setReharm} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="humanize">Humanize</Label>
                <Switch id="humanize" checked={humanize} onCheckedChange={setHumanize} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="swing">Swing</Label>
                <Switch id="swing" checked={swing} onCheckedChange={setSwing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seed">Seed</Label>
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Draw a curve:</strong> Your stroke defines the melodic contour. Higher = higher pitch.
              </li>
              <li>
                <strong>Quantization:</strong> The curve is sampled at evenly-spaced steps (bars × steps/bar).
              </li>
              <li>
                <strong>Chord generation:</strong> Each bar gets a chord based on the median pitch degree in that bar.
              </li>
              <li>
                <strong>Melody generation:</strong> Notes snap to chord tones (80% probability) or scale degrees. Similar pitches are grouped into longer notes.
              </li>
              <li>
                <strong>Playback & Export:</strong> Audio plays via Tone.js (WebAudio). Export creates a 2-track MIDI file (chords + lead).
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
