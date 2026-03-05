import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { minioClient, BUCKET } from "@/lib/minio";
import { checkFileAccess } from "@/lib/file-access";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = await prisma.file.findUnique({
    where: { id: params.fileId },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const hasAccess = await checkFileAccess(file, {
    id: session.user.id,
    role: session.user.role,
  });

  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Track the download (fire-and-forget, don't block streaming)
  prisma.fileDownload.create({
    data: {
      fileId: file.id,
      userId: session.user.id,
      ipAddress: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
    },
  }).catch(console.error);

  // Stream the file through the server — MinIO stays internal, no public URL needed
  const stream = await minioClient.getObject(BUCKET, file.path);

  const readable = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  const safeName = encodeURIComponent(file.originalName);
  return new NextResponse(readable, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": file.size.toString(),
      "Cache-Control": "private, no-store",
    },
  });
}
