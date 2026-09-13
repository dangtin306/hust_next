"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronRight,
  CircleAlert,
  File,
  Folder,
  GitBranch,
  RefreshCw,
  UserRound,
} from "lucide-react";
import * as api from "./giteaApi";
import {
  CACHE_TTL,
  fetchGetCache,
  readGetCache,
  writeGetCache,
} from "../getCache";

const OWNER = "dangtin";
const REPO = "media_tech_ai";
const relativeTime = (value?: string) =>
  value
    ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round((new Date(value).getTime() - Date.now()) / 60000),
        "minute",
      )
    : "—";
const readableDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
const readableSize = (value?: number) =>
  value == null
    ? "—"
    : value > 1024
      ? `${(value / 1024).toFixed(1)} MB`
      : `${value} KB`;

function Panel({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function State({
  loading,
  error,
  retry,
  children,
}: {
  loading: boolean;
  error?: string;
  retry: () => void;
  children: React.ReactNode;
}) {
  if (loading)
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-2/3 rounded bg-slate-100" />
        <div className="h-10 rounded bg-slate-100" />
        <div className="h-10 rounded bg-slate-100" />
      </div>
    );
  if (error)
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
          <CircleAlert size={16} />
          Unable to load this section
        </div>
        <p className="mt-1 text-xs text-red-600">{error}</p>
        <button
          onClick={retry}
          className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  return <>{children}</>;
}

export default function GiteaDashboard() {
  const [health, setHealth] = useState<api.Health>();
  const [user, setUser] = useState<api.User>();
  const [repository, setRepository] = useState<api.Repository>();
  const [branches, setBranches] = useState<api.Branch[]>([]);
  const [commits, setCommits] = useState<api.Commit[]>([]);
  const [tree, setTree] = useState<api.TreeEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [treePath, setTreePath] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshWarning, setRefreshWarning] = useState("");
  const run = useCallback(
    async <T,>(
      key: string,
      fn: () => Promise<T>,
      setter: (data: T) => void,
    ) => {
      setLoading((old) => ({ ...old, [key]: true }));
      setErrors((old) => ({ ...old, [key]: "" }));
      try {
        setter(await fn());
      } catch (error) {
        setErrors((old) => ({
          ...old,
          [key]: error instanceof Error ? error.message : "Request failed",
        }));
      } finally {
        setLoading((old) => ({ ...old, [key]: false }));
      }
    },
    [],
  );
  const runGet = useCallback(
    async <T,>(
      key: string,
      request: () => Promise<T>,
      setter: (data: T) => void,
      force = false,
    ) => {
      const cached = readGetCache<T>(key);
      if (cached) setter(cached.data);
      const fresh =
        cached && Date.now() - cached.timestamp < CACHE_TTL.giteaDemo;
      if (fresh && !force) return;
      if (cached) setRefreshing(true);
      else setLoading((old) => ({ ...old, [key]: true }));
      try {
        const value = await fetchGetCache(key, request);
        writeGetCache(key, value);
        setter(value);
        setErrors((old) => ({ ...old, [key]: "" }));
      } catch (error) {
        if (!cached)
          setErrors((old) => ({
            ...old,
            [key]: error instanceof Error ? error.message : "Request failed",
          }));
        else setRefreshWarning("Unable to refresh latest data.");
      } finally {
        setLoading((old) => ({ ...old, [key]: false }));
        setRefreshing(false);
      }
    },
    [],
  );
  const refresh = useCallback(
    (force = false) => {
      setRefreshWarning("");
      void runGet("health", api.getGiteaHealth, setHealth, force);
      void runGet("user", api.getGiteaUser, setUser, force);
      void runGet(
        "repository",
        () => api.getRepository(OWNER, REPO),
        setRepository,
        force,
      );
      void runGet(
        "branches",
        () => api.getBranches(OWNER, REPO),
        setBranches,
        force,
      );
      void runGet(
        "commits",
        () => api.getCommits(OWNER, REPO, "main"),
        setCommits,
        force,
      );
      void runGet(
        `tree:${treePath}`,
        () => api.getTree(OWNER, REPO, "main", treePath),
        setTree,
        force,
      );
      setLastRefreshed(new Date());
    },
    [runGet, treePath],
  );
  useEffect(() => {
    refresh();
  }, [refresh]);
  const retry = (key: string) => {
    const actions: Record<string, () => void> = {
      health: () => void run("health", api.getGiteaHealth, setHealth),
      user: () => void run("user", api.getGiteaUser, setUser),
      repository: () =>
        void run(
          "repository",
          () => api.getRepository(OWNER, REPO),
          setRepository,
        ),
      branches: () =>
        void run("branches", () => api.getBranches(OWNER, REPO), setBranches),
      commits: () =>
        void run(
          "commits",
          () => api.getCommits(OWNER, REPO, "main"),
          setCommits,
        ),
      tree: () =>
        void run(
          "tree",
          () => api.getTree(OWNER, REPO, "main", treePath),
          setTree,
        ),
    };
    actions[key]?.();
  };

  return (
    <main className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden pb-10 text-slate-900">
      <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${health?.connected ? "bg-emerald-400 shadow-[0_0_12px_#34d399]" : "bg-red-400"}`}
              />
              <span
                className={
                  health?.connected ? "text-emerald-300" : "text-red-300"
                }
              >
                {health?.connected ? "Connected" : "Gitea Offline"}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-sm text-slate-400">Read-only monitor</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Gitea Project Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              {OWNER} / {REPO}
            </p>
          </div>
          <button
            onClick={() => refresh(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-indigo-50"
          >
            <RefreshCw size={16} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span>
            Last refreshed {lastRefreshed?.toLocaleTimeString("vi-VN") || "—"}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">
            No write actions available
          </span>
          {refreshWarning && (
            <span className="text-amber-300">{refreshWarning}</span>
          )}
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <State
          loading={loading.repository}
          error={errors.repository}
          retry={() => retry("repository")}
        >
          <Panel title="Project Overview" eyebrow="Repository">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Repository", repository?.full_name],
                ["Language", repository?.language],
                ["Default branch", repository?.default_branch],
                ["Repository size", readableSize(repository?.size)],
                ["Branches", String(repository?.branch_count ?? "—")],
                ["Issues", String(repository?.open_issues_count ?? "—")],
                [
                  "Pull requests",
                  String(repository?.open_pull_requests ?? "—"),
                ],
                ["Last updated", readableDate(repository?.updated_at)],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-slate-100 pb-3">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </State>
      </div>
      <State
        loading={loading.tree}
        error={errors.tree}
        retry={() => retry("tree")}
      >
        <Panel title="Source Repository" eyebrow="Browse source">
          <div className="mb-4 flex items-center gap-1 text-xs text-slate-500">
            <button
              onClick={() => {
                setTreePath("");
              }}
              className="font-semibold text-indigo-600 hover:underline"
            >
              main
            </button>
            {treePath
              .split("/")
              .filter(Boolean)
              .map((part, index, parts) => (
                <span key={part} className="flex items-center gap-1">
                  <ChevronRight size={13} />
                  <button
                    onClick={() =>
                      setTreePath(parts.slice(0, index + 1).join("/"))
                    }
                    className="hover:text-indigo-600"
                  >
                    {part}
                  </button>
                </span>
              ))}
          </div>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {tree.length ? (
              tree.map((entry) => {
                const isFolder =
                  entry.type === "tree" ||
                  entry.type === "folder" ||
                  entry.mode === "040000";
                const path =
                  entry.path ||
                  (treePath ? `${treePath}/${entry.name}` : entry.name);
                return (
                  <button
                    key={path}
                    onClick={() => (isFolder ? setTreePath(path) : undefined)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${isFolder ? "hover:bg-indigo-50" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      {isFolder ? (
                        <Folder size={17} className="text-indigo-500" />
                      ) : (
                        <File size={17} className="text-slate-400" />
                      )}
                      <span className="font-medium text-slate-700">
                        {entry.name}
                      </span>
                    </span>
                    {isFolder && (
                      <ChevronRight size={15} className="text-slate-300" />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="p-5 text-sm text-slate-500">
                No source entries found.
              </p>
            )}
          </div>
        </Panel>
      </State>
      <div className="grid gap-6 lg:grid-cols-2">
        <State
          loading={loading.branches}
          error={errors.branches}
          retry={() => retry("branches")}
        >
          <Panel title="Branches" eyebrow="Source control">
            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch size={18} className="text-indigo-500" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {branch.name}
                      </p>
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {branch.latest_commit?.sha.slice(0, 7)} ·{" "}
                        {branch.latest_commit?.message?.trim()}
                      </p>
                    </div>
                  </div>
                  {branch.protected ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Protected
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        </State>
        <State
          loading={loading.commits}
          error={errors.commits}
          retry={() => retry("commits")}
        >
          <Panel title="Recent Commits" eyebrow="main">
            <div className="space-y-3">
              {commits.slice(0, 10).map((commit) => (
                <div
                  key={commit.sha}
                  className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {commit.message?.trim() || "Untitled commit"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      <code>{commit.sha.slice(0, 7)}</code> ·{" "}
                      {commit.author || "Unknown author"} ·{" "}
                      {relativeTime(commit.created_at || commit.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {!commits.length && (
                <p className="text-sm text-slate-500">No commits found.</p>
              )}
            </div>
          </Panel>
        </State>
      </div>
      <State
        loading={loading.health || loading.user}
        error={errors.health || errors.user}
        retry={() => {
          retry("health");
          retry("user");
        }}
      >
        <Panel title="Gitea Connection" eyebrow="System status">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Gitea Server</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Version</p>
              <p className="mt-1 text-sm font-semibold">
                {health?.version || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Authenticated user</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <UserRound size={15} className="text-indigo-500" />
                {user?.username || "—"}
              </p>
            </div>
          </div>
        </Panel>
      </State>
    </main>
  );
}
