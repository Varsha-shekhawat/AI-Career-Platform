"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "ai" | "user";
  content: string;
  feedback?: string;
  questionType?: string;
  tip?: string;
  answerRating?: number;
}

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Mobile Developer",
  "Machine Learning Engineer",
  "Cloud Architect",
];

const experiences = [
  "0-1 years (Fresher)",
  "1-3 years (Junior)",
  "3-5 years (Mid-level)",
  "5-8 years (Senior)",
  "8+ years (Lead/Principal)",
];

export default function MockInterviewPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startInterview = async () => {
    if (!selectedRole || !selectedExperience) {
      setError("Please select both a target role and an experience level.");
      return;
    }

    setStarted(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          experience: selectedExperience,
          messages: [],
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to initialize interview.");

      setMessages([
        {
          role: "ai",
          content: data.result.message,
          questionType: data.result.question_type,
          tip: data.result.tip,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!userInput.trim() || loading) return;

    const newUserMessage: Message = { role: "user", content: userInput.trim() };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          experience: selectedExperience,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to submit answer.");

      setMessages([
        ...updatedMessages,
        {
          role: "ai",
          content: data.result.message,
          feedback: data.result.feedback,
          questionType: data.result.question_type,
          tip: data.result.tip,
          answerRating: data.result.answer_rating,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  const resetInterview = () => {
    setStarted(false);
    setMessages([]);
    setUserInput("");
    setError(null);
    setSelectedRole("");
    setSelectedExperience("");
  };

  const getRatingBadgeClass = (rating: number) => {
    if (rating >= 8) return "badge-green";
    if (rating >= 5) return "badge-amber";
    return "badge-rose";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="border-b border-[#E8E5DC] pb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#82877B] font-semibold">
            Audit Module 03
          </span>
          <h1 className="font-editorial text-3xl font-normal text-[#181916] mt-1">
            Technical Mock Interview
          </h1>
          <p className="text-sm text-[#505449] mt-1.5 max-w-2xl">
            Simulate realistic technical and behavioral interviews. Receive immediate rubric evaluation, score ratings, and strategic feedback on each answer.
          </p>
        </div>
        {started && (
          <button
            onClick={resetInterview}
            className="btn-secondary text-xs shrink-0 self-start sm:self-auto"
          >
            ← End & Reset Interview
          </button>
        )}
      </div>

      {/* ─── Setup Screen ─────────────────────────────────── */}
      {!started && (
        <div className="space-y-6">
          {/* Step 1: Role Selection */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E5DC]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
                  Step 1
                </span>
                <h2 className="text-sm font-semibold text-[#181916] mt-0.5">
                  Select Target Engineering Role
                </h2>
              </div>
              {selectedRole && (
                <span className="badge badge-brand text-xs">{selectedRole}</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {roles.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-lg text-left text-xs font-medium transition-colors border ${
                      isSelected
                        ? "bg-[#EDF4F1] border-[#133B2E] text-[#133B2E] font-semibold"
                        : "bg-[#FAF9F5] border-[#E8E5DC] text-[#505449] hover:text-[#181916] hover:bg-[#F4F2EB]"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Experience Level */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E5DC]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#82877B]">
                  Step 2
                </span>
                <h2 className="text-sm font-semibold text-[#181916] mt-0.5">
                  Select Seniority & Experience Level
                </h2>
              </div>
              {selectedExperience && (
                <span className="badge badge-brand text-xs">{selectedExperience}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {experiences.map((exp) => {
                const isSelected = selectedExperience === exp;
                return (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setSelectedExperience(exp)}
                    className={`p-3 rounded-lg text-left text-xs font-medium transition-colors border ${
                      isSelected
                        ? "bg-[#EDF4F1] border-[#133B2E] text-[#133B2E] font-semibold"
                        : "bg-[#FAF9F5] border-[#E8E5DC] text-[#505449] hover:text-[#181916] hover:bg-[#F4F2EB]"
                    }`}
                  >
                    {exp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Action */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-[#505449]">
              The AI interviewer will tailor questions, architecture depth, and evaluation rubrics based on selected parameters.
            </span>
            <button
              onClick={startInterview}
              disabled={!selectedRole || !selectedExperience || loading}
              className="btn-primary text-sm py-2.5 px-7"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Initializing Simulation...</span>
                </span>
              ) : (
                <span>Begin Mock Interview →</span>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#991B1B] flex items-start gap-2">
              <span className="font-bold shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── Active Interview Interface ───────────────────── */}
      {started && (
        <div className="space-y-6">
          {/* Session Info Bar */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#165636]" />
              <span className="font-semibold text-[#181916]">Active Session:</span>
              <span className="text-[#505449]">{selectedRole}</span>
              <span className="text-[#82877B]">·</span>
              <span className="text-[#82877B]">{selectedExperience}</span>
            </div>
            <span className="font-mono text-[#82877B] text-[11px]">
              {messages.filter((m) => m.role === "user").length} responses recorded
            </span>
          </div>

          {/* Dialogue Log Stream */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-6 sm:p-7 min-h-[400px] max-h-[600px] overflow-y-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className="space-y-3">
                {/* Feedback on candidate's previous response */}
                {msg.feedback && (
                  <div className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E8E5DC] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#133B2E] uppercase tracking-wider text-[11px]">
                        Interviewer Evaluation & Score
                      </span>
                      {msg.answerRating !== undefined && (
                        <span className={`badge ${getRatingBadgeClass(msg.answerRating)}`}>
                          Rating: {msg.answerRating}/10
                        </span>
                      )}
                    </div>
                    <p className="text-[#505449] leading-relaxed">
                      {msg.feedback}
                    </p>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`flex gap-3.5 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar Badge */}
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "ai"
                        ? "bg-[#133B2E] text-[#FFFFFF]"
                        : "bg-[#EBE8DE] text-[#181916]"
                    }`}
                  >
                    {msg.role === "ai" ? "AI" : "You"}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`max-w-[85%] rounded-lg p-4 text-xs leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-[#FAF9F5] border border-[#E8E5DC] text-[#181916]"
                        : "bg-[#FFFFFF] border border-[#BED8CE] text-[#181916]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Question Type & Tip Callout */}
                    {msg.role === "ai" && (msg.tip || msg.questionType) && (
                      <div className="mt-3 pt-3 border-t border-[#E8E5DC] text-[11px] text-[#82877B] flex flex-wrap items-center gap-2">
                        {msg.questionType && (
                          <span className="font-semibold text-[#133B2E] uppercase tracking-wider text-[10px]">
                            [{msg.questionType}]
                          </span>
                        )}
                        {msg.tip && <span>Tip: {msg.tip}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* AI Typing / Generating Indicator */}
            {loading && (
              <div className="flex gap-3.5 items-center">
                <div className="w-7 h-7 rounded-full bg-[#133B2E] text-[#FFFFFF] text-xs font-bold flex items-center justify-center shrink-0">
                  AI
                </div>
                <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E8E5DC] text-xs text-[#505449] flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin text-[#133B2E]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Evaluating answer and formulating follow-up question...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Candidate Response Input Well */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DC] rounded-xl p-4 sm:p-5 space-y-3">
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Structure your answer here... (Press Enter to submit, Shift+Enter for newline)"
              rows={3}
              disabled={loading}
              className="form-textarea text-xs leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-[#82877B]">
                Tip: Use the STAR methodology (Situation, Task, Action, Result) for behavioral questions.
              </span>
              <button
                onClick={sendAnswer}
                disabled={!userInput.trim() || loading}
                className="btn-primary text-xs py-2 px-5 self-end sm:self-auto"
              >
                {loading ? "Submitting Answer..." : "Submit Answer →"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#991B1B] flex items-start gap-2">
              <span className="font-bold shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
