import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const progress = await prisma.studentProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId: params.id,
        },
      },
      select: {
        currentStep: true,
        completedAt: true,
      },
    });

    if (!progress) {
      return NextResponse.json({ currentStep: 0, completedAt: null });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to fetch student progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
