import { useState } from "react";
import { Plus, CalendarDays, Weight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Props {
  onAdd: (date: string, weight: number, note?: string) => void;
}

export default function WeightForm({ onAdd }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!date || isNaN(w) || w <= 0) {
      toast({ title: "Veuillez saisir un poids valide", variant: "destructive" });
      return;
    }
    onAdd(date, w, note || undefined);
    setWeight("");
    setNote("");
    setDate(today);
    setShowNote(false);
    toast({ title: `${w.toFixed(1)} kg enregistré ✓` });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 pl-9 rounded-xl bg-muted/40 border-0 text-sm font-medium"
            max={today}
          />
        </div>
        <div className="relative flex-1">
          <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="number"
            step="0.1"
            min="20"
            max="300"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-11 pl-9 rounded-xl bg-muted/40 border-0 text-sm font-semibold"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowNote(!showNote)}
          className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-[11px] font-semibold transition-colors ${
            showNote ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <MessageSquare className="h-3 w-3" />
          Note
        </button>
        <div className="flex-1" />
        <Button
          type="submit"
          className="h-9 px-5 rounded-xl font-bold text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>
      {showNote && (
        <Input
          placeholder="Ex: après sport, à jeun..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-10 rounded-xl bg-muted/40 border-0 text-sm"
          autoFocus
        />
      )}
    </form>
  );
}
