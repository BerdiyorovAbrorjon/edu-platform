"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
}

interface TestBuilderProps {
  lessonId: string;
  testType: "INITIAL" | "FINAL";
}

const OPTION_LABELS = ["A", "B", "C", "D"];

function emptyQuestion(): Question {
  return {
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  };
}

export function TestBuilder({ lessonId, testType }: TestBuilderProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExistingTest, setHasExistingTest] = useState(false);

  const endpoint = `/api/lessons/${lessonId}/tests/${testType.toLowerCase()}`;

  const fetchTest = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setHasExistingTest(!!data.id);
      } else {
        setQuestions([emptyQuestion()]);
        setHasExistingTest(false);
      }
    } catch {
      setQuestions([emptyQuestion()]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options] as [string, string, string, string];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  };

  const updateCorrectAnswer = (qIndex: number, answer: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctAnswer: answer } : q))
    );
  };

  const validate = (): string | null => {
    if (questions.length === 0) return "Add at least one question";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1}: Enter the question text`;
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim())
          return `Question ${i + 1}: Fill in option ${OPTION_LABELS[j]}`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save test");
      }

      setHasExistingTest(true);
      toast.success("Test saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save test");
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
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
          {hasExistingTest && " (saved)"}
        </p>
        <Button onClick={addQuestion} variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No questions yet</p>
            <Button onClick={addQuestion} variant="outline" className="mt-4">
              <Plus className="h-4 w-4" />
              Add First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <Card key={qIndex}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Question {qIndex + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                    disabled={questions.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Input
                    placeholder="Enter your question..."
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(qIndex, "question", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label>Answer Options</Label>
                  <RadioGroup
                    value={String(q.correctAnswer)}
                    onValueChange={(val) =>
                      updateCorrectAnswer(qIndex, parseInt(val))
                    }
                  >
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <RadioGroupItem
                          value={String(optIndex)}
                          id={`q${qIndex}-opt${optIndex}`}
                        />
                        <span className="text-sm font-medium text-muted-foreground w-4">
                          {OPTION_LABELS[optIndex]}
                        </span>
                        <Input
                          className="flex-1"
                          placeholder={`Option ${OPTION_LABELS[optIndex]}...`}
                          value={opt}
                          onChange={(e) =>
                            updateOption(qIndex, optIndex, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Test
        </Button>
        <span className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
