"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  BookOpen,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestBuilder } from "@/components/admin/test-builder";
import { LecturesManager } from "@/components/admin/lectures-manager";
import { SituationalQABuilder } from "@/components/admin/situational-qa-builder";
import { cn } from "@/lib/utils";

interface TestData {
  id: string;
  type: string;
  questions: unknown[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  tests: TestData[];
  lectures: { id: string; title: string; order: number }[];
  situationalQA: { id: string; question: string; order: number }[];
}

interface CompletionStep {
  key: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  unit: string;
  complete: boolean;
}

function getCompletionSteps(lesson: Lesson): CompletionStep[] {
  const initialTest = lesson.tests.find((t) => t.type === "INITIAL");
  const finalTest = lesson.tests.find((t) => t.type === "FINAL");
  const initialCount = initialTest?.questions?.length ?? 0;
  const finalCount = finalTest?.questions?.length ?? 0;
  const lectureCount = lesson.lectures.length;
  const qaCount = lesson.situationalQA.length;

  return [
    {
      key: "initial-test",
      label: "Dastlabki test",
      icon: <ClipboardCheck className="h-4 w-4" />,
      count: initialCount,
      unit: "savol",
      complete: initialCount > 0,
    },
    {
      key: "lectures",
      label: "Maruzalar",
      icon: <BookOpen className="h-4 w-4" />,
      count: lectureCount,
      unit: "maruza",
      complete: lectureCount > 0,
    },
    {
      key: "situational-qa",
      label: "Vaziyatli S&J",
      icon: <MessageSquare className="h-4 w-4" />,
      count: qaCount,
      unit: "savol",
      complete: qaCount > 0,
    },
    {
      key: "final-test",
      label: "Yakuniy test",
      icon: <GraduationCap className="h-4 w-4" />,
      count: finalCount,
      unit: "savol",
      complete: finalCount > 0,
    },
  ];
}

export default function EditLessonPage() {
  const params = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("initial-test");

  const fetchLesson = useCallback(async () => {
    try {
      const res = await fetch(`/api/lessons/${params.id}`);
      if (!res.ok) {
        throw new Error(
          res.status === 404 ? "Lesson not found" : "Failed to load lesson"
        );
      }
      const data = await res.json();
      setLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  // Refresh lesson data when switching tabs to update counts
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    fetchLesson();
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
          {error || "Lesson not found"}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/lessons">Back to Lessons</Link>
        </Button>
      </div>
    );
  }

  const steps = getCompletionSteps(lesson);
  const allComplete = steps.every((s) => s.complete);
  const completedCount = steps.filter((s) => s.complete).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/lessons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.description}</p>
        </div>
        {allComplete && (
          <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Tayyor
          </Badge>
        )}
      </div>

      {/* Completion Checklist */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">
            Dars holati ({completedCount}/{steps.length})
          </p>
          <div className="flex gap-1">
            {steps.map((step) => (
              <div
                key={step.key}
                className={cn(
                  "h-2 w-8 rounded-full",
                  step.complete ? "bg-green-500" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((step) => (
            <button
              key={step.key}
              type="button"
              onClick={() => handleTabChange(step.key)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                step.complete
                  ? "border-green-200 bg-green-50"
                  : "border-dashed"
              )}
            >
              {step.complete ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{step.label}</p>
                <p className="text-xs text-muted-foreground">
                  {step.count > 0
                    ? `${step.count} ${step.unit}`
                    : "yo'q"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="initial-test" className="gap-1.5">
            Dastlabki baholash
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 h-5 min-w-5 px-1 text-[10px]",
                steps[0].complete
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {steps[0].count}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="lectures" className="gap-1.5">
            Maruzalar
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 h-5 min-w-5 px-1 text-[10px]",
                steps[1].complete
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {steps[1].count}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="situational-qa" className="gap-1.5">
            Vaziyatli S&J
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 h-5 min-w-5 px-1 text-[10px]",
                steps[2].complete
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {steps[2].count}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="final-test" className="gap-1.5">
            Yakuniy test
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 h-5 min-w-5 px-1 text-[10px]",
                steps[3].complete
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {steps[3].count}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="initial-test" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Dastlabki Baholash Testi</h2>
              <p className="text-sm text-muted-foreground">
                Darsni boshlashdan oldin talabalarni baholash uchun savollar yarating
              </p>
            </div>
            <TestBuilder lessonId={lesson.id} testType="INITIAL" />
          </div>
        </TabsContent>

        <TabsContent value="lectures" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Maruzalar</h2>
              <p className="text-sm text-muted-foreground">
                Ushbu dars uchun maruza materiallari, videolar va fayllarni qo&apos;shing
              </p>
            </div>
            <LecturesManager lessonId={lesson.id} />
          </div>
        </TabsContent>

        <TabsContent value="situational-qa" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Vaziyatli Savol-Javob</h2>
              <p className="text-sm text-muted-foreground">
                Vaziyatga asoslangan savollar va batafsil javob tushuntirishlarini yarating
              </p>
            </div>
            <SituationalQABuilder lessonId={lesson.id} />
          </div>
        </TabsContent>

        <TabsContent value="final-test" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Yakuniy Test</h2>
              <p className="text-sm text-muted-foreground">
                Talabalar o&apos;zlashtirishini baholash uchun yakuniy test yarating
              </p>
            </div>
            <TestBuilder lessonId={lesson.id} testType="FINAL" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
