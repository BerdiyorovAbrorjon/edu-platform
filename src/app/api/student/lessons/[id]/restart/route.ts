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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    const lessonId = params.id;

    // Fetch test IDs for this lesson
    const tests = await prisma.test.findMany({
      where: { lessonId },
      select: { id: true },
    });
    const testIds = tests.map((t) => t.id);

    // Delete all progress in a transaction
    await prisma.$transaction([
      prisma.testResult.deleteMany({
        where: { userId, testId: { in: testIds } },
      }),
      prisma.situationalQAResult.deleteMany({
        where: { userId, lessonId },
      }),
      prisma.studentProgress.deleteMany({
        where: { userId, lessonId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to restart lesson:", error);
    return NextResponse.json(
      { error: "Failed to restart lesson" },
      { status: 500 }
    );
  }
}
