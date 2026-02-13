import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: Replace with real user from session
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
      return NextResponse.json(
        { currentStep: 0, completedAt: null },
        { status: 200 }
      );
    }

    const progress = await prisma.studentProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: params.id,
        },
      },
      select: {
        currentStep: true,
        completedAt: true,
      },
    });

    if (!progress) {
      return NextResponse.json({ currentStep: 0, completedAt: null });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to fetch student progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
