-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TEACHER';

-- CreateTable
CREATE TABLE "TeacherEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherEmail_email_key" ON "TeacherEmail"("email");

-- AddForeignKey
ALTER TABLE "TeacherEmail" ADD CONSTRAINT "TeacherEmail_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
