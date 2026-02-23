"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SituationalQAViewer } from "@/components/student/situational-qa-viewer";

interface Answer {
  text: string;
  conclusion: string;
  score: number;
}

interface SituationalQuestion {
  id: string;
  question: string;
  answers: Answer[];
  order: number;
}

interface ProgressData {
  currentStep: number;
  completedAt: string | null;
}

export default function StudentSituationalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [questions, setQuestions] = useState<SituationalQuestion[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [qaRes, progressRes, lessonRes] = await Promise.all([
        fetch(`/api/lessons/${params.id}/situational`),
        fetch(`/api/student/lessons/${params.id}/progress`),
        fetch(`/api/lessons/${params.id}`),
      ]);

      if (!qaRes.ok) throw new Error("Savollar topilmadi");

      const qaData = await qaRes.json();
      setQuestions(Array.isArray(qaData) ? qaData : []);

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      } else {
        setProgress({ currentStep: 0, completedAt: null });
      }

      if (lessonRes.ok) {
        const lessonData = await lessonRes.json();
        setLessonTitle(lessonData.title);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <p className="text-lg font-semibold text-destructive">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/student/lessons/${params.id}`}>Darsga qaytish</Link>
        </Button>
      </div>
    );
  }

  // Not yet unlocked
  if (progress && progress.currentStep < 3 && !progress.completedAt) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <Card>
          <CardContent className="pt-8 pb-8 space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-lg font-semibold">
                Vaziyatli savollar qulflangan
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Avval maruzalarni tugatishingiz kerak.
              </p>
            </div>
            <Button
              onClick={() =>
                router.push(`/student/lessons/${params.id}/lectures`)
              }
            >
              Maruzalarga o&apos;tish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No questions
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-lg font-semibold">Vaziyatli savollar mavjud emas</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/student/lessons/${params.id}`}>Darsga qaytish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/student/lessons/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">{lessonTitle}</p>
          <h1 className="text-xl font-bold">Vaziyatli Savol-Javob</h1>
        </div>
      </div>

      {/* Viewer */}
      <SituationalQAViewer
        questions={questions}
        lessonId={params.id}
        currentStep={progress?.currentStep ?? 3}
      />
    </div>
  );
}
