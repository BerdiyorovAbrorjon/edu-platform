import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

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
