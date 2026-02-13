import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {};

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { tests: true, lectures: true, situationalQA: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lesson.count({ where }),
    ]);

    return NextResponse.json({
      lessons,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Get first admin user as creator (temporary until auth is implemented)
    let creator = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!creator) {
      creator = await prisma.user.findFirst();
    }

    if (!creator) {
      return NextResponse.json(
        { error: "No users found. Please seed the database first." },
        { status: 500 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        createdById: creator.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
