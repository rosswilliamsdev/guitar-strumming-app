import { ChevronDown, ChevronUp, Minus, X } from "lucide-react";

export type StrumType = "down" | "up" | "rest" | "muted";
export type Subdivision = "quarter" | "eighth" | "sixteenth";

export interface StrummingPattern {
  id: string;
  name: string;
  description: string;
  pattern: StrumType[];
  subdivision: Subdivision;
  beatsPerMeasure?: number;
  genre?: string;
}

interface StrummingDisplayProps {
  patternData: StrummingPattern;
  currentBeat: number;
  isPlaying: boolean;
}

export function StrummingDisplay({
  patternData,
  currentBeat,
  isPlaying,
}: StrummingDisplayProps) {
  const { pattern, subdivision, beatsPerMeasure = 4 } = patternData;

  const getBeatLabel = (index: number) => {
    const beatsPerBar = beatsPerMeasure;

    if (subdivision === "quarter") {
      return `${(index % beatsPerBar) + 1}`;
    } else if (subdivision === "eighth") {
      const beatNumber = Math.floor(index / 2) + 1;
      const isOffbeat = index % 2 === 1;
      return isOffbeat ? "&" : `${beatNumber}`;
    } else if (subdivision === "sixteenth") {
      const beatNumber = Math.floor(index / 4) + 1;
      const sixteenthPosition = index % 4;
      const labels = ["", "e", "&", "a"];
      return sixteenthPosition === 0
        ? `${beatNumber}`
        : labels[sixteenthPosition];
    }
    return `${index + 1}`;
  };
  const getHandMotion = (index: number) => {
    // Determine hand motion direction based on alternating pattern
    if (subdivision === "eighth") {
      // For eighth notes: down on 1,2,3,4 and up on &
      return index % 2 === 0 ? "down" : "up";
    } else if (subdivision === "sixteenth") {
      // For sixteenth notes: down on 1,&,2,&,3,&,4,& and up on e,a
      const position = index % 4;
      return position === 1 || position === 3 ? "up" : "down";
    } else {
      // Quarter notes are typically down
      return "down";
    }
  };

  const getStrumIcon = (strum: StrumType, index: number) => {
    const isActive = isPlaying && index === currentBeat;
    const baseClasses = `w-8 h-8 transition-all duration-100 ${
      isActive ? "text-primary scale-125" : "text-muted-foreground"
    }`;

    switch (strum) {
      case "down":
        return <ChevronDown className={baseClasses} />;
      case "up":
        return <ChevronUp className={baseClasses} />;
      case "rest":
        return <Minus className={baseClasses} />;
      case "muted":
        return <X className={baseClasses} />;
      default:
        return <Minus className={baseClasses} />;
    }
  };

  const getHandMotionChevron = (strum: StrumType, index: number) => {
    if (strum !== "rest" && strum !== "muted") return null;

    const handMotion = getHandMotion(index);
    const chevronClasses = "w-6 h-6 text-muted-foreground/70";

    return handMotion === "down" ? (
      <ChevronDown className={chevronClasses} />
    ) : (
      <ChevronUp className={chevronClasses} />
    );
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="mb-4">Strumming Pattern</h3>
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-block px-3 py-1 bg-secondary rounded-full text-sm">
            {subdivision === "quarter" && "Quarter Notes"}
            {subdivision === "eighth" && "Eighth Notes"}
            {subdivision === "sixteenth" && "Sixteenth Notes"}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {pattern.map((strum, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              {/* Hand motion chevron above circle for rest and muted */}
              <div className="h-4 flex items-center justify-center">
                {getHandMotionChevron(strum, index)}
              </div>
              <div
                className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 ${
                  isPlaying && index === currentBeat
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                {getStrumIcon(strum, index)}
              </div>
              <span className="text-xs text-muted-foreground font-mono min-w-[20px] text-center">
                {getBeatLabel(index)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
