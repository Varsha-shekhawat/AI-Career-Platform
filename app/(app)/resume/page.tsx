"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Search,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalysisResult = any;

export default function ResumeScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
      setResult(null);
    } else {
      setError("Please drop a PDF file.");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const clearFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    if (user?.email) {
      formData.append("userId", user.email);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Something went wrong during analysis.");
      }

      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "var(--accent-emerald)";
    if (score >= 60) return "var(--accent-amber)";
    return "var(--accent-rose)";
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "badge-green";
    if (score >= 60) return "badge-amber";
    return "badge-rose";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Critical";
  };

  const getCertBadgeClass = (cert: string) => {
    if (cert?.includes("Optimized")) return "badge-green";
    if (cert?.includes("Compatible") && !cert?.includes("Partially")) return "badge-blue";
    if (cert?.includes("Partially")) return "badge-amber";
    return "badge-rose";
  };

  // Calculate SVG circle progress
  const scorePercent = result ? result.ats_score / 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference * (1 - scorePercent);

  const sectionScoreLabels: { key: string; label: string; color: string }[] = [
    { key: "formatting", label: "Formatting", color: "var(--accent-blue)" },
    { key: "content", label: "Content Quality", color: "var(--accent-violet)" },
    { key: "skills", label: "Skills", color: "var(--accent-emerald)" },
    { key: "experience", label: "Experience", color: "var(--accent-amber)" },
    { key: "keywords", label: "Keywords", color: "var(--accent-rose)" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* ─── Header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold tracking-tight">
          ATS Resume <span className="gradient-text">Analyzer</span>
        </h2>
        <p className="mt-1.5" style={{ color: "var(--text-secondary)" }}>
          Upload your resume and get an instant AI-powered ATS compatibility
          score with detailed feedback
        </p>
      </motion.div>

      {/* ─── Upload Zone ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card p-8 mb-6"
      >
        {!file ? (
          <div
            className={`upload-zone p-10 flex flex-col items-center text-center ${dragOver ? "drag-over" : ""
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 animate-float"
              style={{ background: "var(--accent-blue-glow)" }}
            >
              <Upload
                className="w-7 h-7"
                style={{ color: "var(--accent-blue)" }}
                strokeWidth={1.5}
              />
            </div>
            <p className="font-semibold text-[15px] mb-1">
              Drop your resume here, or{" "}
              <span style={{ color: "var(--accent-blue)" }}>browse</span>
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Supports PDF files up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          /* File Selected */
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(99, 130, 255, 0.08)" }}
            >
              <FileText
                className="w-5 h-5"
                style={{ color: "var(--accent-blue)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {(file.size / 1024).toFixed(1)} KB · PDF
              </p>
            </div>
            <button
              onClick={clearFile}
              className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <X
                className="w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2.5 text-[15px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Resume
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-4 rounded-xl flex items-start gap-3"
              style={{
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
              }}
            >
              <AlertTriangle
                className="w-4 h-4 mt-0.5 shrink-0"
                style={{ color: "var(--accent-rose)" }}
              />
              <p className="text-sm" style={{ color: "var(--accent-rose)" }}>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Loading Skeleton ────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="glass-card p-8 flex items-center gap-6">
              <div className="w-28 h-28 rounded-full shimmer" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-48 rounded shimmer" />
                <div className="h-4 w-full rounded shimmer" />
                <div className="h-4 w-3/4 rounded shimmer" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-6 space-y-3">
                <div className="h-4 w-32 rounded shimmer" />
                <div className="h-3 w-full rounded shimmer" />
                <div className="h-3 w-5/6 rounded shimmer" />
                <div className="h-3 w-4/6 rounded shimmer" />
              </div>
              <div className="glass-card p-6 space-y-3">
                <div className="h-4 w-28 rounded shimmer" />
                <div className="h-3 w-full rounded shimmer" />
                <div className="h-3 w-5/6 rounded shimmer" />
                <div className="h-3 w-3/6 rounded shimmer" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Analysis Results ────────────────────── */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-8 flex flex-col md:flex-row items-center gap-8"
            >
              {/* Circular Score */}
              <div className="relative shrink-0">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 100 100"
                  className="-rotate-90"
                >
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="6"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getScoreColor(result.ats_score)}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="score-ring"
                    style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-3xl font-black"
                    style={{ color: getScoreColor(result.ats_score) }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {result.ats_score}
                  </motion.span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ATS
                  </span>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2 flex-wrap">
                  <h3 className="text-xl font-bold">
                    {result.candidate_name || "Candidate"}
                  </h3>
                  <span
                    className={`badge ${getScoreBadgeClass(result.ats_score)}`}
                  >
                    {getScoreLabel(result.ats_score)}
                  </span>
                  {result.ats_certification && (
                    <span
                      className={`badge ${getCertBadgeClass(result.ats_certification)}`}
                      style={{ fontSize: "11px" }}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {result.ats_certification}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {result.score_explanation}
                </p>
              </div>
            </motion.div>

            {/* Section Scores */}
            {result.section_scores && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(99, 130, 255, 0.1)" }}
                  >
                    <Sparkles
                      className="w-4 h-4"
                      style={{ color: "var(--accent-blue)" }}
                    />
                  </div>
                  <h4 className="font-semibold text-[15px]">
                    Section-by-Section Analysis
                  </h4>
                </div>
                <div className="space-y-4">
                  {sectionScoreLabels.map((section, i) => {
                    const score = result.section_scores[section.key] || 0;
                    return (
                      <motion.div
                        key={section.key}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 + 0.06 * i }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium">{section.label}</span>
                          <span
                            className="text-sm font-bold"
                            style={{ color: getScoreColor(score) }}
                          >
                            {score}%
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: section.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, delay: 0.3 + 0.06 * i, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass-card p-6"
                style={{ borderColor: "rgba(52, 211, 153, 0.15)" }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(52, 211, 153, 0.1)" }}
                  >
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{ color: "var(--accent-emerald)" }}
                    />
                  </div>
                  <h4 className="font-semibold text-[15px]">What Looks Good</h4>
                </div>
                <ul className="space-y-3">
                  {result.strengths?.map((item: string, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + 0.06 * i }}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: "var(--accent-emerald)" }}
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Weaknesses */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass-card p-6"
                style={{ borderColor: "rgba(244, 63, 94, 0.15)" }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(244, 63, 94, 0.1)" }}
                  >
                    <AlertTriangle
                      className="w-4 h-4"
                      style={{ color: "var(--accent-rose)" }}
                    />
                  </div>
                  <h4 className="font-semibold text-[15px]">Critical Flaws</h4>
                </div>
                <ul className="space-y-3">
                  {result.weaknesses?.map((item: string, i: number) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + 0.06 * i }}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: "var(--accent-rose)" }}
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Keyword Analysis */}
            {result.keyword_analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Found Keywords */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="glass-card p-6"
                  style={{ borderColor: "rgba(99, 130, 255, 0.15)" }}
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(99, 130, 255, 0.1)" }}
                    >
                      <Search
                        className="w-4 h-4"
                        style={{ color: "var(--accent-blue)" }}
                      />
                    </div>
                    <h4 className="font-semibold text-[15px]">Keywords Found</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keyword_analysis.found_keywords?.map(
                      (kw: string, i: number) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.45 + 0.04 * i }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            background: "rgba(99, 130, 255, 0.08)",
                            color: "var(--accent-blue)",
                            border: "1px solid rgba(99, 130, 255, 0.15)",
                          }}
                        >
                          {kw}
                        </motion.span>
                      )
                    )}
                  </div>
                </motion.div>

                {/* Missing Keywords */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="glass-card p-6"
                  style={{ borderColor: "rgba(251, 191, 36, 0.15)" }}
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(251, 191, 36, 0.1)" }}
                    >
                      <AlertCircle
                        className="w-4 h-4"
                        style={{ color: "var(--accent-amber)" }}
                      />
                    </div>
                    <h4 className="font-semibold text-[15px]">Missing Keywords</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keyword_analysis.missing_keywords?.map(
                      (kw: string, i: number) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.45 + 0.04 * i }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            background: "rgba(251, 191, 36, 0.08)",
                            color: "var(--accent-amber)",
                            border: "1px solid rgba(251, 191, 36, 0.15)",
                          }}
                        >
                          + {kw}
                        </motion.span>
                      )
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Missing Sections */}
            {result.missing_sections && result.missing_sections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                className="glass-card p-6"
                style={{ borderColor: "rgba(244, 63, 94, 0.15)" }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(244, 63, 94, 0.1)" }}
                  >
                    <AlertTriangle
                      className="w-4 h-4"
                      style={{ color: "var(--accent-rose)" }}
                    />
                  </div>
                  <h4 className="font-semibold text-[15px]">Missing Sections</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missing_sections.map((section: string, i: number) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.5 + 0.04 * i }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: "rgba(244, 63, 94, 0.08)",
                        color: "var(--accent-rose)",
                        border: "1px solid rgba(244, 63, 94, 0.15)",
                      }}
                    >
                      {section}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="glass-card p-6"
              style={{ borderColor: "rgba(99, 130, 255, 0.15)" }}
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(99, 130, 255, 0.1)" }}
                >
                  <Lightbulb
                    className="w-4 h-4"
                    style={{ color: "var(--accent-blue)" }}
                  />
                </div>
                <h4 className="font-semibold text-[15px]">
                  How to Improve Your Score
                </h4>
              </div>
              <ul className="space-y-3">
                {result.recommendations?.map((item: string, i: number) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.55 + 0.06 * i }}
                    className="flex items-start gap-3 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold"
                      style={{
                        background: "rgba(99, 130, 255, 0.1)",
                        color: "var(--accent-blue)",
                      }}
                    >
                      {i + 1}
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Analyze Another */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="text-center pt-2"
            >
              <button
                onClick={clearFile}
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--accent-blue)" }}
              >
                ← Analyze another resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}