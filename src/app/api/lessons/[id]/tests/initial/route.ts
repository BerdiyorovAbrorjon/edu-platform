import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.test.findUnique({
      where: {
        lessonId_type: { lessonId: params.id, type: "INITIAL" },
      },
    });

    if (!test) {
      return NextResponse.json({ id: null, questions: [] });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("Failed to fetch initial test:", error);
    return NextResponse.json(
      { error: "Failed to fetch initial test" },
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

    // Validate each question
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

    const test = await prisma.test.upsert({
      where: {
        lessonId_type: { lessonId: params.id, type: "INITIAL" },
      },
      update: { questions },
      create: {
        lessonId: params.id,
        type: "INITIAL",
        questions,
      },
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error("Failed to save initial test:", error);
    return NextResponse.json(
      { error: "Failed to save initial test" },
      { status: 500 }
    );
  }
}
