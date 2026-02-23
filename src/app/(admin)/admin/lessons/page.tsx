"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  FileText,
  Video,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function LessonCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
      <Skeleton className="mb-4 h-4 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Lessons
          </h1>
          <p className="mt-1 text-gray-500">
            {!loading && `${lessons.length} ta dars mavjud`}
          </p>
        </div>
        <Button
          asChild
          className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-violet-700"
        >
          <Link href="/admin/lessons/create">
            <Plus className="h-4 w-4" />
            Create Lesson
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search lessons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border-gray-200 bg-white pl-10 shadow-sm focus-visible:ring-blue-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LessonCardSkeleton key={i} />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-gray-900">
            {search ? "No lessons found" : "No lessons yet"}
          </h3>
          <p className="mb-6 max-w-xs text-sm text-gray-500">
            {search
              ? `No results for "${search}"`
              : "Get started by creating your first lesson"}
          </p>
          {!search && (
            <Button
              asChild
              className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600"
            >
              <Link href="/admin/lessons/create">
                <Plus className="h-4 w-4" />
                Create Lesson
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Title + actions */}
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 flex-1 font-bold leading-snug text-gray-900">
                  {lesson.title}
                </h3>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                    aria-label={`Edit ${lesson.title}`}
                  >
                    <Link href={`/admin/lessons/${lesson.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                    onClick={() => setDeleteLesson(lesson)}
                    aria-label={`Delete ${lesson.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
                {lesson.description}
              </p>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  <Video className="h-3 w-3" />
                  {lesson._count.lectures} lecture
                  {lesson._count.lectures !== 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                  <FileText className="h-3 w-3" />
                  {lesson._count.tests} test{lesson._count.tests !== 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-600">
                  <MessageSquare className="h-3 w-3" />
                  {lesson._count.situationalQA} Q&amp;A
                </span>
              </div>

              {/* Date */}
              <div className="mt-4 border-t border-gray-50 pt-4">
                <p className="text-xs text-gray-400">
                  {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteLessonDialog
        lesson={deleteLesson}
        onClose={() => setDeleteLesson(null)}
        onDeleted={fetchLessons}
      />
    </div>
  );
}
