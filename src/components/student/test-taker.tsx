"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

interface Question {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
}

interface TestTakerProps {
  questions: Question[];
  testId: string;
  lessonId: string;
  testType: "INITIAL" | "FINAL";
}

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_COLORS = [
  "border-blue-200 bg-blue-50 text-blue-800",
  "border-green-200 bg-green-50 text-green-800",
  "border-amber-200 bg-amber-50 text-amber-800",
  "border-purple-200 bg-purple-50 text-purple-800",
];

export function TestTaker({
  questions,
  testId,
  lessonId,
  testType,
}: TestTakerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const allAnswered = answeredCount === totalQuestions;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  // Navigation guard
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (answeredCount > 0 && !isSubmitting) {
        e.preventDefault();
      }
    },
    [answeredCount, isSubmitting]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;

    setIsSubmitting(true);
    try {
      const orderedAnswers = Array.from({ length: totalQuestions }, (_, i) => answers[i]);

      const res = await fetch("/api/student/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          lessonId,
          answers: orderedAnswers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Testni topshirishda xatolik");
      }

      const result = await res.json();

      if (testType === "FINAL") {
        toast.success(
          `Tabriklaymiz! Darsni muvaffaqiyatli tugatdingiz! Natija: ${result.correctCount}/${result.totalQuestions} (${Math.round(result.score)}%)`
        );
        router.push(`/student/lessons/${lessonId}/results`);
      } else {
        toast.success(
          `Test topshirildi! Natija: ${result.correctCount}/${result.totalQuestions} (${Math.round(result.score)}%)`
        );
        router.push(`/student/lessons/${lessonId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-14 z-40 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {testType === "INITIAL" ? "Dastlabki Test" : "Yakuniy Test"}
            </h2>
            <p className="text-lg font-semibold">
              {answeredCount}/{totalQuestions} javob berildi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="w-32 h-2" />
            <Badge
              variant={allAnswered ? "default" : "secondary"}
              className={cn(
                allAnswered && "bg-green-100 text-green-700 border-green-200"
              )}
            >
              {allAnswered ? "Tayyor" : `${totalQuestions - answeredCount} qoldi`}
            </Badge>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qIndex) => {
          const isAnswered = answers[qIndex] !== undefined;
          const selectedOption = answers[qIndex];

          return (
            <Card
              key={qIndex}
              id={`question-${qIndex}`}
              className={cn(
                "transition-colors",
                isAnswered && "border-green-200 bg-green-50/30"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {isAnswered ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {qIndex + 1}-savol
                      </Badge>
                    </div>
                    <p className="text-base font-medium leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-11">
                <RadioGroup
                  value={selectedOption !== undefined ? String(selectedOption) : ""}
                  onValueChange={(val) => selectAnswer(qIndex, parseInt(val))}
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedOption === optIndex;
                      return (
                        <label
                          key={optIndex}
                          htmlFor={`q${qIndex}-opt${optIndex}`}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent",
                            isSelected &&
                              "border-primary bg-primary/5 ring-1 ring-primary"
                          )}
                        >
                          <RadioGroupItem
                            value={String(optIndex)}
                            id={`q${qIndex}-opt${optIndex}`}
                            className="shrink-0"
                          />
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : OPTION_COLORS[optIndex]
                            )}
                          >
                            {OPTION_LABELS[optIndex]}
                          </span>
                          <span className="text-sm leading-snug">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submit area */}
      <div className="sticky bottom-0 -mx-4 border-t bg-background px-4 py-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            {!allAnswered && (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">
                  Barcha savollarga javob bering
                </span>
              </>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="lg"
                disabled={!allAnswered || isSubmitting}
                className={cn(
                  allAnswered && !isSubmitting && "animate-pulse"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Topshirilmoqda...
                  </>
                ) : (
                  "Testni topshirish"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Testni topshirishga ishonchingiz komilmi?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Barcha savollar: {totalQuestions}, Javob berilgan:{" "}
                  {answeredCount}. Topshirgandan so&apos;ng javoblarni
                  o&apos;zgartirib bo&apos;lmaydi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>
                  Topshirish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
