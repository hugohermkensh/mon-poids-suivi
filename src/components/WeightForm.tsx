import { useState } from "react";
import { Plus, CalendarDays, Weight } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

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
    setIsExpanded(false);
    toast({ title: `${w.toFixed(1)} kg enregistré ✓` });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card/80 backdrop-blur-sm p-4 shadow-sm space-y-3 transition-all duration-300"
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 pl-10 rounded-xl bg-background/60 border-border/60 text-sm font-medium focus:bg-background"
            max={today}
          />
        </div>
        <div className="relative flex-1">
          <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            type="number"
            step="0.1"
            min="20"
            max="300"
            placeholder="kg"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              if (!isExpanded && e.target.value) setIsExpanded(true);
            }}
            className="h-11 pl-10 rounded-xl bg-background/60 border-border/60 text-sm font-semibold focus:bg-background"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className="shrink-0 h-11 w-11 rounded-xl shadow-md shadow-primary/20 transition-transform active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Input
          placeholder="Ajouter une note — ex: après sport, à jeun..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-10 rounded-xl bg-background/60 border-border/60 text-sm"
        />
      </div>
    </form>
  );
}
