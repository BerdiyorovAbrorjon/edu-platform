import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; qaId: string } }
) {
  try {
    // Verify the QA belongs to the lesson
    const qa = await prisma.situationalQA.findFirst({
      where: { id: params.qaId, lessonId: params.id },
    });

    if (!qa) {
      return NextResponse.json(
        { error: "Situational QA not found" },
        { status: 404 }
      );
    }

    await prisma.situationalQA.delete({
      where: { id: params.qaId },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Failed to delete situational QA:", error);
    return NextResponse.json(
      { error: "Failed to delete situational QA" },
      { status: 500 }
    );
  }
}
