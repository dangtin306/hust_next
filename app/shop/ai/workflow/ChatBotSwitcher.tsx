"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import RealChatDrawer from "@/app/shop/ai/chat_bot/main/RealChatDrawer";

export type ChatBotSwitcherProps = {
  active?: "home" | "laravel" | "test_1" | "api_1" | "main";
};

export default function ChatBotSwitcher({ active }: ChatBotSwitcherProps) {
  const [isRealChatOpen, setIsRealChatOpen] = useState(false);
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
        className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200/80 bg-white/80 p-3 shadow-xs backdrop-blur-md"
      >
        <Link
          href={"/workflow/chat_bot/home" as any}
          onClick={clearHash}
          className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
            currentActive === "home"
              ? "border-blue-600 bg-blue-600 text-white shadow-xs"
              : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
          }`}
        >
          Home
        </Link>

        {/* API documentation label right next to Home */}
        <span className="mx-1 text-sm font-semibold text-slate-600">
          API documentation:
        </span>

        {/* Laravel n8n realtime workflow tab */}
        <Link
          href={"/workflow/chat_bot/laravel" as any}
          onClick={clearHash}
          className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
            currentActive === "laravel"
              ? "border-blue-600 bg-blue-600 text-white shadow-xs"
              : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
          }`}
        >
          Laravel n8n
        </Link>

        {/* Chat Test tab */}
        <Link
          href={"/workflow/chat_bot/test_1" as any}
          onClick={clearHash}
          className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
            currentActive === "test_1"
              ? "border-blue-600 bg-blue-600 text-white shadow-xs"
              : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
          }`}
        >
          Chat Test
        </Link>

        {/* API Test tab */}
        <Link
          href={"/workflow/chat_bot/api_1" as any}
          onClick={clearHash}
          className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
            currentActive === "api_1"
              ? "border-blue-600 bg-blue-600 text-white shadow-xs"
              : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
          }`}
        >
          API Test
        </Link>

        {/* Real Chat trigger - opens embedded chat from bottom without navigating URL */}
        <button
          type="button"
          onClick={() => setIsRealChatOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-semibold transition ${
            isRealChatOpen
              ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
              : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Real chat</span>
          {isRealChatOpen && (
            <span className="ml-0.5 h-2 w-2 rounded-full bg-white animate-pulse" />
          )}
        </button>
      </nav>

      {/* Real Chat Embedded Slide-up Drawer */}
      <RealChatDrawer
        isOpen={isRealChatOpen}
        onClose={() => setIsRealChatOpen(false)}
      />
    </>
  );
}
