"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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

function getProgressPercent(currentStep: number, completedAt: string | null): number {
  if (completedAt) return 100;
  if (currentStep === 0) return 0;
  // Steps 1-4, each step completed = 25%
  return Math.min((currentStep - 1) * 25 + 12, 100);
}

function getStatusBadge(currentStep: number, completedAt: string | null) {
  if (completedAt) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        Tugatilgan
      </Badge>
    );
  }
  if (currentStep > 0) {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
        Jarayonda
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-muted-foreground">
      Boshlanmagan
    </Badge>
  );
}

function LessonCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
}

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Darslar</h1>
        <p className="text-muted-foreground">
          Barcha mavjud darslar ro&apos;yxati
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Darslarni qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LessonCardSkeleton key={i} />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            {debouncedSearch
              ? "Hech narsa topilmadi"
              : "Hozircha darslar mavjud emas"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const percent = getProgressPercent(
              lesson.currentStep,
              lesson.completedAt
            );
            return (
              <Card
                key={lesson.id}
                className="group flex flex-col transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug line-clamp-2">
                      {lesson.title}
                    </h3>
                    {getStatusBadge(lesson.currentStep, lesson.completedAt)}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lesson.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{lesson.lectureCount} maruza</span>
                    <span>{lesson.qaCount} savol</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{percent}%</span>
                    </div>
                    <Progress
                      value={percent}
                      className={cn(
                        "h-2",
                        lesson.completedAt
                          ? "[&>div]:bg-green-500"
                          : lesson.currentStep > 0
                          ? "[&>div]:bg-blue-500"
                          : ""
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild size="sm" className="w-full group-hover:gap-3 transition-all">
                    <Link href={`/student/lessons/${lesson.id}`}>
                      {lesson.completedAt
                        ? "Ko'rib chiqish"
                        : lesson.currentStep > 0
                        ? "Davom ettirish"
                        : "Boshlash"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
