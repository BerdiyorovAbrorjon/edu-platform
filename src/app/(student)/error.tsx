"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Student Error]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Xatolik yuz berdi</h2>
            <p className="text-sm text-muted-foreground">
              {error.message || "Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring."}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Qayta urinish
            </Button>
            <Button variant="outline" asChild>
              <Link href="/student/lessons" className="gap-2 flex items-center">
                <ArrowLeft className="h-4 w-4" />
                Darslarga qaytish
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
