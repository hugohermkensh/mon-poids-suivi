import { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WeightEntry } from "@/lib/weight-storage";

interface Props {
  entry: WeightEntry;
  onSave: (id: string, updates: { date: string; weight: number; note?: string }) => void;
}

export default function EditEntryDialog({ entry, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(entry.date);
  const [weight, setWeight] = useState(entry.weight.toString());
  const [note, setNote] = useState(entry.note || "");
  const today = new Date().toISOString().split("T")[0];

  const handleSave = () => {
    const w = parseFloat(weight);
    if (!date || isNaN(w) || w <= 0) return;
    onSave(entry.id, { date, weight: w, note: note || undefined });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="h-7 w-7 flex items-center justify-center text-muted-foreground/50 hover:text-accent hover:bg-secondary transition-all"
          aria-label="Éditer"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-none border-accent/30 bg-card">
        <DialogHeader>
          <DialogTitle className="font-bold text-base uppercase tracking-widest font-mono text-accent">
            ▸ Édition Entrée
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Date</Label>
            <Input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-none bg-secondary border-border font-mono focus-visible:border-accent focus-visible:ring-0" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Poids (KG)</Label>
            <Input type="number" step="0.1" min="20" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-11 rounded-none bg-secondary border-border font-mono tabular-nums focus-visible:border-accent focus-visible:ring-0" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Note</Label>
            <Input placeholder="// optionnel" value={note} onChange={(e) => setNote(e.target.value)} className="h-11 rounded-none bg-secondary border-border font-mono focus-visible:border-accent focus-visible:ring-0" />
          </div>
          <button onClick={handleSave} className="w-full h-11 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs hover:bg-foreground transition-colors">
            Confirmer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
