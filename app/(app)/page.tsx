"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Award,
  BarChart3,
  Clock,
  ArrowUpRight,
  FileText,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Analysis {
  id: string;
  fileName: string;
  candidateName: string;
  atsScore: number;
  createdAt: string;
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAnalyses() {
      if (!user?.email) return;
      try {
        const res = await fetch(`/api/analyses?userId=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success) {
          setAnalyses(data.analyses);
        }
      } catch (err) {
        console.error("Failed to fetch analyses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalyses();
  }, [user?.email]);

  const totalAnalyses = analyses.length;
  const avgScore =
    totalAnalyses > 0
      ? Math.round(
        analyses.reduce((sum, a) => sum + a.atsScore, 0) / totalAnalyses
      )
      : 0;
  const bestScore =
    totalAnalyses > 0 ? Math.max(...analyses.map((a) => a.atsScore)) : 0;
  const latestScore = totalAnalyses > 0 ? analyses[0].atsScore : 0;

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "badge-green";
    if (score >= 60) return "badge-amber";
    return "badge-rose";
  };

  const stats = [
    {
      label: "Total Analyses",
      value: totalAnalyses,
      icon: BarChart3,
      color: "var(--accent-blue)",
    },
    {
      label: "Average Score",
      value: avgScore > 0 ? `${avgScore}%` : "—",
      icon: TrendingUp,
      color: "var(--accent-violet)",
    },
    {
      label: "Best Score",
      value: bestScore > 0 ? `${bestScore}%` : "—",
      icon: Award,
      color: "var(--accent-emerald)",
    },
    {
      label: "Latest Score",
      value: latestScore > 0 ? `${latestScore}%` : "—",
      icon: Clock,
      color: "var(--accent-amber)",
    },
  ];

  const tools = [
    {
      title: "Resume Analyzer",
      desc: "Get your ATS score and AI-powered feedback on your resume",
      icon: FileSearch,
      href: "/resume",
      gradient: "linear-gradient(135deg, #6382ff, #8b5cf6)",
    },
    {
      title: "Job Match",
      desc: "Match your resume against real job descriptions",
      icon: Briefcase,
      href: "/job-match",
      gradient: "linear-gradient(135deg, #34d399, #6382ff)",
    },
    {
      title: "Mock Interview",
      desc: "Practice interviews with an AI interviewer",
      icon: MessageSquare,
      href: "/interview",
      gradient: "linear-gradient(135deg, #f43f5e, #fbbf24)",
    },
  ];

  // Build SVG chart data points (last 7 analyses, reversed to show chronological)
  const chartData = analyses
    .slice(0, 7)
    .reverse()
    .map((a) => a.atsScore);

  return (
    <div className="max-w-6xl mx-auto">
      {/* ─── Header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="gradient-text">{user?.fullName?.split(" ")[0] || ""} ✦</span>
        </h2>
        <p className="mt-1.5" style={{ color: "var(--text-secondary)" }}>
          Your AI career toolkit at a glance
        </p>
      </motion.div>

      {/* ─── Stats Row ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {loading ? (
                      <span className="inline-block w-12 h-7 rounded shimmer" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                    strokeWidth={1.8}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Score Trend Chart ────────────────────── */}
      <AnimatePresence>
        {chartData.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="glass-card p-6 mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm">Score Trend</h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Your last {chartData.length} analyses
                </p>
              </div>
              <TrendingUp
                className="w-4 h-4"
                style={{ color: "var(--accent-emerald)" }}
              />
            </div>
            <svg
              viewBox="0 0 400 100"
              className="w-full h-24"
              preserveAspectRatio="none"
            >
              {/* Gradient fill */}
              <defs>
                <linearGradient
                  id="chartGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--accent-blue)"
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--accent-blue)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              {/* Area */}
              <path
                d={`M ${chartData
                  .map(
                    (score, i) =>
                      `${(i / (chartData.length - 1)) * 400},${100 - score}`
                  )
                  .join(" L ")} L 400,100 L 0,100 Z`}
                fill="url(#chartGradient)"
              />
              {/* Line */}
              <path
                d={`M ${chartData
                  .map(
                    (score, i) =>
                      `${(i / (chartData.length - 1)) * 400},${100 - score}`
                  )
                  .join(" L ")}`}
                fill="none"
                stroke="var(--accent-blue)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {chartData.map((score, i) => (
                <circle
                  key={i}
                  cx={(i / (chartData.length - 1)) * 400}
                  cy={100 - score}
                  r="4"
                  fill="var(--bg-primary)"
                  stroke="var(--accent-blue)"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Tools Grid ──────────────────────────── */}
      <div className="mt-8">
        <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          AI Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + 0.05 * i }}
              >
                <Link href={tool.href}>
                  <div className="glass-card p-6 group cursor-pointer relative overflow-hidden h-full">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: tool.gradient }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-semibold text-[15px] mb-1.5 flex items-center gap-2">
                      {tool.title}
                      <ArrowUpRight
                        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity -translate-x-1 group-hover:translate-x-0"
                        style={{
                          color: "var(--text-secondary)",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Recent Analyses ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: "var(--text-secondary)" }}>
            Recent Analyses
          </h3>
          {analyses.length > 5 && (
            <Link
              href="/resume"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--accent-blue)" }}
            >
              View all →
            </Link>
          )}
        </div>

        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 rounded shimmer" />
                    <div className="h-3 w-24 rounded shimmer" />
                  </div>
                  <div className="h-6 w-14 rounded-full shimmer" />
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "var(--accent-blue-glow)" }}
              >
                <Sparkles
                  className="w-7 h-7"
                  style={{ color: "var(--accent-blue)" }}
                />
              </div>
              <h4 className="font-semibold mb-1.5">No analyses yet</h4>
              <p
                className="text-sm mb-5 max-w-xs mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                Upload your first resume to get an AI-powered ATS score and
                detailed feedback
              </p>
              <Link href="/resume">
                <button className="btn-primary text-sm">
                  Analyze Your Resume
                </button>
              </Link>
            </div>
          ) : (
            /* Analyses List */
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {analyses.slice(0, 5).map((analysis, i) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(99, 130, 255, 0.08)" }}
                  >
                    <FileText
                      className="w-4 h-4"
                      style={{ color: "var(--accent-blue)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {analysis.candidateName}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {analysis.fileName} ·{" "}
                      {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`badge ${getScoreBadge(analysis.atsScore)}`}>
                    {analysis.atsScore}%
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
