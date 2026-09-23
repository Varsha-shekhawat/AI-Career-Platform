"use client";

import { useState } from "react";
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
      setError("Please fill in all required fields.");
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
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
        <div className="flex items-center gap-3 text-sm text-[#505449]">
          <svg className="w-5 h-5 animate-spin text-[#133B2E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF9F5]">
      {/* ─── Left Panel: Editorial Pillar ─────────────────── */}
      <div className="lg:w-[48%] bg-[#133B2E] text-[#FAF9F5] p-10 lg:p-16 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-[#0B251D]">
        {/* Top: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#EDF4F1] text-[#133B2E] flex items-center justify-center font-bold text-sm font-editorial">
            C
          </div>
          <div>
            <span className="font-editorial text-lg font-bold tracking-tight text-[#FAF9F5]">
              CareerAI
            </span>
            <span className="ml-2 text-[11px] uppercase tracking-widest text-[#BED8CE] font-medium">
              Intelligence
            </span>
          </div>
        </div>

        {/* Editorial Headline & Supporting Copy */}
        <div className="max-w-md my-auto py-12 lg:py-16">
          <p className="text-xs uppercase tracking-widest text-[#BED8CE] font-semibold mb-4">
            CAREER INTELLIGENCE
          </p>
          <h1 className="font-editorial text-3xl lg:text-4xl font-normal leading-tight text-[#FAF9F5] mb-4">
            Build a career with better intelligence.
          </h1>
          <p className="text-sm leading-relaxed text-[#D2E4DC]">
            Understand your resume, match your skills to opportunities, and prepare with confidence.
          </p>
        </div>

        {/* Subtle Analytical Graphic (Understated editorial data trajectory) */}
        <div className="pt-6 border-t border-[#1D5442] max-w-md">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[#BED8CE]/80 mb-3">
            <span>CALIBRATION LEDGER</span>
            <span>SYSTEM READY</span>
          </div>
          <svg viewBox="0 0 360 44" className="w-full h-9 overflow-visible" fill="none">
            <line x1="0" y1="34" x2="360" y2="34" stroke="#1D5442" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="0" y1="12" x2="360" y2="12" stroke="#1D5442" strokeDasharray="3 3" strokeWidth="1" />
            <path
              d="M 8 32 C 70 30, 120 25, 175 18 C 235 11, 295 13, 352 6"
              stroke="#BED8CE"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="32" r="2.5" fill="#133B2E" stroke="#BED8CE" strokeWidth="1.5" />
            <circle cx="175" cy="18" r="2.5" fill="#133B2E" stroke="#BED8CE" strokeWidth="1.5" />
            <circle cx="352" cy="6" r="2.5" fill="#BED8CE" />
          </svg>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8FBBA9] mt-2">
            <span>Audit</span>
            <span>Alignment</span>
            <span>Prepared</span>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Authentication Form ─────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-editorial text-2xl lg:text-3xl font-normal text-[#181916] mb-2">
              {isLogin ? "Sign in to your account" : "Create your career profile"}
            </h2>
            <p className="text-sm text-[#505449]">
              {isLogin
                ? "Enter your credentials to access your intelligence dashboard."
                : "Enter your details to begin analyzing resumes and job matches."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#505449] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#505449] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#505449]">
                  Password
                </label>
                {isLogin && (
                  <span className="text-xs text-[#82877B] cursor-default">
                    6+ characters
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-16"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#82877B] hover:text-[#181916] px-1 py-0.5 rounded transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#991B1B] flex items-start gap-2">
                <span className="font-bold shrink-0">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="btn-primary w-full py-2.5 text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                  </span>
                ) : (
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                )}
              </button>
            </div>
          </form>

          {/* Form Toggle */}
          <div className="mt-8 pt-6 border-t border-[#E8E5DC] text-center text-xs text-[#505449]">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-semibold text-[#133B2E] underline underline-offset-2 hover:text-[#0C281F]"
            >
              {isLogin ? "Sign up here" : "Sign in here"}
            </button>
          </div>

          <p className="mt-8 text-center text-[11px] text-[#82877B]">
            Career intelligence data is strictly private and associated with your user session.
          </p>
        </div>
      </div>
    </div>
  );
}