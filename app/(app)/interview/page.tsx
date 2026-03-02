"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Send,
    Loader2,
    Sparkles,
    Star,
    Lightbulb,
    RotateCcw,
    ChevronRight,
    User,
    Bot,
} from "lucide-react";

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
    }, [messages]);

    const startInterview = async () => {
        if (!selectedRole || !selectedExperience) {
            setError("Please select a role and experience level.");
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
            if (!data.success) throw new Error(data.error);

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
            if (!data.success) throw new Error(data.error);

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
            inputRef.current?.focus();
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

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return "var(--accent-emerald)";
        if (rating >= 5) return "var(--accent-amber)";
        return "var(--accent-rose)";
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Mock <span className="gradient-text">Interview</span>
                        </h2>
                        <p className="mt-1.5" style={{ color: "var(--text-secondary)" }}>
                            Practice interviews with an AI interviewer and get real-time feedback
                        </p>
                    </div>
                    {started && (
                        <button
                            onClick={resetInterview}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/[0.05]"
                            style={{ color: "var(--text-secondary)", border: "1px solid var(--border-medium)" }}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            New Interview
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Setup Screen */}
            <AnimatePresence mode="wait">
                {!started && (
                    <motion.div
                        key="setup"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-5"
                    >
                        {/* Role Selection */}
                        <div className="glass-card p-6">
                            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
                                Select Your Target Role
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left"
                                        style={{
                                            background: selectedRole === role ? "var(--accent-blue-glow)" : "rgba(255,255,255,0.02)",
                                            border: `1px solid ${selectedRole === role ? "var(--accent-blue)" : "var(--border-subtle)"}`,
                                            color: selectedRole === role ? "var(--accent-blue)" : "var(--text-secondary)",
                                        }}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Experience Selection */}
                        <div className="glass-card p-6">
                            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                <Star className="w-4 h-4" style={{ color: "var(--accent-violet)" }} />
                                Experience Level
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                {experiences.map((exp) => (
                                    <button
                                        key={exp}
                                        onClick={() => setSelectedExperience(exp)}
                                        className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left"
                                        style={{
                                            background: selectedExperience === exp ? "rgba(139, 92, 246, 0.1)" : "rgba(255,255,255,0.02)",
                                            border: `1px solid ${selectedExperience === exp ? "var(--accent-violet)" : "var(--border-subtle)"}`,
                                            color: selectedExperience === exp ? "var(--accent-violet)" : "var(--text-secondary)",
                                        }}
                                    >
                                        {exp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={startInterview}
                            disabled={!selectedRole || !selectedExperience || loading}
                            className="btn-primary w-full flex items-center justify-center gap-2.5 text-[15px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Starting Interview...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4" />
                                    Start Mock Interview
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {error && (
                            <p className="text-sm text-center" style={{ color: "var(--accent-rose)" }}>{error}</p>
                        )}
                    </motion.div>
                )}

                {/* Chat Interface */}
                {started && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col"
                    >
                        {/* Interview Info Bar */}
                        <div
                            className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl text-xs font-medium"
                            style={{
                                background: "rgba(99, 130, 255, 0.05)",
                                border: "1px solid rgba(99, 130, 255, 0.12)",
                                color: "var(--text-secondary)",
                            }}
                        >
                            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent-blue)" }} />
                            <span>
                                Interviewing for <strong style={{ color: "var(--accent-blue)" }}>{selectedRole}</strong> · {selectedExperience}
                            </span>
                        </div>

                        {/* Messages */}
                        <div
                            className="glass-card p-5 mb-4 space-y-5 overflow-y-auto"
                            style={{ maxHeight: "500px", minHeight: "300px" }}
                        >
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            background: msg.role === "ai"
                                                ? "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))"
                                                : "rgba(139, 92, 246, 0.15)",
                                        }}
                                    >
                                        {msg.role === "ai" ? (
                                            <Bot className="w-4 h-4 text-white" />
                                        ) : (
                                            <User className="w-4 h-4" style={{ color: "var(--accent-violet)" }} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "text-right" : ""}`}>
                                        {/* Feedback on previous answer */}
                                        {msg.feedback && (
                                            <div
                                                className="mb-2 p-3 rounded-xl text-xs"
                                                style={{
                                                    background: "rgba(52, 211, 153, 0.05)",
                                                    border: "1px solid rgba(52, 211, 153, 0.12)",
                                                }}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold" style={{ color: "var(--accent-emerald)" }}>
                                                        Feedback
                                                    </span>
                                                    {msg.answerRating && (
                                                        <span
                                                            className="badge text-[10px] py-0"
                                                            style={{
                                                                background: `${getRatingColor(msg.answerRating)}15`,
                                                                color: getRatingColor(msg.answerRating),
                                                                border: `1px solid ${getRatingColor(msg.answerRating)}30`,
                                                            }}
                                                        >
                                                            {msg.answerRating}/10
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ color: "var(--text-secondary)" }}>{msg.feedback}</p>
                                            </div>
                                        )}

                                        {/* Message bubble */}
                                        <div
                                            className="p-4 rounded-2xl text-sm leading-relaxed"
                                            style={{
                                                background: msg.role === "ai" ? "rgba(255,255,255,0.03)" : "var(--accent-blue-glow)",
                                                border: `1px solid ${msg.role === "ai" ? "var(--border-subtle)" : "rgba(99, 130, 255, 0.2)"}`,
                                                textAlign: "left",
                                            }}
                                        >
                                            {msg.content}
                                        </div>

                                        {/* Question type & tip */}
                                        {msg.role === "ai" && msg.tip && (
                                            <div
                                                className="mt-2 flex items-start gap-2 p-2.5 rounded-lg text-xs"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "var(--accent-amber)" }} />
                                                <span>
                                                    {msg.questionType && (
                                                        <span className="font-semibold capitalize" style={{ color: "var(--accent-amber)" }}>
                                                            {msg.questionType}
                                                        </span>
                                                    )}{" "}
                                                    — {msg.tip}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))" }}
                                    >
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="dot-pulse flex items-center gap-1.5 pt-3">
                                        <span /><span /><span />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="glass-card p-4 flex items-end gap-3">
                            <textarea
                                ref={inputRef}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                                rows={2}
                                disabled={loading}
                                className="flex-1 rounded-xl p-3 text-sm outline-none resize-none transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border-medium)",
                                    color: "var(--text-primary)",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "var(--accent-blue)")}
                                onBlur={(e) => (e.target.style.borderColor = "var(--border-medium)")}
                            />
                            <button
                                onClick={sendAnswer}
                                disabled={!userInput.trim() || loading}
                                className="btn-primary px-4 py-3 flex items-center justify-center"
                                style={{ borderRadius: "12px" }}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {error && (
                            <p className="text-sm text-center mt-3" style={{ color: "var(--accent-rose)" }}>{error}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
