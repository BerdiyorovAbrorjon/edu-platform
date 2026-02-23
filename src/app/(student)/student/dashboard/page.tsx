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
  Sparkles,
  Flame,
} from "lucide-react";
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

function stepLabel(step: number) {
  const labels: Record<number, string> = {
    1: "Boshlang'ich test",
    2: "Ma'ruzalar",
    3: "Vaziyatli savollar",
    4: "Yakuniy test",
  };
  return labels[step] ?? `Qadam ${step}`;
}

function scoreColor(score: number) {
  if (score >= 80) return "bg-green-50 text-green-700 border-green-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="mb-2 h-9 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

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
      setData(await res.json());
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

  useEffect(() => {
    const onFocus = () => fetchDashboard(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const userName = session?.user?.name?.split(" ")[0] ?? "Talaba";

  const stats = [
    {
      label: "Tugatilgan darslar",
      value: data?.stats.completedCount ?? 0,
      sub: `${data?.stats.totalLessonsAttempted ?? 0} ta urinishdan`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      iconBg: "bg-green-50",
      valueColor: "text-green-600",
    },
    {
      label: "Jarayondagi darslar",
      value: data?.stats.inProgressCount ?? 0,
      sub: "Hozir o'qilmoqda",
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      iconBg: "bg-blue-50",
      valueColor: "text-blue-600",
    },
    {
      label: "O'rtacha ball",
      value:
        data?.stats.avgScore != null ? `${data.stats.avgScore}%` : "—",
      sub: "Barcha testlar bo'yicha",
      icon: <TrendingUp className="h-5 w-5 text-violet-600" />,
      iconBg: "bg-violet-50",
      valueColor: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-400">
            Xush kelibsiz
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Salom, {userName}! 👋
          </h1>
          <p className="mt-1 text-gray-500">
            O&apos;zingizning o&apos;quv jarayonginizni kuzating
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="gap-2 rounded-xl border-gray-200"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Yangilash
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {s.label}
                  </span>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}
                  >
                    {s.icon}
                  </div>
                </div>
                <div className={`text-4xl font-black ${s.valueColor}`}>
                  {s.value}
                </div>
                <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
              </div>
            ))}
      </div>

      {/* Achievements */}
      {!loading && data && data.achievements.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-gray-900">Yutuqlar</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.achievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium shadow-sm"
              >
                <span className="text-lg">{a.icon}</span>
                {a.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-violet-500" />
          <h2 className="font-bold text-gray-900">Natijalar dinamikasi</h2>
        </div>
        {loading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : data && data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="title"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={40}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
                formatter={(v, name) => [
                  `${Number(v ?? 0)}%`,
                  name === "initialScore" ? "Boshlang'ich" : "Yakuniy",
                ]}
                labelFormatter={(label) => {
                  const item = data.chartData.find(
                    (d) => d.title === String(label)
                  );
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
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#f59e0b" }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="finalScore"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#8b5cf6" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[220px] flex-col items-center justify-center gap-3 text-gray-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
              <TrendingUp className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-sm">
              Hali tugatilgan darslar yo&apos;q. Darsni boshlang!
            </p>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/student/lessons">Darslarni ko&apos;rish</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Bottom two cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent completed */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h2 className="font-bold text-gray-900">
                So&apos;nggi tugatilganlar
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-lg text-gray-400 hover:text-gray-700"
            >
              <Link href="/student/lessons">Hammasi →</Link>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              ))}
            </div>
          ) : !data || data.recentLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <BookOpen className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">Hali tugatilgan dars yo&apos;q</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.recentLessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/student/lessons/${lesson.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-50 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {lesson.title}
                      </p>
                      {lesson.completedAt && (
                        <p className="text-xs text-gray-400">
                          {new Date(lesson.completedAt).toLocaleDateString(
                            "uz-UZ"
                          )}
                        </p>
                      )}
                    </div>
                    {lesson.finalScore !== null && (
                      <Badge
                        className={`shrink-0 border text-xs ${scoreColor(
                          lesson.finalScore
                        )}`}
                      >
                        {Math.round(lesson.finalScore)}%
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Continue learning */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="font-bold text-gray-900">
              O&apos;qishni davom ettirish
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-4 h-10 w-36 rounded-xl" />
            </div>
          ) : data?.nextLesson ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Joriy qadam
                </p>
                <p className="mt-2 text-base font-bold text-gray-900">
                  {data.nextLesson.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {stepLabel(data.nextLesson.currentStep)}
                </p>
              </div>
              <Button
                asChild
                className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/25"
              >
                <Link href={`/student/lessons/${data.nextLesson.id}`}>
                  Davom ettirish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <p className="text-sm text-gray-500">
                Barcha boshlangan darslar tugatildi!
              </p>
              <Button asChild variant="outline" className="rounded-xl gap-2">
                <Link href="/student/lessons">
                  Yangi dars boshlash
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
