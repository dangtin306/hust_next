"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import {
  Home,
  Sparkles,
  Bot,
  BookOpen,
  ExternalLink,
  Loader2,
  Workflow as WorkflowIcon,
  Briefcase,
  Code2,
  GitBranch,
} from "lucide-react";

const MediaTechChatClient = dynamic(
  () => import("../chat_ui/main/media_main"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-white p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm font-medium text-slate-600">Đang khởi tạo AI Chat Bot...</p>
        </div>
      </div>
    ),
  }
);

export type SwaggerTabKey =
  | "home"
  | "api_list"
  | "openclaw"
  | "laravel"
  | "workspace"
  | "chat_bot"
  | "chat_test"
  | "chat_public"
  | "workflow"
  | "git_auto"
  | "git_test"
  | "gitea_test";

const TABS = [
  {
    key: "api_list" as const,
    label: "Api List",
    href: "/api/hust/list/home",
    icon: Code2,
    description: "Danh sách API: Laravel & OpenClaw",
  },
  {
    key: "workspace" as const,
    label: "Workspace",
    href: "/api/hust/workspace/home",
    icon: Briefcase,
    description: "AI Workspace Management",
  },
  {
    key: "chat_bot" as const,
    label: "Chat Bot",
    href: "/api/hust/chat/home",
    icon: Bot,
    description: "Hust Media AI Chat Bot (Quản lý, Test & Public)",
  },
  {
    key: "workflow" as const,
    label: "Workflow",
    href: "/api/hust/n8n/home",
    icon: WorkflowIcon,
    description: "Sơ đồ Workflow n8n của Hust",
  },
  {
    key: "git_auto" as const,
    label: "Git Auto",
    href: "/api/hust/git/home",
    icon: GitBranch,
    description: "Trung tâm Git Automation & Control (Git Auto, Git Test, Gitea Test)",
  },
];

function normalizePath(p: string): string {
  if (!p) return "";
  let path = p;
  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      path = new URL(path).pathname;
    }
  } catch {
    // ignore
  }
  if (path.startsWith("/next/")) {
    path = path.slice(5);
  } else if (path === "/next") {
    path = "/";
  }
  return path.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
}

