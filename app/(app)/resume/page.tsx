"use client";

import { useState, useRef, useCallback } from "react";
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
      setError("Please drop a valid PDF document.");
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
      setError("Please select or drop a PDF resume file.");
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
        throw new Error(data.error || "Analysis failed. Please ensure the PDF is valid.");
      }

      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeClass = (score: number) => {
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

  const getCertBadgeClass = (cert: string) => {
    if (cert?.includes("Optimized")) return "badge-green";
    if (cert?.includes("Compatible") && !cert?.includes("Partially")) return "badge-brand";
    if (cert?.includes("Partially")) return "badge-amber";
    return "badge-rose";
  };

  const sectionScoreLabels: { key: string; label: string; desc: string }[] = [
    { key: "formatting", label: "Structural Formatting", desc: "Hierarchy, margins, fonts, parseability" },
    { key: "content", label: "Content Quality", desc: "Action verbs, quantifiable impact, brevity" },
    { key: "skills", label: "Skills Density", desc: "Core technical tools & frameworks" },
    { key: "experience", label: "Experience Relevance", desc: "Seniority trajectory & responsibility" },
    { key: "keywords", label: "Keyword Matching", desc: "Industry terminology alignment" },
  ];

  const scorePercent = result ? result.ats_score / 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - scorePercent);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="border-b border-[#E8E5DC] pb-5">
        <span className="text-xs uppercase tracking-wider text-[#82877B] font-semibold">
          Audit Module 01
        </span>
        <h1 className="font-editorial text-3xl font-normal text-[#181916] mt-1">
          ATS Resume Analyzer
        </h1>
        <p className="text-sm text-[#505449] mt-1.5 max-w-2xl">
          Evaluate your resume against enterprise Applicant Tracking System (ATS) parsing models. Discover structural flaws, keyword density gaps, and section completeness.
        </p>
      </div>

      {/* ─── File Upload Section ──────────────────────────── */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7">
        {!file ? (
          <div
            className={`upload-zone p-10 flex flex-col items-center text-center ${
              dragOver ? "drag-over" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-[#EDF4F1] text-[#133B2E] flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="font-semibold text-sm text-[#181916]">
              Click to select or drag and drop your PDF resume
            </p>
            <p className="text-xs text-[#82877B] mt-1">
              Supports single or multi-page PDF documents up to 10MB
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#FAF9F5] border border-[#E8E5DC]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded bg-[#EDF4F1] text-[#133B2E] flex items-center justify-center font-bold text-xs shrink-0">
                PDF
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#181916] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[#82877B] mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB · Ready for parsing
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="text-xs font-semibold text-[#991B1B] hover:underline"
            >
              Remove document
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5 pt-5 border-t border-[#E8E5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-[#82877B]">
            All uploaded files are analyzed in a secure sandbox.
          </span>
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-primary text-sm py-2 px-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Evaluating Rubric & Parsing PDF...</span>
              </span>
            ) : (
              <span>Start ATS Compatibility Audit →</span>
            )}
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#991B1B] flex items-start gap-2">
            <span className="font-bold shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ─── Loading State ────────────────────────────────── */}
      {loading && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin text-[#133B2E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-semibold text-[#181916]">
              Running Multi-Stage ATS Analysis...
            </p>
          </div>
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-3/4 skeleton" />
          <div className="h-20 w-full skeleton mt-4" />
        </div>
      )}

      {/* ─── Analysis Results Presentation ────────────────── */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Executive Score Summary */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Circular Gauge */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E8E5DC" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#133B2E"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-editorial text-3xl font-normal text-[#181916]">
                    {result.ats_score}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#82877B]">
                    Score / 100
                  </span>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <h2 className="text-xl font-bold text-[#181916]">
                    {result.candidate_name || "Candidate Audit"}
                  </h2>
                  <span className={`badge ${getScoreBadgeClass(result.ats_score)}`}>
                    {getScoreLabel(result.ats_score)}
                  </span>
                  {result.ats_certification && (
                    <span className={`badge ${getCertBadgeClass(result.ats_certification)}`}>
                      {result.ats_certification}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#505449] leading-relaxed">
                  {result.score_explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Section Breakdown Grid */}
          {result.section_scores && (
            <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
                Rubric Evaluation
              </span>
              <h3 className="text-base font-semibold text-[#181916] mt-0.5 mb-5 pb-3 border-b border-[#E8E5DC]">
                Section-by-Section Scores
              </h3>
              <div className="space-y-4">
                {sectionScoreLabels.map((sec) => {
                  const score = result.section_scores[sec.key] || 0;
                  return (
                    <div key={sec.key} className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs">
                        <div>
                          <span className="font-semibold text-[#181916]">{sec.label}</span>
                          <span className="text-[#82877B] ml-2 hidden sm:inline">· {sec.desc}</span>
                        </div>
                        <span className="font-mono font-bold text-[#181916]">{score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#EBE8DE] overflow-hidden">
                        <div
                          className="h-full bg-[#133B2E] rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2-Column Strengths vs Vulnerabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E5DC]">
                <span className="w-2 h-2 rounded-full bg-[#165636]" />
                <h3 className="text-sm font-semibold text-[#181916]">
                  Validated Strengths ({result.strengths?.length || 0})
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#505449]">
                {result.strengths?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#165636] font-bold">✓</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E5DC]">
                <span className="w-2 h-2 rounded-full bg-[#991B1B]" />
                <h3 className="text-sm font-semibold text-[#181916]">
                  Critical Flaws & Vulnerabilities ({result.weaknesses?.length || 0})
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#505449]">
                {result.weaknesses?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#991B1B] font-bold">✕</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Keyword Intelligence Matrix */}
          {result.keyword_analysis && (
            <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
                Terminology Audit
              </span>
              <h3 className="text-base font-semibold text-[#181916] mt-0.5 mb-5 pb-3 border-b border-[#E8E5DC]">
                Keyword Extraction Matrix
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-[#181916] mb-3">
                    Keywords Detected in Resume ({result.keyword_analysis.found_keywords?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_analysis.found_keywords?.map((kw: string, i: number) => (
                      <span key={i} className="badge badge-brand text-xs font-normal">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#181916] mb-3">
                    Missing High-Value Keywords ({result.keyword_analysis.missing_keywords?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_analysis.missing_keywords?.map((kw: string, i: number) => (
                      <span key={i} className="badge badge-amber text-xs font-normal">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Missing Structural Sections (if any) */}
          {result.missing_sections && result.missing_sections.length > 0 && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[#991B1B]">Missing Structural Sections:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_sections.map((sec: string, i: number) => (
                  <span key={i} className="badge badge-rose text-xs">
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
                Optimization Protocol
              </span>
              <h3 className="text-base font-semibold text-[#181916] mt-0.5 mb-5 pb-3 border-b border-[#E8E5DC]">
                Actionable Next Steps
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#FAF9F5] border border-[#E8E5DC]">
                    <span className="w-5 h-5 rounded-full bg-[#133B2E] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-[#505449] leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action */}
          <div className="text-center pt-2">
            <button
              onClick={clearFile}
              className="text-xs font-semibold text-[#133B2E] hover:underline"
            >
              ← Audit Another Resume File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}