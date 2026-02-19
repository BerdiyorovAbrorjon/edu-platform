import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

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
