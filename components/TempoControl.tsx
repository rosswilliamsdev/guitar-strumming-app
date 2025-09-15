import { Play, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";

interface TempoControlProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isPlaying: boolean;
  onPlayStop: () => void;
}

export function TempoControl({
  bpm,
  onBpmChange,
  isPlaying,
  onPlayStop,
}: TempoControlProps) {
  const handleBpmChange = (value: number[]) => {
    onBpmChange(value[0]);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>Tempo Control</h3>
          <div className="text-2xl font-mono">
            {bpm} <span className="text-sm text-muted-foreground">BPM</span>
          </div>
        </div>

        <div className="space-y-2">
          <Slider
            value={[bpm]}
            onValueChange={handleBpmChange}
            min={60}
            max={200}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>60 BPM</span>
            <span>200 BPM</span>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={onPlayStop} size="lg" className="flex-1">
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
