import { useState } from "react";
import { ChevronDown, ChevronUp, Minus, Plus, Trash2, X } from "lucide-react";
import { StrumType, StrummingPattern, Subdivision } from "./StrummingDisplay";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PatternEditorProps {
  onSavePattern: (pattern: StrummingPattern) => void;
}

export function PatternEditor({ onSavePattern }: PatternEditorProps) {
  const [pattern, setPattern] = useState<StrumType[]>([
    "down",
    "down",
    "up",
    "down",
    "up",
  ]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Custom");
  const [subdivision, setSubdivision] = useState<Subdivision>("eighth");
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);

  const updateStrum = (index: number, newStrum: StrumType) => {
    const newPattern = [...pattern];
    newPattern[index] = newStrum;
    setPattern(newPattern);
  };

  const getMaxBeats = () => {
    if (subdivision === "quarter") return beatsPerMeasure;
    if (subdivision === "eighth") return beatsPerMeasure * 2;
    if (subdivision === "sixteenth") return beatsPerMeasure * 4;
    return 16;
  };

  const addBeat = () => {
    if (pattern.length < getMaxBeats()) {
      setPattern([...pattern, "down"]);
    }
  };

  const removeBeat = () => {
    if (pattern.length > 1) {
      setPattern(pattern.slice(0, -1));
    }
  };

  const getStrumIcon = (strum: StrumType) => {
    switch (strum) {
      case "down":
        return <ChevronDown className="w-4 h-4" />;
      case "up":
        return <ChevronUp className="w-4 h-4" />;
      case "rest":
        return <Minus className="w-4 h-4" />;
      case "muted":
        return <X className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const newPattern: StrummingPattern = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || "Custom pattern",
      pattern,
      subdivision,
      beatsPerMeasure,
      genre,
    };

    onSavePattern(newPattern);

    // Reset form
    setName("");
    setDescription("");
    setPattern(["down", "down", "up", "down", "up"]);
    setSubdivision("eighth");
    setBeatsPerMeasure(4);
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4">Create Custom Pattern</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2">Pattern Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Pattern"
            />
          </div>
          <div>
            <label className="block mb-2">Genre</label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Custom">Custom</SelectItem>
                <SelectItem value="Rock">Rock</SelectItem>
                <SelectItem value="Pop">Pop</SelectItem>
                <SelectItem value="Folk">Folk</SelectItem>
                <SelectItem value="Country">Country</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-2">Note Value</label>
            <Select
              value={subdivision}
              onValueChange={(value: Subdivision) => setSubdivision(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarter">Quarter Notes</SelectItem>
                <SelectItem value="eighth">Eighth Notes</SelectItem>
                <SelectItem value="sixteenth">Sixteenth Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-2">Time Signature</label>
            <Select
              value={beatsPerMeasure.toString()}
              onValueChange={(value) => setBeatsPerMeasure(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3/4</SelectItem>
                <SelectItem value="4">4/4</SelectItem>
                <SelectItem value="6">6/8</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your pattern..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label>
              Pattern ({pattern.length} {subdivision}s)
            </label>
            <div className="flex gap-2">
              <Button
                onClick={addBeat}
                size="sm"
                variant="outline"
                disabled={pattern.length >= getMaxBeats()}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={removeBeat}
                size="sm"
                variant="outline"
                disabled={pattern.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {pattern.map((strum, index) => (
              <div key={index} className="flex flex-col gap-1">
                <Select
                  value={strum}
                  onValueChange={(newStrum: StrumType) =>
                    updateStrum(index, newStrum)
                  }
                >
                  <SelectTrigger className="w-16 h-16">
                    <SelectValue>{getStrumIcon(strum)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="down">
                      <div className="flex items-center gap-2">
                        <ChevronDown className="w-4 h-4" />
                        Down
                      </div>
                    </SelectItem>
                    <SelectItem value="up">
                      <div className="flex items-center gap-2">
                        <ChevronUp className="w-4 h-4" />
                        Up
                      </div>
                    </SelectItem>
                    <SelectItem value="rest">
                      <div className="flex items-center gap-2">
                        <Minus className="w-4 h-4" />
                        Rest
                      </div>
                    </SelectItem>
                    <SelectItem value="muted">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Muted
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <span className={`text-xs text-center text-muted-foreground ${
                  (index + 1).toString().match(/^[1-4]$/) ? "font-bold text-sm" : ""
                }`}>
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={!name.trim()}>
          Save Pattern
        </Button>
      </div>
    </Card>
  );
}
