"use client";

import { useState, useRef, useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MatchResult = any;

export default function JobMatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please drop a valid PDF resume file.");
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
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMatch = async () => {
    if (!file) {
      setError("Please upload your PDF resume first.");
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError("Please provide a detailed job description (minimum 20 characters).");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch("/api/job-match", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Job match analysis failed.");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    if (verdict?.includes("Strong")) return "badge-green";
    if (verdict?.includes("Good")) return "badge-brand";
    if (verdict?.includes("Partial")) return "badge-amber";
    return "badge-rose";
  };

  const scorePercent = result ? result.match_score / 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - scorePercent);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="border-b border-[#E8E5DC] pb-5">
        <span className="text-xs uppercase tracking-wider text-[#82877B] font-semibold">
          Audit Module 02
        </span>
        <h1 className="font-editorial text-3xl font-normal text-[#181916] mt-1">
          Role Fit Gap Analysis
        </h1>
        <p className="text-sm text-[#505449] mt-1.5 max-w-2xl">
          Evaluate how well your resume qualifications match a target role specification. Uncover skill gaps, qualification alignment, and custom tailoring advice.
        </p>
      </div>

      {/* ─── Dual Input Interface ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Resume Upload */}
        <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E5DC]">
              <h2 className="text-sm font-semibold text-[#181916]">
                1. Candidate Resume (PDF)
              </h2>
              {file && (
                <span className="badge badge-brand text-[11px]">Loaded</span>
              )}
            </div>

            {!file ? (
              <div
                className={`upload-zone p-8 flex flex-col items-center text-center ${
                  dragOver ? "drag-over" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-10 h-10 rounded-full bg-[#EDF4F1] text-[#133B2E] flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-xs text-[#181916]">
                  Click or drag resume PDF here
                </p>
                <p className="text-[11px] text-[#82877B] mt-0.5">
                  PDF up to 10MB
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
              <div className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E8E5DC] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#181916] truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-[#82877B] mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB · Ready
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="text-xs text-[#991B1B] font-semibold hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#E8E5DC] text-[11px] text-[#82877B]">
            Ensure PDF includes your complete career history.
          </div>
        </div>

        {/* Panel 2: Target Job Description */}
        <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E5DC]">
              <h2 className="text-sm font-semibold text-[#181916]">
                2. Target Job Specification
              </h2>
              <span className="text-[11px] font-mono text-[#82877B]">
                {jobDescription.length} chars
              </span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste full job description, qualifications, and role requirements here..."
              rows={6}
              className="form-textarea text-xs leading-relaxed"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-[#E8E5DC] text-[11px] text-[#82877B]">
            Include responsibilities, required skills, and experience criteria.
          </div>
        </div>
      </div>

      {/* ─── Match Button ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-4 sm:p-5">
        <span className="text-xs text-[#505449]">
          Cross-examines technical requirements, seniority level, and domain experience.
        </span>
        <button
          onClick={handleMatch}
          disabled={!file || jobDescription.trim().length < 20 || loading}
          className="btn-primary text-sm py-2 px-6"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Cross-Referencing Requirements...</span>
            </span>
          ) : (
            <span>Run Role Fit Gap Analysis →</span>
          )}
        </button>
      </div>

      {/* ─── Error Notification ───────────────────────────── */}
      {error && (
        <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#991B1B] flex items-start gap-2">
          <span className="font-bold shrink-0">!</span>
          <span>{error}</span>
        </div>
      )}

      {/* ─── Loading State ────────────────────────────────── */}
      {loading && (
        <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin text-[#133B2E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-semibold text-[#181916]">
              Parsing Job Requirements and Aligning Candidate Profile...
            </p>
          </div>
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-5/6 skeleton" />
          <div className="h-24 w-full skeleton mt-4" />
        </div>
      )}

      {/* ─── Match Results Presentation ───────────────────── */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Executive Score Card */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score Gauge */}
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
                    {result.match_score}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#82877B]">
                    Fit / 100
                  </span>
                </div>
              </div>

              {/* Summary Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <h2 className="text-xl font-bold text-[#181916]">
                    {result.candidate_name || "Candidate Alignment"}
                  </h2>
                  <span className={`badge ${getVerdictBadge(result.overall_verdict)}`}>
                    {result.overall_verdict}
                  </span>
                </div>
                <p className="text-sm text-[#505449] leading-relaxed">
                  {result.match_summary}
                </p>
                {result.experience_match && (
                  <p className="text-xs text-[#82877B] mt-2 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                    <span>Experience Trajectory:</span>
                    <strong className="text-[#181916]">{result.experience_match}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2-Column Skills Alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E5DC]">
                <span className="w-2 h-2 rounded-full bg-[#165636]" />
                <h3 className="text-sm font-semibold text-[#181916]">
                  Matching Qualifications ({result.matching_skills?.length || 0})
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-[#505449]">
                {result.matching_skills?.map((skill: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#165636] font-bold">✓</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Skills */}
            <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8E5DC]">
                <span className="w-2 h-2 rounded-full bg-[#991B1B]" />
                <h3 className="text-sm font-semibold text-[#181916]">
                  Missing / Unverified Skills ({result.missing_skills?.length || 0})
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-[#505449]">
                {result.missing_skills?.map((skill: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#991B1B] font-bold">✕</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Targeted Improvement Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
                Resume Optimization Advice
              </span>
              <h3 className="text-base font-semibold text-[#181916] mt-0.5 mb-5 pb-3 border-b border-[#E8E5DC]">
                Targeted Alignment Next Steps
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#FAF9F5] border border-[#E8E5DC]">
                    <span className="w-5 h-5 rounded-full bg-[#133B2E] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-[#505449] leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset / Run Another Match */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                clearFile();
                setResult(null);
                setJobDescription("");
              }}
              className="text-xs font-semibold text-[#133B2E] hover:underline"
            >
              ← Analyze Another Job Description
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
