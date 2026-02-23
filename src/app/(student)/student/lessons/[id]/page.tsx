"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  RotateCcw,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
  Check,
  Lock,
  Trophy,
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    description: "Bilimingizni tekshirish va boshlang'ich darajani aniqlash",
    icon: ClipboardCheck,
    route: "initial-test",
    color: {
      ring: "ring-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      glow: "shadow-amber-500/20",
      line: "bg-amber-200",
    },
  },
  {
    step: 2,
    label: "Maruzalar",
    description: "Video va matnli materiallar orqali yangi bilim olish",
    icon: BookOpen,
    route: "lectures",
    color: {
      ring: "ring-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      glow: "shadow-blue-500/20",
      line: "bg-blue-200",
    },
  },
  {
    step: 3,
    label: "Vaziyatli Savol-Javob",
    description: "Amaliy vaziyatlarni tahlil qilish va qaror qabul qilish",
    icon: MessageSquare,
    route: "situational",
    color: {
      ring: "ring-violet-500",
      bg: "bg-violet-50",
      text: "text-violet-600",
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      glow: "shadow-violet-500/20",
      line: "bg-violet-200",
    },
  },
  {
    step: 4,
    label: "Yakuniy Test",
    description: "O'zlashtirishni baholash va sertifikat olish",
    icon: GraduationCap,
    route: "final-test",
    color: {
      ring: "ring-green-500",
      bg: "bg-green-50",
      text: "text-green-600",
      badge: "bg-green-50 text-green-700 border-green-200",
      glow: "shadow-green-500/20",
      line: "bg-green-200",
    },
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

      setLesson(await lessonRes.json());
      setProgress(
        progressRes.ok
          ? await progressRes.json()
          : { currentStep: 0, completedAt: null }
      );
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

  const handleStepClick = (route: string, isLocked: boolean) => {
    if (!isLocked) router.push(`/student/lessons/${params.id}/${route}`);
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
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <ClipboardCheck className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-lg font-semibold text-gray-900">
          {error || "Dars topilmadi"}
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-xl">
          <Link href="/student/lessons">Darslarga qaytish</Link>
        </Button>
      </div>
    );
  }

  const activeStepData = STEPS.find((s) => s.step === activeStep) ?? STEPS[0];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Back + Title */}
      <div>
        <Link
          href="/student/lessons"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Darslarga qaytish
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              {lesson.title}
            </h1>
            <p className="mt-2 text-gray-500">{lesson.description}</p>
          </div>
          {isCompleted && (
            <Badge className="shrink-0 gap-1.5 border-green-200 bg-green-50 px-3 py-1.5 text-green-700">
              <Check className="h-3.5 w-3.5" />
              Tugatilgan
            </Badge>
          )}
        </div>
      </div>

      {/* Progress overview */}
      {!isCompleted && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Joriy qadam</p>
              <p className="mt-1 text-lg font-bold">
                {activeStepData.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Umumiy progress</p>
              <p className="mt-1 text-2xl font-black">
                {currentStep === 0 ? 0 : Math.min((currentStep - 1) * 25, 75)}%
              </p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{
                width: `${currentStep === 0 ? 0 : Math.min((currentStep - 1) * 25, 75)
                  }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Vertical step flow */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute bottom-8 left-6 top-8 w-0.5 bg-gradient-to-b from-gray-200 to-gray-100" />

        <div className="space-y-4">
          {STEPS.map((s) => {
            const status = getStepStatus(s.step, activeStep, isCompleted);
            const Icon = s.icon;
            const isLocked = status === "locked";
            const isCurrent = status === "current";
            const isDone = status === "completed";

            return (
              <button
                key={s.step}
                onClick={() => handleStepClick(s.route, isLocked)}
                disabled={isLocked}
                className={cn(
                  "group relative flex w-full items-start gap-4 rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300",
                  isLocked
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
                  isCurrent &&
                  "border-blue-200 ring-2 ring-blue-100",
                  isDone && "border-green-100",
                  !isCurrent && !isDone && !isLocked && "border-gray-100"
                )}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 shadow-lg transition-all",
                    isDone &&
                    "border-green-400 bg-green-50 text-green-600 shadow-green-500/20",
                    isCurrent &&
                    `border-2 ${s.color.ring} ${s.color.bg} ${s.color.text} shadow-lg ${s.color.glow}`,
                    isLocked &&
                    "border-gray-200 bg-gray-50 text-gray-300"
                  )}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  {/* Pulse for current */}
                  {isCurrent && (
                    <span className="absolute -inset-1 animate-ping rounded-xl border border-blue-300 opacity-30" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Qadam {s.step}
                    </span>
                    {/* {isDone && (
                      <Badge className="border-green-200 bg-green-50 px-2 py-0 text-xs text-green-700">
                        Tugatilgan
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge
                        className={cn(
                          "px-2 py-0 text-xs border",
                          s.color.badge
                        )}
                      >
                        Hozirgi
                      </Badge>
                    )}
                    {isLocked && (
                      <Badge className="border-gray-200 bg-gray-50 px-2 py-0 text-xs text-gray-400">
                        Qulflangan
                      </Badge>
                    )} */}
                  </div>
                  <p className="font-bold text-gray-900">{s.label}</p>
                  <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">
                    {s.description}
                  </p>
                </div>

                {/* Arrow */}
                {!isLocked && (
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6">
        <Button
          onClick={() =>
            handleStepClick(
              STEPS.find((s) => s.step === activeStep)?.route ?? "initial-test",
              false
            )
          }
          size="lg"
          className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-violet-700"
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
              className="gap-2 rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
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
                  variant="ghost"
                  size="lg"
                  className="gap-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Darsni qayta boshlashni tasdiqlaysizmi?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Barcha test natijalari, vaziyatli savol javoblari va
                    ilgarilash o&apos;chiriladi. Bu amalni qaytarib
                    bo&apos;lmaydi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Bekor qilish
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRestart}
                    className="rounded-xl"
                  >
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
