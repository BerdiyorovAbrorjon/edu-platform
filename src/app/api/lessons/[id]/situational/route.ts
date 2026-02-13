import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const qas = await prisma.situationalQA.findMany({
      where: { lessonId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(qas);
  } catch (error) {
    console.error("Failed to fetch situational QAs:", error);
    return NextResponse.json(
      { error: "Failed to fetch situational QAs" },
      { status: 500 }
    );
  }
}

interface AnswerInput {
  text: string;
  conclusion: string;
}

interface QAInput {
  id?: string;
  question: string;
  answers: AnswerInput[];
  order: number;
}

export async function POST(
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

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i] as QAInput;
      if (!q.question || q.question.trim().length < 10) {
        return NextResponse.json(
          { error: `Question ${i + 1}: text must be at least 10 characters` },
          { status: 400 }
        );
      }
      if (!Array.isArray(q.answers) || q.answers.length < 2) {
        return NextResponse.json(
          { error: `Question ${i + 1}: must have at least 2 answers` },
          { status: 400 }
        );
      }
      for (let j = 0; j < q.answers.length; j++) {
        const a = q.answers[j];
        if (!a.text || a.text.trim().length < 5) {
          return NextResponse.json(
            { error: `Question ${i + 1}, Answer ${j + 1}: text must be at least 5 characters` },
            { status: 400 }
          );
        }
        if (!a.conclusion || a.conclusion.trim().length < 10) {
          return NextResponse.json(
            { error: `Question ${i + 1}, Answer ${j + 1}: conclusion must be at least 10 characters` },
            { status: 400 }
          );
        }
      }
    }

    // Get existing QA IDs
    const existing = await prisma.situationalQA.findMany({
      where: { lessonId: params.id },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((q) => q.id));
    const incomingIds = new Set(
      questions
        .filter((q: QAInput) => q.id)
        .map((q: QAInput) => q.id as string)
    );

    // Delete QAs no longer in the list
    const toDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id));
    if (toDelete.length > 0) {
      await prisma.situationalQA.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    // Upsert each QA
    const results = await Promise.all(
      questions.map(async (qa: QAInput, index: number) => {
        const data = {
          lessonId: params.id,
          question: qa.question.trim(),
          answers: qa.answers.map((a) => ({
            text: a.text.trim(),
            conclusion: a.conclusion.trim(),
          })),
          order: qa.order ?? index + 1,
        };

        if (qa.id && existingIds.has(qa.id)) {
          return prisma.situationalQA.update({
            where: { id: qa.id },
            data,
          });
        } else {
          return prisma.situationalQA.create({ data });
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to save situational QAs:", error);
    return NextResponse.json(
      { error: "Failed to save situational QAs" },
      { status: 500 }
    );
  }
}
