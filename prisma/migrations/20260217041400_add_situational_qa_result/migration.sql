-- CreateTable
CREATE TABLE "SituationalQAResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "situationalQAId" TEXT NOT NULL,
    "selectedAnswerIndex" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SituationalQAResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SituationalQAResult_userId_situationalQAId_key" ON "SituationalQAResult"("userId", "situationalQAId");

-- AddForeignKey
ALTER TABLE "SituationalQAResult" ADD CONSTRAINT "SituationalQAResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SituationalQAResult" ADD CONSTRAINT "SituationalQAResult_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SituationalQAResult" ADD CONSTRAINT "SituationalQAResult_situationalQAId_fkey" FOREIGN KEY ("situationalQAId") REFERENCES "SituationalQA"("id") ON DELETE CASCADE ON UPDATE CASCADE;
