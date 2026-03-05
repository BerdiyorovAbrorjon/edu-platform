import { prisma } from "@/lib/prisma";

interface FileInfo {
  lessonId: string | null;
  lectureId: string | null;
}

interface UserInfo {
  id: string;
  role: string;
}

export async function checkFileAccess(
  file: FileInfo,
  user: UserInfo
): Promise<boolean> {
  if (user.role === "ADMIN") return true;

  // Resolve lessonId: directly on file, or via its lecture
  let lessonId = file.lessonId;
  if (!lessonId && file.lectureId) {
    const lecture = await prisma.lecture.findUnique({
      where: { id: file.lectureId },
      select: { lessonId: true },
    });
    lessonId = lecture?.lessonId ?? null;
  }

  if (!lessonId) return false;

  const progress = await prisma.studentProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });

  if (!progress) return false;

  // If file is attached to a lecture, student must be at the lectures step (>=2)
  if (file.lectureId) {
    return progress.currentStep >= 2;
  }

  return true;
}
