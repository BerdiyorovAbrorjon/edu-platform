import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/teacher-emails — list all teacher emails
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherEmails = await prisma.teacherEmail.findMany({
    include: { addedBy: { select: { name: true, email: true } } },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json({ teacherEmails });
}

// POST /api/admin/teacher-emails — add a teacher email
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Yaroqli email manzil kiriting" }, { status: 400 });
  }

  try {
    const teacherEmail = await prisma.teacherEmail.create({
      data: { email, addedById: session.user.id },
      include: { addedBy: { select: { name: true, email: true } } },
    });

    // If a user with this email already exists and is STUDENT, upgrade to TEACHER
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.role === "STUDENT") {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: "TEACHER" },
      });
    }

    return NextResponse.json({ teacherEmail });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "Bu email allaqachon qo'shilgan" }, { status: 409 });
    }
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
