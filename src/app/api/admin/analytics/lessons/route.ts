import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isTeacher = session.user.role === "TEACHER";

    const lessons = await prisma.lesson.findMany({
      where: isTeacher ? { createdById: session.user.id } : {},
      select: {
        id: true,
        title: true,
        progress: { select: { completedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      completedCount: lesson.progress.filter((p) => p.completedAt !== null).length,
      inProgressCount: lesson.progress.filter((p) => p.completedAt === null).length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch lesson stats:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
