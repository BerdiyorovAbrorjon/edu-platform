"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LessonWithProgress {
  id: string;
  title: string;
  description: string;
  lectureCount: number;
  qaCount: number;
  currentStep: number;
  completedAt: string | null;
}

function getProgressPercent(
  currentStep: number,
  completedAt: string | null
): number {
  if (completedAt) return 100;
  if (currentStep === 0) return 0;
  return Math.min((currentStep - 1) * 25 + 12, 100);
}

type Status = "completed" | "active" | "idle";

function getStatus(
  currentStep: number,
  completedAt: string | null
): Status {
  if (completedAt) return "completed";
  if (currentStep > 0) return "active";
  return "idle";
}

function LessonCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-5 h-4 w-3/4" />
      <Skeleton className="mb-4 h-2 w-full rounded-full" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}

const statusConfig = {
  completed: {
    badge: (
      <Badge className="gap-1 border-green-200 bg-green-50 text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Tugatilgan
      </Badge>
    ),
    border: "border-green-200",
    progress: "[&>div]:bg-green-500",
    button:
      "flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition-all hover:bg-green-100",
    buttonText: "Ko'rib chiqish",
    accentLine: "bg-green-400",
  },
  active: {
    badge: (
      <Badge className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
        <Clock className="h-3 w-3" />
        Jarayonda
      </Badge>
    ),
    border: "border-blue-200",
    progress: "[&>div]:bg-blue-500",
    button:
      "flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40",
    buttonText: "Davom ettirish",
    accentLine: "bg-blue-400",
  },
  idle: {
    badge: (
      <Badge className="border-gray-200 bg-gray-50 text-gray-500">
        Boshlanmagan
      </Badge>
    ),
    border: "border-gray-100",
    progress: "",
    button:
      "flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-700",
    buttonText: "Boshlash",
    accentLine: "bg-gray-200",
  },
};

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/student/lessons?${params}`);
      const data = await res.json();
      setLessons(Array.isArray(data) ? data : []);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const completedCount = lessons.filter((l) => l.completedAt).length;
  const activeCount = lessons.filter(
    (l) => !l.completedAt && l.currentStep > 0
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Darslar
          </h1>
          <p className="mt-1 text-gray-500">
            {!loading && lessons.length > 0 && (
              <>
                <span className="font-medium text-green-600">
                  {completedCount} tugatilgan
                </span>
                {activeCount > 0 && (
                  <>
                    {" · "}
                    <span className="font-medium text-blue-600">
                      {activeCount} jarayonda
                    </span>
                  </>
                )}
              </>
            )}
            {loading && "Yuklanmoqda..."}
            {!loading && lessons.length === 0 && "Barcha mavjud darslar"}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="rounded-xl border-gray-200 bg-white pl-10 shadow-sm focus-visible:ring-blue-500"
            placeholder="Darslarni qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LessonCardSkeleton key={i} />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            {debouncedSearch ? "Hech narsa topilmadi" : "Hozircha darslar yo'q"}
          </h3>
          <p className="text-sm text-gray-500">
            {debouncedSearch
              ? `"${debouncedSearch}" bo'yicha natija topilmadi`
              : "Admin tomonidan darslar qo'shilgach ko'rinadi"}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const percent = getProgressPercent(
              lesson.currentStep,
              lesson.completedAt
            );
            const status = getStatus(lesson.currentStep, lesson.completedAt);
            const cfg = statusConfig[status];

            return (
              <div
                key={lesson.id}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  cfg.border
                )}
              >
                {/* Colored top accent line */}
                <div
                  className={cn("h-1 w-full shrink-0", cfg.accentLine)}
                />

                <div className="flex flex-1 flex-col p-6">
                  {/* Title + badge */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-bold leading-snug text-gray-900">
                      {lesson.title}
                    </h3>
                    {cfg.badge}
                  </div>

                  {/* Description */}
                  <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
                    {lesson.description}
                  </p>

                  {/* Meta */}
                  <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {lesson.lectureCount} maruza
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span>{lesson.qaCount} savol</span>
                  </div>

                  {/* Progress */}
                  <div className="mb-5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-semibold text-gray-700">
                        {percent}%
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className={cn("h-1.5 bg-gray-100", cfg.progress)}
                    />
                  </div>

                  {/* Button */}
                  <Link
                    href={`/student/lessons/${lesson.id}`}
                    className={cfg.button}
                  >
                    <Play className="h-3.5 w-3.5" />
                    {cfg.buttonText}
                    <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
