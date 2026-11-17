"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  AlertCircle,
  Bot,
  Check,
  ArrowRight,
  Copy,
  ExternalLink,
  Folder,
  LoaderCircle,
  Network,
  RefreshCw,
  Search,
  Server,
} from "lucide-react";
import { copyText } from "@/app/api/media_tech/workspace/copyText";

type AgentRecord = {
  agent_code: string;
  workspaces: string[];
  mcp_path: string;
};

type WorkspaceGroup = {
  code: string;
  name?: string;
  status?: string;
  parent?: string;
};

type AgentsResponse = {
  ok: boolean;
  openclaw?: {
    reachable?: boolean;
    ok?: boolean;
    connected?: boolean;
    subscribed?: boolean;
    plugins?: number;
  };
  agents: AgentRecord[];
  workspaces?: WorkspaceGroup[];
  fetched_at?: string;
  cached?: boolean;
  stale?: boolean;
};

// Giữ Multi Agent API làm nguồn danh sách, để agent không có workspace vẫn hiện.
const AGENTS_API = "/next/api/hust/agent/data";
const MCP_BASE = "https://node-js.hust.media";

export default function AgentManagement() {
  const router = useRouter();
  const [isNavigationPending, startNavigation] = useTransition();
  const [pendingAgentCode, setPendingAgentCode] = useState<string | null>(null);
  const [data, setData] = useState<AgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const load = useCallback(async (isRetry = false) => {
    if (!isRetry) setLoading(true);
    setError(null);
    try {
      const response = await fetch(AGENTS_API, { cache: "no-store" });
      const json = (await response.json().catch(() => null)) as AgentsResponse | null;
      if (!json || !Array.isArray(json.agents)) {
        const message = (json as { message?: string } | null)?.message;
        throw new Error(message || "Không tải được danh sách agent (HTTP " + response.status + ").");
      }

      // Cache vẫn dùng được nếu Gateway tạm thời không truy cập được.
      const hasUsableCachedRegistry = json.agents.length > 0 && json.openclaw?.reachable === false;
      if (!response.ok && !hasUsableCachedRegistry) {
        const message = (json as { message?: string } | null)?.message;
        throw new Error(message || "Không tải được danh sách agent (HTTP " + response.status + ").");
      }

      setData(json);
      if (json.stale && !isRetry) {
        if (retryTimer.current) clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => void load(true), 4000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách agent.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [load]);

  const handleCopy = async (key: string, text: string, label: string) => {
    const copied = await copyText(text);
    if (!copied) {
      showToast("Không sao chép được " + label + ", hãy chép thủ công.");
      return;
    }
    setCopiedKey(key);
    showToast("Đã sao chép " + label + "!");
    setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1800);
  };

  const agents = useMemo(() => {
    const list = data?.agents ?? [];
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (agent) =>
        agent.agent_code.toLowerCase().includes(term) ||
        agent.workspaces.some((code) => code.toLowerCase().includes(term)),
    );
  }, [data, query]);

  const gateway = data?.openclaw;
  const gatewayOk = Boolean(gateway?.reachable && gateway?.ok);

  const copyButton = (key: string, text: string, label: string, title: string) => (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void handleCopy(key, text, label);
      }}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-indigo-700 cursor-pointer"
      title={title}
      aria-label={title}
    >
      {copiedKey === key ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  const openWorkspaces = (code: string) => {
    setPendingAgentCode(code);
    startNavigation(() => {
      router.push(("/api/hust/agent/" + encodeURIComponent(code) + "/workspace") as Route);
    });
  };

  return (
    <div className="w-full space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-2xs backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white shadow-2xs">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
              Quản lý Agent
            </h1>
            <p className="hidden truncate text-[11px] text-slate-500 sm:block">
              Bấm vào một agent để mở trang Workspace của agent đó (chỉ xem).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          {gateway && (
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 " +
                (gatewayOk
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700")
              }
              title={
                "reachable: " + String(gateway.reachable) +
                " • ok: " + String(gateway.ok) +
                " • connected: " + String(gateway.connected) +
                " • subscribed: " + String(gateway.subscribed)
              }
            >
              <span className={"h-1.5 w-1.5 rounded-full " + (gatewayOk ? "bg-emerald-500" : "bg-rose-500")} />
              Gateway OpenClaw {gatewayOk ? "sẵn sàng" : "không sẵn sàng"}
              {typeof gateway.plugins === "number" ? " · " + gateway.plugins + " plugin" : ""}
            </span>
          )}
          {data?.stale && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">
              Bản cache cũ, đang làm mới
            </span>
          )}
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={"h-3.5 w-3.5 " + (loading ? "animate-spin" : "")} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-2xs">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo mã agent hoặc workspace…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {data ? agents.length + "/" + data.agents.length + " agent" : loading ? "Đang tải…" : agents.length + " agent"}
          {data?.fetched_at ? (
            <span className="ml-2 font-normal text-slate-400">
              cập nhật {new Date(data.fetched_at).toLocaleTimeString("vi-VN")}
            </span>
          ) : null}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold">Không tải được danh sách agent</p>
            <p className="break-words text-xs">{error}</p>
          </div>
        </div>
      )}

      {loading && !data && !error && (
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[170px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-8 shadow-sm sm:min-h-[190px]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Đang tải agent và workspace…</p>
            <p className="mt-1 text-xs text-slate-500">Lần đầu có thể mất khoảng 20 giây.</p>
          </div>
        </div>
      )}

      {data && agents.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-2xs">
          Không có agent nào khớp “{query}”.
        </div>
      )}

      {data?.workspaces && data.workspaces.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-2xs">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Nhóm workspace mẹ</p>
          <div className="flex flex-wrap gap-2">
            {data.workspaces.map((group) => (
              <span
                key={group.code}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200/80 bg-purple-50 px-2 py-1 font-mono text-[11px] font-semibold text-purple-900"
                title={group.name || group.code}
              >
                <Folder className="h-3 w-3 text-amber-500" />
                {group.code}
                {group.status ? (
                  <span className={group.status === "active" ? "text-emerald-600" : "text-slate-400"}>
                    · {group.status}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => {
          const isOpeningAgent = isNavigationPending && pendingAgentCode === agent.agent_code;
          const mcpUrl = MCP_BASE + agent.mcp_path;
          return (
            <div
              key={agent.agent_code}
              role="link"
              tabIndex={0}
              onClick={() => {
                if (!isNavigationPending) openWorkspaces(agent.agent_code);
              }}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && !isNavigationPending) {
                  event.preventDefault();
                  openWorkspaces(agent.agent_code);
                }
              }}
              title="Bấm để mở trang Workspace của agent này"
              aria-busy={isOpeningAgent}
              aria-disabled={isNavigationPending}
              className="group cursor-pointer space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs outline-none transition-all duration-200 hover:border-indigo-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-400/60 aria-disabled:cursor-wait aria-disabled:opacity-75"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100/90 bg-indigo-50 text-indigo-700 transition-transform group-hover:scale-105">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-mono text-sm font-bold text-slate-900" title={agent.agent_code}>
                      {agent.agent_code}
                    </h3>
                    <p className="text-[11px] text-slate-500">{agent.workspaces.length} workspace</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {copyButton("code-" + agent.agent_code, agent.agent_code, "mã agent", "Sao chép mã agent")}
                  <span className="flex h-6 w-6 items-center justify-center text-slate-300 transition group-hover:text-indigo-700">
                    {isOpeningAgent ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
                    ) : (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </span>
                </div>
              </div>

              {agent.workspaces.length > 0 ? (
                <div className="space-y-1.5">
                  {agent.workspaces.slice(0, 4).map((workspaceCode) => (
                    <div
                      key={workspaceCode}
                      className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2"
                    >
                      <Server className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span className="truncate font-mono text-xs text-slate-700">{workspaceCode}</span>
                    </div>
                  ))}
                  {agent.workspaces.length > 4 && (
                    <p className="pl-2 text-xs text-slate-500">
                      và {agent.workspaces.length - 4} workspace khác
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chưa có workspace con được gán.</p>
              )}

              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60 px-2.5 py-1.5">
                <Network className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                <code className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold text-slate-700" title={mcpUrl}>
                  {agent.mcp_path}
                </code>
                {copyButton("mcp-" + agent.agent_code, mcpUrl, "địa chỉ MCP đầy đủ", "Sao chép " + mcpUrl)}
                <a
                  href={mcpUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-teal-700"
                  title="Mở mô tả endpoint MCP (GET)"
                  aria-label="Mở mô tả endpoint MCP"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex max-w-[90vw] items-center gap-3 rounded-2xl border border-emerald-200/90 bg-white px-4 py-3 text-slate-800 shadow-[0_10px_30px_rgba(16,185,129,0.2)] sm:max-w-md"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
            <Check className="h-4 w-4" />
          </div>
          <p className="min-w-0 text-xs font-bold text-emerald-700">{toast}</p>
        </div>
      )}
    </div>
  );
}
