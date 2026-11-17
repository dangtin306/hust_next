"use client";

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Bot, ChevronRight, LoaderCircle, RefreshCw, Search, Server, TriangleAlert } from "lucide-react";

type WorkspaceRecord = {
  id: number;
  agent_code?: string | null;
  work_space_code?: string | null;
  workspace_name?: string | null;
  parent_workspace_code?: string | null;
  status?: string | null;
  children?: WorkspaceRecord[];
};

type WorkspaceApiResponse = {
  data?: WorkspaceRecord[];
  meta?: { last_page?: number };
  last_page?: number;
  message?: string;
};

type AgentView = {
  code: string;
  workspaces: WorkspaceRecord[];
};

function flattenWorkspaceTree(records: WorkspaceRecord[]): WorkspaceRecord[] {
  const flattened: WorkspaceRecord[] = [];
  const visit = (record: WorkspaceRecord) => {
    flattened.push(record);
    for (const child of record.children ?? []) visit(child);
  };
  for (const record of records) visit(record);
  return flattened;
}

export default function AgentManagement() {
  const router = useRouter();
  const [isNavigationPending, startNavigation] = useTransition();
  const [pendingAgentCode, setPendingAgentCode] = useState<string | null>(null);
  const [records, setRecords] = useState<WorkspaceRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSize = 50;
      const collected: WorkspaceRecord[] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const response = await fetch(
          `/next/api/workspaces/main/data?per_page=${pageSize}&page=${page}`,
          { cache: "no-store" },
        );
        const payload = (await response.json().catch(() => null)) as WorkspaceApiResponse | null;
        if (!response.ok || !Array.isArray(payload?.data)) {
          throw new Error(payload?.message || `Không tải được workspace (HTTP ${response.status}).`);
        }
        collected.push(...payload.data);
        lastPage = Math.max(1, Number(payload.meta?.last_page ?? payload.last_page ?? 1));
        page += 1;
      } while (page <= lastPage && page <= 100);

      setRecords(flattenWorkspaceTree(collected));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không tải được danh sách agent.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const agents = useMemo<AgentView[]>(() => {
    const parentCodes = new Set(
      records.map((record) => record.parent_workspace_code?.trim()).filter((code): code is string => Boolean(code)),
    );
    const codes = [...new Set(records.map((record) => record.agent_code?.trim()).filter((code): code is string => Boolean(code)))].sort();
    const term = query.trim().toLowerCase();

    return codes
      .map((code) => {
        const workspaces = records.filter((record) => {
          const workspaceCode = record.work_space_code?.trim();
          return record.agent_code?.trim() === code && Boolean(workspaceCode) && !parentCodes.has(workspaceCode!);
        });
        return { code, workspaces };
      })
      .filter((agent) =>
        !term ||
        agent.code.toLowerCase().includes(term) ||
        agent.workspaces.some((workspace) =>
          `${workspace.work_space_code ?? ""} ${workspace.workspace_name ?? ""}`.toLowerCase().includes(term),
        ),
      );
  }, [records, query]);

  const openWorkspaces = (agentCode: string) => {
    setPendingAgentCode(agentCode);
    startNavigation(() => {
      router.push(`/api/mt/agent/${encodeURIComponent(agentCode)}/workspace` as Route);
    });
  };

  return (
    <div className="w-full space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Quản lý Agent</h1>
            <p className="text-sm text-slate-500">Mã agent và workspace được liên kết trong Media Tech.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <label className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm mã agent hoặc workspace..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-300 focus:bg-white"
          />
        </label>
        <span className="text-sm font-semibold text-slate-500">
          {loading && records.length === 0 ? "Đang tải…" : agents.length + " agent"}
        </span>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && records.length === 0 && !error && (
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

      {!loading && !error && agents.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Không tìm thấy agent có trong dữ liệu Workspace Media Tech.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <button
            key={agent.code}
            type="button"
            onClick={() => openWorkspaces(agent.code)}
            disabled={isNavigationPending}
            aria-busy={isNavigationPending && pendingAgentCode === agent.code}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md disabled:cursor-wait disabled:opacity-75"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-mono text-base font-bold text-slate-900">{agent.code}</h2>
                  <p className="text-xs text-slate-500">{agent.workspaces.length} workspace</p>
                </div>
              </div>
              {isNavigationPending && pendingAgentCode === agent.code ? (
                <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-teal-600" />
              ) : (
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
              )}
            </div>
            <div className="mt-4 space-y-2">
              {agent.workspaces.slice(0, 4).map((workspace) => (
                <div key={workspace.id} className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                  <Server className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  <span className="truncate font-mono text-xs text-slate-700">{workspace.work_space_code}</span>
                </div>
              ))}
              {agent.workspaces.length > 4 && <p className="pl-2 text-xs text-slate-500">và {agent.workspaces.length - 4} workspace khác</p>}
              {agent.workspaces.length === 0 && <p className="text-xs text-slate-500">Chưa có workspace con được gán.</p>}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-teal-700">
              <span>Mở workspace của agent</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
