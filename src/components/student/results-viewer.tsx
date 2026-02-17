"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Trophy,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Star,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, getScoreColor } from "@/lib/utils";

interface QuestionBreakdown {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  isCorrect: boolean;
}

interface TestResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
  questionBreakdown?: QuestionBreakdown[] | null;
}

interface SituationalResult {
  id: string;
  question: string;
  answers: { text: string; conclusion: string; score: number }[];
  order: number;
  selectedAnswerIndex: number | null;
  score: number | null;
}

interface ResultsViewerProps {
  lesson: { id: string; title: string; description: string };
  initialResult: TestResult | null;
  finalResult: TestResult | null;
  completedAt: string | null;
  situationalResults?: SituationalResult[];
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function ResultsViewer({
  lesson,
  initialResult,
  finalResult,
  completedAt,
  situationalResults,
}: ResultsViewerProps) {
  const initialScore = initialResult?.score ?? 0;
  const finalScore = finalResult?.score ?? 0;
  const improvement = finalScore - initialScore;

  const improvementText =
    improvement > 0
      ? `+${Math.round(improvement)} ball yaxshilandi`
      : improvement === 0
        ? "Natija bir xil"
        : `${Math.round(improvement)} ball kamaydi`;

  const encouragement =
    improvement > 0
      ? "Siz ajoyib natijaga erishdingiz!"
      : improvement === 0
        ? "Doimiy natija — yaxshi ish!"
        : "Siz darsni muvaffaqiyatli tugatdingiz!";

  const chartData = [
    { name: "Dastlabki", score: Math.round(initialScore) },
    { name: "Yakuniy", score: Math.round(finalScore) },
  ];

  const completionDate = completedAt
    ? new Date(completedAt).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "";

  // Situational QA total score
  const situationalTotalScore = situationalResults
    ? situationalResults.reduce((sum, r) => sum + (r.score ?? 0), 0)
    : 0;
  const situationalMaxScore = situationalResults
    ? situationalResults.length * 5
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Celebration header */}
      <div className="text-center space-y-3 py-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Tabriklaymiz!</h1>
        <p className="text-lg text-muted-foreground">
          &ldquo;{lesson.title}&rdquo; darsini tugatdingiz
        </p>
        <p className="text-sm text-green-700 font-medium">{encouragement}</p>
        {completionDate && (
          <p className="text-xs text-muted-foreground">
            Tugatilgan sana: {completionDate}
          </p>
        )}
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Initial */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6 pb-6 text-center">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-3">
              Dastlabki Test
            </Badge>
            <p className="text-4xl font-bold text-blue-700">
              {Math.round(initialScore)}%
            </p>
            {initialResult && (
              <p className="text-sm text-blue-600 mt-1">
                {initialResult.correctCount}/{initialResult.totalQuestions}{" "}
                to&apos;g&apos;ri
              </p>
            )}
          </CardContent>
        </Card>

        {/* Improvement indicator */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              improvement > 0
                ? "bg-green-100"
                : improvement === 0
                  ? "bg-gray-100"
                  : "bg-red-100"
            )}
          >
            {improvement > 0 ? (
              <TrendingUp className="h-6 w-6 text-green-600" />
            ) : improvement === 0 ? (
              <Minus className="h-6 w-6 text-gray-500" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
          <p
            className={cn(
              "text-sm font-semibold",
              improvement > 0
                ? "text-green-700"
                : improvement === 0
                  ? "text-gray-600"
                  : "text-red-700"
            )}
          >
            {improvement > 0 ? "+" : ""}
            {Math.round(improvement)}%
          </p>
          <p className="text-xs text-muted-foreground">{improvementText}</p>
        </div>

        {/* Final */}
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-6 pb-6 text-center">
            <Badge className="bg-green-100 text-green-800 border-green-200 mb-3">
              Yakuniy Test
            </Badge>
            <p className="text-4xl font-bold text-green-700">
              {Math.round(finalScore)}%
            </p>
            {finalResult && (
              <p className="text-sm text-green-600 mt-1">
                {finalResult.correctCount}/{finalResult.totalQuestions}{" "}
                to&apos;g&apos;ri
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Natijalar taqqoslash
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 14 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip
                formatter={(value) => [`${value}%`, "Ball"]}
                contentStyle={{ borderRadius: "8px", fontSize: "14px" }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={60}>
                <Cell fill="#3b82f6" />
                <Cell fill="#22c55e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <BarChart3 className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{Math.round(initialScore)}%</p>
            <p className="text-xs text-muted-foreground">Dastlabki natija</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Target className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{Math.round(finalScore)}%</p>
            <p className="text-xs text-muted-foreground">Yakuniy natija</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <TrendingUp
              className={cn(
                "h-5 w-5 mx-auto mb-1",
                improvement >= 0 ? "text-green-500" : "text-red-500"
              )}
            />
            <p
              className={cn(
                "text-2xl font-bold",
                improvement > 0
                  ? "text-green-700"
                  : improvement === 0
                    ? "text-gray-700"
                    : "text-red-700"
              )}
            >
              {improvement > 0 ? "+" : ""}
              {Math.round(improvement)}%
            </p>
            <p className="text-xs text-muted-foreground">O&apos;sish</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {(initialResult?.totalQuestions ?? 0) +
                (finalResult?.totalQuestions ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">Jami savollar</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-question breakdown: Initial Test */}
      {initialResult?.questionBreakdown && initialResult.questionBreakdown.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Dastlabki Test — Savol bo&apos;yicha natijalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {initialResult.questionBreakdown.map((q, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    q.isCorrect ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {q.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span>
                        Sizning javob: <strong>{q.options[q.userAnswer]}</strong>
                      </span>
                      {!q.isCorrect && (
                        <span className="ml-3">
                          To&apos;g&apos;ri javob: <strong className="text-green-700">{q.options[q.correctAnswer]}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Per-question breakdown: Final Test */}
      {finalResult?.questionBreakdown && finalResult.questionBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              Yakuniy Test — Savol bo&apos;yicha natijalar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {finalResult.questionBreakdown.map((q, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  q.isCorrect ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {q.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span>
                      Sizning javob: <strong>{q.options[q.userAnswer]}</strong>
                    </span>
                    {!q.isCorrect && (
                      <span className="ml-3">
                        To&apos;g&apos;ri javob: <strong className="text-green-700">{q.options[q.correctAnswer]}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Situational QA Results */}
      {situationalResults && situationalResults.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Vaziyatli savollar natijalari
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3" />
                  {situationalTotalScore}/{situationalMaxScore} ball
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {situationalResults.map((qa, idx) => {
                const selectedAnswer =
                  qa.selectedAnswerIndex !== null
                    ? qa.answers[qa.selectedAnswerIndex]
                    : null;
                return (
                  <div
                    key={qa.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">
                        {idx + 1}. {qa.question}
                      </p>
                      {qa.score !== null && (
                        <Badge className={cn("shrink-0 text-xs", getScoreColor(qa.score))}>
                          {qa.score}/5
                        </Badge>
                      )}
                    </div>
                    {selectedAnswer && (
                      <div className="text-xs text-muted-foreground">
                        <span>
                          Javob: <strong>{OPTION_LABELS[qa.selectedAnswerIndex!]}</strong> — {selectedAnswer.text}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-8">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/student/lessons">
            <ArrowLeft className="h-4 w-4" />
            Darslar ro&apos;yxatiga qaytish
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/student/lessons/${lesson.id}`}>
            Darsni qayta ko&apos;rish
          </Link>
        </Button>
      </div>
    </div>
  );
}
