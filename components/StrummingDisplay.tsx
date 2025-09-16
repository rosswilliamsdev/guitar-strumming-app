import { ChevronDown, ChevronUp, Minus, X, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

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
  onReset: () => void;
  onSubdivisionChange: (subdivision: Subdivision) => void;
  onPatternChange: (newPattern: StrumType[]) => void;
}

export function StrummingDisplay({
  patternData,
  currentBeat,
  isPlaying,
  onReset,
  onSubdivisionChange,
  onPatternChange,
}: StrummingDisplayProps) {
  const { pattern, subdivision, beatsPerMeasure = 4 } = patternData;

  const cycleStrumType = (currentType: StrumType): StrumType => {
    switch (currentType) {
      case "down":
        return "up";
      case "up":
        return "muted";
      case "muted":
        return "rest";
      case "rest":
        return "down";
      default:
        return "down";
    }
  };

  const handleBeatClick = (beatIndex: number) => {
    const newPattern = [...pattern];
    newPattern[beatIndex] = cycleStrumType(pattern[beatIndex]);
    onPatternChange(newPattern);
  };

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
      {/* Legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Down</span>
          </div>
          <div className="flex items-center gap-1">
            <ChevronUp className="w-3 h-3" />
            <span>Up</span>
          </div>
          <div className="flex items-center gap-1">
            <X className="w-3 h-3" />
            <span>Muted</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="w-3 h-3" />
            <span>Rest</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 w-8 p-0"
          title="Reset to Quarter Notes"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 bg-secondary rounded-full text-sm">
            {subdivision === "quarter" && "Quarter Notes"}
            {subdivision === "eighth" && "Eighth Notes"}
            {subdivision === "sixteenth" && "Sixteenth Notes"}
          </div>

          {/* Subdivision buttons */}
          <div className="flex justify-center gap-2">
            <Button
              variant={subdivision === "quarter" ? "default" : "outline"}
              size="sm"
              onClick={() => onSubdivisionChange("quarter")}
              className="w-8 h-8 p-0"
            >
              4
            </Button>
            <Button
              variant={subdivision === "eighth" ? "default" : "outline"}
              size="sm"
              onClick={() => onSubdivisionChange("eighth")}
              className="w-8 h-8 p-0"
            >
              8
            </Button>
            <Button
              variant={subdivision === "sixteenth" ? "default" : "outline"}
              size="sm"
              onClick={() => onSubdivisionChange("sixteenth")}
              className="w-8 h-8 p-0"
            >
              16
            </Button>
          </div>
        </div>

        {subdivision === "sixteenth" ? (
          // Mobile: Each beat on its own row (4 subdivisions per row)
          <div className="space-y-4 sm:space-y-4">
            {/* Beat 1 */}
            <div className="flex items-center justify-center gap-3">
              {pattern.slice(0, 4).map((strum, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  {/* Hand motion chevron above circle for rest and muted */}
                  <div className="h-4 flex items-center justify-center">
                    {getHandMotionChevron(strum, index)}
                  </div>
                  <div
                    className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 cursor-pointer hover:bg-accent/50 ${
                      isPlaying && index === currentBeat
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    onClick={() => handleBeatClick(index)}
                  >
                    {getStrumIcon(strum, index)}
                  </div>
                  <span
                    className={`${
                      getBeatLabel(index).match(/^[1-4]$/)
                        ? "text-lg font-bold text-primary"
                        : "text-xs text-muted-foreground"
                    } font-mono min-w-[20px] text-center`}
                  >
                    {getBeatLabel(index)}
                  </span>
                </div>
              ))}
            </div>
            {/* Beat 2 */}
            <div className="flex items-center justify-center gap-3">
              {pattern.slice(4, 8).map((strum, index) => {
                const actualIndex = index + 4;
                return (
                  <div
                    key={actualIndex}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* Hand motion chevron above circle for rest and muted */}
                    <div className="h-4 flex items-center justify-center">
                      {getHandMotionChevron(strum, actualIndex)}
                    </div>
                    <div
                      className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 cursor-pointer hover:bg-accent/50 ${
                        isPlaying && actualIndex === currentBeat
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                      onClick={() => handleBeatClick(actualIndex)}
                    >
                      {getStrumIcon(strum, actualIndex)}
                    </div>
                    <span
                      className={`${
                        getBeatLabel(actualIndex).match(/^[1-4]$/)
                          ? "text-lg font-bold text-primary"
                          : "text-xs text-muted-foreground"
                      } font-mono min-w-[20px] text-center`}
                    >
                      {getBeatLabel(actualIndex)}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Beat 3 */}
            <div className="flex items-center justify-center gap-3">
              {pattern.slice(8, 12).map((strum, index) => {
                const actualIndex = index + 8;
                return (
                  <div
                    key={actualIndex}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* Hand motion chevron above circle for rest and muted */}
                    <div className="h-4 flex items-center justify-center">
                      {getHandMotionChevron(strum, actualIndex)}
                    </div>
                    <div
                      className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 cursor-pointer hover:bg-accent/50 ${
                        isPlaying && actualIndex === currentBeat
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                      onClick={() => handleBeatClick(actualIndex)}
                    >
                      {getStrumIcon(strum, actualIndex)}
                    </div>
                    <span
                      className={`${
                        getBeatLabel(actualIndex).match(/^[1-4]$/)
                          ? "text-lg font-bold text-primary"
                          : "text-xs text-muted-foreground"
                      } font-mono min-w-[20px] text-center`}
                    >
                      {getBeatLabel(actualIndex)}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Beat 4 */}
            <div className="flex items-center justify-center gap-3">
              {pattern.slice(12, 16).map((strum, index) => {
                const actualIndex = index + 12;
                return (
                  <div
                    key={actualIndex}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* Hand motion chevron above circle for rest and muted */}
                    <div className="h-4 flex items-center justify-center">
                      {getHandMotionChevron(strum, actualIndex)}
                    </div>
                    <div
                      className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 cursor-pointer hover:bg-accent/50 ${
                        isPlaying && actualIndex === currentBeat
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                      onClick={() => handleBeatClick(actualIndex)}
                    >
                      {getStrumIcon(strum, actualIndex)}
                    </div>
                    <span
                      className={`${
                        getBeatLabel(actualIndex).match(/^[1-4]$/)
                          ? "text-lg font-bold text-primary"
                          : "text-xs text-muted-foreground"
                      } font-mono min-w-[20px] text-center`}
                    >
                      {getBeatLabel(actualIndex)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : subdivision === "eighth" ? (
          // Eighth notes: beats 1-2 on first row, 3-4 on second row (mobile)
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:gap-3 sm:flex-wrap">
            <div className="sm:hidden">
              {/* Mobile: Two rows */}
              {/* Row 1: Beats 1 and 2 */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {pattern.slice(0, 4).map((strum, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    {/* Hand motion chevron above circle for rest and muted */}
                    <div className="h-4 flex items-center justify-center">
                      {getHandMotionChevron(strum, index)}
                    </div>
                    <div
                      className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 cursor-pointer hover:bg-accent/50 ${
                        isPlaying && index === currentBeat
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                      onClick={() => handleBeatClick(index)}
                    >
                      {getStrumIcon(strum, index)}
                    </div>
                    <span
                      className={`${
                        getBeatLabel(index).match(/^[1-4]$/)
                          ? "text-lg font-bold text-primary"
                          : "text-xs text-muted-foreground"
                      } font-mono min-w-[20px] text-center`}
                    >
                      {getBeatLabel(index)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Row 2: Beats 3 and 4 */}
              <div className="flex items-center justify-center gap-3">
                {pattern.slice(4, 8).map((strum, index) => {
                  const actualIndex = index + 4;
                  return (
                    <div
                      key={actualIndex}
                      className="flex flex-col items-center gap-2"
                    >
                      {/* Hand motion chevron above circle for rest and muted */}
                      <div className="h-4 flex items-center justify-center">
                        {getHandMotionChevron(strum, actualIndex)}
                      </div>
                      <div
                        className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 cursor-pointer hover:bg-accent/50 ${
                          isPlaying && actualIndex === currentBeat
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                        onClick={() => handleBeatClick(actualIndex)}
                      >
                        {getStrumIcon(strum, actualIndex)}
                      </div>
                      <span
                        className={`${
                          getBeatLabel(actualIndex).match(/^[1-4]$/)
                            ? "text-lg font-bold text-primary"
                            : "text-xs text-muted-foreground"
                        } font-mono min-w-[20px] text-center`}
                      >
                        {getBeatLabel(actualIndex)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Desktop: Single row */}
            <div className="hidden sm:flex sm:items-center sm:justify-center sm:gap-3">
              {pattern.map((strum, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  {/* Hand motion chevron above circle for rest and muted */}
                  <div className="h-4 flex items-center justify-center">
                    {getHandMotionChevron(strum, index)}
                  </div>
                  <div
                    className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 cursor-pointer hover:bg-accent/50 ${
                      isPlaying && index === currentBeat
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    onClick={() => handleBeatClick(index)}
                  >
                    {getStrumIcon(strum, index)}
                  </div>
                  <span
                    className={`${
                      getBeatLabel(index).match(/^[1-4]$/)
                        ? "text-lg font-bold text-primary"
                        : "text-xs text-muted-foreground"
                    } font-mono min-w-[20px] text-center`}
                  >
                    {getBeatLabel(index)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Quarter notes: single row on all screens
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {pattern.map((strum, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                {/* Hand motion chevron above circle for rest and muted */}
                <div className="h-4 flex items-center justify-center">
                  {getHandMotionChevron(strum, index)}
                </div>
                <div
                  className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-100 cursor-pointer hover:bg-accent/50 ${
                    isPlaying && index === currentBeat
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onClick={() => handleBeatClick(index)}
                >
                  {getStrumIcon(strum, index)}
                </div>
                <span
                  className={`${
                    getBeatLabel(index).match(/^[1-4]$/)
                      ? "text-lg font-bold text-primary"
                      : "text-xs text-muted-foreground"
                  } font-mono min-w-[20px] text-center`}
                >
                  {getBeatLabel(index)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
