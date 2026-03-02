"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isLogin && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      let errorMsg: string | null;
      if (isLogin) {
        errorMsg = await login(email, password);
      } else {
        errorMsg = await signup(email, password, fullName);
      }
      if (errorMsg) {
        setError(errorMsg);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth state (prevents flash)
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-blue)" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* ─── Left Panel: Branding ────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: "var(--bg-secondary)" }}
      >
        {/* Gradient orbs */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[150px] animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(99, 130, 255, 0.15) 0%, transparent 70%)",
            top: "10%",
            left: "20%",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            bottom: "15%",
            right: "10%",
            animation: "float 5s ease-in-out infinite 1s",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, transparent 70%)",
            top: "50%",
            left: "60%",
            animation: "float 6s ease-in-out infinite 2s",
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-16 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 animate-pulse-glow"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
              }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Land your dream job <br />
              <span className="gradient-text">with AI</span>
            </h2>

            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: "var(--text-secondary)" }}
            >
              Analyze your resume with advanced AI, match it against real jobs,
              practice mock interviews, and stand out from the competition.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                "ATS Score Analysis",
                "AI Feedback",
                "Job Matching",
                "Mock Interviews",
              ].map((feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + 0.1 * i }}
                  className="px-4 py-2 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(99, 130, 255, 0.08)",
                    color: "var(--accent-blue)",
                    border: "1px solid rgba(99, 130, 255, 0.15)",
                  }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Border */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{ background: "var(--border-subtle)" }}
        />
      </div>

      {/* ─── Right Panel: Form ───────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold gradient-text">CareerAI</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Sign up to start analyzing your resumes with AI"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-medium)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="John Doe"
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--accent-blue)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border-medium)")
                    }
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="you@example.com"
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--accent-blue)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--border-medium)")
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="••••••••"
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--accent-blue)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--border-medium)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-white/[0.05] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "var(--accent-blue)" }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center py-2 px-4 rounded-xl"
                style={{
                  color: "var(--accent-rose)",
                  background: "rgba(244, 63, 94, 0.08)",
                  border: "1px solid rgba(244, 63, 94, 0.15)",
                }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full flex items-center justify-center gap-2.5 text-[15px] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div
            className="mt-8 text-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-semibold hover:underline"
              style={{ color: "var(--accent-blue)" }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>

          {/* Footer */}
          <p
            className="mt-10 text-center text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}