"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { LessonStudents } from "@/components/admin/lesson-students";
import { fmtDate } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: { id: string; name: string | null; email: string };
  _count: { tests: number; lectures: number; situationalQA: number };
  initialQuestionCount: number;
  finalQuestionCount: number;
  completedCount: number;
  inProgressCount: number;
}

type StudentsDialogState =
  | { open: false }
  | { open: true; lessonId: string; lessonTitle: string };

type ViewDialogState =
  | { open: false }
  | { open: true; lesson: Lesson };

function isReady(lesson: Lesson): boolean {
  return (
    lesson.initialQuestionCount > 0 && lesson.finalQuestionCount > 0 &&
    lesson._count.lectures >= 1 &&
    lesson._count.situationalQA >= 1
  );
}

function StatusBadge({ lesson }: { lesson: Lesson }) {
  return isReady(lesson) ? (
    <Badge className="border-green-200 bg-green-50 text-green-700 gap-1">
      <CheckCircle2 className="h-3 w-3" />
      Tayyor
    </Badge>
  ) : (
    <Badge className="border-yellow-200 bg-yellow-50 text-yellow-700 gap-1">
      <XCircle className="h-3 w-3" />
      To&apos;liq emas
    </Badge>
  );
}

function ContentChips({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex flex-wrap gap-1">
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        {lesson.initialQuestionCount} T
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        {lesson._count.lectures} M
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
        {lesson._count.situationalQA} SJ
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        {lesson.finalQuestionCount} T
      </span>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border bg-white p-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function TeacherLessonsPage() {
  const { data: session } = useSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [studentsDialog, setStudentsDialog] = useState<StudentsDialogState>({ open: false });
  const [viewDialog, setViewDialog] = useState<ViewDialogState>({ open: false });
  const [deleteLesson, setDeleteLesson] = useState<Lesson | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/lessons?${params}`);
      if (!res.ok) throw new Error("Darslarni yuklashda xatolik");
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch {
      setLessons([]);
      toast.error("Darslarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchLessons, 300);
    return () => clearTimeout(timeout);
  }, [fetchLessons]);

  const handleDelete = async () => {
    if (!deleteLesson) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/lessons/${deleteLesson.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("O'chirishda xatolik");
      toast.success("Dars o'chirildi");
      setDeleteLesson(null);
      fetchLessons();
    } catch {
      toast.error("Darsni o'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const filteredLessons = statusFilter
    ? lessons.filter((l) =>
      statusFilter === "ready" ? isReady(l) : !isReady(l)
    )
    : lessons;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Darslar</h1>
          <p className="mt-1 text-gray-500">
            {!loading && `${filteredLessons.length} ta dars`}
          </p>
        </div>
        <Button
          asChild
          className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-violet-700"
        >
          <Link href="/teacher/lessons/create">
            <Plus className="h-4 w-4" />
            Dars yaratish
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Darslarni qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-gray-200 bg-white pl-10 shadow-sm focus-visible:ring-blue-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Barcha holatlar</option>
          <option value="ready">Tayyor</option>
          <option value="incomplete">To&apos;liq emas</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : filteredLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center">
          <p className="text-lg font-semibold text-gray-500">
            {search ? `"${search}" bo'yicha natija topilmadi` : "Hali dars yo'q"}
          </p>
          {!search && (
            <Button
              asChild
              className="mt-4 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600"
            >
              <Link href="/teacher/lessons/create">
                <Plus className="h-4 w-4" />
                Dars yaratish
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Nomi</TableHead>
                <TableHead className="font-semibold">Holati</TableHead>
                <TableHead className="font-semibold">Tarkibi</TableHead>
                <TableHead className="font-semibold">Sana</TableHead>
                <TableHead className="font-semibold text-center">Yakunlagan</TableHead>
                <TableHead className="font-semibold text-center">Jarayonda</TableHead>
                <TableHead className="font-semibold text-center">Ko&apos;rish</TableHead>
                <TableHead className="font-semibold text-center">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons.map((lesson) => {
                const isOwn = session?.user?.id === lesson.createdBy.id;
                return (
                  <TableRow key={lesson.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <p className="font-medium text-gray-900 max-w-[200px] truncate">
                        {lesson.title}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge lesson={lesson} />
                    </TableCell>
                    <TableCell>
                      <ContentChips lesson={lesson} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      {fmtDate(lesson.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setStudentsDialog({
                            open: true,
                            lessonId: lesson.id,
                            lessonTitle: lesson.title,
                          })
                        }
                        className="inline-flex items-center justify-center rounded-lg bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
                      >
                        {lesson.completedCount} ta
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setStudentsDialog({
                            open: true,
                            lessonId: lesson.id,
                            lessonTitle: lesson.title,
                          })
                        }
                        className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        {lesson.inProgressCount} ta
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewDialog({ open: true, lesson })}
                        className="h-8 w-8 rounded-lg hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      {isOwn && (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Link href={`/teacher/lessons/${lesson.id}/edit`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteLesson(lesson)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Students Dialog */}
      <Dialog
        open={studentsDialog.open}
        onOpenChange={(open) => !open && setStudentsDialog({ open: false })}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {studentsDialog.open ? studentsDialog.lessonTitle : ""}
            </DialogTitle>
          </DialogHeader>
          {studentsDialog.open && (
            <LessonStudents lessonId={studentsDialog.lessonId} />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) => !open && setViewDialog({ open: false })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewDialog.open ? viewDialog.lesson.title : ""}
            </DialogTitle>
          </DialogHeader>
          {viewDialog.open && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {viewDialog.lesson.description}
              </p>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-semibold">Tarkib:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Testlar:</span>
                  <span className="font-medium">{viewDialog.lesson._count.tests} ta</span>
                  <span className="text-muted-foreground">Maruzalar:</span>
                  <span className="font-medium">{viewDialog.lesson._count.lectures} ta</span>
                  <span className="text-muted-foreground">S&amp;J:</span>
                  <span className="font-medium">{viewDialog.lesson._count.situationalQA} ta</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button asChild variant="outline">
                  <Link href={`/teacher/lessons/${viewDialog.lesson.id}/edit`}>
                    Tahrirlash
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteLesson}
        onOpenChange={(open) => !open && setDeleteLesson(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Darsni o&apos;chirish</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteLesson?.title}&quot; darsini o&apos;chirishni tasdiqlaysizmi? Bu amalni
              bekor qilib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
