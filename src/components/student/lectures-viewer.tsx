"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileDown,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match?.[1] ?? null;
}

function VideoPlayer({ url }: { url: string }) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${ytId}`}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }
  return (
    <video
      src={url}
      controls
      className="absolute inset-0 h-full w-full object-contain"
    />
  );
}

interface Lecture {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  filePath: string | null;
  order: number;
}

interface LecturesViewerProps {
  lectures: Lecture[];
  lessonId: string;
  currentStep: number;
}

export function LecturesViewer({
  lectures,
  lessonId,
  currentStep,
}: LecturesViewerProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewedLectures, setViewedLectures] = useState<Set<string>>(
    new Set([lectures[0]?.id])
  );
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = lectures[selectedIndex];
  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === lectures.length - 1;
  const allViewed = lectures.every((l) => viewedLectures.has(l.id));

  const selectLecture = (index: number) => {
    setSelectedIndex(index);
    setViewedLectures((prev) => {
      const next = new Set(prev);
      next.add(lectures[index].id);
      return next;
    });
    setSidebarOpen(false);
  };

  const goNext = () => {
    if (!isLast) selectLecture(selectedIndex + 1);
  };

  const goPrev = () => {
    if (!isFirst) selectLecture(selectedIndex - 1);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch("/api/student/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, currentStep: 3 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Xatolik yuz berdi");
      }

      toast.success("Maruzalar tugallandi!");
      router.push(`/student/lessons/${lessonId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setCompleting(false);
    }
  };

  if (!current) return null;

  const sidebarContent = (
    <div className="space-y-1 p-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
        Maruzalar ({lectures.length})
      </p>
      {lectures.map((lecture, idx) => {
        const isViewed = viewedLectures.has(lecture.id);
        const isActive = idx === selectedIndex;
        return (
          <button
            key={lecture.id}
            type="button"
            onClick={() => selectLecture(idx)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "hover:bg-accent",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                isViewed
                  ? "bg-green-100 text-green-700"
                  : isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {isViewed ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                idx + 1
              )}
            </span>
            <span className="truncate font-medium">{lecture.title}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-0 -mx-4 sm:-mx-6 min-h-[calc(100vh-8rem)]">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Maruzalar ro&apos;yxati
        </Button>
        <Badge variant="secondary" className="ml-auto">
          {selectedIndex + 1}/{lectures.length}
        </Badge>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="lg:hidden border-b bg-muted/30">
          {sidebarContent}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r bg-muted/30">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {sidebarContent}
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="px-4 py-6 sm:px-8 max-w-4xl mx-auto space-y-6">
          {/* Lecture header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {selectedIndex + 1}-maruza
              </Badge>
              {viewedLectures.has(current.id) && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  Ko&apos;rilgan
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-bold">{current.title}</h2>
          </div>

          {/* Video player */}
          {current.videoUrl && (
            <Card className="overflow-hidden">
              <div className="relative pt-[56.25%] bg-black">
                <VideoPlayer url={current.videoUrl} />
              </div>
            </Card>
          )}

          {/* Lecture content */}
          {current.description && current.description !== "<p></p>" ? (
            <div
              className="prose prose-sm sm:prose max-w-none"
              dangerouslySetInnerHTML={{ __html: current.description }}
            />
          ) : (
            !current.videoUrl && (
              <div className="flex items-center justify-center rounded-lg border border-dashed py-12">
                <p className="text-muted-foreground">Matn mavjud emas</p>
              </div>
            )
          )}

          {/* File download */}
          {current.filePath && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <FileDown className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Qo&apos;shimcha materiallar</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {current.filePath.split("/").pop()}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`${process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9010"}/${process.env.NEXT_PUBLIC_MINIO_BUCKET || "edu-platform"}/${current.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Yuklab olish
                  </a>
                </Button>
              </div>
            </>
          )}

          <Separator />

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={isFirst}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Oldingi</span>
            </Button>

            <div className="flex items-center gap-1.5">
              {lectures.map((l, idx) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => selectLecture(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    idx === selectedIndex ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/30",
                    viewedLectures.has(l.id) && idx !== selectedIndex && "bg-green-300"
                  )}
                />
              ))}
            </div>

            {isLast && allViewed && currentStep === 2 ? (
              <Button
                onClick={handleComplete}
                disabled={completing}
                className="gap-2"
              >
                {completing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Tugatish</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={goNext}
                disabled={isLast}
                className="gap-2"
              >
                <span className="hidden sm:inline">Keyingi</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
