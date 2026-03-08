"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const lessonSchema = z.object({
  title: z.string().min(1, "Sarlavha kiritish shart").max(200, "Sarlavha juda uzun"),
  description: z
    .string()
    .min(1, "Tavsif kiritish shart")
    .max(2000, "Tavsif juda uzun"),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export default function TeacherCreateLessonPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormData>();

  const onSubmit = async (data: LessonFormData) => {
    const parsed = lessonSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Dars yaratishda xatolik");
      }

      const lesson = await res.json();
      toast.success("Dars muvaffaqiyatli yaratildi");
      router.push(`/teacher/lessons/${lesson.id}/edit`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Dars yaratishda xatolik"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teacher/lessons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dars yaratish</h1>
          <p className="text-muted-foreground">
            Platformaga yangi dars qo&apos;shish
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dars ma&apos;lumotlari</CardTitle>
          <CardDescription>
            Dars uchun asosiy ma&apos;lumotlarni kiriting. Yaratgandan so&apos;ng test, maruza va S&amp;J qo&apos;shishingiz mumkin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Sarlavha</Label>
              <Input
                id="title"
                placeholder="Masalan: Web dasturlashga kirish"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                placeholder="Talabalar bu darsda nima o'rganishini tasvirlab bering..."
                rows={5}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Dars yaratish
              </Button>
              <Button variant="outline" asChild>
                <Link href="/teacher/lessons">Bekor qilish</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
