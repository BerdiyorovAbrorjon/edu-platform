import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: Get userId from session
async function getCurrentUserId() {
  const user = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Fetch lesson with tests
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        tests: { select: { id: true, type: true, questions: true } },
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

    // Fetch test results for this user and lesson's tests
    const testIds = lesson.tests.map((t) => t.id);
    const testResults = await prisma.testResult.findMany({
      where: {
        userId,
        testId: { in: testIds },
      },
      orderBy: { completedAt: "desc" },
    });

    const initialTest = lesson.tests.find((t) => t.type === "INITIAL");
    const finalTest = lesson.tests.find((t) => t.type === "FINAL");

    const initialResult = testResults.find((r) => r.testId === initialTest?.id);
    const finalResult = testResults.find((r) => r.testId === finalTest?.id);

    const initialQuestionCount = initialTest
      ? (initialTest.questions as unknown[]).length
      : 0;
    const finalQuestionCount = finalTest
      ? (finalTest.questions as unknown[]).length
      : 0;

    return NextResponse.json({
      lesson: { id: lesson.id, title: lesson.title, description: lesson.description },
      progress,
      initialResult: initialResult
        ? {
            score: initialResult.score,
            answers: initialResult.answers,
            completedAt: initialResult.completedAt,
            totalQuestions: initialQuestionCount,
            correctCount: Math.round(
              (initialResult.score / 100) * initialQuestionCount
            ),
          }
        : null,
      finalResult: finalResult
        ? {
            score: finalResult.score,
            answers: finalResult.answers,
            completedAt: finalResult.completedAt,
            totalQuestions: finalQuestionCount,
            correctCount: Math.round(
              (finalResult.score / 100) * finalQuestionCount
            ),
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
