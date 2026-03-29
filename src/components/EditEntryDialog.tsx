import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label="Modifier"
        >
          <Pencil className="h-3 w-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold">Modifier l'entrée</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Date</Label>
            <Input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Poids (kg)</Label>
            <Input type="number" step="0.1" min="20" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Note</Label>
            <Input placeholder="Ex: après sport" value={note} onChange={(e) => setNote(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <Button onClick={handleSave} className="w-full h-11 rounded-xl font-bold">
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
