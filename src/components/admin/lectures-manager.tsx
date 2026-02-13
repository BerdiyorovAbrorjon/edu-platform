"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  GripVertical,
  Video,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/admin/file-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { cn } from "@/lib/utils";

interface LectureItem {
  _key: string;
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  filePath: string | null;
  order: number;
}

interface LecturesManagerProps {
  lessonId: string;
}

let keyCounter = 0;
function nextKey() {
  return `lecture-${++keyCounter}`;
}

function emptyLecture(order: number): LectureItem {
  return {
    _key: nextKey(),
    title: "",
    description: "",
    videoUrl: "",
    filePath: null,
    order,
  };
}

function SortableLecture({
  lecture,
  index,
  total,
  onUpdate,
  onRemove,
}: {
  lecture: LectureItem;
  index: number;
  total: number;
  onUpdate: (index: number, field: keyof LectureItem, value: string | null) => void;
  onRemove: (index: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lecture._key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex flex-1 items-center gap-2 text-left"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                collapsed && "-rotate-90"
              )}
            />
            <CardTitle className="text-base">
              {lecture.title || `Lecture ${index + 1}`}
            </CardTitle>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            disabled={total === 1}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Lecture title..."
                value={lecture.title}
                onChange={(e) => onUpdate(index, "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://youtube.com/watch?v=..."
                  value={lecture.videoUrl}
                  onChange={(e) => onUpdate(index, "videoUrl", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maruza Matni</Label>
            <RichTextEditor
              value={lecture.description}
              onChange={(html) => onUpdate(index, "description", html)}
              placeholder="Maruza matnini kiriting..."
              minHeight={300}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment</Label>
            <FileUpload
              value={lecture.filePath}
              onChange={(path) => onUpdate(index, "filePath", path)}
            />
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, or PPTX (max 50MB)
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function LecturesManager({ lessonId }: LecturesManagerProps) {
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchLectures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/lectures`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLectures(
          data.map((l: LectureItem & { id: string }) => ({
            ...l,
            _key: nextKey(),
            videoUrl: l.videoUrl || "",
          }))
        );
      } else {
        setLectures([emptyLecture(1)]);
      }
    } catch {
      setLectures([emptyLecture(1)]);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const addLecture = () => {
    setLectures((prev) => [...prev, emptyLecture(prev.length + 1)]);
  };

  const removeLecture = (index: number) => {
    setLectures((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((l, i) => ({ ...l, order: i + 1 }));
    });
  };

  const updateLecture = (
    index: number,
    field: keyof LectureItem,
    value: string | null
  ) => {
    setLectures((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLectures((prev) => {
      const oldIndex = prev.findIndex((l) => l._key === active.id);
      const newIndex = prev.findIndex((l) => l._key === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((l, i) => ({ ...l, order: i + 1 }));
    });
  };

  const validate = (): string | null => {
    if (lectures.length === 0) return "Add at least one lecture";
    for (let i = 0; i < lectures.length; i++) {
      if (!lectures[i].title.trim())
        return `Lecture ${i + 1}: Title is required`;
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      const payload = lectures.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        videoUrl: l.videoUrl || null,
        filePath: l.filePath,
        order: l.order,
      }));

      const res = await fetch(`/api/lessons/${lessonId}/lectures`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectures: payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save lectures");
      }

      const saved = await res.json();
      setLectures(
        saved.map((l: LectureItem & { id: string }) => ({
          ...l,
          _key: nextKey(),
          videoUrl: l.videoUrl || "",
        }))
      );
      toast.success("Lectures saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-9 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {lectures.length} lecture{lectures.length !== 1 ? "s" : ""} — drag to
          reorder, click to collapse
        </p>
        <Button onClick={addLecture} variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Add Lecture
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lectures.map((l) => l._key)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {lectures.map((lecture, index) => (
              <SortableLecture
                key={lecture._key}
                lecture={lecture}
                index={index}
                total={lectures.length}
                onUpdate={updateLecture}
                onRemove={removeLecture}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Lectures
        </Button>
        <span className="text-sm text-muted-foreground">
          {lectures.length} lecture{lectures.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
