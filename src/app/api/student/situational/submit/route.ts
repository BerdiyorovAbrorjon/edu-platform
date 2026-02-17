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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { situationalQAId, lessonId, selectedAnswerIndex, score } = body;

    if (!situationalQAId || !lessonId || typeof selectedAnswerIndex !== "number" || typeof score !== "number") {
      return NextResponse.json(
        { error: "situationalQAId, lessonId, selectedAnswerIndex, and score are required" },
        { status: 400 }
      );
    }

    if (score < 0 || score > 5) {
      return NextResponse.json(
        { error: "Score must be between 0 and 5" },
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

    await prisma.situationalQAResult.upsert({
      where: {
        userId_situationalQAId: { userId, situationalQAId },
      },
      create: {
        userId,
        lessonId,
        situationalQAId,
        selectedAnswerIndex,
        score,
      },
      update: {
        selectedAnswerIndex,
        score,
        answeredAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit situational answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
