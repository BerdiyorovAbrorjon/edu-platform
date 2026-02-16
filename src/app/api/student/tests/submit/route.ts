import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

// TODO: Get userId from session
async function getCurrentUserId() {
  const user = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, lessonId, answers } = body;

    if (!testId || !lessonId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "testId, lessonId, and answers are required" },
        { status: 400 }
      );
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Fetch test with correct answers
    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    const questions = test.questions as unknown as Question[];

    if (answers.length !== questions.length) {
      return NextResponse.json(
        { error: "Number of answers must match number of questions" },
        { status: 400 }
      );
    }

    // Calculate score
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctAnswer) {
        correctCount++;
      }
    }
    const score = (correctCount / questions.length) * 100;

    // Determine next step based on test type
    const isInitial = test.type === "INITIAL";
    const nextStep = isInitial ? 2 : 4;

    // Create test result and update progress in a transaction
    const [testResult] = await prisma.$transaction([
      prisma.testResult.create({
        data: {
          userId,
          testId,
          score,
          answers,
        },
      }),
      prisma.studentProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId },
        },
        create: {
          userId,
          lessonId,
          currentStep: nextStep,
          ...(test.type === "FINAL" ? { completedAt: new Date() } : {}),
        },
        update: {
          currentStep: nextStep,
          ...(test.type === "FINAL" ? { completedAt: new Date() } : {}),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      resultId: testResult.id,
      score,
      correctCount,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error("Failed to submit test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}
