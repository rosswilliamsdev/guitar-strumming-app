"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  StrummingDisplay,
  StrummingPattern,
} from "../components/StrummingDisplay";
import { TempoControl } from "../components/TempoControl";
import { MetronomeDisplay } from "../components/MetronomeDisplay";
import { MetronomeControls } from "../components/MetronomeControls";
import { ThemeToggle } from "../components/ThemeToggle";
import { useMetronomeSound } from "../hooks/useMetronomeSound";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";

// Default quarter note pattern
const defaultQuarterPattern: StrummingPattern = {
  id: "quarter-notes",
  name: "Quarter Notes",
  description: "Simple quarter note pattern",
  pattern: ["down", "down", "down", "down"],
  subdivision: "quarter",
  beatsPerMeasure: 4,
};


export default function App() {

  const [currentPattern, setCurrentPattern] = useState<StrummingPattern>(
    defaultQuarterPattern
  );
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [restSoundEnabled, setRestSoundEnabled] = useState(true);
  const [accentEnabled, setAccentEnabled] = useState(true);
  const [randomMutingEnabled, setRandomMutingEnabled] = useState(false);
  const [randomMutingPercentage, setRandomMutingPercentage] = useState(30);
  const [volume, setVolume] = useState(0.5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playBeat, setVolume: setMetronomeVolume } = useMetronomeSound();


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
  const isAccentBeat = useCallback(
    (beatIndex: number) => {
      if (!accentEnabled) return false;

      // For quarter notes, accent on beat 1
      if (currentPattern.subdivision === "quarter") {
        return beatIndex === 0;
      }
      // For eighth notes, accent on beats 1, 3, 5, 7 (downbeats) - only beat 1 of each measure
      if (currentPattern.subdivision === "eighth") {
        return (
          beatIndex % 2 === 0 &&
          beatIndex % ((currentPattern.beatsPerMeasure || 4) * 2) === 0
        );
      }
      // For sixteenth notes, accent on beats 1, 5, 9, 13 (downbeats) - only beat 1 of each measure
      if (currentPattern.subdivision === "sixteenth") {
        return (
          beatIndex % 4 === 0 &&
          beatIndex % ((currentPattern.beatsPerMeasure || 4) * 4) === 0
        );
      }
      return beatIndex === 0;
    },
    [currentPattern.subdivision, currentPattern.beatsPerMeasure, accentEnabled]
  );

  // Start/stop metronome
  useEffect(() => {
    if (isPlaying) {
      // Play the first beat immediately when starting
      const currentStrum = currentPattern.pattern[currentBeat];

      // Check if random muting should apply to any beat (check first)
      const shouldRandomMute =
        randomMutingEnabled && Math.random() * 100 < randomMutingPercentage;

      if (shouldRandomMute) {
        // Don't play any sound when randomly muted
      } else {
        // Normal logic for non-randomly-muted beats
        const shouldPlaySound = currentStrum !== "rest" || restSoundEnabled;
        if (shouldPlaySound) {
          if (currentStrum === "muted") {
            playBeat("muted");
          } else if (currentStrum === "rest") {
            playBeat("normal"); // Play normal sound for rest when restSoundEnabled is true
          } else {
            playBeat(isAccentBeat(currentBeat) ? "accent" : "normal");
          }
        }
      }

      intervalRef.current = setInterval(() => {
        setCurrentBeat((prev) => {
          const nextBeat = (prev + 1) % currentPattern.pattern.length;
          // Play sound
          const currentStrum = currentPattern.pattern[nextBeat];

          // Check if random muting should apply to any beat (check first)
          const shouldRandomMute =
            randomMutingEnabled && Math.random() * 100 < randomMutingPercentage;

          if (shouldRandomMute) {
            // Don't play any sound when randomly muted
          } else {
            // Normal logic for non-randomly-muted beats
            const shouldPlaySound = currentStrum !== "rest" || restSoundEnabled;
            if (shouldPlaySound) {
              if (currentStrum === "muted") {
                playBeat("muted");
              } else if (currentStrum === "rest") {
                playBeat("normal"); // Play normal sound for rest when restSoundEnabled is true
              } else {
                playBeat(isAccentBeat(nextBeat) ? "accent" : "normal");
              }
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
  }, [
    isPlaying,
    getBeatInterval,
    currentPattern.pattern.length,
    restSoundEnabled,
    accentEnabled,
    randomMutingEnabled,
    randomMutingPercentage,
    playBeat,
    isAccentBeat,
    currentPattern.pattern,
  ]);

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


  const handleReset = () => {
    setCurrentPattern(defaultQuarterPattern);
    setCurrentBeat(0);
    setIsPlaying(false);
  };

  const handleSubdivisionChange = (
    subdivision: "quarter" | "eighth" | "sixteenth"
  ) => {
    let newPattern: StrummingPattern;

    switch (subdivision) {
      case "quarter":
        newPattern = {
          id: "quarter-notes",
          name: "Quarter Notes",
          description: "Simple quarter note pattern",
          pattern: ["down", "down", "down", "down"],
          subdivision: "quarter",
          beatsPerMeasure: 4,
        };
        break;
      case "eighth":
        newPattern = {
          id: "eighth-notes",
          name: "Eighth Notes",
          description: "Alternating down-up eighth note pattern",
          pattern: ["down", "up", "down", "up", "down", "up", "down", "up"],
          subdivision: "eighth",
          beatsPerMeasure: 4,
        };
        break;
      case "sixteenth":
        newPattern = {
          id: "sixteenth-notes",
          name: "Sixteenth Notes",
          description: "Alternating down-up sixteenth note pattern",
          pattern: [
            "down",
            "up",
            "down",
            "up",
            "down",
            "up",
            "down",
            "up",
            "down",
            "up",
            "down",
            "up",
            "down",
            "up",
            "down",
            "up",
          ],
          subdivision: "sixteenth",
          beatsPerMeasure: 4,
        };
        break;
      default:
        newPattern = defaultQuarterPattern;
    }

    setCurrentPattern(newPattern);
    setCurrentBeat(0);
    setIsPlaying(false);
  };

  const handlePatternChange = (
    newPatternArray: ("down" | "up" | "rest" | "muted")[]
  ) => {
    const updatedPattern: StrummingPattern = {
      ...currentPattern,
      pattern: newPatternArray,
      name: "Custom Pattern",
      description: "Modified pattern",
    };
    setCurrentPattern(updatedPattern);
    setCurrentBeat(0);
    setIsPlaying(false);
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
              onReset={handleReset}
              onSubdivisionChange={handleSubdivisionChange}
              onPatternChange={handlePatternChange}
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
            restSoundEnabled={restSoundEnabled}
            onRestSoundEnabledChange={setRestSoundEnabled}
            accentEnabled={accentEnabled}
            onAccentEnabledChange={setAccentEnabled}
          />

          {/* Random Muting Feature */}
          <div className="bg-card border rounded-lg p-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Enable Random Muting</Label>
                  <p className="text-sm text-muted-foreground">
                    Randomly mute notes during playback
                  </p>
                </div>
                <Switch
                  checked={randomMutingEnabled}
                  onCheckedChange={setRandomMutingEnabled}
                />
              </div>

              <div className="space-y-2 mt-7.75">
                <div className="flex items-center justify-between space-y-2">
                  <Label className="font-medium">Muting Chance</Label>
                  <span className="text-sm text-muted-foreground">
                    {randomMutingPercentage}%
                  </span>
                </div>
                <Slider
                  value={[randomMutingPercentage]}
                  onValueChange={(values) =>
                    setRandomMutingPercentage(values[0])
                  }
                  min={5}
                  max={80}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5%</span>
                  <span>80%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
