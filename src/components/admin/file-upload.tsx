"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  value: string | null; // fileId
  displayName?: string | null; // original filename for display
  lessonId?: string | null;
  onChange: (fileId: string | null, originalName?: string | null) => void;
}

export function FileUpload({ value, displayName, lessonId, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localName, setLocalName] = useState<string | null>(null);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setLocalName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (lessonId) formData.append("lessonId", lessonId);

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setProgress(100);
      onChange(data.fileId, data.originalName);
      setLocalName(data.originalName);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setLocalName(null);
      onChange(null, null);
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null, null);
    setLocalName(null);
  };

  if (value) {
    const shownName = localName || displayName || "Uploaded file";
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
        <File className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm truncate flex-1">{shownName}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.pptx,.doc,.ppt"
        onChange={handleSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? "Uploading..." : "Upload File"}
      </Button>
      {uploading && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
