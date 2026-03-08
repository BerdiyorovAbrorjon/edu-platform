import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/teacher-emails/[email]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { email: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = decodeURIComponent(params.email).toLowerCase();

  try {
    await prisma.teacherEmail.delete({ where: { email } });

    // Downgrade teacher user back to STUDENT if they exist
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.role === "TEACHER") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "STUDENT" } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
