import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface Props {
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ onConfirm }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="h-7 w-7 flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-secondary transition-all"
          aria-label="Supprimer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm rounded-none border-destructive/40 bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-base uppercase tracking-widest font-mono text-destructive">
            ▸ Suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-xs">
            Cette opération est irréversible. Confirmer la suppression de l'entrée ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none font-mono uppercase tracking-widest text-xs">Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-none bg-destructive hover:bg-destructive/90 font-mono uppercase tracking-widest text-xs"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
