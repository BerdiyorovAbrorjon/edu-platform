import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { lessonId, currentStep } = body;

    if (!lessonId || typeof currentStep !== "number") {
      return NextResponse.json(
        { error: "lessonId and currentStep are required" },
        { status: 400 }
      );
    }

    if (currentStep < 2 || currentStep > 4) {
      return NextResponse.json(
        { error: "currentStep must be 2, 3, or 4" },
        { status: 400 }
      );
    }

    // Only advance forward, never go backward
    const existing = await prisma.studentProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (existing && existing.currentStep >= currentStep) {
      return NextResponse.json({ success: true, message: "Already at this step or beyond" });
    }

    await prisma.studentProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, currentStep },
      update: { currentStep },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
