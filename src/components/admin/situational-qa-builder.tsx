"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  GripVertical,
  MessageSquarePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

type Answer = { text: string; conclusion: string; score: number };

type SituationalQuestion = {
  _key: string;
  id?: string;
  question: string;
  answers: Answer[];
  order: number;
};

interface SituationalQABuilderProps {
  lessonId: string;
}

type FieldError = {
  questionIndex: number;
  field: "question" | "answerText" | "answerConclusion";
  answerIndex?: number;
  message: string;
};

const ANSWER_BADGES = [
  { letter: "A", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { letter: "B", color: "bg-green-100 text-green-800 border-green-200" },
  { letter: "C", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { letter: "D", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { letter: "E", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { letter: "F", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
];

let keyCounter = 0;
function nextKey() {
  return `sq-${++keyCounter}`;
}

function emptyQuestion(order: number): SituationalQuestion {
  return {
    _key: nextKey(),
    question: "",
    answers: [
      { text: "", conclusion: "", score: 0 },
      { text: "", conclusion: "", score: 0 },
    ],
    order,
  };
}

function SortableQuestion({
  question,
  index,
  errors,
  onUpdateQuestion,
  onUpdateAnswer,
  onAddAnswer,
  onRemoveAnswer,
  onRemove,
}: {
  question: SituationalQuestion;
  index: number;
  errors: FieldError[];
  onUpdateQuestion: (index: number, value: string) => void;
  onUpdateAnswer: (
    questionIndex: number,
    answerIndex: number,
    field: "text" | "conclusion" | "score",
    value: string | number
  ) => void;
  onAddAnswer: (questionIndex: number) => void;
  onRemoveAnswer: (questionIndex: number, answerIndex: number) => void;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question._key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const questionError = errors.find(
    (e) => e.questionIndex === index && e.field === "question"
  );

  const preview =
    question.question.length > 50
      ? question.question.slice(0, 50) + "..."
      : question.question || `Savol ${index + 1}`;

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={question._key} className="border rounded-lg">
        <div className="flex items-center gap-2 px-4">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <Badge
            variant="outline"
            className="shrink-0 h-7 w-7 rounded-full p-0 flex items-center justify-center font-semibold"
          >
            {index + 1}
          </Badge>
          <AccordionTrigger className="flex-1 hover:no-underline py-4">
            <span className="text-sm font-medium text-left truncate">
              {preview}
            </span>
          </AccordionTrigger>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Savolni o&apos;chirish</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu amalni qaytarib bo&apos;lmaydi. Savol va uning barcha javoblari
                  o&apos;chiriladi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRemove(index)}>
                  O&apos;chirish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <AccordionContent className="px-4 pb-4">
          <div className="space-y-5 pt-2">
            {/* Question textarea */}
            <div className="space-y-2">
              <Label>Vaziyat/Savol</Label>
              <Textarea
                placeholder="Vaziyatni tasvirlab, savol bering..."
                rows={4}
                maxLength={500}
                value={question.question}
                onChange={(e) => onUpdateQuestion(index, e.target.value)}
                className={cn(questionError && "border-destructive")}
              />
              <div className="flex items-center justify-between">
                {questionError ? (
                  <p className="text-xs text-destructive">{questionError.message}</p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {question.question.length}/500
                </span>
              </div>
            </div>

            {/* Answers section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Javob Variantlari</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddAnswer(index)}
                  disabled={question.answers.length >= 6}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Javob qo&apos;shish
                </Button>
              </div>

              <div className="space-y-3">
                {question.answers.map((answer, aIdx) => {
                  const badge = ANSWER_BADGES[aIdx];
                  const textError = errors.find(
                    (e) =>
                      e.questionIndex === index &&
                      e.field === "answerText" &&
                      e.answerIndex === aIdx
                  );
                  const conclusionError = errors.find(
                    (e) =>
                      e.questionIndex === index &&
                      e.field === "answerConclusion" &&
                      e.answerIndex === aIdx
                  );

                  return (
                    <Card
                      key={aIdx}
                      className="bg-muted/30 border-dashed"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "shrink-0 mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
                              badge?.color
                            )}
                          >
                            {badge?.letter}
                          </span>
                          <div className="flex-1 space-y-3">
                            <div className="space-y-1.5">
                              <Input
                                placeholder="Javob varianti..."
                                maxLength={200}
                                value={answer.text}
                                onChange={(e) =>
                                  onUpdateAnswer(index, aIdx, "text", e.target.value)
                                }
                                className={cn(textError && "border-destructive")}
                              />
                              {textError && (
                                <p className="text-xs text-destructive">
                                  {textError.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Xulosa/Tushuntirish
                              </Label>
                              <Textarea
                                placeholder="Bu javob tanlansa nima bo'ladi yoki nima demak..."
                                rows={3}
                                maxLength={500}
                                value={answer.conclusion}
                                onChange={(e) =>
                                  onUpdateAnswer(
                                    index,
                                    aIdx,
                                    "conclusion",
                                    e.target.value
                                  )
                                }
                                className={cn(
                                  conclusionError && "border-destructive"
                                )}
                              />
                              {conclusionError && (
                                <p className="text-xs text-destructive">
                                  {conclusionError.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Ball (0-5)
                              </Label>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={answer.score}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "").slice(-1); // faqat raqam, 1 ta
                                  const parsed = val === "" ? 0 : parseInt(val, 10);
                                  const clamped = Math.max(0, Math.min(5, isNaN(parsed) ? 0 : parsed));
                                  onUpdateAnswer(index, aIdx, "score", clamped);
                                }}
                                className="w-20"
                              />
                            </div>
                          </div>
                          {question.answers.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 mt-1"
                              onClick={() => onRemoveAnswer(index, aIdx)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

export function SituationalQABuilder({ lessonId }: SituationalQABuilderProps) {
  const [questions, setQuestions] = useState<SituationalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/situational`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(
          data.map(
            (q: { id: string; question: string; answers: Answer[]; order: number }) => ({
              _key: nextKey(),
              id: q.id,
              question: q.question,
              answers: q.answers,
              order: q.order,
            })
          )
        );
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const addQuestion = () => {
    const newQ = emptyQuestion(questions.length + 1);
    setQuestions((prev) => [...prev, newQ]);
    setOpenItems((prev) => [...prev, newQ._key]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((q, i) => ({ ...q, order: i + 1 }));
    });
    setErrors((prev) => prev.filter((e) => e.questionIndex !== index));
  };

  const updateQuestion = (index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, question: value } : q))
    );
    setErrors((prev) =>
      prev.filter((e) => !(e.questionIndex === index && e.field === "question"))
    );
  };

  const addAnswer = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, answers: [...q.answers, { text: "", conclusion: "", score: 0 }] }
          : q
      )
    );
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, answers: q.answers.filter((_, j) => j !== answerIndex) }
          : q
      )
    );
  };

  const updateAnswer = (
    questionIndex: number,
    answerIndex: number,
    field: "text" | "conclusion" | "score",
    value: string | number
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
            ...q,
            answers: q.answers.map((a, j) =>
              j === answerIndex ? { ...a, [field]: value } : a
            ),
          }
          : q
      )
    );
    if (field === "text" || field === "conclusion") {
      const errorField = field === "text" ? "answerText" : "answerConclusion";
      setErrors((prev) =>
        prev.filter(
          (e) =>
            !(
              e.questionIndex === questionIndex &&
              e.field === errorField &&
              e.answerIndex === answerIndex
            )
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setQuestions((prev) => {
      const oldIndex = prev.findIndex((q) => q._key === active.id);
      const newIndex = prev.findIndex((q) => q._key === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  const validate = (): FieldError[] => {
    const errs: FieldError[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() || q.question.trim().length < 10) {
        errs.push({
          questionIndex: i,
          field: "question",
          message: "Savol kamida 10 ta belgidan iborat bo'lishi kerak",
        });
      }
      if (q.answers.length < 2) {
        errs.push({
          questionIndex: i,
          field: "question",
          message: "Kamida 2 ta javob varianti bo'lishi kerak",
        });
      }
      for (let j = 0; j < q.answers.length; j++) {
        const a = q.answers[j];
        if (!a.text.trim() || a.text.trim().length < 5) {
          errs.push({
            questionIndex: i,
            field: "answerText",
            answerIndex: j,
            message: "Javob kamida 5 ta belgidan iborat bo'lishi kerak",
          });
        }
        if (!a.conclusion.trim() || a.conclusion.trim().length < 10) {
          errs.push({
            questionIndex: i,
            field: "answerConclusion",
            answerIndex: j,
            message: "Xulosa kamida 10 ta belgidan iborat bo'lishi kerak",
          });
        }
      }
    }

    return errs;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      // Open accordion items that have errors
      const errorKeys = new Set(
        validationErrors.map((e) => questions[e.questionIndex]?._key).filter(Boolean)
      );
      setOpenItems((prev) => {
        const merged = new Set([...prev, ...Array.from(errorKeys) as string[]]);
        return Array.from(merged);
      });
      toast.error("Iltimos, barcha xatolarni tuzating");
      return;
    }

    setSaving(true);
    try {
      const payload = questions.map((q) => ({
        id: q.id,
        question: q.question,
        answers: q.answers,
        order: q.order,
      }));

      const res = await fetch(`/api/lessons/${lessonId}/situational`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Saqlashda xatolik yuz berdi");
      }

      const saved = await res.json();
      setQuestions(
        saved.map(
          (q: { id: string; question: string; answers: Answer[]; order: number }) => ({
            _key: nextKey(),
            id: q.id,
            question: q.question,
            answers: q.answers,
            order: q.order,
          })
        )
      );
      toast.success("Savollar muvaffaqiyatli saqlandi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <MessageSquarePlus className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">
            Hali savol qo&apos;shilmagan. Birinchi savol qo&apos;shing!
          </p>
          <Button onClick={addQuestion}>
            <Plus className="h-4 w-4" />
            Savol qo&apos;shish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} ta savol — tartibni o&apos;zgartirish uchun suring
        </p>
        <Button onClick={addQuestion} variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Savol qo&apos;shish
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map((q) => q._key)}
          strategy={verticalListSortingStrategy}
        >
          <Accordion
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className="space-y-3"
          >
            {questions.map((question, index) => (
              <SortableQuestion
                key={question._key}
                question={question}
                index={index}
                errors={errors}
                onUpdateQuestion={updateQuestion}
                onUpdateAnswer={updateAnswer}
                onAddAnswer={addAnswer}
                onRemoveAnswer={removeAnswer}
                onRemove={removeQuestion}
              />
            ))}
          </Accordion>
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Saqlash
        </Button>
        <span className="text-sm text-muted-foreground">
          {questions.length} ta savol
        </span>
      </div>
    </div>
  );
}
