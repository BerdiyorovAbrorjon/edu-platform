"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TestTaker } from "@/components/student/test-taker";

interface Question {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
}

interface TestData {
  id: string | null;
  questions: Question[];
}

interface ProgressData {
  currentStep: number;
  completedAt: string | null;
}

export default function InitialTestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [testRes, progressRes, lessonRes] = await Promise.all([
        fetch(`/api/lessons/${params.id}/tests/initial`),
        fetch(`/api/student/lessons/${params.id}/progress`),
        fetch(`/api/lessons/${params.id}`),
      ]);

      if (!testRes.ok) throw new Error("Test topilmadi");

      const testData = await testRes.json();
      setTest(testData);

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

  if (error || !test || !test.id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <p className="text-lg font-semibold text-destructive">
          {error || "Test topilmadi"}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/student/lessons/${params.id}`}>Darsga qaytish</Link>
        </Button>
      </div>
    );
  }

  // Already completed initial test
  if (progress && progress.currentStep > 1) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <Card>
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h2 className="text-lg font-semibold">
                Dastlabki test allaqachon topshirilgan
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Siz ushbu testni muvaffaqiyatli topshirgansiz. Keyingi
                bosqichga o&apos;tishingiz mumkin.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button asChild variant="outline">
                <Link href={`/student/lessons/${params.id}`}>
                  Darsga qaytish
                </Link>
              </Button>
              <Button
                onClick={() =>
                  router.push(`/student/lessons/${params.id}/lectures`)
                }
              >
                Maruzalarga o&apos;tish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No questions
  if (!test.questions || test.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-lg font-semibold">Savollar topilmadi</p>
        <p className="text-sm text-muted-foreground mt-1">
          Bu test uchun savollar hali qo&apos;shilmagan.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/student/lessons/${params.id}`}>Darsga qaytish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link and title */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/student/lessons/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">{lessonTitle}</p>
          <h1 className="text-xl font-bold">Dastlabki Baholash Testi</h1>
        </div>
      </div>

      {/* Test taker */}
      <TestTaker
        questions={test.questions}
        testId={test.id}
        lessonId={params.id}
        testType="INITIAL"
      />
    </div>
  );
}
