import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch progress, test results, and lessons in parallel
    const [allProgress, testResults] = await Promise.all([
      prisma.studentProgress.findMany({
        where: { userId },
        include: {
          lesson: { select: { id: true, title: true } },
        },
        orderBy: { completedAt: "desc" },
      }),
      prisma.testResult.findMany({
        where: { userId },
        include: {
          test: { select: { lessonId: true, type: true } },
        },
        orderBy: { completedAt: "asc" },
      }),
    ]);

    // Stats
    const completedProgress = allProgress.filter((p) => p.completedAt !== null);
    const inProgressProgress = allProgress.filter(
      (p) => p.completedAt === null && p.currentStep > 0
    );

    const allScores = testResults.map((r) => r.score);
    const avgScore =
      allScores.length > 0
        ? Math.round(
            (allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10
          ) / 10
        : null;

    // Recent 5 completed lessons with scores
    const recentLessons = completedProgress.slice(0, 5).map((p) => {
      const lessonResults = testResults.filter(
        (r) => r.test.lessonId === p.lessonId
      );
      const initialResult = lessonResults.find((r) => r.test.type === "INITIAL");
      const finalResult = lessonResults.find((r) => r.test.type === "FINAL");
      return {
        id: p.lessonId,
        title: p.lesson.title,
        completedAt: p.completedAt,
        initialScore: initialResult?.score ?? null,
        finalScore: finalResult?.score ?? null,
      };
    });

    // Next incomplete lesson (in-progress with lowest currentStep, or first unstarted)
    const nextLesson = inProgressProgress.sort(
      (a, b) => b.currentStep - a.currentStep
    )[0] ?? null;

    const nextLessonData = nextLesson
      ? {
          id: nextLesson.lessonId,
          title: nextLesson.lesson.title,
          currentStep: nextLesson.currentStep,
        }
      : null;

    // Chart data: initial vs final scores per completed lesson
    const chartData = completedProgress
      .map((p) => {
        const lessonResults = testResults.filter(
          (r) => r.test.lessonId === p.lessonId
        );
        const initialResult = lessonResults.find((r) => r.test.type === "INITIAL");
        const finalResult = lessonResults.find((r) => r.test.type === "FINAL");
        if (!initialResult && !finalResult) return null;
        return {
          title:
            p.lesson.title.length > 20
              ? p.lesson.title.slice(0, 20) + "…"
              : p.lesson.title,
          fullTitle: p.lesson.title,
          initialScore: initialResult?.score ?? null,
          finalScore: finalResult?.score ?? null,
          completedAt: p.completedAt,
        };
      })
      .filter(Boolean)
      .reverse(); // chronological order

    // Achievements
    const achievements = [];
    if (completedProgress.length >= 1)
      achievements.push({ id: "first", label: "Birinchi dars", icon: "🎯" });
    if (completedProgress.length >= 5)
      achievements.push({ id: "five", label: "5 ta dars", icon: "⭐" });
    if (completedProgress.length >= 10)
      achievements.push({ id: "ten", label: "10 ta dars", icon: "🏆" });
    if (avgScore !== null && avgScore >= 80)
      achievements.push({ id: "highscore", label: "Yuqori natija", icon: "🔥" });

    return NextResponse.json({
      stats: {
        completedCount: completedProgress.length,
        inProgressCount: inProgressProgress.length,
        avgScore,
        totalLessonsAttempted: allProgress.length,
      },
      recentLessons,
      nextLesson: nextLessonData,
      chartData,
      achievements,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
