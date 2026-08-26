-- AlterTable: add fileId and fileOriginalName to Lecture (keep filePath for backward compat)
ALTER TABLE "Lecture" ADD COLUMN "fileId" TEXT;
ALTER TABLE "Lecture" ADD COLUMN "fileOriginalName" TEXT;

-- CreateTable: File
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "lessonId" TEXT,
    "lectureId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FileDownload
CREATE TABLE "FileDownload" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "FileDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "File_lessonId_idx" ON "File"("lessonId");

-- CreateIndex
CREATE INDEX "File_lectureId_idx" ON "File"("lectureId");

-- CreateIndex
CREATE INDEX "FileDownload_fileId_idx" ON "FileDownload"("fileId");

-- CreateIndex
CREATE INDEX "FileDownload_userId_idx" ON "FileDownload"("userId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileDownload" ADD CONSTRAINT "FileDownload_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileDownload" ADD CONSTRAINT "FileDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
