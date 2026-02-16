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
          className="text-muted-foreground/50 hover:text-destructive transition-colors"
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette entrée ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
