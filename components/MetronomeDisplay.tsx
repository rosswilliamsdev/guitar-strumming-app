import { Card } from "./ui/card";

import { StrummingPattern } from "./StrummingDisplay";

interface MetronomeDisplayProps {
  currentBeat: number;
  patternData: StrummingPattern;
  isPlaying: boolean;
  bpm: number;
}

export function MetronomeDisplay({
  currentBeat,
  patternData,
  isPlaying,
  bpm,
}: MetronomeDisplayProps) {
  const { pattern, subdivision, beatsPerMeasure = 4 } = patternData;

  const isStrongBeat = () => {
    if (subdivision === "quarter") {
      return currentBeat % beatsPerMeasure === 0;
    } else if (subdivision === "eighth") {
      return (
        currentBeat % 2 === 0 &&
        Math.floor(currentBeat / 2) % beatsPerMeasure === 0
      );
    } else if (subdivision === "sixteenth") {
      return (
        currentBeat % 4 === 0 &&
        Math.floor(currentBeat / 4) % beatsPerMeasure === 0
      );
    }
    return false;
  };
  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <h3>Metronome</h3>

        <div className="relative">
          <div
            className={`w-16 h-16 mx-auto rounded-full border-4 transition-all duration-100 ${
              isPlaying
                ? isStrongBeat()
                  ? "border-destructive bg-destructive/20 animate-pulse"
                  : "border-primary bg-primary/20 animate-pulse"
                : "border-muted bg-muted/20"
            }`}
          >
            <div className="flex items-center justify-center h-full">
              <div
                className={`w-4 h-4 rounded-full transition-all duration-100 ${
                  isPlaying
                    ? isStrongBeat()
                      ? "bg-destructive"
                      : "bg-primary"
                    : "bg-muted-foreground"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-center gap-1 flex-wrap max-w-[200px] mx-auto">
            {pattern.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full border transition-all duration-100 ${
                  isPlaying && index === currentBeat
                    ? "border-primary bg-primary scale-125"
                    : "border-muted bg-background"
                }`}
              />
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            {subdivision === "quarter" && "Quarter Notes"}
            {subdivision === "eighth" && "Eighth Notes"}
            {subdivision === "sixteenth" && "Sixteenth Notes"}
          </div>

          <div className="text-lg font-mono">{bpm} BPM</div>
        </div>
      </div>
    </Card>
  );
}
