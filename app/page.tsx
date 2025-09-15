"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  StrummingDisplay,
  StrummingPattern,
} from "../components/StrummingDisplay";
import { PatternLibrary } from "../components/PatternLibrary";
import { TempoControl } from "../components/TempoControl";
import { PatternEditor } from "../components/PatternEditor";
import { MetronomeDisplay } from "../components/MetronomeDisplay";
import { MetronomeControls } from "../components/MetronomeControls";
import { ThemeToggle } from "../components/ThemeToggle";
import { useMetronomeSound } from "../hooks/useMetronomeSound";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";

// Default strumming patterns
const defaultPatterns: StrummingPattern[] = [
  {
    id: "basic-down",
    name: "Basic Down Strums",
    description: "Simple downward strums on every beat",
    pattern: ["down", "down", "down", "down"],
    subdivision: "quarter",
    beatsPerMeasure: 4,
    genre: "Beginner",
  },
  {
    id: "down-up-eighth",
    name: "Down-Up Eighths",
    description: "Alternating down and up strums on eighth notes",
    pattern: ["down", "up", "down", "up", "down", "up", "down", "up"],
    subdivision: "eighth",
    beatsPerMeasure: 4,
    genre: "Beginner",
  },
  {
    id: "folk-strum",
    name: "Folk Strum",
    description: "Classic folk pattern: D-D-U-D-U-D-U-D",
    pattern: ["down", "rest", "up", "down", "up", "down", "up", "rest"],
    subdivision: "eighth",
    beatsPerMeasure: 4,
    genre: "Folk",
  },
  {
    id: "common-time",
    name: "Common Time",
    description: "Popular pop strumming pattern: D-rest-D-U-rest-U-D-U",
    pattern: ["down", "rest", "down", "up", "rest", "up", "down", "up"],
    subdivision: "eighth",
    beatsPerMeasure: 4,
    genre: "Pop",
  },
  {
    id: "rock-rhythm",
    name: "Rock Rhythm",
    description: "Rock pattern with muted strums",
    pattern: ["down", "muted", "down", "up", "down", "up", "down", "up"],
    subdivision: "eighth",
    beatsPerMeasure: 4,
    genre: "Rock",
  },
  {
    id: "country-shuffle",
    name: "Country Shuffle",
    description: "Country pattern with muted strums and swing feel in 3/4 time",
    pattern: ["down", "muted", "up", "down", "muted", "up"],
    subdivision: "eighth",
    beatsPerMeasure: 3,
    genre: "Country",
  },
  {
    id: "waltz",
    name: "3/4 Waltz",
    description: "Traditional waltz in 3/4 time",
    pattern: ["down", "down", "down"],
    subdivision: "quarter",
    beatsPerMeasure: 3,
    genre: "Folk",
  },
  {
    id: "reggae-skank",
    name: "Reggae Skank",
    description: "Classic reggae upstroke on off-beats",
    pattern: ["rest", "up", "rest", "up", "rest", "up", "rest", "up"],
    subdivision: "eighth",
    beatsPerMeasure: 4,
    genre: "Reggae",
  },
  {
    id: "sixteenth-groove",
    name: "Sixteenth Note Groove",
    description: "Funky sixteenth note pattern with muted strums",
    pattern: [
      "down",
      "up",
      "down",
      "up",
      "muted",
      "up",
      "down",
      "up",
      "down",
      "up",
      "down",
      "up",
      "muted",
      "up",
      "down",
      "up",
    ],
    subdivision: "sixteenth",
    beatsPerMeasure: 4,
    genre: "Funk",
  },
  {
    id: "ballad-pattern",
    name: "Ballad Pattern",
    description: "Gentle ballad strumming",
    pattern: ["down", "rest", "rest", "up", "rest", "up", "rest", "up"],
    subdivision: "eighth",
    beatsPerMeasure: 4,
    genre: "Ballad",
  },
  {
    id: "palm-mute-rock",
    name: "Palm Mute Rock",
    description: "Heavy rock pattern with palm muted strums",
    pattern: ["down", "muted", "muted", "up", "muted", "muted", "down", "up"],
    subdivision: "eighth",
    beatsPerMeasure: 4,
    genre: "Rock",
  },
];

