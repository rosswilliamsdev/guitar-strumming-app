import { Volume2, VolumeX } from "lucide-react";
import { Card } from "./ui/card";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface MetronomeControlsProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  restSoundEnabled: boolean;
  onRestSoundEnabledChange: (enabled: boolean) => void;
  accentEnabled: boolean;
  onAccentEnabledChange: (enabled: boolean) => void;
}

export function MetronomeControls({
  volume,
  onVolumeChange,
  restSoundEnabled,
  onRestSoundEnabledChange,
  accentEnabled,
  onAccentEnabledChange,
}: MetronomeControlsProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="accent-beat">Accent Beat One</Label>
          <Switch
            id="accent-beat"
            checked={accentEnabled}
            onCheckedChange={onAccentEnabledChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="rest-sound">Sound on Rest Beats</Label>
          <Switch
            id="rest-sound"
            checked={restSoundEnabled}
            onCheckedChange={onRestSoundEnabledChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Volume</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              onValueChange={(values) => onVolumeChange(values[0])}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
