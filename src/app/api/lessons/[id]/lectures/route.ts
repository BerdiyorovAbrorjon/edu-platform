import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lectures = await prisma.lecture.findMany({
      where: { lessonId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(lectures);
  } catch (error) {
    console.error("Failed to fetch lectures:", error);
    return NextResponse.json(
      { error: "Failed to fetch lectures" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { lectures } = body;

    if (!Array.isArray(lectures)) {
      return NextResponse.json(
        { error: "Lectures must be an array" },
        { status: 400 }
      );
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get existing lecture IDs
    const existing = await prisma.lecture.findMany({
      where: { lessonId: params.id },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((l) => l.id));
    const incomingIds = new Set(
      lectures.filter((l: { id?: string }) => l.id).map((l: { id: string }) => l.id)
    );

    // Delete lectures that are no longer in the list
    const toDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id));
    if (toDelete.length > 0) {
      await prisma.lecture.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    // Upsert each lecture
    const results = await Promise.all(
      lectures.map(
        async (
          lecture: {
            id?: string;
            title: string;
            description: string;
            videoUrl?: string | null;
            filePath?: string | null;
            order: number;
          },
          index: number
        ) => {
          const data = {
            lessonId: params.id,
            title: lecture.title,
            description: lecture.description ? sanitizeHtml(lecture.description) : "",
            videoUrl: lecture.videoUrl || null,
            filePath: lecture.filePath || null,
            order: lecture.order ?? index + 1,
          };

          if (lecture.id && existingIds.has(lecture.id)) {
            return prisma.lecture.update({
              where: { id: lecture.id },
              data,
            });
          } else {
            return prisma.lecture.create({ data });
          }
        }
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to save lectures:", error);
    return NextResponse.json(
      { error: "Failed to save lectures" },
      { status: 500 }
    );
  }
}
