"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Server,
  Bot,
  Terminal,
  BookOpen,
} from "lucide-react";

export type ChatBotSwitcherProps = {
  active?: "home" | "laravel" | "test_1" | "api_1" | "main";
};

export default function ChatBotSwitcher({ active }: ChatBotSwitcherProps) {
  const pathname = usePathname() || "";
  const currentActive =
    active ||
    (pathname.includes("/home") || pathname.endsWith("/home")
      ? "home"
      : pathname.includes("/laravel") || pathname.endsWith("/laravel")
      ? "laravel"
      : pathname.includes("/api_1") || pathname.endsWith("/api_1")
      ? "api_1"
      : pathname.includes("/test_1") || pathname.endsWith("/test_1")
      ? "test_1"
      : "home");

  const clearHash = () => {
    if (typeof window !== "undefined") {
      if (window.location.hash) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  return (
    <>
      <nav
        aria-label="Chat Bot Navigation"
        className="mb-4 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white/90 p-2 shadow-xs backdrop-blur-md transition-all sm:p-2.5"
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Home Button */}
          <Link
            href={"/api/hust/home" as any}
            onClick={clearHash}
            className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all sm:px-3.5 sm:py-2 sm:text-sm active:scale-[0.98] ${
              currentActive === "home"
                ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                : "border-slate-200/80 bg-slate-50/80 text-slate-700 hover:border-blue-400 hover:bg-white hover:text-blue-600"
            }`}
          >
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Home</span>
          </Link>

          {/* Divider */}
          <div className="hidden h-5 w-[1px] bg-slate-200/90 sm:block mx-0.5" />

          {/* Label */}
          <div className="flex items-center gap-1.5 px-1 py-1 text-xs font-semibold text-slate-500">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Documentation:</span>
          </div>

          {/* Laravel n8n */}
          <Link
            href={"/api/hust/workflow/laravel" as any}
            onClick={clearHash}
            className={`group flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 sm:py-2 sm:text-sm active:scale-[0.98] ${
              currentActive === "laravel"
                ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                : "border-slate-200/80 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
            }`}
          >
            <Server className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${currentActive === "laravel" ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
            <span>Laravel n8n</span>
          </Link>

          {/* Chat Test */}
          <Link
            href={"/api/hust/chat_test" as any}
            onClick={clearHash}
            className={`group flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 sm:py-2 sm:text-sm active:scale-[0.98] ${
              currentActive === "test_1"
                ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                : "border-slate-200/80 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
            }`}
          >
            <Bot className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${currentActive === "test_1" ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
            <span>Chat Test</span>
          </Link>

          {/* API Test */}
          <Link
            href={"/api/hust/api_test" as any}
            onClick={clearHash}
            className={`group flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 sm:py-2 sm:text-sm active:scale-[0.98] ${
              currentActive === "api_1"
                ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                : "border-slate-200/80 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
            }`}
          >
            <Terminal className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${currentActive === "api_1" ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
            <span>API Test</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
