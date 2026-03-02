"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  Briefcase,
  MessageSquare,
  Sparkles,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume Analyzer", icon: FileSearch },
  { href: "/job-match", label: "Job Match", icon: Briefcase },
  { href: "/interview", label: "Mock Interview", icon: MessageSquare },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  // Auth guard: show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--accent-blue)" }}
        />
      </div>
    );
  }

  // If not authenticated, render nothing (middleware handles redirect)
  if (!user) {
    return null;
  }

  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";
  const displayName = user?.fullName || user?.email || "User";
  const displayEmail = user?.email || "";

  return (
    <main className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ─── SIDEBAR ─────────────────────────────── */}
      <aside
        className="w-[260px] flex flex-col justify-between shrink-0 border-r"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Top: Logo + Nav */}
        <div>
          {/* Logo */}
          <div className="px-6 pt-7 pb-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center animate-pulse-glow"
                style={{
                  background:
                    "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[17px] font-bold tracking-tight gradient-text">
                  CareerAI
                </h1>
                <p
                  className="text-[10px] font-medium tracking-widest uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  AI Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div
            className="mx-5 h-px mb-4"
            style={{ background: "var(--border-subtle)" }}
          />

          {/* Navigation */}
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link key={item.label} href={item.href}>
                  <div
                    className={`nav-link group relative ${isActive ? "active" : ""
                      }`}
                  >
                    <Icon
                      className="w-[18px] h-[18px] shrink-0"
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight
                        className="w-3.5 h-3.5 opacity-50"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: User Section with Logout */}
        <div className="px-4 pb-5">
          <div
            className="h-px mb-4"
            style={{ background: "var(--border-subtle)" }}
          />
          <div
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.03] cursor-pointer group"
            title="Sign out"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-violet), var(--accent-blue))",
              }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {displayName}
              </p>
              <p
                className="text-[11px] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {displayEmail}
              </p>
            </div>
            <LogOut
              className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--accent-rose)" }}
            />
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ────────────────────────── */}
      <div
        className="flex-1 min-h-screen overflow-y-auto"
        style={{ background: "var(--bg-primary)" }}
      >
        {/* Ambient gradient glow at top */}
        <div
          className="fixed top-0 left-[260px] right-0 h-[300px] pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -20%, rgba(99, 130, 255, 0.08) 0%, transparent 100%)",
          }}
        />
        <div className="relative z-10 p-8 lg:p-10">{children}</div>
      </div>
    </main>
  );
}
