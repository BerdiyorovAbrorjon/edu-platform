import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { uploadFile, getFileUrl } from "@/lib/minio";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  // Documents
  "application/pdf": "documents",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "documents",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "documents",
  "application/msword": "documents",
  "application/vnd.ms-powerpoint": "documents",
  // Images
  "image/jpeg": "images",
  "image/png": "images",
  "image/gif": "images",
  "image/webp": "images",
  "image/svg+xml": "images",
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const folder = ALLOWED_TYPES[file.type];
    if (!folder) {
      return NextResponse.json(
        { error: "File type not allowed. Accepted: PDF, DOCX, PPTX, JPG, PNG, GIF, WebP, SVG" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 50MB" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || ".bin";
    const filename = `${folder}/${uuidv4()}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadFile(buffer, filename, file.type);

    const url = await getFileUrl(filename);

    return NextResponse.json({
      filename,
      originalName: file.name,
      url,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