export default function SwaggerSwitcher({
  active,
  className = "mb-4",
}: {
  active: SwaggerTabKey;
  className?: string;
}) {
  const pathname = usePathname() || "";
  const [navigatingKey, setNavigatingKey] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openChatModal = () => {
    try {
      const identityMigrationKey = "hust_api_chat_public_identity_migrated_v1";
      if (!window.localStorage.getItem(identityMigrationKey)) {
        if (window.localStorage.getItem("hust_api_chat_public_conv_id_user_id") === "502") {
          window.localStorage.removeItem("hust_api_chat_public_conv_id_user_id");
        }
        window.localStorage.setItem(identityMigrationKey, "1");
      }
    } catch {
      // The chat can still initialize through OpenClaw.
    }
    setIsChatModalOpen(true);
  };

  useEffect(() => {
    if (!isChatModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsChatModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChatModalOpen]);

  // Listen to open-ai-chat-bot custom events or URL params
  useEffect(() => {
    const handleOpenChatEvent = () => openChatModal();
    window.addEventListener("open-ai-chat-bot", handleOpenChatEvent);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("open_chat") === "1" || params.get("chat") === "open" || window.location.hash === "#chat") {
        openChatModal();
      }
    }
    return () => window.removeEventListener("open-ai-chat-bot", handleOpenChatEvent);
  }, []);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setNavigatingKey(null);
  }

  useEffect(() => {
    if (!navigatingKey) return;
    const timer = setTimeout(() => {
      setNavigatingKey(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [navigatingKey]);

  const handleTabClick = (e: React.MouseEvent, key: string, targetHref: string) => {
    const rawPath = pathname || (typeof window !== "undefined" ? window.location.pathname : "");
    const isSamePath = normalizePath(rawPath) === normalizePath(targetHref);
    if (isSamePath) {
      e.preventDefault();
      return;
    }
    setNavigatingKey(key);
  };

  return (
    <>
      <nav
      aria-label="Swagger documentation"
      className={`relative mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-2 shadow-xs backdrop-blur-md transition-all sm:p-2.5 ${className}`}
    >
      {/* Top Navigation Progress Indicator */}
      {navigatingKey && (
        <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden z-20 pointer-events-none">
          <div className="h-full w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
        {/* Home Button */}
        <Link
          href={"/api/hust/home" as unknown as Route}
          prefetch={false}
          onClick={(e) => handleTabClick(e, "home", "/api/hust/home")}
          className={`group flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 sm:py-2 active:scale-[0.98] ${
            active === "home" || navigatingKey === "home"
              ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
              : "border-slate-200/80 bg-slate-50/80 text-slate-700 hover:border-blue-400 hover:bg-white hover:text-blue-600"
          }`}
        >
          {navigatingKey === "home" ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Home className="h-4 w-4" />
          )}
          <span>Home</span>
        </Link>

        {/* Divider */}
        <div className="hidden h-5 w-[1px] bg-slate-200/90 sm:block mx-0.5" />

        {/* Section Label */}
        <div className="flex items-center gap-1 px-1 py-1 text-xs font-semibold text-slate-500">
          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden lg:inline">Documentation:</span>
        </div>

        {/* Tab Items */}
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            active === tab.key ||
            (tab.key === "api_list" &&
              (active === "api_list" || active === "laravel" || active === "openclaw")) ||
            (tab.key === "chat_bot" &&
              (active === "chat_bot" || active === "chat_test" || active === "chat_public")) ||
            (tab.key === "git_auto" &&
              (active === "git_auto" || active === "git_test" || active === "gitea_test"));
          const isNavigating = navigatingKey === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href as unknown as Route}
              prefetch={false}
              onClick={(e) => handleTabClick(e, tab.key, tab.href)}
              title={tab.description}
              className={`group flex items-center gap-1 rounded-xl border px-2 py-1.5 text-xs font-semibold tracking-tight transition-all sm:px-2.5 sm:py-2 active:scale-[0.98] ${
                isActive || isNavigating
                  ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                  : "border-slate-200/80 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
              }`}
            >
              {isNavigating ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-white" />
              ) : (
                <Icon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"
                  }`}
                />
              )}
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right side live status & shortcuts */}
      <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 shrink-0">
        <button
          type="button"
          onClick={openChatModal}
          className="flex items-center gap-1.5 rounded-xl border border-purple-200/90 bg-purple-50/80 px-2.5 py-1.5 text-xs font-semibold text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-100 hover:shadow-xs sm:px-3 sm:py-2 active:scale-[0.98] cursor-pointer"
          title="Mở giao diện Chat Bot chính ngay lập tức"
        >
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
          <span className="whitespace-nowrap">AI Chat Bot</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-500 sm:py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="whitespace-nowrap">API Live</span>
        </div>
      </div>
    </nav>

    {/* Chat Public Assistant Modal Portal */}
    {mounted && isChatModalOpen && createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:p-5"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsChatModalOpen(false);
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Chat Public AI"
          className="relative flex h-[calc(100dvh-1rem)] max-h-[920px] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-slate-100 via-white to-purple-50 shadow-2xl sm:h-[min(90dvh,860px)] sm:rounded-3xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="h-full min-h-0 w-full overflow-hidden">
            <MediaTechChatClient
              isDrawer
              onClose={() => setIsChatModalOpen(false)}
              className="h-full max-h-full"
              targetUrl="https://node_js.hust.media/openclaw"
              laravelUrl="https://laravel.hust.media"
              sessionKey="agent:test"
              storageKey="hust_api_chat_public_conv_id"
              model="gpt-5.6-luna"
              useResponsesApi
              hideModel
              createUserIfMissing
              showWelcomeMessage={false}
              title="Chat Public Assistant"
              subtitle="Trợ lý AI trực tuyến"
              agentBadge="Live AI"
              defaultUserId={null}
            />
          </div>
        </section>
      </div>,
      document.body
    )}
  </>
  );
}
