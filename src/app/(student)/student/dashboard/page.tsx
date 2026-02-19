"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardData {
  stats: {
    completedCount: number;
    inProgressCount: number;
    avgScore: number | null;
    totalLessonsAttempted: number;
  };
  recentLessons: {
    id: string;
    title: string;
    completedAt: string | null;
    initialScore: number | null;
    finalScore: number | null;
  }[];
  nextLesson: {
    id: string;
    title: string;
    currentStep: number;
  } | null;
  chartData: {
    title: string;
    fullTitle: string;
    initialScore: number | null;
    finalScore: number | null;
    completedAt: string | null;
  }[];
  achievements: { id: string; label: string; icon: string }[];
}

// ─── Skeleton Loaders ────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

// ─── Step label helper ───────────────────────────────────────────────────────

function stepLabel(step: number) {
  const labels: Record<number, string> = {
    1: "Boshlang'ich test",
    2: "Ma'ruzalar",
    3: "Vaziyatli savollar",
    4: "Yakuniy test",
  };
  return labels[step] ?? `Qadam ${step}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/student/dashboard");
      const json = await res.json();
      setData(json);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Refresh on window focus
  useEffect(() => {
    const onFocus = () => fetchDashboard(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const userName = session?.user?.name?.split(" ")[0] ?? "Talaba";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Salom, {userName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            O&apos;zingizning o&apos;quv jarayonginizni kuzating
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Yangilash
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tugatilgan darslar
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data?.stats.completedCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data?.stats.totalLessonsAttempted ?? 0} ta urinishdan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Jarayondagi darslar
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data?.stats.inProgressCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Hozir o&apos;qilmoqda
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  O&apos;rtacha ball
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data?.stats.avgScore !== null && data?.stats.avgScore !== undefined
                    ? `${data.stats.avgScore}%`
                    : "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Barcha testlar bo&apos;yicha
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Achievements */}
      {!loading && data && data.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yutuqlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data.achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-sm font-medium"
                >
                  <span className="text-lg">{a.icon}</span>
                  {a.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Natijalar dinamikasi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-56 w-full rounded-md" />
          ) : data && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={40}
                />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(v, name) => [
                    `${Number(v ?? 0)}%`,
                    name === "initialScore" ? "Boshlang'ich" : "Yakuniy",
                  ]}
                  labelFormatter={(label) => {
                    const item = data.chartData.find((d) => d.title === String(label));
                    return item?.fullTitle ?? String(label);
                  }}
                />
                <Legend
                  formatter={(v) =>
                    v === "initialScore" ? "Boshlang'ich ball" : "Yakuniy ball"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="initialScore"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="finalScore"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <TrendingUp className="h-8 w-8 opacity-30" />
              <p className="text-sm">
                Hali tugatilgan darslar yo&apos;q. Darsni boshlang!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent completed lessons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">So&apos;nggi tugatilgan darslar</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/lessons">Hammasi</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : data && data.recentLessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <BookOpen className="h-6 w-6 opacity-30" />
                <p className="text-sm">Hali tugatilgan dars yo&apos;q</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data?.recentLessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{lesson.title}</p>
                      {lesson.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(lesson.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lesson.finalScore !== null && (
                        <Badge
                          className={
                            lesson.finalScore >= 80
                              ? "bg-green-100 text-green-700 border-green-200"
                              : lesson.finalScore >= 60
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {Math.round(lesson.finalScore)}%
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/student/lessons/${lesson.id}`}>
                          Ko&apos;rish
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Continue learning */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">O&apos;qishni davom ettirish</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-32 mt-4" />
              </div>
            ) : data?.nextLesson ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="font-semibold text-base">{data.nextLesson.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Joriy qadam:{" "}
                    <span className="font-medium text-foreground">
                      {stepLabel(data.nextLesson.currentStep)}
                    </span>
                  </p>
                  <Button className="mt-4 gap-2" asChild>
                    <Link href={`/student/lessons/${data.nextLesson.id}`}>
                      Davom ettirish
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-70" />
                <p className="text-sm text-center">
                  Barcha boshlangan darslar tugatildi!
                </p>
                <Button variant="outline" asChild>
                  <Link href="/student/lessons">
                    Yangi dars boshlash
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
