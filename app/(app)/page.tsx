"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      ? Math.round(analyses.reduce((sum, a) => sum + a.atsScore, 0) / totalAnalyses)
      : 0;
  const bestScore =
    totalAnalyses > 0 ? Math.max(...analyses.map((a) => a.atsScore)) : 0;
  const latestScore = totalAnalyses > 0 ? analyses[0].atsScore : 0;

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "badge-green";
    if (score >= 60) return "badge-amber";
    return "badge-rose";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "ATS Optimized";
    if (score >= 60) return "Competitive";
    if (score >= 40) return "Needs Revision";
    return "Critical Flaws";
  };

  // Build SVG chart data points (last 7 analyses, reversed to show chronological)
  const chartData = analyses
    .slice(0, 7)
    .reverse()
    .map((a) => a.atsScore);

  const userName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      {/* ─── Editorial Header ─────────────────────────────── */}
      <div className="border-b border-[#E8E5DC] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#82877B] font-semibold">
              Career Intelligence Ledger
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#181916] mt-1">
              Welcome back, {userName}.
            </h1>
          </div>
          <div className="text-xs text-[#82877B] font-mono">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
        <p className="text-sm text-[#505449] mt-2 max-w-2xl">
          Real-time summary of resume calibration, role-fit readiness, and simulated interview performance.
        </p>
      </div>

      {/* ─── Primary Intelligence Hero Section ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Score & Trajectory Analysis (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-4 mb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
                  ATS Calibration
                </span>
                <h2 className="text-base font-semibold text-[#181916] mt-0.5">
                  Latest Resume Benchmark
                </h2>
              </div>
              {totalAnalyses > 0 && (
                <span className={`badge ${getScoreBadge(latestScore)}`}>
                  {getScoreLabel(latestScore)}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-12 space-y-3">
                <div className="h-6 w-32 skeleton" />
                <div className="h-4 w-full skeleton" />
                <div className="h-24 w-full skeleton" />
              </div>
            ) : totalAnalyses === 0 ? (
              <div className="py-8 text-center sm:text-left">
                <p className="text-sm text-[#505449] mb-4">
                  No resume audits recorded yet. Upload your PDF resume to generate an instant ATS compatibility score, parse keyword vulnerabilities, and review actionable feedback.
                </p>
                <Link href="/resume" className="btn-primary text-xs">
                  Run First Resume Audit →
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-editorial text-5xl font-normal text-[#181916]">
                    {latestScore}%
                  </span>
                  <span className="text-xs text-[#82877B]">
                    for <strong className="text-[#181916]">{analyses[0]?.candidateName || "Candidate"}</strong> ({analyses[0]?.fileName})
                  </span>
                </div>

                <p className="text-xs text-[#505449] leading-relaxed mb-6">
                  Calculated using structural parseability, keyword density, section completion, and formatting compliance against enterprise applicant tracking systems.
                </p>

                {/* Score Trend SVG */}
                {chartData.length >= 2 ? (
                  <div className="bg-[#FAF9F5] border border-[#E8E5DC] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#82877B]">
                        Historical Trajectory ({chartData.length} submissions)
                      </span>
                      <span className="text-[11px] font-mono text-[#133B2E]">
                        {chartData[0]}% → {chartData[chartData.length - 1]}%
                      </span>
                    </div>
                    <svg viewBox="0 0 400 90" className="w-full h-20 overflow-visible" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#E8E5DC" strokeDasharray="3 3" />
                      <line x1="0" y1="55" x2="400" y2="55" stroke="#E8E5DC" strokeDasharray="3 3" />

                      {/* Area */}
                      <path
                        d={`M ${chartData
                          .map((score, i) => `${(i / (chartData.length - 1)) * 400},${90 - (score * 0.75)}`)
                          .join(" L ")} L 400,90 L 0,90 Z`}
                        fill="#EDF4F1"
                      />

                      {/* Line */}
                      <path
                        d={`M ${chartData
                          .map((score, i) => `${(i / (chartData.length - 1)) * 400},${90 - (score * 0.75)}`)
                          .join(" L ")}`}
                        fill="none"
                        stroke="#133B2E"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Dots */}
                      {chartData.map((score, i) => (
                        <circle
                          key={i}
                          cx={(i / (chartData.length - 1)) * 400}
                          cy={90 - (score * 0.75)}
                          r="3.5"
                          fill="#FFFFFF"
                          stroke="#133B2E"
                          strokeWidth="2"
                        />
                      ))}
                    </svg>
                  </div>
                ) : (
                  <div className="text-xs text-[#82877B] bg-[#FAF9F5] p-3 rounded border border-[#E8E5DC]">
                    Trajectory trendline will activate after 2 or more resume audits.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-[#E8E5DC] flex items-center justify-between text-xs">
            <span className="text-[#82877B]">Standard: Enterprise ATS Rubric v2.4</span>
            <Link href="/resume" className="text-[#133B2E] font-semibold hover:underline">
              Analyze New Resume →
            </Link>
          </div>
        </div>

        {/* Right: Key Metric Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
              Summary Metrics
            </span>
            <h2 className="text-base font-semibold text-[#181916] mt-0.5 mb-5 pb-4 border-b border-[#E8E5DC]">
              Performance Ledger
            </h2>

            <div className="divide-y divide-[#E8E5DC]">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#181916]">Total Audits Completed</p>
                  <p className="text-[11px] text-[#82877B]">Archived resume scans</p>
                </div>
                <span className="font-mono text-base font-semibold text-[#181916]">
                  {loading ? "..." : totalAnalyses}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#181916]">Average Compatibility</p>
                  <p className="text-[11px] text-[#82877B]">Across all revisions</p>
                </div>
                <span className="font-mono text-base font-semibold text-[#181916]">
                  {loading ? "..." : avgScore > 0 ? `${avgScore}%` : "—"}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#181916]">Peak Benchmark</p>
                  <p className="text-[11px] text-[#82877B]">Highest recorded score</p>
                </div>
                <span className="font-mono text-base font-semibold text-[#165636]">
                  {loading ? "..." : bestScore > 0 ? `${bestScore}%` : "—"}
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#181916]">Readiness Assessment</p>
                  <p className="text-[11px] text-[#82877B]">Overall market positioning</p>
                </div>
                <span className="text-xs font-medium text-[#181916]">
                  {loading ? "..." : totalAnalyses === 0 ? "Not Assessed" : latestScore >= 75 ? "Market Ready" : "Optimization Advised"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#E8E5DC] text-xs text-[#82877B]">
            Data synced with active profile session.
          </div>
        </div>
      </div>

      {/* ─── Structured Workflow Launchers ────────────────── */}
      <div>
        <div className="mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
            Intelligence Modules
          </span>
          <h2 className="text-lg font-semibold text-[#181916] mt-0.5">
            Core Career Workflows
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Module 1: Resume Analyzer */}
          <Link
            href="/resume"
            className="group bg-[#FFFFFF] border border-[#E8E5DC] hover:border-[#133B2E] rounded-xl p-6 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded bg-[#EDF4F1] text-[#133B2E] flex items-center justify-center font-bold text-xs mb-4">
                01
              </div>
              <h3 className="text-base font-semibold text-[#181916] group-hover:text-[#133B2E] flex items-center justify-between">
                <span>ATS Resume Scanner</span>
                <span className="text-xs text-[#82877B] group-hover:text-[#133B2E] transition-colors">→</span>
              </h3>
              <p className="text-xs text-[#505449] mt-2 leading-relaxed">
                Scan your PDF resume against applicant tracking rubrics to uncover missing keywords, formatting errors, and section gaps.
              </p>
            </div>
            <div className="pt-4 mt-5 border-t border-[#E8E5DC] flex items-center justify-between text-[11px] text-[#82877B]">
              <span>Input: PDF Document</span>
              <span className="font-semibold text-[#133B2E]">Launch Audit</span>
            </div>
          </Link>

          {/* Module 2: Job Match */}
          <Link
            href="/job-match"
            className="group bg-[#FFFFFF] border border-[#E8E5DC] hover:border-[#133B2E] rounded-xl p-6 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded bg-[#FAF5E8] text-[#854D0E] flex items-center justify-center font-bold text-xs mb-4">
                02
              </div>
              <h3 className="text-base font-semibold text-[#181916] group-hover:text-[#133B2E] flex items-center justify-between">
                <span>Role Fit Gap Analysis</span>
                <span className="text-xs text-[#82877B] group-hover:text-[#133B2E] transition-colors">→</span>
              </h3>
              <p className="text-xs text-[#505449] mt-2 leading-relaxed">
                Compare your resume against specific target job descriptions to identify qualification gaps, missing skills, and alignment opportunities.
              </p>
            </div>
            <div className="pt-4 mt-5 border-t border-[#E8E5DC] flex items-center justify-between text-[11px] text-[#82877B]">
              <span>Input: Resume + Job Spec</span>
              <span className="font-semibold text-[#133B2E]">Analyze Match</span>
            </div>
          </Link>

          {/* Module 3: Mock Interview */}
          <Link
            href="/interview"
            className="group bg-[#FFFFFF] border border-[#E8E5DC] hover:border-[#133B2E] rounded-xl p-6 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded bg-[#F1F5F9] text-[#334155] flex items-center justify-center font-bold text-xs mb-4">
                03
              </div>
              <h3 className="text-base font-semibold text-[#181916] group-hover:text-[#133B2E] flex items-center justify-between">
                <span>Mock Technical Interview</span>
                <span className="text-xs text-[#82877B] group-hover:text-[#133B2E] transition-colors">→</span>
              </h3>
              <p className="text-xs text-[#505449] mt-2 leading-relaxed">
                Conduct simulated technical and behavioral interviews tailored to your role and seniority, with immediate critique on each answer.
              </p>
            </div>
            <div className="pt-4 mt-5 border-t border-[#E8E5DC] flex items-center justify-between text-[11px] text-[#82877B]">
              <span>Input: Role & Seniority</span>
              <span className="font-semibold text-[#133B2E]">Start Simulation</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Recent Analyses Audit Log ────────────────────── */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E8E5DC]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
              Audit Log
            </span>
            <h2 className="text-base font-semibold text-[#181916] mt-0.5">
              Recent Resume Analyses
            </h2>
          </div>
          {analyses.length > 0 && (
            <Link href="/resume" className="text-xs font-semibold text-[#133B2E] hover:underline">
              Run New Scan →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-full skeleton" />
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#DCD8CD] rounded-lg bg-[#FAF9F5]">
            <p className="text-xs uppercase tracking-wider font-semibold text-[#82877B] mb-1">
              Empty Audit Ledger
            </p>
            <p className="text-sm text-[#505449] max-w-sm mx-auto mb-4">
              Your completed resume audits and ATS compatibility scores will appear in this ledger.
            </p>
            <Link href="/resume" className="btn-primary text-xs">
              Upload Resume for Audit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DC] text-[#82877B] uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Candidate</th>
                  <th className="py-2.5 font-semibold">File Name</th>
                  <th className="py-2.5 font-semibold">Date Analyzed</th>
                  <th className="py-2.5 font-semibold text-right">ATS Score</th>
                  <th className="py-2.5 font-semibold text-right">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DC]">
                {analyses.slice(0, 6).map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3 font-semibold text-[#181916]">
                      {analysis.candidateName}
                    </td>
                    <td className="py-3 font-mono text-[#505449]">
                      {analysis.fileName}
                    </td>
                    <td className="py-3 text-[#82877B]">
                      {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-[#181916]">
                      {analysis.atsScore}%
                    </td>
                    <td className="py-3 text-right">
                      <span className={`badge ${getScoreBadge(analysis.atsScore)}`}>
                        {getScoreLabel(analysis.atsScore)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
