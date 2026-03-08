"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Loader2, Users, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultsViewer } from "@/components/student/results-viewer";
import Image from "next/image";

interface StudentRow {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  currentStep: number;
  completedAt: string | null;
  initialScore: number | null;
  finalScore: number | null;
}

interface UserResults {
  user: { id: string; name: string | null; email: string; image: string | null };
  lesson: { id: string; title: string; description: string };
  progress: { currentStep: number; completedAt: string | null } | null;
  initialResult: {
    score: number;
    completedAt: string;
    totalQuestions: number;
    correctCount: number;
    questionBreakdown: {
      question: string;
      options: string[];
      correctAnswer: number;
      userAnswer: number;
      isCorrect: boolean;
    }[] | null;
  } | null;
  finalResult: {
    score: number;
    completedAt: string;
    totalQuestions: number;
    correctCount: number;
    questionBreakdown: {
      question: string;
      options: string[];
      correctAnswer: number;
      userAnswer: number;
      isCorrect: boolean;
    }[] | null;
  } | null;
  situationalResults: {
    id: string;
    question: string;
    answers: { text: string; conclusion: string; score: number }[];
    order: number;
    selectedAnswerIndex: number | null;
    score: number | null;
  }[];
}

const STEP_LABELS: Record<number, string> = {
  1: "Dastlabki test",
  2: "Maruzalar",
  3: "Vaziyatli S&J",
  4: "Yakuniy test",
};

function stepLabel(step: number) {
  return STEP_LABELS[step] ?? `Qadam ${step}`;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>;
  const rounded = Math.round(score);
  const color =
    rounded >= 80
      ? "border-green-200 bg-green-50 text-green-700"
      : rounded >= 60
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-red-200 bg-red-50 text-red-700";
  return (
    <Badge className={`border text-xs font-semibold ${color}`}>
      {rounded}%
    </Badge>
  );
}

export function LessonStudents({ lessonId }: { lessonId: string }) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserResults | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/students`);
      const data = await res.json();
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSelectUser = async (userId: string) => {
    setLoadingUser(true);
    try {
      const res = await fetch(
        `/api/admin/lessons/${lessonId}/students/${userId}/results`
      );
      const data = await res.json();
      setSelectedUser(data);
    } catch {
      /* noop */
    } finally {
      setLoadingUser(false);
    }
  };

  // ── User results view ──────────────────────────────────────────────
  if (loadingUser) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-2"
          onClick={() => setSelectedUser(null)}
        >
          <ArrowLeft className="h-4 w-4" />
          Talabalarga qaytish
        </Button>

        {/* User header */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          {selectedUser.user.image ? (
            <Image
              src={selectedUser.user.image}
              alt={selectedUser.user.name ?? ""}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {(selectedUser.user.name ?? selectedUser.user.email)[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold leading-tight">
              {selectedUser.user.name ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedUser.user.email}
            </p>
          </div>
        </div>

        <ResultsViewer
          lesson={selectedUser.lesson}
          initialResult={selectedUser.initialResult}
          finalResult={selectedUser.finalResult}
          completedAt={selectedUser.progress?.completedAt ?? null}
          situationalResults={selectedUser.situationalResults}
          adminView
        />
      </div>
    );
  }

  // ── Students list ──────────────────────────────────────────────────
  const completed = students.filter((s) => s.completedAt);
  const inProgress = students.filter((s) => !s.completedAt);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border bg-white p-4"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-gray-900">
          Hali talabalar yo&apos;q
        </h3>
        <p className="text-sm text-gray-500">
          Bu darsni boshlagan talabalar bu yerda ko&apos;rinadi
        </p>
      </div>
    );
  }

  function StudentRow({ student }: { student: StudentRow }) {
    const isCompleted = !!student.completedAt;
    return (
      <button
        type="button"
        onClick={() => handleSelectUser(student.userId)}
        className="flex w-full items-center gap-4 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        {/* Avatar */}
        {student.image ? (
          <Image
            src={student.image}
            alt={student.name ?? ""}
            width={40}
            height={40}
            className="rounded-full shrink-0"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {(student.name ?? student.email)[0].toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">
            {student.name ?? "—"}
          </p>
          <p className="truncate text-xs text-gray-500">{student.email}</p>
        </div>

        {/* Step */}
        <div className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
          {isCompleted ? "Tugatilgan" : stepLabel(student.currentStep)}
        </div>

        {/* Scores */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Boshlanğich</span>
              <ScoreBadge score={student.initialScore} />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Yakuniy</span>
              <ScoreBadge score={student.finalScore} />
            </div>
          </div>

          {/* Status badge */}
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          ) : (
            <Clock className="h-5 w-5 text-blue-400 shrink-0" />
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <strong className="text-green-700">{completed.length}</strong> tugatilgan
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-blue-400" />
          <strong className="text-blue-600">{inProgress.length}</strong> jarayonda
        </span>
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Tugatilganlar ({completed.length})
          </p>
          {completed.map((s) => (
            <StudentRow key={s.userId} student={s} />
          ))}
        </div>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Jarayonda ({inProgress.length})
          </p>
          {inProgress.map((s) => (
            <StudentRow key={s.userId} student={s} />
          ))}
        </div>
      )}
    </div>
  );
}
