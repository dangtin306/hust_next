import Link from "next/link";
import {
  Home,
  Server,
  Sparkles,
  Bot,
  Workflow,
  Briefcase,
  GitBranch,
  Terminal,
  Code2,
  BookOpen,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

export type SwaggerTabKey =
  | "home"
  | "openclaw"
  | "laravel"
  | "n8n"
  | "workspace"
  | "git_auto"
  | "git_test"
  | "gitea_test"
  | "chat_test"
  | "chat_public";

const TABS = [
  {
    key: "laravel" as const,
    label: "Laravel",
    href: "/api/mt/laravel",
    icon: Server,
    description: "Laravel Chat Backend API",
  },
  {
    key: "openclaw" as const,
    label: "OpenClaw",
    href: "/api/mt/openclaw",
    icon: Sparkles,
    description: "OpenClaw AI Gateway",
  },
  {
    key: "chat_test" as const,
    label: "Chat Test",
    href: "/api/mt/chat_test",
    icon: Bot,
    description: "Media Tech AI Assistant Test",
  },
  {
    key: "chat_public" as const,
    label: "Chat Public",
    href: "/api/mt/chat_public",
    icon: MessageSquare,
    description: "Media Tech AI Public Chat",
  },
  {
    key: "n8n" as const,
    label: "Workflow",
    href: "/api/mt/n8n",
    icon: Workflow,
    description: "n8n Automation Workflows",
  },
  {
    key: "workspace" as const,
    label: "Workspace",
    href: "/api/mt/workspace",
    icon: Briefcase,
    description: "AI Workspace Management",
  },
  {
    key: "git_auto" as const,
    label: "Git Auto",
    href: "/api/mt/git_auto",
    icon: GitBranch,
    description: "Git Automation Service",
  },
  {
    key: "git_test" as const,
    label: "Git Test",
    href: "/api/mt/git_test",
    icon: Terminal,
    description: "Git Test Endpoints",
  },
  {
    key: "gitea_test" as const,
    label: "Gitea Test",
    href: "/api/mt/gitea_test",
    icon: Code2,
    description: "Gitea Webhook & API Test",
  },
];

export default function SwaggerSwitcher({
  active,
  className = "mb-4",
}: {
  active: SwaggerTabKey;
  className?: string;
}) {
  const clearSwaggerHash = () => {
    if (typeof window !== "undefined") {
      if (window.location.hash) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  return (
    <nav
      aria-label="Swagger documentation"
      className={`mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/90 bg-white/90 p-2 shadow-xs backdrop-blur-md transition-all sm:p-2.5 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
        {/* Home Button */}
        <Link
          href={"/api/mt/home" as any}
          onClick={clearSwaggerHash}
          className={`group flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 sm:py-2 active:scale-[0.98] ${
            active === "home"
              ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
              : "border-slate-200/80 bg-slate-50/80 text-slate-700 hover:border-blue-400 hover:bg-white hover:text-blue-600"
          }`}
        >
          <Home className="h-4 w-4" />
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
          const isActive = active === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href as any}
              prefetch
              onClick={clearSwaggerHash}
              title={tab.description}
              className={`group flex items-center gap-1 rounded-xl border px-2 py-1.5 text-xs font-semibold tracking-tight transition-all sm:px-2.5 sm:py-2 active:scale-[0.98] ${
                isActive
                  ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"
                  : "border-slate-200/80 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"
                }`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right side live status & shortcuts */}
      <div className="hidden xl:flex items-center gap-2 pl-2">
        <Link
          href={"/shop/ai/chat_bot/media_tech" as any}
          className="flex items-center gap-1.5 rounded-xl border border-purple-200/90 bg-purple-50/80 px-2.5 py-1.5 text-xs font-semibold text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-100 hover:shadow-xs sm:px-3 sm:py-2 active:scale-[0.98]"
          title="Mở giao diện Chat Bot chính"
        >
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
          <span className="whitespace-nowrap">AI Chat Bot</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </Link>
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-500 sm:py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="whitespace-nowrap">API Live</span>
        </div>
      </div>
    </nav>
  );
}
