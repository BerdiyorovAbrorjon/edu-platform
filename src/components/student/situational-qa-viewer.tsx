"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface Answer {
  text: string;
  conclusion: string;
}

interface SituationalQuestion {
  id: string;
  question: string;
  answers: Answer[];
  order: number;
}

interface SituationalQAViewerProps {
  questions: SituationalQuestion[];
  lessonId: string;
  currentStep: number;
}

const ANSWER_STYLES = [
  { letter: "A", bg: "hover:bg-blue-50 hover:border-blue-300", selected: "bg-blue-50 border-blue-400 ring-1 ring-blue-200", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  { letter: "B", bg: "hover:bg-green-50 hover:border-green-300", selected: "bg-green-50 border-green-400 ring-1 ring-green-200", badge: "bg-green-100 text-green-800 border-green-200" },
  { letter: "C", bg: "hover:bg-amber-50 hover:border-amber-300", selected: "bg-amber-50 border-amber-400 ring-1 ring-amber-200", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  { letter: "D", bg: "hover:bg-purple-50 hover:border-purple-300", selected: "bg-purple-50 border-purple-400 ring-1 ring-purple-200", badge: "bg-purple-100 text-purple-800 border-purple-200" },
  { letter: "E", bg: "hover:bg-pink-50 hover:border-pink-300", selected: "bg-pink-50 border-pink-400 ring-1 ring-pink-200", badge: "bg-pink-100 text-pink-800 border-pink-200" },
  { letter: "F", bg: "hover:bg-indigo-50 hover:border-indigo-300", selected: "bg-indigo-50 border-indigo-400 ring-1 ring-indigo-200", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
];

export function SituationalQAViewer({
  questions,
  lessonId,
  currentStep,
}: SituationalQAViewerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(new Map());
  const [completing, setCompleting] = useState(false);
  const conclusionRef = useRef<HTMLDivElement>(null);

  const total = questions.length;
  const current = questions[currentIndex];
  const selectedAnswer = selectedAnswers.get(currentIndex);
  const hasAnswer = selectedAnswer !== undefined;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  // Scroll to conclusion when answer is selected
  useEffect(() => {
    if (hasAnswer && conclusionRef.current) {
      setTimeout(() => {
        conclusionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [hasAnswer, currentIndex]);

  const selectAnswer = (answerIndex: number) => {
    if (hasAnswer) return; // Don't allow changing answer
    setSelectedAnswers((prev) => {
      const next = new Map(prev);
      next.set(currentIndex, answerIndex);
      return next;
    });
  };

  const goNext = () => {
    if (!isLast && hasAnswer) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch("/api/student/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, currentStep: 4 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Xatolik yuz berdi");
      }

      toast.success("Vaziyatli savollar tugallandi!");
      router.push(`/student/lessons/${lessonId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setCompleting(false);
    }
  };

  if (!current) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Savol {currentIndex + 1}/{total}
        </p>
        <div className="flex items-center gap-1.5">
          {questions.map((_, idx) => {
            const isCompleted = selectedAnswers.has(idx);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isCompleted || idx <= currentIndex) setCurrentIndex(idx);
                }}
                disabled={!isCompleted && idx > currentIndex}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  isCurrent
                    ? "w-6 bg-primary"
                    : isCompleted
                    ? "w-2.5 bg-green-400 hover:bg-green-500 cursor-pointer"
                    : "w-2.5 bg-muted cursor-not-allowed"
                )}
              />
            );
          })}
        </div>
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
              {current.question}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Answer options */}
      <div className="space-y-2.5">
        {current.answers.map((answer, aIdx) => {
          const style = ANSWER_STYLES[aIdx];
          const isSelected = selectedAnswer === aIdx;
          const isDisabled = hasAnswer && !isSelected;

          return (
            <div key={aIdx}>
              <button
                type="button"
                onClick={() => selectAnswer(aIdx)}
                disabled={hasAnswer}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all",
                  !hasAnswer && style?.bg,
                  isSelected && style?.selected,
                  isDisabled && "opacity-50",
                  !hasAnswer && "cursor-pointer",
                  hasAnswer && !isSelected && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                    isSelected
                      ? style?.badge
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {style?.letter}
                </span>
                <span className="text-base leading-relaxed pt-0.5">
                  {answer.text}
                </span>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-1 ml-auto" />
                )}
              </button>

              {/* Conclusion - appears below selected answer */}
              {isSelected && (
                <div
                  ref={conclusionRef}
                  className="mt-2 ml-4 animate-in slide-in-from-top-2 fade-in duration-300"
                >
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Xulosa
                          </p>
                          <p className="text-sm leading-relaxed text-blue-800">
                            {answer.conclusion}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirst}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Oldingi
        </Button>

        <span className="text-sm text-muted-foreground">
          {selectedAnswers.size}/{total} javob berildi
        </span>

        {isLast && hasAnswer ? (
          currentStep === 3 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={completing} className="gap-2">
                  {completing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Tugatish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Vaziyatli savollarni tugatishni tasdiqlaysizmi?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Barcha {total} ta savolga javob berildi. Yakuniy testga
                    o&apos;tishingiz mumkin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                  <AlertDialogAction onClick={handleComplete}>
                    Tugatish
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              onClick={() => router.push(`/student/lessons/${lessonId}`)}
              className="gap-2"
            >
              Darsga qaytish
            </Button>
          )
        ) : (
          <Button
            onClick={goNext}
            disabled={!hasAnswer || isLast}
            className="gap-2"
          >
            Keyingi
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
