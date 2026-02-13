import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.test.findUnique({
      where: {
        lessonId_type: { lessonId: params.id, type: "FINAL" },
      },
    });

    if (!test) {
      return NextResponse.json({ id: null, questions: [] });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("Failed to fetch final test:", error);
    return NextResponse.json(
      { error: "Failed to fetch final test" },
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
    const { questions } = body;

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Questions must be an array" },
        { status: 400 }
      );
    }

    for (const q of questions) {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        return NextResponse.json(
          {
            error:
              "Each question must have: question (string), options (4 strings), correctAnswer (0-3)",
          },
          { status: 400 }
        );
      }
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const test = await prisma.test.upsert({
      where: {
        lessonId_type: { lessonId: params.id, type: "FINAL" },
      },
      update: { questions },
      create: {
        lessonId: params.id,
        type: "FINAL",
        questions,
      },
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error("Failed to save final test:", error);
    return NextResponse.json(
      { error: "Failed to save final test" },
      { status: 500 }
    );
  }
}
