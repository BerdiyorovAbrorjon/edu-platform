import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const dateRange = searchParams.get("dateRange") || "30d";
    const lessonId = searchParams.get("lessonId") || "";

    // Calculate date cutoff
    const now = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "90d" ? 90 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // --- Overview stats ---
    const [totalStudents, totalLessons, progressData] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.lesson.count(),
      prisma.studentProgress.findMany({
        where: lessonId ? { lessonId } : {},
        select: { completedAt: true },
      }),
    ]);

    const completedCount = progressData.filter((p) => p.completedAt !== null).length;
    const completionRate =
      progressData.length > 0
        ? Math.round((completedCount / progressData.length) * 100 * 10) / 10
        : 0;

    // --- Average improvement (final - initial) ---
    const testResults = await prisma.testResult.findMany({
      include: {
        test: { select: { lessonId: true, type: true } },
      },
    });

    // Group by userId + lessonId
    const byPair: Record<string, { initial?: number; final?: number }> = {};
    for (const r of testResults) {
      const key = `${r.userId}::${r.test.lessonId}`;
      if (!byPair[key]) byPair[key] = {};
      if (r.test.type === "INITIAL") byPair[key].initial = r.score;
      if (r.test.type === "FINAL") byPair[key].final = r.score;
    }
    const improvements = Object.values(byPair)
      .filter((p) => p.initial !== undefined && p.final !== undefined)
      .map((p) => p.final! - p.initial!);
    const avgImprovement =
      improvements.length > 0
        ? Math.round(
            (improvements.reduce((a, b) => a + b, 0) / improvements.length) * 10
          ) / 10
        : 0;

    // --- Completion chart (daily completions over date range) ---
    const completionsInRange = await prisma.studentProgress.findMany({
      where: {
        completedAt: { gte: cutoff },
        ...(lessonId ? { lessonId } : {}),
      },
      select: { completedAt: true },
      orderBy: { completedAt: "asc" },
    });

    const completionByDate: Record<string, number> = {};
    for (let d = 0; d < days; d++) {
      const date = new Date(cutoff.getTime() + d * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      completionByDate[key] = 0;
    }
    for (const p of completionsInRange) {
      if (p.completedAt) {
        const key = p.completedAt.toISOString().slice(0, 10);
        if (key in completionByDate) completionByDate[key]++;
      }
    }
    const completionChart = Object.entries(completionByDate).map(
      ([date, count]) => ({ date, count })
    );

    // --- Lesson chart (bar: completions per lesson) ---
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            progress: { where: { completedAt: { not: null } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const lessonChart = lessons
      .map((l) => ({ id: l.id, title: l.title, completions: l._count.progress }))
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 10);

    // --- Score trend (avg final scores by date) ---
    const finalResults = await prisma.testResult.findMany({
      where: {
        completedAt: { gte: cutoff },
        test: {
          type: "FINAL",
          ...(lessonId ? { lessonId } : {}),
        },
      },
      select: { score: true, completedAt: true },
      orderBy: { completedAt: "asc" },
    });

    const scoreByDate: Record<string, { sum: number; count: number }> = {};
    for (const r of finalResults) {
      const key = r.completedAt.toISOString().slice(0, 10);
      if (!scoreByDate[key]) scoreByDate[key] = { sum: 0, count: 0 };
      scoreByDate[key].sum += r.score;
      scoreByDate[key].count++;
    }
    const scoreChart = Object.entries(scoreByDate).map(([date, { sum, count }]) => ({
      date,
      avg: Math.round((sum / count) * 10) / 10,
    }));

    // --- Students list (with pagination) ---
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        progress: {
          select: { completedAt: true, lessonId: true },
        },
        testResults: {
          select: { score: true, completedAt: true },
          orderBy: { completedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const studentsList = students.map((s) => {
      const completed = s.progress.filter((p) => p.completedAt !== null);
      const scores = s.testResults.map((r) => r.score);
      const avgScore =
        scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : null;
      const latestActivity =
        s.testResults[0]?.completedAt ??
        completed.sort((a, b) =>
          b.completedAt!.getTime() - a.completedAt!.getTime()
        )[0]?.completedAt ??
        null;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        image: s.image,
        completedCount: completed.length,
        avgScore,
        latestActivity,
      };
    });

    const totalStudentsCount = await prisma.user.count({ where: { role: "STUDENT" } });

    return NextResponse.json({
      totalStudents,
      totalLessons,
      completionRate,
      avgImprovement,
      completionChart,
      lessonChart,
      scoreChart,
      studentsList,
      pagination: {
        page,
        pageSize,
        total: totalStudentsCount,
        totalPages: Math.ceil(totalStudentsCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
