"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteLessonDialog } from "@/components/admin/delete-lesson-dialog";

interface Lesson {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: { id: string; name: string | null; email: string };
  _count: { tests: number; lectures: number; situationalQA: number };
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteLesson, setDeleteLesson] = useState<Lesson | null>(null);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/lessons?${params}`);
      if (!res.ok) throw new Error("Failed to load lessons");
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch {
      setLessons([]);
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchLessons, 300);
    return () => clearTimeout(timeout);
  }, [fetchLessons]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground">
            Manage your educational lessons
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lessons/create">
            <Plus className="h-4 w-4" />
            Create Lesson
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No lessons found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {search
                ? "Try adjusting your search term"
                : "Get started by creating your first lesson"}
            </p>
            {!search && (
              <Button asChild className="mt-4">
                <Link href="/admin/lessons/create">
                  <Plus className="h-4 w-4" />
                  Create Lesson
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {lesson.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {lesson._count.lectures} lectures, {lesson._count.tests} tests
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label={`Edit ${lesson.title}`}>
                        <Link href={`/admin/lessons/${lesson.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteLesson(lesson)}
                        aria-label={`Delete ${lesson.title}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </div>

      <DeleteLessonDialog
        lesson={deleteLesson}
        onClose={() => setDeleteLesson(null)}
        onDeleted={fetchLessons}
      />
    </div>
  );
}
