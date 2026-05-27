"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardData = {
  stats?: {
    ats_avg?: number;
    interviews_taken?: number;
    roadmap_progress?: number;
    skills_improved?: number;
  };
  ats_trend?: Array<{ score?: number; createdAt?: string }>;
  interview_scores?: Array<{ score?: number; createdAt?: string }>;
  recent_activity?: Array<{ action?: string; detail?: string; createdAt?: string }>;
  interview_history?: Array<{ role?: string; company?: string; avg_score?: number; createdAt?: string }>;
  ai_insights?: string[];
  company_readiness?: Record<string, number>;
};

type StatCardProps = {
  label: string;
  value: number;
  suffix?: string;
  delta?: string;
  accent: string;
  description: string;
};

function useAnimatedNumber(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const steps = 24;
    const increment = target / steps;
    const timer = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        window.clearInterval(timer);
      } else {
        setValue(Math.round(current));
      }
    }, 28);

    return () => window.clearInterval(timer);
  }, [target]);

  return value;
}

function StatCard({ label, value, suffix = "", delta, accent, description }: StatCardProps) {
  const animatedValue = useAnimatedNumber(value);

  return (
    <div className="glass-card group relative overflow-hidden border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20 transition-opacity duration-300 group-hover:opacity-30`} />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">{label}</p>
        <div className="mt-4 flex items-end gap-2">
          <h3 className="text-4xl font-semibold text-white">{animatedValue}{suffix}</h3>
          {delta && <span className="mb-1 text-sm font-medium text-emerald-400">{delta}</span>}
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card border border-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_80%_0%,_rgba(139,92,246,0.18),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#050507_100%)] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
        <div className="glass-card border border-white/10 p-6">
          <div className="h-4 w-40 rounded-full bg-white/10" />
          <div className="mt-5 h-10 w-3/4 rounded-2xl bg-white/10" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-white/10" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card border border-white/10 p-6">
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="mt-4 h-10 w-24 rounded-2xl bg-white/10" />
              <div className="mt-4 h-3 w-full rounded-full bg-white/10" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card border border-white/10 p-6">
                <div className="h-5 w-32 rounded-full bg-white/10" />
                <div className="mt-6 h-72 rounded-3xl bg-white/5" />
              </div>
              <div className="glass-card border border-white/10 p-6">
                <div className="h-5 w-32 rounded-full bg-white/10" />
                <div className="mt-6 h-72 rounded-3xl bg-white/5" />
              </div>
            </div>
            <div className="glass-card border border-white/10 p-6">
              <div className="h-5 w-32 rounded-full bg-white/10" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-card border border-white/10 p-6">
              <div className="h-5 w-32 rounded-full bg-white/10" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
            <div className="glass-card border border-white/10 p-6">
              <div className="h-5 w-32 rounded-full bg-white/10" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatRelativeTime(value?: string) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatAxisLabel(value?: string, fallback = "") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id || session?.user?.email || "";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      return;
    }

    const controller = new AbortController();

    const loadDashboard = async () => {
      setLoadingData(true);
      setError(null);

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/dashboard-data?userId=${encodeURIComponent(userId)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError("Unable to load dashboard data right now.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingData(false);
        }
      }
    };

    loadDashboard();

    return () => controller.abort();
  }, [status, userId]);

  if (status === "loading" || loadingData) {
    return <LoadingSkeleton />;
  }

  if (status === "unauthenticated") {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_80%_0%,_rgba(139,92,246,0.18),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#050507_100%)] px-6 py-10 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="glass-card border border-white/10 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <h1 className="text-3xl font-semibold text-white">Dashboard unavailable</h1>
            <p className="mt-4 text-zinc-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  const stats = dashboardData?.stats ?? {};
  const atsTrend = (dashboardData?.ats_trend ?? []).map((item, index) => ({
    name: formatAxisLabel(item.createdAt, `#${index + 1}`),
    score: item.score ?? 0,
  }));
  const interviewScores = (dashboardData?.interview_scores ?? []).map((item, index) => ({
    name: formatAxisLabel(item.createdAt, `#${index + 1}`),
    score: item.score ?? 0,
  }));
  const activityFeed = dashboardData?.recent_activity ?? [];
  const interviewHistory = dashboardData?.interview_history ?? [];
  const aiInsights = dashboardData?.ai_insights ?? [];
  const companyReadiness = dashboardData?.company_readiness ?? {};

  const userName = session?.user?.name || "User";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const statCards = [
    {
      label: "ATS Avg Score",
      value: stats.ats_avg ?? 0,
      suffix: "%",
      delta: "Live data",
      accent: "from-cyan-500/30 to-blue-500/30",
      description: "Average ATS compatibility across your resume reports.",
    },
    {
      label: "Interviews",
      value: stats.interviews_taken ?? 0,
      suffix: "",
      delta: "Completed",
      accent: "from-violet-500/30 to-fuchsia-500/30",
      description: "Total mock interview sessions saved to your workspace.",
    },
    {
      label: "Roadmap",
      value: stats.roadmap_progress ?? 0,
      suffix: "% complete",
      delta: "Tracked",
      accent: "from-emerald-500/30 to-green-500/30",
      description: "Average progress across your generated career roadmaps.",
    },
    {
      label: "Skills Gained",
      value: stats.skills_improved ?? 0,
      suffix: "",
      delta: "Unique",
      accent: "from-amber-500/30 to-orange-500/30",
      description: "Unique skills matched across your latest resume reports.",
    },
  ];

  const readinessCards = [
    { name: "Google", value: companyReadiness.Google ?? 0, accent: "from-cyan-400 to-blue-500" },
    { name: "Amazon", value: companyReadiness.Amazon ?? 0, accent: "from-amber-400 to-orange-500" },
    { name: "Startup", value: companyReadiness.Startup ?? 0, accent: "from-emerald-400 to-green-500" },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_80%_0%,_rgba(139,92,246,0.18),_transparent_24%),linear-gradient(180deg,_#09090b_0%,_#050507_100%)] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="glass-card border border-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
                AI Career Command Center
              </div>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Welcome back, <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">{userName}</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Track ATS performance, interview readiness, roadmap progress, and AI recommendations in one live workspace.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-2xl font-bold text-black shadow-lg shadow-cyan-500/20">
                {userInitials}
              </div>
              <div>
                <p className="text-sm text-zinc-400">Signed in as</p>
                <p className="text-lg font-semibold text-white">{session?.user?.email || "Session active"}</p>
                <p className="text-sm text-emerald-400">Analytics live • session ready</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard eyebrow="Performance" title="ATS Score Trend">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={atsTrend}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(9,9,11,0.94)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 16,
                          color: "#fafafa",
                        }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard eyebrow="Interview" title="Interview Scores">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interviewScores}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(9,9,11,0.94)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 16,
                          color: "#fafafa",
                        }}
                      />
                      <Bar dataKey="score" radius={[12, 12, 0, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            <SectionCard eyebrow="Activity" title="Recent Activity">
              <div className="space-y-4">
                {activityFeed.length > 0 ? activityFeed.map((item, index) => (
                  <div key={`${item.action || "activity"}-${index}`} className="group flex items-start gap-4 rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/5">
                    <div className="mt-1 h-3 w-3 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_18px_rgba(255,255,255,0.18)]" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-white">{item.action || "Activity"}</p>
                        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{formatRelativeTime(item.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">{item.detail || "No details available."}</p>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-zinc-400">
                    No activity yet. Analyze a resume or complete an interview to populate the timeline.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard eyebrow="History" title="Interview History">
              <div className="overflow-hidden rounded-2xl border border-white/8">
                <table className="min-w-full divide-y divide-white/8 text-left">
                  <thead className="bg-white/4 text-xs uppercase tracking-[0.24em] text-zinc-500">
                    <tr>
                      <th className="px-5 py-4 font-medium">Role</th>
                      <th className="px-5 py-4 font-medium">Company</th>
                      <th className="px-5 py-4 font-medium">Score</th>
                      <th className="px-5 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 bg-white/3">
                    {interviewHistory.length > 0 ? interviewHistory.map((row, index) => {
                      const score = row.avg_score ?? 0;
                      const scoreTone = score >= 75 ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" : score >= 50 ? "text-amber-300 bg-amber-500/10 border-amber-500/20" : "text-red-300 bg-red-500/10 border-red-500/20";

                      return (
                        <tr key={`${row.company || "company"}-${row.role || "role"}-${index}`} className="transition hover:bg-white/5">
                          <td className="px-5 py-4 font-medium text-white">{row.role || "Unknown role"}</td>
                          <td className="px-5 py-4 text-zinc-300">{row.company || "Unknown company"}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${scoreTone}`}>
                              {score}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-zinc-400">{formatRelativeTime(row.createdAt)}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td className="px-5 py-6 text-sm text-zinc-400" colSpan={4}>
                          No interview history yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard eyebrow="Profile" title="User Profile Sidebar">
              <div className="space-y-5">
                <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/8 to-white/3 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-2xl font-bold text-black">
                      {userInitials}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{userName}</p>
                      <p className="text-sm text-zinc-400">Target role: AI Engineer</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-zinc-500">ATS Avg</p>
                      <p className="mt-1 text-xl font-semibold text-white">{stats.ats_avg ?? 0}%</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-zinc-500">Sessions</p>
                      <p className="mt-1 text-xl font-semibold text-white">{stats.interviews_taken ?? 0}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500">AI Insights</p>
                  <ul className="space-y-3 text-sm leading-7 text-zinc-300">
                    {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
                      <li key={`${insight}-${index}`} className="flex gap-3 rounded-2xl border border-white/8 bg-white/3 p-4">
                        <span className="mt-1">💡</span>
                        <span>{insight}</span>
                      </li>
                    )) : (
                      <li className="rounded-2xl border border-white/8 bg-white/3 p-4 text-zinc-400">No AI insights yet.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500">Company Readiness</p>
                  <div className="space-y-3">
                    {readinessCards.map((company) => (
                      <div key={company.name} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-white">{company.name}</p>
                          <span className="text-sm font-semibold text-cyan-300">{company.value}%</span>
                        </div>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${company.accent}`}
                            style={{ width: `${company.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-500">Quick Actions</p>
                  <div className="grid gap-3">
                    <Link href="/mock_interview" className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-500/15">
                      Start Mock Interview
                    </Link>
                    <Link href="/resume-analysis" className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:-translate-y-0.5 hover:bg-violet-500/15">
                      Analyze Resume
                    </Link>
                    <Link href="/career_roadmap" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-500/15">
                      Generate Roadmap
                    </Link>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard eyebrow="Summary" title="Interview Performance Summary">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Average interview score</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{stats.interviews_taken ? `${Math.round((interviewHistory.reduce((sum, row) => sum + (row.avg_score ?? 0), 0) / Math.max(interviewHistory.length, 1)) || 0)}/100` : "0/100"}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Roadmap progress</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">Your average roadmap progress is {stats.roadmap_progress ?? 0}%. Keep building toward your next milestone.</p>
                </div>
              </div>
            </SectionCard>
          </aside>
        </section>
      </div>
    </main>
  );
}