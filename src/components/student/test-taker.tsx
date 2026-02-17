"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [allAnswers, setAllAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const progressPercent = (allAnswers.length / totalQuestions) * 100;
  const isLast = currentIndex === totalQuestions - 1;

  // Navigation guard
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (allAnswers.length > 0 && !isSubmitting) {
        e.preventDefault();
      }
    },
    [allAnswers.length, isSubmitting]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const handleCheck = async () => {
    if (selectedAnswer === null) return;
    setShowFeedback(true);

    // Fire confetti on correct answer
    if (selectedAnswer === currentQuestion.correctAnswer) {
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // confetti is optional
      }
    }
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...allAnswers, selectedAnswer];
    setAllAnswers(newAnswers);

    if (isLast) {
      // Submit test
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/student/tests/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testId,
            lessonId,
            answers: newAnswers,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Testni topshirishda xatolik");
        }

        const result = await res.json();

        if (testType === "FINAL") {
          toast.success(
            `Tabriklaymiz! Natija: ${result.correctCount}/${result.totalQuestions} (${Math.round(result.score)}%)`
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
        setIsSubmitting(false);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">
            {testType === "INITIAL" ? "Dastlabki Test" : "Yakuniy Test"}
          </h2>
          <p className="text-lg font-semibold">
            Savol {currentIndex + 1}/{totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="w-32 h-2" />
          <Badge variant="secondary">
            {allAnswers.length}/{totalQuestions}
          </Badge>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {questions.map((_, idx) => {
          const isAnswered = idx < allAnswers.length;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={idx}
              className={cn(
                "h-2.5 rounded-full transition-all",
                isCurrent
                  ? "w-6 bg-primary"
                  : isAnswered
                  ? "w-2.5 bg-green-400"
                  : "w-2.5 bg-muted"
              )}
            />
          );
        })}
      </div>

      {/* Question card */}
      <Card className="border-2">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-3">
            <Badge
              variant="outline"
              className="shrink-0 h-8 w-8 rounded-full p-0 flex items-center justify-center text-sm font-bold"
            >
              {currentIndex + 1}
            </Badge>
            <p className="text-lg leading-relaxed pt-0.5">
              {currentQuestion.question}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQuestion.options.map((opt, optIndex) => {
          const isSelected = selectedAnswer === optIndex;
          const isCorrectOption = optIndex === currentQuestion.correctAnswer;

          let optionStyle = "";
          if (showFeedback) {
            if (isCorrectOption) {
              optionStyle = "border-green-500 bg-green-50 ring-1 ring-green-300";
            } else if (isSelected && !isCorrectOption) {
              optionStyle = "border-red-400 bg-red-50 ring-1 ring-red-200";
            } else {
              optionStyle = "opacity-50";
            }
          } else if (isSelected) {
            optionStyle = "border-primary bg-primary/5 ring-1 ring-primary";
          }

          return (
            <button
              key={optIndex}
              type="button"
              onClick={() => {
                if (!showFeedback) setSelectedAnswer(optIndex);
              }}
              disabled={showFeedback}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
                !showFeedback && !isSelected && "hover:bg-accent hover:border-accent",
                !showFeedback && "cursor-pointer",
                showFeedback && "cursor-default",
                optionStyle
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                  showFeedback && isCorrectOption
                    ? "bg-green-500 text-white border-green-500"
                    : showFeedback && isSelected && !isCorrectOption
                    ? "bg-red-400 text-white border-red-400"
                    : isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : OPTION_COLORS[optIndex]
                )}
              >
                {OPTION_LABELS[optIndex]}
              </span>
              <span className="text-sm leading-snug flex-1">{opt}</span>
              {showFeedback && isCorrectOption && (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              )}
              {showFeedback && isSelected && !isCorrectOption && (
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback message */}
      {showFeedback && (
        <div
          className={cn(
            "rounded-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300",
            isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          )}
        >
          <p className={cn("font-semibold", isCorrect ? "text-green-800" : "text-red-800")}>
            {isCorrect ? "To'g'ri javob!" : "Noto'g'ri javob!"}
          </p>
          {!isCorrect && (
            <p className="text-sm text-red-700 mt-1">
              To&apos;g&apos;ri javob: {OPTION_LABELS[currentQuestion.correctAnswer]}. {currentQuestion.options[currentQuestion.correctAnswer]}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end pt-2 border-t">
        {!showFeedback ? (
          <Button
            onClick={handleCheck}
            disabled={selectedAnswer === null}
            size="lg"
          >
            Tekshirish
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            size="lg"
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Topshirilmoqda...
              </>
            ) : isLast ? (
              "Yakunlash"
            ) : (
              <>
                Keyingi savol
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
