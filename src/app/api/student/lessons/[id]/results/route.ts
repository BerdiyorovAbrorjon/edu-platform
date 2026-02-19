import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch lesson with tests and situational QAs
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        tests: { select: { id: true, type: true, questions: true } },
        situationalQA: {
          select: { id: true, question: true, answers: true, order: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Fetch progress
    const progress = await prisma.studentProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: params.id } },
      select: { currentStep: true, completedAt: true },
    });

    // Fetch test results
    const testIds = lesson.tests.map((t) => t.id);
    const testResults = await prisma.testResult.findMany({
      where: { userId, testId: { in: testIds } },
      orderBy: { completedAt: "desc" },
    });

    const initialTest = lesson.tests.find((t) => t.type === "INITIAL");
    const finalTest = lesson.tests.find((t) => t.type === "FINAL");

    const initialResult = testResults.find((r) => r.testId === initialTest?.id);
    const finalResult = testResults.find((r) => r.testId === finalTest?.id);

    // Build per-question breakdown for tests
    function buildQuestionBreakdown(
      test: { questions: unknown } | undefined,
      result: { answers: unknown } | undefined
    ) {
      if (!test || !result) return null;
      const questions = test.questions as Question[];
      const userAnswers = result.answers as number[];
      return questions.map((q, i) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[i] ?? -1,
        isCorrect: userAnswers[i] === q.correctAnswer,
      }));
    }

    const initialQuestions = initialTest ? (initialTest.questions as unknown[]).length : 0;
    const finalQuestions = finalTest ? (finalTest.questions as unknown[]).length : 0;

    // Fetch situational QA results
    const situationalQAIds = lesson.situationalQA.map((q) => q.id);
    const situationalResults = await prisma.situationalQAResult.findMany({
      where: {
        userId,
        situationalQAId: { in: situationalQAIds },
      },
    });

    const situationalResultsMap = new Map(
      situationalResults.map((r) => [r.situationalQAId, r])
    );

    const situationalData = lesson.situationalQA.map((qa) => {
      const result = situationalResultsMap.get(qa.id);
      const answers = qa.answers as { text: string; conclusion: string; score: number }[];
      return {
        id: qa.id,
        question: qa.question,
        answers,
        order: qa.order,
        selectedAnswerIndex: result?.selectedAnswerIndex ?? null,
        score: result?.score ?? null,
      };
    });

    return NextResponse.json({
      lesson: { id: lesson.id, title: lesson.title, description: lesson.description },
      progress,
      initialResult: initialResult
        ? {
            score: initialResult.score,
            answers: initialResult.answers,
            completedAt: initialResult.completedAt,
            totalQuestions: initialQuestions,
            correctCount: Math.round((initialResult.score / 100) * initialQuestions),
            questionBreakdown: buildQuestionBreakdown(initialTest, initialResult),
          }
        : null,
      finalResult: finalResult
        ? {
            score: finalResult.score,
            answers: finalResult.answers,
            completedAt: finalResult.completedAt,
            totalQuestions: finalQuestions,
            correctCount: Math.round((finalResult.score / 100) * finalQuestions),
            questionBreakdown: buildQuestionBreakdown(finalTest, finalResult),
          }
        : null,
      situationalResults: situationalData,
    });
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
