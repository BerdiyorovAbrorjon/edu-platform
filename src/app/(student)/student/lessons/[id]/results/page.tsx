"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsViewer } from "@/components/student/results-viewer";

interface TestResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
}

interface ResultsData {
  lesson: { id: string; title: string; description: string };
  progress: { currentStep: number; completedAt: string | null } | null;
  initialResult: TestResult | null;
  finalResult: TestResult | null;
}

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/student/lessons/${params.id}/results`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Natijalarni yuklashda xatolik");
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Redirect if not completed
  useEffect(() => {
    if (data && !data.progress?.completedAt) {
      router.push(`/student/lessons/${params.id}`);
    }
  }, [data, router, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <p className="text-lg font-semibold text-destructive">
          {error || "Natijalar topilmadi"}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/student/lessons/${params.id}`}>Darsga qaytish</Link>
        </Button>
      </div>
    );
  }

  if (!data.progress?.completedAt) {
    return null; // Will redirect
  }

  return (
    <ResultsViewer
      lesson={data.lesson}
      initialResult={data.initialResult}
      finalResult={data.finalResult}
      completedAt={data.progress.completedAt}
    />
  );
}
