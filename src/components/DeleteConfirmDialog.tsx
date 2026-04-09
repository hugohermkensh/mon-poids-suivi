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
          className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
          aria-label="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-black text-lg">🗑️ Supprimer cette entrée ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-2xl">Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="rounded-2xl bg-destructive hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
