"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Play,
  RotateCcw,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
  Check,
  Lock,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

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

const STEPS = [
  {
    step: 1,
    label: "Dastlabki Test",
    description: "Bilimingizni tekshirish",
    icon: ClipboardCheck,
    route: "initial-test",
  },
  {
    step: 2,
    label: "Maruzalar",
    description: "Yangi bilimlarni o'rganish",
    icon: BookOpen,
    route: "lectures",
  },
  {
    step: 3,
    label: "Vaziyatli Savol-Javob",
    description: "Amaliy vaziyatlarni tahlil qilish",
    icon: MessageSquare,
    route: "situational",
  },
  {
    step: 4,
    label: "Yakuniy Test",
    description: "O'zlashtirishni baholash",
    icon: GraduationCap,
    route: "final-test",
  },
];

function getStepStatus(
  step: number,
  currentStep: number,
  isCompleted: boolean
): "completed" | "current" | "locked" {
  if (isCompleted) return "completed";
  if (step < currentStep) return "completed";
  if (step === currentStep) return "current";
  return "locked";
}

export default function LessonOverviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonOverview | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
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

  const handleStepClick = (route: string) => {
    router.push(`/student/lessons/${params.id}/${route}`);
  };

  const handleRestart = async () => {
    setRestarting(true);
    try {
      const res = await fetch(`/api/student/lessons/${params.id}/restart`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Qayta boshlashda xatolik");
      }

      toast.success("Dars qayta boshlandi!");
      setProgress({ currentStep: 0, completedAt: null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setRestarting(false);
    }
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

      {/* Vertical step cards */}
      <div className="space-y-3">
        {STEPS.map((s, idx) => {
          const status = getStepStatus(s.step, activeStep, isCompleted);
          const Icon = s.icon;
          const isLocked = status === "locked";

          return (
            <Card
              key={s.step}
              className={cn(
                "transition-all",
                isLocked && "opacity-50 cursor-not-allowed",
                !isLocked && "hover:shadow-md cursor-pointer",
                status === "current" && "border-blue-300 ring-1 ring-blue-100",
                status === "completed" && "border-green-200"
              )}
              onClick={() => {
                if (!isLocked) handleStepClick(s.route);
              }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    status === "completed" &&
                      "border-green-500 bg-green-50 text-green-600",
                    status === "current" &&
                      "border-blue-500 bg-blue-50 text-blue-600",
                    status === "locked" &&
                      "border-muted bg-muted/50 text-muted-foreground"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="h-5 w-5" />
                  ) : status === "locked" ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      status === "completed" && "text-green-700",
                      status === "current" && "text-blue-700",
                      status === "locked" && "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-xs",
                    status === "completed" &&
                      "bg-green-50 text-green-700 border-green-200",
                    status === "current" &&
                      "bg-blue-50 text-blue-700 border-blue-200",
                    status === "locked" && "text-muted-foreground"
                  )}
                >
                  {status === "completed"
                    ? "Tugatilgan"
                    : status === "current"
                    ? "Hozirgi"
                    : "Qulflangan"}
                </Badge>
                {/* Connector */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={() => handleStepClick(STEPS.find((s) => s.step === activeStep)?.route ?? "initial-test")}
          size="lg"
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {isCompleted
            ? "Ko'rib chiqish"
            : currentStep === 0
            ? "Darsni boshlash"
            : "Davom ettirish"}
        </Button>
        {isCompleted && (
          <>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              asChild
            >
              <Link href={`/student/lessons/${params.id}/results`}>
                <Trophy className="h-4 w-4" />
                Natijalarni Ko&apos;rish
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  disabled={restarting}
                >
                  {restarting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Qayta Boshlash
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Darsni qayta boshlashni tasdiqlaysizmi?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Barcha test natijalari, vaziyatli savol javoblari va
                    ilgarilash o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRestart}>
                    Qayta boshlash
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
