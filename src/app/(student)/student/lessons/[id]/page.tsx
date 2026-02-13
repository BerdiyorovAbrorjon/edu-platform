"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonStepper } from "@/components/student/lesson-stepper";

interface LessonOverview {
  id: string;
  title: string;
  description: string;
  tests: { id: string; type: string; questions: unknown[] }[];
  lectures: { id: string; title: string; order: number }[];
  situationalQA: { id: string; question: string; order: number }[];
}

interface Progress {
  currentStep: number;
  completedAt: string | null;
}

const STEP_ROUTES: Record<number, string> = {
  1: "initial-test",
  2: "lectures",
  3: "situational",
  4: "final-test",
};

const STEP_LABELS: Record<number, string> = {
  1: "Dastlabki Testni boshlash",
  2: "Maruzalarni ko'rish",
  3: "Vaziyatli savollarni boshlash",
  4: "Yakuniy Testni boshlash",
};

export default function LessonOverviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonOverview | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch lesson details and progress in parallel
      const [lessonRes, progressRes] = await Promise.all([
        fetch(`/api/lessons/${params.id}`),
        fetch(`/api/student/lessons/${params.id}/progress`),
      ]);

      if (!lessonRes.ok) {
        throw new Error(
          lessonRes.status === 404 ? "Dars topilmadi" : "Darsni yuklashda xato"
        );
      }

      const lessonData = await lessonRes.json();
      setLesson(lessonData);

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      } else {
        setProgress({ currentStep: 0, completedAt: null });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentStep = progress?.currentStep ?? 0;
  const isCompleted = !!progress?.completedAt;
  const activeStep = isCompleted ? 4 : currentStep === 0 ? 1 : currentStep;

  const handleStepClick = (step: number) => {
    const route = STEP_ROUTES[step];
    if (route) {
      router.push(`/student/lessons/${params.id}/${route}`);
    }
  };

  const handleContinue = () => {
    handleStepClick(activeStep);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-destructive">
          {error || "Dars topilmadi"}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/student/lessons">Darslarga qaytish</Link>
        </Button>
      </div>
    );
  }

  const initialTest = lesson.tests.find((t) => t.type === "INITIAL");
  const finalTest = lesson.tests.find((t) => t.type === "FINAL");

  const stats = [
    {
      label: "Dastlabki test savollari",
      value: (initialTest?.questions as unknown[])?.length ?? 0,
    },
    { label: "Maruzalar", value: lesson.lectures.length },
    { label: "Vaziyatli savollar", value: lesson.situationalQA.length },
    {
      label: "Yakuniy test savollari",
      value: (finalTest?.questions as unknown[])?.length ?? 0,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link href="/student/lessons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Tugatilgan
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{lesson.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card px-4 py-3 text-center"
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stepper */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dars bosqichlari</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonStepper
            currentStep={activeStep}
            completedAt={isCompleted}
            onStepClick={handleStepClick}
          />
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={handleContinue} size="lg" className="gap-2">
          <Play className="h-4 w-4" />
          {isCompleted
            ? "Ko'rib chiqish"
            : currentStep === 0
            ? "Darsni boshlash"
            : STEP_LABELS[activeStep]}
        </Button>
        {isCompleted && (
          <Button variant="outline" size="lg" className="gap-2" disabled>
            <RotateCcw className="h-4 w-4" />
            Boshidan boshlash
          </Button>
        )}
      </div>

      {/* Lesson content summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Dars tarkibi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lesson.lectures.map((lecture, idx) => (
              <div
                key={lecture.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {idx + 1}
                </span>
                <span className="text-sm">{lecture.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
