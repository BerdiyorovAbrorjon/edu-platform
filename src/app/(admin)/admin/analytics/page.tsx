"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  BarChart3,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalStudents: number;
  totalLessons: number;
  completionRate: number;
  avgImprovement: number;
  completionChart: { date: string; count: number }[];
  lessonChart: { id: string; title: string; completions: number }[];
  scoreChart: { date: string; avg: number }[];
  studentsList: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    completedCount: number;
    avgScore: number | null;
    latestActivity: string | null;
  }[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

type SortField = "name" | "completedCount" | "avgScore" | "latestActivity";
type SortDir = "asc" | "desc";

// ─── Skeleton Loaders ────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-56 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("latestActivity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams({ dateRange, page: String(page) });
        const res = await fetch(`/api/admin/analytics?${params}`);
        const json = await res.json();
        setData(json);
      } catch {
        /* noop */
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, page]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Re-fetch on window focus
  useEffect(() => {
    const onFocus = () => fetchAnalytics(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchAnalytics]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-1" />
    );
  }

  const sortedStudents = data
    ? [...data.studentsList].sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortField === "name") {
          return mul * (a.name ?? "").localeCompare(b.name ?? "");
        }
        if (sortField === "completedCount") {
          return mul * (a.completedCount - b.completedCount);
        }
        if (sortField === "avgScore") {
          return mul * ((a.avgScore ?? -1) - (b.avgScore ?? -1));
        }
        // latestActivity
        const ta = a.latestActivity ? new Date(a.latestActivity).getTime() : 0;
        const tb = b.latestActivity ? new Date(b.latestActivity).getTime() : 0;
        return mul * (ta - tb);
      })
    : [];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Platform performance and student activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex rounded-md border overflow-hidden text-sm">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setDateRange(r); setPage(1); }}
                className={`px-3 py-1.5 transition-colors ${
                  dateRange === r
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.totalStudents ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered learners</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Lessons
                </CardTitle>
                <BookOpen className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.totalLessons ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Published lessons</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.completionRate ?? 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Of all enrollments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Improvement
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data && data.avgImprovement >= 0 ? "+" : ""}
                  {data?.avgImprovement ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Final vs initial score</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <ChartSkeleton title="Completions Over Time" />
            <ChartSkeleton title="Lessons by Completions" />
          </>
        ) : (
          <>
            {/* Line chart: completions over time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Completions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {data && data.completionChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.completionChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        labelFormatter={(v) => formatDate(String(v))}
                        formatter={(v) => [Number(v ?? 0), "Completions"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    No completion data in this period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar chart: lessons by completion count */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Lessons by Completions</CardTitle>
              </CardHeader>
              <CardContent>
                {data && data.lessonChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.lessonChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="title"
                        tick={{ fontSize: 10 }}
                        width={100}
                        tickFormatter={(v: string) =>
                          v.length > 14 ? v.slice(0, 14) + "…" : v
                        }
                      />
                      <Tooltip formatter={(v) => [Number(v ?? 0), "Completions"]} />
                      <Bar dataKey="completions" fill="#22c55e" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    No lesson data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Row 2: Score Trend */}
      {loading ? (
        <ChartSkeleton title="Average Score Trend" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Final Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data && data.scoreChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.scoreChart}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    labelFormatter={(v) => formatDate(String(v))}
                    formatter={(v) => [`${Number(v ?? 0)}%`, "Avg Score"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No score data in this period
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : data && data.studentsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No students yet</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        className="flex items-center text-xs font-medium"
                        onClick={() => toggleSort("name")}
                      >
                        Student <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center text-xs font-medium"
                        onClick={() => toggleSort("completedCount")}
                      >
                        Completed <SortIcon field="completedCount" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center text-xs font-medium"
                        onClick={() => toggleSort("avgScore")}
                      >
                        Avg Score <SortIcon field="avgScore" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center text-xs font-medium"
                        onClick={() => toggleSort("latestActivity")}
                      >
                        Last Activity <SortIcon field="latestActivity" />
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {student.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {student.completedCount} lessons
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.avgScore !== null ? (
                          <span
                            className={
                              student.avgScore >= 80
                                ? "text-green-600 font-medium"
                                : student.avgScore >= 60
                                ? "text-amber-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {student.avgScore}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {student.latestActivity
                          ? new Date(student.latestActivity).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
                  <p className="text-muted-foreground">
                    Showing {(data.pagination.page - 1) * data.pagination.pageSize + 1}–
                    {Math.min(
                      data.pagination.page * data.pagination.pageSize,
                      data.pagination.total
                    )}{" "}
                    of {data.pagination.total}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page >= data.pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
