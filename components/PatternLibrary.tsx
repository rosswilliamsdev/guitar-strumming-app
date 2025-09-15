import { StrummingPattern } from "./StrummingDisplay";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface PatternLibraryProps {
  patterns: StrummingPattern[];
  currentPattern: StrummingPattern;
  onPatternSelect: (pattern: StrummingPattern) => void;
}

export function PatternLibrary({
  patterns,
  currentPattern,
  onPatternSelect,
}: PatternLibraryProps) {
  const groupedPatterns = patterns.reduce((acc, pattern) => {
    const genre = pattern.genre || "General";
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(pattern);
    return acc;
  }, {} as Record<string, StrummingPattern[]>);

  return (
    <div className="space-y-4">
      <h3>Pattern Library</h3>
      {Object.entries(groupedPatterns).map(([genre, genrePatterns]) => (
        <div key={genre}>
          <h4 className="mb-2 text-muted-foreground">{genre}</h4>
          <div className="grid gap-2">
            {genrePatterns.map((pattern) => (
              <Card
                key={pattern.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                  currentPattern.id === pattern.id
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => onPatternSelect(pattern)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-3">
                    <h5 className="mb-1">{pattern.name}</h5>
                    <p className="text-sm text-muted-foreground mb-1">
                      {pattern.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {pattern.subdivision === "quarter" && "Quarter Notes"}
                      {pattern.subdivision === "eighth" && "Eighth Notes"}
                      {pattern.subdivision === "sixteenth" && "Sixteenth Notes"}
                      {pattern.beatsPerMeasure &&
                        pattern.beatsPerMeasure !== 4 &&
                        ` • ${pattern.beatsPerMeasure}/4 time`}
                    </div>
                  </div>
                  <Button
                    variant={
                      currentPattern.id === pattern.id ? "default" : "outline"
                    }
                    size="sm"
                  >
                    {currentPattern.id === pattern.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
