"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    X,
    Briefcase,
    CheckCircle2,
    XCircle,
    Lightbulb,
    Loader2,
    ArrowRight,
    Target,
    TrendingUp,
} from "lucide-react";

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
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleMatch = async () => {
        if (!file) {
            setError("Please upload your resume PDF first.");
            return;
        }
        if (jobDescription.trim().length < 20) {
            setError("Please paste a detailed job description (at least 20 characters).");
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
                throw new Error(data.error || "Something went wrong.");
            }

            setResult(data.result);
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

    const getVerdictBadge = (verdict: string) => {
        if (verdict?.includes("Strong")) return "badge-green";
        if (verdict?.includes("Good")) return "badge-blue";
        if (verdict?.includes("Partial")) return "badge-amber";
        return "badge-rose";
    };

    const scorePercent = result ? result.match_score / 100 : 0;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference * (1 - scorePercent);

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <h2 className="text-3xl font-bold tracking-tight">
                    AI Job <span className="gradient-text">Match</span>
                </h2>
                <p className="mt-1.5" style={{ color: "var(--text-secondary)" }}>
                    See how well your resume matches a specific job description
                </p>
            </motion.div>

            {/* Input Section */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
            >
                {/* Resume Upload */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
                        Your Resume
                    </h3>
                    {!file ? (
                        <div
                            className={`upload-zone p-8 flex flex-col items-center text-center ${dragOver ? "drag-over" : ""}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload
                                className="w-8 h-8 mb-3"
                                style={{ color: "var(--accent-blue)" }}
                                strokeWidth={1.5}
                            />
                            <p className="text-sm font-medium">
                                Drop PDF or <span style={{ color: "var(--accent-blue)" }}>browse</span>
                            </p>
                            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
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
                        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(99, 130, 255, 0.05)" }}>
                            <FileText className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button onClick={clearFile} className="p-1.5 rounded-lg hover:bg-white/[0.05]">
                                <X className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Job Description */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" style={{ color: "var(--accent-violet)" }} />
                        Job Description
                    </h3>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        rows={6}
                        className="w-full rounded-xl p-4 text-sm outline-none resize-none transition-all duration-200"
                        style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid var(--border-medium)",
                            color: "var(--text-primary)",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent-violet)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-medium)")}
                    />
                </div>
            </motion.div>

            {/* Match Button */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
            >
                <button
                    onClick={handleMatch}
                    disabled={!file || jobDescription.trim().length < 20 || loading}
                    className="btn-primary w-full flex items-center justify-center gap-2.5 text-[15px] mb-6"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Matching with AI...
                        </>
                    ) : (
                        <>
                            <Target className="w-4 h-4" />
                            Analyze Match
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mb-6 p-4 rounded-xl flex items-start gap-3"
                        style={{
                            background: "rgba(244, 63, 94, 0.08)",
                            border: "1px solid rgba(244, 63, 94, 0.2)",
                        }}
                    >
                        <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent-rose)" }} />
                        <p className="text-sm" style={{ color: "var(--accent-rose)" }}>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Skeleton */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {result && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        {/* Score Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-8 flex flex-col md:flex-row items-center gap-8"
                        >
                            <div className="relative shrink-0">
                                <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
                                    <circle
                                        cx="50" cy="50" r="45" fill="none"
                                        stroke={getScoreColor(result.match_score)}
                                        strokeWidth="6" strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="score-ring"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        className="text-3xl font-black"
                                        style={{ color: getScoreColor(result.match_score) }}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {result.match_score}
                                    </motion.span>
                                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                                        Match
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                    <h3 className="text-xl font-bold">{result.candidate_name || "Candidate"}</h3>
                                    <span className={`badge ${getVerdictBadge(result.overall_verdict)}`}>
                                        {result.overall_verdict}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                    {result.match_summary}
                                </p>
                                {result.experience_match && (
                                    <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                                        <TrendingUp className="w-3 h-3" /> {result.experience_match}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Matching vs Missing Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-6"
                                style={{ borderColor: "rgba(52, 211, 153, 0.15)" }}
                            >
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(52, 211, 153, 0.1)" }}>
                                        <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent-emerald)" }} />
                                    </div>
                                    <h4 className="font-semibold text-[15px]">Matching Skills</h4>
                                </div>
                                <ul className="space-y-3">
                                    {result.matching_skills?.map((item: string, i: number) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + 0.06 * i }}
                                            className="flex items-start gap-2.5 text-sm"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--accent-emerald)" }} />
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-6"
                                style={{ borderColor: "rgba(244, 63, 94, 0.15)" }}
                            >
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(244, 63, 94, 0.1)" }}>
                                        <XCircle className="w-4 h-4" style={{ color: "var(--accent-rose)" }} />
                                    </div>
                                    <h4 className="font-semibold text-[15px]">Missing Skills</h4>
                                </div>
                                <ul className="space-y-3">
                                    {result.missing_skills?.map((item: string, i: number) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + 0.06 * i }}
                                            className="flex items-start gap-2.5 text-sm"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--accent-rose)" }} />
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>

                        {/* Suggestions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-6"
                            style={{ borderColor: "rgba(99, 130, 255, 0.15)" }}
                        >
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99, 130, 255, 0.1)" }}>
                                    <Lightbulb className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
                                </div>
                                <h4 className="font-semibold text-[15px]">How to Improve Your Match</h4>
                            </div>
                            <ul className="space-y-3">
                                {result.suggestions?.map((item: string, i: number) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.55 + 0.06 * i }}
                                        className="flex items-start gap-3 text-sm"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        <span
                                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold"
                                            style={{ background: "rgba(99, 130, 255, 0.1)", color: "var(--accent-blue)" }}
                                        >
                                            {i + 1}
                                        </span>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Reset */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-center pt-2"
                        >
                            <button
                                onClick={() => { clearFile(); setResult(null); setJobDescription(""); }}
                                className="text-sm font-medium hover:underline"
                                style={{ color: "var(--accent-blue)" }}
                            >
                                ← Try another match
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
