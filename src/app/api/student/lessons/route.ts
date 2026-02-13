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

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const search = request.nextUrl.searchParams.get("search") || "";

    // Fetch lessons that have all 4 parts complete
    const lessons = await prisma.lesson.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        // Only lessons with at least 1 test of each type, 1 lecture, and 1 situational QA
        tests: {
          some: { type: "INITIAL" },
        },
        lectures: {
          some: {},
        },
        situationalQA: {
          some: {},
        },
        AND: {
          tests: {
            some: { type: "FINAL" },
          },
        },
      },
      include: {
        _count: {
          select: {
            lectures: true,
            situationalQA: true,
          },
        },
        tests: {
          select: { type: true, questions: true },
        },
        ...(userId
          ? {
              progress: {
                where: { userId },
                select: {
                  currentStep: true,
                  completedAt: true,
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data for client
    const result = lessons.map((lesson) => {
      const progress = (lesson.progress as { currentStep: number; completedAt: Date | null }[] | undefined)?.[0] ?? null;
      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        lectureCount: lesson._count.lectures,
        qaCount: lesson._count.situationalQA,
        currentStep: progress?.currentStep ?? 0,
        completedAt: progress?.completedAt ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch student lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
