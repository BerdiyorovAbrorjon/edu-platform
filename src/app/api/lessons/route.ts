import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const teacherFilter = searchParams.get("teacher") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // TEACHER sees only their own lessons; ADMIN sees all
    const creatorFilter =
      session.user.role === "TEACHER" ? { createdById: session.user.id } : {};

    const searchFilter = search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {};

    const teacherIdFilter =
      session.user.role === "ADMIN" && teacherFilter
        ? { createdById: teacherFilter }
        : {};

    const where = { ...creatorFilter, ...searchFilter, ...teacherIdFilter };

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          tests: { select: { type: true, questions: true } },
          _count: { select: { lectures: true, situationalQA: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lesson.count({ where }),
    ]);

    // Fetch student progress counts for each lesson
    const lessonIds = lessons.map((l) => l.id);

    const [completedCounts, inProgressCounts] = await Promise.all([
      prisma.studentProgress.groupBy({
        by: ["lessonId"],
        where: { lessonId: { in: lessonIds }, completedAt: { not: null } },
        _count: { _all: true },
      }),
      prisma.studentProgress.groupBy({
        by: ["lessonId"],
        where: { lessonId: { in: lessonIds }, completedAt: null },
        _count: { _all: true },
      }),
    ]);

    const completedMap = Object.fromEntries(
      completedCounts.map((r) => [r.lessonId, r._count._all])
    );
    const inProgressMap = Object.fromEntries(
      inProgressCounts.map((r) => [r.lessonId, r._count._all])
    );

    const enrichedLessons = lessons.map((lesson) => {
      const initialTest = lesson.tests.find((t) => t.type === "INITIAL");
      const finalTest = lesson.tests.find((t) => t.type === "FINAL");

      return {
        ...lesson,
        initialQuestionCount: Array.isArray(initialTest?.questions) ? initialTest.questions.length : 0,
        finalQuestionCount: Array.isArray(finalTest?.questions) ? finalTest.questions.length : 0,
        completedCount: completedMap[lesson.id] ?? 0,
        inProgressCount: inProgressMap[lesson.id] ?? 0,
      };
    });

    // Fetch teachers list for ADMIN filter dropdown
    let teachers: { id: string; name: string | null; email: string }[] = [];
    if (session.user.role === "ADMIN") {
      teachers = await prisma.user.findMany({
        where: { role: "TEACHER" },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({
      lessons: enrichedLessons,
      teachers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        createdById: session.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
