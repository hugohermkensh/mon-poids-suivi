import { useState } from "react";
import { Settings, Target, Ruler } from "lucide-react";
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
import { UserSettings } from "@/lib/weight-storage";
import { toast } from "@/hooks/use-toast";

interface Props {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export default function SettingsDialog({ settings, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [goalWeight, setGoalWeight] = useState(settings.goalWeight?.toString() || "");
  const [height, setHeight] = useState(settings.height?.toString() || "");

  const handleSave = () => {
    const gw = parseFloat(goalWeight);
    const h = parseFloat(height);
    onSave({
      goalWeight: !isNaN(gw) && gw > 0 ? gw : undefined,
      height: !isNaN(h) && h > 0 ? h : undefined,
    });
    setOpen(false);
    toast({ title: "Paramètres sauvegardés ✓" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-xl transition-transform active:scale-90"
          aria-label="Paramètres"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Paramètres</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                <Target className="h-3 w-3 text-primary" />
              </div>
              Poids objectif (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="Ex: 70"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                <Ruler className="h-3 w-3 text-primary" />
              </div>
              Taille (cm)
            </Label>
            <Input
              type="number"
              step="1"
              min="100"
              max="250"
              placeholder="Ex: 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <Button
            onClick={handleSave}
            className="w-full h-11 rounded-xl font-bold shadow-md shadow-primary/20 transition-transform active:scale-[0.98]"
          >
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
