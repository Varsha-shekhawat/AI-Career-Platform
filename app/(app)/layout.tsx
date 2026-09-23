"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    tag: "Overview",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/resume",
    label: "Resume Analyzer",
    tag: "ATS Audit",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/job-match",
    label: "Job Match",
    tag: "Gap Analysis",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/interview",
    label: "Mock Interview",
    tag: "Simulation",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login";
    }
  }, [isLoading, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
        <div className="flex items-center gap-3 text-sm text-[#505449]">
          <svg className="w-5 h-5 animate-spin text-[#133B2E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>{isLoading ? "Loading career workspace..." : "Redirecting to authentication..."}</span>
        </div>
      </div>
    );
  }

  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";
  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F5] text-[#181916]">
      {/* ─── Mobile Header ───────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-[#FAF9F5] border-b border-[#E8E5DC] sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#133B2E] text-[#FAF9F5] flex items-center justify-center font-bold text-xs font-editorial">
            C
          </div>
          <span className="font-editorial text-base font-bold tracking-tight text-[#181916]">
            CareerAI
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded text-[#505449] hover:text-[#181916] hover:bg-[#EBE8DE]"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ─── Desktop Sidebar / Mobile Drawer ─────────────── */}
      <aside
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } md:flex flex-col justify-between w-full md:w-[250px] lg:w-[260px] shrink-0 bg-[#F6F5F0] border-r border-[#E8E5DC] min-h-[calc(100vh-53px)] md:min-h-screen sticky top-0 z-20`}
      >
        {/* Top: Logo & Navigation */}
        <div>
          {/* Brand Header */}
          <div className="px-6 pt-6 pb-5 hidden md:block">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#133B2E] text-[#FAF9F5] flex items-center justify-center font-bold text-xs font-editorial">
                C
              </div>
              <div>
                <span className="font-editorial text-base font-bold tracking-tight text-[#181916] block leading-none">
                  CareerAI
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#82877B] font-semibold block mt-1">
                  Career Intelligence
                </span>
              </div>
            </Link>
          </div>

          <div className="h-px mx-5 bg-[#E8E5DC] mb-4 hidden md:block" />

          {/* Nav Section Label */}
          <div className="px-6 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#82877B]">
              Workspace
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <span className={isActive ? "text-[#133B2E]" : "text-[#82877B]"}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: User Card & Sign Out */}
        <div className="p-4 border-t border-[#E8E5DC]">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E5DC] mb-3">
            <div className="w-7 h-7 rounded-full bg-[#133B2E] text-[#FAF9F5] flex items-center justify-center text-xs font-bold shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#181916] truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-[#82877B] truncate leading-tight mt-0.5">
                {displayEmail}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-[#505449] hover:text-[#991B1B] hover:bg-[#FEF2F2] border border-[#E8E5DC] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
