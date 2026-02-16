import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onAdd: (date: string, weight: number, note?: string) => void;
}

export default function WeightForm({ onAdd }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!date || isNaN(w) || w <= 0) return;
    onAdd(date, w, note || undefined);
    setWeight("");
    setNote("");
    setDate(today);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 bg-card"
          max={today}
        />
        <Input
          type="number"
          step="0.1"
          min="20"
          max="300"
          placeholder="Poids (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="flex-1 bg-card"
        />
        <Button type="submit" size="icon" className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Input
        placeholder="Note (optionnel) — ex: après sport"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="bg-card text-sm"
      />
    </form>
  );
}
