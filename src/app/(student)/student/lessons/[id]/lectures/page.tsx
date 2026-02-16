"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LecturesViewer } from "@/components/student/lectures-viewer";

interface Lecture {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  filePath: string | null;
  order: number;
}

interface ProgressData {
  currentStep: number;
  completedAt: string | null;
}

export default function StudentLecturesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [lecturesRes, progressRes, lessonRes] = await Promise.all([
        fetch(`/api/lessons/${params.id}/lectures`),
        fetch(`/api/student/lessons/${params.id}/progress`),
        fetch(`/api/lessons/${params.id}`),
      ]);

      if (!lecturesRes.ok) throw new Error("Maruzalar topilmadi");

      const lecturesData = await lecturesRes.json();
      setLectures(Array.isArray(lecturesData) ? lecturesData : []);

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
  if (progress && progress.currentStep < 2 && !progress.completedAt) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <Card>
          <CardContent className="pt-8 pb-8 space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-lg font-semibold">Maruzalar qulflangan</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Avval dastlabki testni topshirishingiz kerak.
              </p>
            </div>
            <Button
              onClick={() =>
                router.push(`/student/lessons/${params.id}/initial-test`)
              }
            >
              Dastlabki testga o&apos;tish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No lectures
  if (lectures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-lg font-semibold">Maruzalar topilmadi</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/student/lessons/${params.id}`}>Darsga qaytish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/student/lessons/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">{lessonTitle}</p>
          <h1 className="text-xl font-bold">Maruzalar</h1>
        </div>
      </div>

      {/* Lectures viewer */}
      <LecturesViewer
        lectures={lectures}
        lessonId={params.id}
        currentStep={progress?.currentStep ?? 2}
      />
    </div>
  );
}
