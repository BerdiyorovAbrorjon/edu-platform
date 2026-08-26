"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteLessonDialogProps {
  lesson: { id: string; title: string } | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteLessonDialog({
  lesson,
  onClose,
  onDeleted,
}: DeleteLessonDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!lesson) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Darsni o'chirishda xatolik");
      }

      toast.success("Dars muvaffaqiyatli o'chirildi");
      onClose();
      onDeleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Darsni o'chirishda xatolik"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={!!lesson} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ishonchingiz komilmi?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu dars{" "}
            <span className="font-semibold text-foreground">
              &quot;{lesson?.title}&quot;
            </span>{" "}
            va unga tegishli barcha ma&apos;lumotlar (testlar, maruzalar va S&amp;J) butunlay o&apos;chiriladi.
            Bu amalni qaytarib bo&apos;lmaydi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Bekor qilish</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            O&apos;chirish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
