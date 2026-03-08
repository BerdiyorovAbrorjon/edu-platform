import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        tests: { select: { id: true, type: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const initialTestId = lesson.tests.find((t) => t.type === "INITIAL")?.id;
    const finalTestId = lesson.tests.find((t) => t.type === "FINAL")?.id;

    // Get all progress records for this lesson
    const progressList = await prisma.studentProgress.findMany({
      where: { lessonId: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    // Fetch test results for these users
    const userIds = progressList.map((p) => p.userId);

    const testResults = await prisma.testResult.findMany({
      where: {
        userId: { in: userIds },
        testId: {
          in: [initialTestId, finalTestId].filter(Boolean) as string[],
        },
      },
    });

    const resultsByUser = new Map<
      string,
      { initialScore: number | null; finalScore: number | null }
    >();
    for (const userId of userIds) {
      const initialResult = initialTestId
        ? testResults.find(
            (r) => r.userId === userId && r.testId === initialTestId
          )
        : null;
      const finalResult = finalTestId
        ? testResults.find(
            (r) => r.userId === userId && r.testId === finalTestId
          )
        : null;
      resultsByUser.set(userId, {
        initialScore: initialResult?.score ?? null,
        finalScore: finalResult?.score ?? null,
      });
    }

    const students = progressList.map((p) => {
      const scores = resultsByUser.get(p.userId);
      return {
        userId: p.userId,
        name: p.user.name,
        email: p.user.email,
        image: p.user.image,
        currentStep: p.currentStep,
        completedAt: p.completedAt,
        initialScore: scores?.initialScore ?? null,
        finalScore: scores?.finalScore ?? null,
      };
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Failed to fetch lesson students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