export default function App() {
  const [patterns, setPatterns] = useState<StrummingPattern[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("strumming-patterns");
      return saved ? [...defaultPatterns, ...JSON.parse(saved)] : defaultPatterns;
    }
    return defaultPatterns;
  });

  const [currentPattern, setCurrentPattern] = useState<StrummingPattern>(
    patterns[0]
  );
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [restSoundEnabled, setRestSoundEnabled] = useState(true);
  const [accentEnabled, setAccentEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playBeat, setVolume: setMetronomeVolume } = useMetronomeSound();

  // Save custom patterns to localStorage
  const saveCustomPatterns = (allPatterns: StrummingPattern[]) => {
    if (typeof window !== "undefined") {
      const customPatterns = allPatterns.filter(
        (p) => !defaultPatterns.find((dp) => dp.id === p.id)
      );
      localStorage.setItem("strumming-patterns", JSON.stringify(customPatterns));
    }
  };

  // Calculate interval based on BPM and subdivision
  const getBeatInterval = useCallback(() => {
    const quarterNoteInterval = (60 / bpm) * 1000; // Quarter note in milliseconds

    switch (currentPattern.subdivision) {
      case "quarter":
        return quarterNoteInterval;
      case "eighth":
        return quarterNoteInterval / 2;
      case "sixteenth":
        return quarterNoteInterval / 4;
      default:
        return quarterNoteInterval;
    }
  }, [bpm, currentPattern.subdivision]);

  // Determine if current beat is an accent (strong beat)
  const isAccentBeat = useCallback((beatIndex: number) => {
    if (!accentEnabled) return false;

    // For quarter notes, accent on beat 1
    if (currentPattern.subdivision === "quarter") {
      return beatIndex === 0;
    }
    // For eighth notes, accent on beats 1, 3, 5, 7 (downbeats) - only beat 1 of each measure
    if (currentPattern.subdivision === "eighth") {
      return beatIndex % 2 === 0 && beatIndex % ((currentPattern.beatsPerMeasure || 4) * 2) === 0;
    }
    // For sixteenth notes, accent on beats 1, 5, 9, 13 (downbeats) - only beat 1 of each measure
    if (currentPattern.subdivision === "sixteenth") {
      return beatIndex % 4 === 0 && beatIndex % ((currentPattern.beatsPerMeasure || 4) * 4) === 0;
    }
    return beatIndex === 0;
  }, [currentPattern.subdivision, currentPattern.beatsPerMeasure, accentEnabled]);

  // Start/stop metronome
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentBeat((prev) => {
          const nextBeat = (prev + 1) % currentPattern.pattern.length;
          // Play sound if enabled
          if (soundEnabled) {
            const currentStrum = currentPattern.pattern[nextBeat];
            const shouldPlaySound = currentStrum !== "rest" || restSoundEnabled;
            if (shouldPlaySound) {
              playBeat(isAccentBeat(nextBeat));
            }
          }
          return nextBeat;
        });
      }, getBeatInterval());
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, getBeatInterval, currentPattern.pattern.length, soundEnabled, restSoundEnabled, accentEnabled, playBeat, isAccentBeat, currentPattern.pattern]);

  const handlePlayStop = () => {
    if (isPlaying) {
      // Stop: pause playback and reset to beginning
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      // Play: start from current position (which will be 0 after stop)
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setMetronomeVolume(newVolume);
  };

  const handlePatternSelect = (pattern: StrummingPattern) => {
    setCurrentPattern(pattern);
    setCurrentBeat(0);
    setIsPlaying(false);
  };

  const handleSavePattern = (pattern: StrummingPattern) => {
    const newPatterns = [...patterns, pattern];
    setPatterns(newPatterns);
    saveCustomPatterns(newPatterns);
    setCurrentPattern(pattern);
    setCurrentBeat(0);
    setIsPlaying(false);
    toast.success(`Pattern "${pattern.name}" saved successfully!`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="text-center space-y-2">
            <h1>Guitar Strumming Pattern Generator</h1>
            <p className="text-muted-foreground">
              Practice guitar strumming patterns with visual guidance and
              customizable tempo
            </p>
          </div>
          {/* Theme toggle positioned in top right */}
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
        </div>

        {/* Main Display */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pattern Display */}
          <div className="lg:col-span-2">
            <StrummingDisplay
              patternData={currentPattern}
              currentBeat={currentBeat}
              isPlaying={isPlaying}
            />
          </div>

          {/* Metronome */}
          <div>
            <MetronomeDisplay
              currentBeat={currentBeat}
              patternData={currentPattern}
              isPlaying={isPlaying}
              bpm={bpm}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Tempo Control */}
          <TempoControl
            bpm={bpm}
            onBpmChange={setBpm}
            isPlaying={isPlaying}
            onPlayStop={handlePlayStop}
          />

          {/* Metronome Sound Control */}
          <MetronomeControls
            volume={volume}
            onVolumeChange={handleVolumeChange}
            soundEnabled={soundEnabled}
            onSoundEnabledChange={setSoundEnabled}
            restSoundEnabled={restSoundEnabled}
            onRestSoundEnabledChange={setRestSoundEnabled}
            accentEnabled={accentEnabled}
            onAccentEnabledChange={setAccentEnabled}
          />

          {/* Pattern Info */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="mb-2">Current Pattern</h3>
            <h4 className="mb-1">{currentPattern.name}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {currentPattern.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {currentPattern.genre && (
                <div className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  {currentPattern.genre}
                </div>
              )}
              <div className="inline-block px-2 py-1 bg-secondary/50 text-secondary-foreground rounded text-xs">
                {currentPattern.subdivision === "quarter" && "Quarter Notes"}
                {currentPattern.subdivision === "eighth" && "Eighth Notes"}
                {currentPattern.subdivision === "sixteenth" &&
                  "Sixteenth Notes"}
              </div>
              {currentPattern.beatsPerMeasure !== 4 && (
                <div className="inline-block px-2 py-1 bg-accent/50 text-accent-foreground rounded text-xs">
                  {currentPattern.beatsPerMeasure}/4 time
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for Pattern Library and Editor */}
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Pattern Library</TabsTrigger>
            <TabsTrigger value="editor">Create Pattern</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <PatternLibrary
              patterns={patterns}
              currentPattern={currentPattern}
              onPatternSelect={handlePatternSelect}
            />
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <PatternEditor onSavePattern={handleSavePattern} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
