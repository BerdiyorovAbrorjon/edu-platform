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
        throw new Error(error.error || "Failed to delete lesson");
      }

      toast.success("Lesson deleted successfully");
      onClose();
      onDeleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete lesson"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={!!lesson} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the lesson{" "}
            <span className="font-semibold text-foreground">
              &quot;{lesson?.title}&quot;
            </span>{" "}
            and all its associated data including tests, lectures, and Q&A.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
