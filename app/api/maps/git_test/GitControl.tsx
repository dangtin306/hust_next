"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code2,
  FileCode2,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  GitMerge,
  History,
  Eye,
  EyeOff,
  RefreshCw,
  Server,
  ShieldAlert,
  Terminal,
  Trash2,
} from "lucide-react";
import {
  ChangedFile,
  GitApiError,
  SourceDiff,
  SourceInfo,
  SourceStatus,
  GitWorkflow,
  Preflight,
  PushMode,
  PullRequest,
  PullRequestMergeResult,
  GitTestConfig,
  HistoryEvent,
  HistoryResponse,
  GitDashboardState,
  laravelGitService,
} from "./LaravelGitService";
import {
  CACHE_TTL,
  fetchGetCache,
  readGetCache,
  writeGetCache,
} from "../getCache";

const GIT_CACHE_KEYS = {
  workflow: "workflow",
  info: "info",
  status: "status",
  diff: "diff",
  history: "history",
  dashboardState: "git_test:dashboard-state",
  preflightPull: "preflight:pull",
  preflightCommit: "preflight:commit",
  preflightPush: "preflight:push",
} as const;

const COMMIT_TYPES = [
  { value: "feat", label: "feat — tính năng mới" },
  { value: "fix", label: "fix — sửa lỗi" },
  { value: "update", label: "update — cập nhật chung" },
  { value: "docs", label: "docs — tài liệu" },
  { value: "style", label: "style — giao diện/format" },
  { value: "refactor", label: "refactor — tái cấu trúc" },
  { value: "perf", label: "perf — hiệu năng" },
  { value: "test", label: "test — kiểm thử" },
  { value: "build", label: "build — build/phụ thuộc" },
  { value: "ci", label: "ci — CI/CD" },
  { value: "chore", label: "chore — bảo trì/cập nhật" },
  { value: "revert", label: "revert — hoàn tác" },
] as const;
function GitTestConfigPanel({
  onSaved,
  onNotify,
  onUsernameChange,
  refreshing,
}: {
  onSaved: () => void;
  onNotify: (message: string) => void;
  onUsernameChange: (username: string) => void;
  refreshing: boolean;
}) {
  const [config, setConfig] = useState<GitTestConfig>({
    provider: "gitea",
    remote_url: "",
    repository: "",
    component: "all",
    local_path: "",
    base_branch: "",
    working_branch: "",
  });
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [message, setMessage] = useState<string>();

  const reloadConfig = useCallback(async () => {
    setReloading(true);
    setMessage(undefined);
    try {
      const current = await laravelGitService.getConfig();
      setConfig((old) => ({ ...old, ...current }));
      onUsernameChange(current.username || "");
      setMessage("Đã tải lại cấu hình");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Không lấy được cấu hình hiện tại";
      setMessage(text);
      onNotify(`Tải cấu hình thất bại: ${text}`);
    } finally {
      setReloading(false);
    }
  }, [onNotify, onUsernameChange]);

  useEffect(() => {
    void reloadConfig();
  }, [reloadConfig]);

  const update = (key: keyof GitTestConfig, value: string) =>
    setConfig((old) => ({ ...old, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMessage(undefined);
    try {
      const saved = await laravelGitService.saveConfig(config);
      setConfig((old) => ({ ...old, ...saved }));
      await reloadConfig();
      setMessage("Đã lưu và tải lại cấu hình từ server");
      onNotify("Đã lưu cấu hình Git Test thành công");
      onSaved();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Lưu cấu hình thất bại";
      setMessage(text);
      onNotify(`Lưu cấu hình Git Test thất bại: ${text}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-indigo-100 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Git Test Configuration
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-slate-900">
            Connect your Gitea repository
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Cấu hình repository dành riêng cho Git Test.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          <ShieldAlert size={13} /> {saving ? "Đang lưu…" : "Đã kết nối config"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-xs font-semibold text-slate-600">
          Provider
          <select value={config.provider} onChange={(event) => update("provider", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-normal text-slate-800 outline-none focus:border-indigo-400">
            <option value="gitea">Gitea</option>
            <option value="github">GitHub</option>
            <option value="gitlab">GitLab</option>
            <option value="bitbucket">Bitbucket</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-600 sm:col-span-2">
          Remote URL
          <input value={config.remote_url} onChange={(event) => update("remote_url", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-normal text-slate-800 outline-none focus:border-indigo-400" />
        </label>
        <label className="block text-xs font-semibold text-slate-600 sm:col-span-2">
          Repository
          <input value={config.repository} onChange={(event) => update("repository", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-normal text-slate-800 outline-none focus:border-indigo-400" />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Component
          <input value={config.component} onChange={(event) => update("component", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-normal text-slate-800 outline-none focus:border-indigo-400" />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Local path
          <input value={config.local_path} onChange={(event) => update("local_path", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-normal text-slate-800 outline-none focus:border-indigo-400" />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Base branch
          <input value={config.base_branch} onChange={(event) => update("base_branch", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-normal text-slate-800 outline-none focus:border-indigo-400" />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Working branch
          <input value={config.working_branch} onChange={(event) => update("working_branch", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-normal text-slate-800 outline-none focus:border-indigo-400" />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Access token
          <span className="relative mt-1 block">
            <input type={showToken ? "text" : "password"} value={config.access_token || ""} onChange={(event) => update("access_token", event.target.value)} placeholder="Giữ token hiện tại nếu để trống" className="w-full rounded-lg border border-slate-200 py-1.5 pl-3 pr-9 text-xs font-normal text-slate-800 outline-none focus:border-indigo-400" />
            <button type="button" onClick={() => setShowToken((visible) => !visible)} aria-label={showToken ? "Ẩn access token" : "Hiện access token"} title={showToken ? "Ẩn access token" : "Hiện access token"} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700">
              {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </span>
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Gitea user
          <input
            value={config.username || "—"}
            readOnly
            aria-readonly="true"
            className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-normal text-slate-500 outline-none"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-col justify-between gap-2 border-t border-slate-100 pt-2 sm:flex-row sm:items-center">
        <p className="text-[11px] text-slate-400">{message || "Config được lưu cho các thao tác Git Test bên dưới."}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void reloadConfig()} disabled={reloading || saving || refreshing} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
            <RefreshCw size={13} className={reloading ? "animate-spin" : ""} />
            {reloading ? "Reloading…" : refreshing ? "Refreshing…" : "Reload config"}
          </button>
          <button type="button" onClick={() => void save()} disabled={saving || reloading || refreshing} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Saving…" : refreshing ? "Refreshing…" : "Save & Connect"}
          </button>
        </div>
      </div>
    </section>
  );
}

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
const apiError = (error: GitApiError) =>
  `${error.code ? `${error.code}: ` : ""}${error.status === 419 ? "CSRF/session validation failed." : error.message}`;
const statusColor = (status?: string) =>
  status === "Clean"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-amber-50 text-amber-700";

function Button({
  children,
  onClick,
  disabled = false,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SyncMetric({
  label,
  value,
  description,
  className,
}: {
  label: string;
  value?: number;
  description: string;
  className: string;
}) {
  return (
    <span className={`group relative inline-flex cursor-help ${className}`}>
      {label}{value === undefined ? "" : ` ${value}`}
      <span className="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
        {description}
      </span>
    </span>
  );
}
function Tooltip({
  children,
  description,
  className = "",
  tooltipClassName = "",
}: {
  children: React.ReactNode;
  description: string;
  className?: string;
  tooltipClassName?: string;
}) {
  return (
    <span className={`group relative inline-flex cursor-help ${className}`}>
      {children}
      <span className={`pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 ${tooltipClassName}`}>
        {description}
      </span>
    </span>
  );
}
function Panel({
  title,
  icon,
  action,
  className = "",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`min-w-0 self-start rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex min-w-0 items-center justify-between border-b border-slate-100 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800">
          {icon}
          {title}
        </div>
        {action}
      </div>
      <div className="min-w-0 overflow-visible p-3">{children}</div>
    </section>
  );
}
function InlineWarning({ error }: { error: GitApiError }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      Unable to refresh latest data: {apiError(error)}
    </div>
  );
}
function DisabledButton({
  children,
  title = "Not available from current backend",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Button disabled title={title}>
      {children}
    </Button>
  );
}
function FileList({
  files,
  onSelect,
}: {
  files: ChangedFile[];
  onSelect: (file: ChangedFile) => void;
}) {
  return files.length ? (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
      {files.map((file) => (
        <button
          key={`${file.path}-${file.status}`}
          onClick={() => onSelect(file)}
          className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-indigo-50"
        >
          <span
            className={`w-20 shrink-0 whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${file.status.toLowerCase().startsWith("d") ? "bg-red-50 text-red-600" : file.status.toLowerCase().startsWith("u") ? "bg-violet-50 text-violet-600" : file.status.toLowerCase().startsWith("a") ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
          >
            {file.status}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-slate-700">
              {file.path.split("/").pop()}
            </span>
            <span className="block truncate text-[11px] text-slate-400">
              {file.path}
            </span>
          </span>
          <span className="text-[10px] text-slate-400">View Diff</span>
          <ChevronRight size={14} className="text-slate-300" />
        </button>
      ))}
    </div>
  ) : (
    <p className="py-4 text-center text-xs text-slate-400">
      No files in this group.
    </p>
  );
}

function Workflow({
  status,
  workflow,
  pullAllowed,
  commitAllowed,
  commitDone,
  pushDone,
  pushAllowed,
  writeBusy,
  fetching,
  pullRequestLoading,
  mergeLoading,
  mergeStatus,
  pullRequest,
  newCycle,
}: {
  status?: SourceStatus;
  workflow?: GitWorkflow;
  pullAllowed: boolean;
  commitAllowed: boolean;
  commitDone: boolean;
  pushDone: boolean;
  pushAllowed: boolean;
  writeBusy?: string;
  fetching: boolean;
  pullRequestLoading: boolean;
  mergeLoading: boolean;
  mergeStatus: string;
  pullRequest?: PullRequest;
  newCycle: boolean;
}) {
  const ahead = workflow?.sync.ahead ?? status?.ahead ?? 0;
  const behind = workflow?.sync.behind ?? status?.behind ?? 0;
  const staged = workflow?.working_tree.staged ?? status?.staged ?? 0;
  const currentPullRequest = pullRequest || workflow?.pull_request;
  const prState = currentPullRequest?.state?.toLowerCase();
  const steps = ["Fetch", "Pull", "Commit", "Push", "Pull Request", "Merge"];
  const states = [
    ...(newCycle
      ? ["Waiting", "Waiting", "Waiting", "Waiting", pullRequestLoading ? "Running" : "Waiting", mergeLoading ? "Running" : "Waiting"]
      : [
    fetching
      ? "Running"
      : !workflow
      ? "Waiting"
      : "Done",
    fetching
      ? "Waiting"
      : writeBusy === "pull"
        ? "Running"
        : writeBusy
          ? "Waiting"
          : behind > 0
            ? pullAllowed
              ? "Ready"
              : "Waiting"
            : "Done",
    fetching
      ? "Waiting"
      : writeBusy === "commit"
        ? "Running"
        : writeBusy
          ? "Waiting"
        : behind > 0
          ? "Waiting"
          : commitDone
            ? "Done"
            : commitAllowed
              ? "Ready"
              : staged === 0 && ahead > 0
                ? "Done"
                : "Waiting",
    fetching
      ? "Waiting"
      : writeBusy === "push"
        ? "Running"
        : writeBusy
          ? "Waiting"
      : pushDone
      ? "Done"
      : ahead > 0 && pushAllowed
      ? "Ready"
      : ahead === 0 && currentPullRequest?.exists
        ? "Done"
        : "Waiting",
    fetching
      ? "Waiting"
      : pullRequestLoading
        ? "Running"
      : currentPullRequest?.exists && prState === "merged"
        ? "Merged"
      : currentPullRequest?.exists
        ? "Done"
        : ahead > 0
          ? "Waiting"
      : Boolean(workflow?.capabilities?.can_create_pr)
          ? "Ready"
          : "Waiting",
    fetching
      ? "Waiting"
      : mergeLoading
        ? "Running"
      : currentPullRequest?.exists
        ? mergeStatus
        : "Waiting",
      ]),
  ];
  const stepDescriptions: Record<string, string> = {
    Fetch: "Cập nhật thông tin remote trước khi kiểm tra quy trình Git.",
    Pull: "Lấy các commit mới từ remote về branch hiện tại khi Behind > 0.",
    Commit: "Lưu lại một phiên bản thay đổi của code vào Git trên máy.",
    Push: "Đẩy các commit trên máy lên Gitea.",
    "Pull Request": "Tạo yêu cầu đưa thay đổi từ nhánh hiện tại vào nhánh chính.",
    Merge: "Gộp Pull Request vào nhánh main.",
  };
  return (
    <Panel
      title="Workflow"
      icon={<GitMerge size={16} className="text-indigo-500" />}
    >
      <div className="grid gap-2 sm:grid-cols-6">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-lg border p-3 ${states[index] === "Done" || states[index] === "Merged" ? "border-emerald-200 bg-emerald-50" : states[index] === "Ready" || states[index] === "Running" ? "border-indigo-300 bg-indigo-50" : "border-slate-100 bg-slate-50"}`}
          >
            <p className="text-[10px] font-bold text-slate-400">0{index + 1}</p>
            <Tooltip description={stepDescriptions[step]}>
              <p
                className={`mt-2 text-xs font-semibold ${states[index] === "Done" || states[index] === "Merged" ? "text-emerald-800" : states[index] === "Ready" || states[index] === "Running" ? "text-indigo-800" : "text-slate-600"}`}
              >
                {step}
              </p>
            </Tooltip>
            <p className={`mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wide ${states[index] === "Done" || states[index] === "Merged" ? "text-emerald-600" : states[index] === "Ready" ? "text-amber-600" : states[index] === "Running" ? "text-indigo-500" : "text-slate-500"}`}>
              {states[index] === "Running" && (
                <RefreshCw size={11} className="animate-spin" aria-hidden="true" />
              )}
              {states[index]}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function HistoryPanel({
  history,
  error,
  selectedCommit,
  onSelect,
  className = "",
}: {
  history: HistoryEvent[];
  error?: GitApiError;
  selectedCommit?: HistoryEvent;
  onSelect: (commit: HistoryEvent) => void;
  className?: string;
}) {
  return (
    <Panel
      title="History"
      icon={<History size={16} className="text-indigo-500" />}
      className={className}
    >
      {error && <InlineWarning error={error} />}
      {history.length ? (
        history.map((event, index) => {
          // Backend history can contain legacy entries without `type`.
          // Normalize the value before rendering so one malformed event
          // cannot crash the whole page.
          const eventType =
            typeof event.type === "string" ? event.type.toLowerCase() : "unknown";
          const isCommit = eventType === "commit";
          const sha = typeof event.sha === "string" ? event.sha : "";
          const eventLabel = isCommit
            ? event.short_sha || sha.slice(0, 7) || "—"
            : eventType === "pull_request"
              ? "PULL REQUEST"
              : eventType.toUpperCase();
          const eventDescription = isCommit
            ? event.message?.trim()
            : eventType === "pull"
              ? `Pull ${event.branch || "—"} · ${event.status || "—"}`
              : eventType === "push"
                ? `Push ${event.mode || "all"} · ${event.status || "—"}`
                : eventType === "pull_request"
                  ? `PR #${event.pr_index || "—"} · ${event.source_branch || "—"} → ${event.target_branch || "—"} · ${event.status || "—"}`
                : eventType === "merge"
                  ? `Pull request #${event.pr_index || "—"} · ${event.source_branch || "—"} → ${event.target_branch || "—"} · ${event.status || "—"}`
                : "Unknown history event";
          const eventColor = isCommit
            ? "text-indigo-600"
            : eventType === "pull"
              ? "text-sky-600"
              : eventType === "push"
                ? "text-emerald-600"
                : eventType === "pull_request"
                  ? "text-indigo-600"
                : eventType === "merge"
                  ? "text-violet-600"
                : "text-slate-600";
          return (
          <button
            key={isCommit ? sha || index : `${eventType}-${event.date || index}`}
            onClick={() => onSelect(event)}
            className="flex w-full items-center gap-1 border-b border-slate-100 px-2 py-3 text-left hover:bg-slate-50"
          >
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-wide ${eventColor} ${isCommit ? "bg-indigo-50" : eventType === "pull" ? "bg-sky-50" : eventType === "push" ? "bg-emerald-50" : eventType === "pull_request" ? "bg-indigo-50" : eventType === "merge" ? "bg-violet-50" : "bg-slate-50"}`}>
              {eventLabel}
            </span>
            {isCommit && <span className="font-mono text-xs font-semibold text-indigo-600">{eventLabel}</span>}
            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
              {eventDescription}
            </span>
            <span className="hidden text-[11px] text-slate-400 sm:block">
              {isCommit ? event.author : "—"}
            </span>
            <span className="text-[11px] text-slate-400">
              {formatDate(isCommit ? event.created_at || event.date : event.date)}
            </span>
            <ChevronRight size={14} className="text-slate-300" />
          </button>
          );
        })
      ) : (
        <p className="py-4 text-center text-sm text-slate-400">
          {error ? "History temporarily unavailable." : "No history found."}
        </p>
      )}
      {selectedCommit && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs">
          <p className="font-semibold">
            {selectedCommit.type === "commit"
              ? selectedCommit.message?.trim()
              : selectedCommit.type === "pull"
                ? `Pull ${selectedCommit.branch || "—"} · ${selectedCommit.status || "—"}`
              : selectedCommit.type === "push"
                ? `Push ${selectedCommit.mode || "all"} · ${selectedCommit.status || "—"}`
                : selectedCommit.type === "pull_request" || selectedCommit.type === "merge"
                  ? `Pull request #${selectedCommit.pr_index || "—"} · ${selectedCommit.source_branch || "—"} → ${selectedCommit.target_branch || "—"} · ${selectedCommit.status || "—"}`
                  : "Unknown history event"}
          </p>
          <p className="mt-1 font-mono text-slate-500">
            {selectedCommit.type === "commit"
              ? `${selectedCommit.sha} · ${selectedCommit.author}`
              : selectedCommit.type.toUpperCase()}
          </p>
        </div>
      )}
    </Panel>
  );
}

export default function GitControl() {
  const [workflow, setWorkflow] = useState<GitWorkflow>();
  const [info, setInfo] = useState<SourceInfo>();
  const [status, setStatus] = useState<SourceStatus>();
  const [diff, setDiff] = useState<SourceDiff>();
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [pullPreflight, setPullPreflight] = useState<Preflight>();
  const [commitPreflight, setCommitPreflight] = useState<Preflight>();
  const [pushPreflight, setPushPreflight] = useState<Preflight>();
  const [errors, setErrors] = useState<Record<string, GitApiError>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>();
  const [selectedFile, setSelectedFile] = useState<ChangedFile>();
  const [selectedCommit, setSelectedCommit] = useState<HistoryEvent>();
  const [commitType, setCommitType] = useState("chore");
  const [giteaUsername, setGiteaUsername] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [commitDone, setCommitDone] = useState(false);
  const [pushDone, setPushDone] = useState(false);
  const [uncommitLoading, setUncommitLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastPaused, setToastPaused] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const [pullRequestLoading, setPullRequestLoading] = useState(false);
  const [pullRequestNotice, setPullRequestNotice] = useState("");
  const [mergeDetails, setMergeDetails] = useState<PullRequest>();
  const [mergeDetailsIndex, setMergeDetailsIndex] = useState<number>();
  const [mergeError, setMergeError] = useState("");
  const [mergeLoading, setMergeLoading] = useState(false);
  const [endedPullRequestIndex, setEndedPullRequestIndex] = useState<number>();
  const [newCycle, setNewCycle] = useState(false);
  const [commitNotice, setCommitNotice] = useState("");
  const [pushNotice, setPushNotice] = useState("");
  const [updateNotice, setUpdateNotice] = useState("");
  const [stageNotice, setStageNotice] = useState("");
  const [writeBusy, setWriteBusy] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshWarning, setRefreshWarning] = useState("");
  const refreshRequests = useRef(0);
  const applyHistory = useCallback((value: HistoryResponse | HistoryEvent[]) => {
    if (Array.isArray(value)) {
      setHistory(value);
      return;
    }
    setHistory(
      value.history_data ??
        value.commits?.map((commit) => ({ ...commit, type: "commit" as const })) ??
        [],
    );
  }, []);
  const run = useCallback(
    async <T,>(
      key: string,
      request: () => Promise<T>,
      setter: (value: T) => void,
      onError?: (error: GitApiError) => void,
    ) => {
      setNewCycle(false);
      setLoading((old) => ({ ...old, [key]: true }));
      try {
        setter(await request());
        setErrors((old) => {
          const next = { ...old };
          delete next[key];
          return next;
        });
      } catch (error) {
        const typed = error as GitApiError;
        setErrors((old) => ({ ...old, [key]: typed }));
        onError?.(typed);
      } finally {
        setLoading((old) => ({ ...old, [key]: false }));
      }
    },
    [],
  );
  const applyDashboardState = useCallback((snapshot: GitDashboardState) => {
    if (snapshot.workflow) setWorkflow(snapshot.workflow);
    if (snapshot.info) setInfo(snapshot.info);
    if (snapshot.status) setStatus(snapshot.status);
    if (snapshot.diff) setDiff(snapshot.diff);
    if (snapshot.history) applyHistory(snapshot.history);
    if (snapshot.preflight?.pull) setPullPreflight(snapshot.preflight.pull);
    if (snapshot.preflight?.commit) setCommitPreflight(snapshot.preflight.commit);
    if (snapshot.preflight?.push) setPushPreflight(snapshot.preflight.push);
  }, [applyHistory]);
  const load = useCallback(
    (force = false, announce = false) => {
      setLastRefresh(new Date());
      if (announce) {
        setRefreshWarning("");
      }
      const cached = readGetCache<GitDashboardState>(GIT_CACHE_KEYS.dashboardState);
      if (cached) applyDashboardState(cached.data);
      const fresh = cached && Date.now() - cached.timestamp < CACHE_TTL.workflow;
      if (fresh && !force) return;

      if (force) refreshRequests.current += 1;
      setRefreshing(Boolean(force || cached));
      if (!cached) {
        setLoading((old) => ({
          ...old,
          dashboard_state: true,
          workflow: true,
          info: true,
          status: true,
          diff: true,
          history: true,
          preflightPull: true,
          preflightCommit: true,
          preflightPush: true,
        }));
      }

      void fetchGetCache(
        GIT_CACHE_KEYS.dashboardState,
        () => laravelGitService.getDashboardState(),
      ).then((snapshot) => {
        writeGetCache(GIT_CACHE_KEYS.dashboardState, snapshot);
        applyDashboardState(snapshot);
        if (announce) {
          if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current);
          setToast("Đã làm tươi dữ liệu.");
          setToastPaused(false);
          toastTimer.current = window.setTimeout(() => setToast(""), 3000);
        }
        setErrors((old) => {
          const next = { ...old };
          ["workflow", "info", "status", "diff", "history", "preflight"].forEach((key) => delete next[key]);
          return next;
        });
      }).catch((error) => {
        if (announce) {
          if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current);
          setToast(`Làm tươi thất bại: ${apiError(error as GitApiError)}`);
          setToastPaused(false);
          toastTimer.current = window.setTimeout(() => setToast(""), 3000);
        }
        if (!cached) {
          const typed = error as GitApiError;
          setErrors((old) => ({
            ...old,
            workflow: typed,
            info: typed,
            status: typed,
            diff: typed,
            history: typed,
            preflight: typed,
          }));
        } else {
          setRefreshWarning("Unable to refresh latest data.");
        }
      }).finally(() => {
        setLoading((old) => ({
          ...old,
          dashboard_state: false,
          workflow: false,
          info: false,
          status: false,
          diff: false,
          history: false,
          preflightPull: false,
          preflightCommit: false,
          preflightPush: false,
        }));
        if (force) refreshRequests.current = Math.max(0, refreshRequests.current - 1);
        if (refreshRequests.current === 0) setRefreshing(false);
      });
    },
    [applyDashboardState],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const notify = useCallback((message: string, scope?: "commit" | "push") => {
    if (toastTimer.current !== undefined) {
      window.clearTimeout(toastTimer.current);
    }
    setToast(message);
    setToastPaused(false);
    if (scope === "commit") setCommitNotice(message);
    if (scope === "push") setPushNotice(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 3000);
  }, []);
  const openPullRequestDetails = async () => {
    const index = cyclePullRequest?.index;
    if (!index) return;
    setPullRequestLoading(true);
    try {
      const pullRequest = await laravelGitService.getPullRequest(index);
      const message = `PR #${pullRequest.index || index} · ${pullRequest.state || "unknown"}`;
      setPullRequestNotice(message);
      notify(message);
    } catch (error) {
      const message = `Open Details failed: ${apiError(error as GitApiError)}`;
      setPullRequestNotice(message);
      notify(message);
    } finally {
      setPullRequestLoading(false);
    }
  };
  const createPullRequest = async () => {
    const head = workflow?.current_branch || status?.branch;
    const base = workflow?.base_branch;
    if (!head || !base || pullRequestLoading) return;
    setPullRequestLoading(true);
    setPullRequestNotice("");
    try {
      const pullRequest = await laravelGitService.createPullRequest(
        `Update ${head}`,
        `Changes from ${head} into ${base}.`,
        head,
        base,
      );
      const message = `PR #${pullRequest.index || "—"} · ${pullRequest.state || "open"}`;
      setPullRequestNotice(message);
      notify(message);
      load(true);
    } catch (error) {
      const message = `Create Pull Request failed: ${apiError(error as GitApiError)}`;
      setPullRequestNotice(message);
      notify(message);
    } finally {
      setPullRequestLoading(false);
    }
  };
  const applyMergeResult = (index: number, result: PullRequestMergeResult) => {
    const mergedPullRequest: PullRequest = {
      ...(cyclePullRequest ?? { exists: true }),
      ...result,
      exists: true,
      index: result.index || index,
      state: result.state || "merged",
      merged: result.merged ?? true,
    };
    setMergeDetails(mergedPullRequest);
    setMergeDetailsIndex(index);
    setWorkflow((current) => current ? {
      ...current,
      pull_request: { ...current.pull_request, ...mergedPullRequest },
    } : current);
  };
  const refreshHistoryAfterMerge = async () => {
    applyHistory(await laravelGitService.getHistory());
  };
  const mergeCurrentPullRequest = async () => {
    const index = cyclePullRequest?.index;
    if (!index || mergeLoading) return;
    setMergeLoading(true);
    setMergeError("");
    try {
      const result = await laravelGitService.mergePullRequest(index);
      applyMergeResult(index, result);
      notify(`PR #${result.index || index} merged`);
      try {
        await refreshHistoryAfterMerge();
      } catch (error) {
        notify(`PR #${result.index || index} merged; history refresh failed: ${apiError(error as GitApiError)}`);
      }
    } catch (error) {
      const message = "Merge failed: " + apiError(error as GitApiError);
      setMergeError(message);
      notify(message);
    } finally {
      setMergeLoading(false);
    }
  };
  const forceMergeCurrentPullRequest = async () => {
    const index = cyclePullRequest?.index;
    if (!index || mergeLoading) return;
    const confirmed = window.confirm(
      `Merge PR #${index} bất chấp các điều kiện kiểm tra? Thao tác này không tự giải quyết xung đột nội dung.`,
    );
    if (!confirmed) return;

    setMergeLoading(true);
    setMergeError("");
    try {
      const result = await laravelGitService.forceMergePullRequest(index);
      applyMergeResult(index, result);
      notify(`PR #${result.index || index} merged`);
      try {
        await refreshHistoryAfterMerge();
      } catch (error) {
        notify(`PR #${result.index || index} merged; history refresh failed: ${apiError(error as GitApiError)}`);
      }
    } catch (error) {
      const message = "Force merge failed: " + apiError(error as GitApiError);
      setMergeError(message);
      notify(message);
    } finally {
      setMergeLoading(false);
    }
  };
  const loadMergeStatus = async () => {
    const index = cyclePullRequest?.index;
    if (!index || mergeLoading) return;
    setMergeLoading(true);
    setMergeError("");
    try {
      const updatedPullRequest = await laravelGitService.getPullRequest(index);
      setMergeDetails(updatedPullRequest);
      setMergeDetailsIndex(index);
      notify("Merge status loaded");
    } catch (error) {
      const message = "Load merge status failed: " + apiError(error as GitApiError);
      setMergeError(message);
      notify(message);
    } finally {
      setMergeLoading(false);
    }
  };
  const resetWorkflow = () => {
    const currentIndex = workflow?.pull_request?.index;
    if (currentIndex) setEndedPullRequestIndex(currentIndex);
    setNewCycle(true);
    setMergeDetails(undefined);
    setMergeDetailsIndex(undefined);
    setMergeError("");
    setPullRequestNotice("");
    setCommitNotice("");
    setPushNotice("");
    setUpdateNotice("");
    setStageNotice("");
    setCommitMessage("");
    setCommitDone(false);
    setPushDone(false);
    setErrors({});
    setRefreshWarning("");
    setToast("");
    load(true);
  };
  const write = async (
    operation: "pull" | "commit" | "push",
    pushMode: PushMode = "code",
  ) => {
    const allowed =
      operation === "pull"
        ? Boolean(pullPreflight?.allowed && (pullPreflight.blockers?.length || 0) === 0)
        : operation === "push"
          ? pushAllowed
          : commitAllowed;
    if (
      !allowed ||
      writeBusy ||
      (operation === "commit" && !commitMessage.trim())
    )
      return;
    setNewCycle(false);
    setWriteBusy(operation);
    try {
      if (operation === "pull") await laravelGitService.pull();
      if (operation === "commit") {
        await laravelGitService.commit(`${commitType}: [${giteaUsername || "—"}] - ${commitMessage.trim()}`);
        setCommitMessage("");
        setCommitDone(true);
        setPushDone(false);
      }
      if (operation === "push") await laravelGitService.push(pushMode);
      if (operation === "push") setPushDone(true);
      notify(`${operation} completed`, operation === "commit" || operation === "push" ? operation : undefined);
      load(true);
    } catch (error) {
      const typed = error as GitApiError;
      notify(
        typed.uncertain
          ? "Unable to confirm the Git operation result. Refresh repository status before trying again."
          : apiError(typed),
        operation === "commit" || operation === "push" ? operation : undefined,
      );
    } finally {
      setWriteBusy(undefined);
    }
  };
  const undoLastCommit = async () => {
    if (!commitDone || pushDone || uncommitLoading || writeBusy) return;
    const confirmed = window.confirm(
      "Undo the latest local commit? Its changes will be kept staged.",
    );
    if (!confirmed) return;

    setUncommitLoading(true);
    try {
      await laravelGitService.uncommit();
      setCommitDone(false);
      setPushDone(false);
      const message = "Latest commit undone; changes remain staged";
      setCommitNotice(message);
      notify(message, "commit");
      load(true);
    } catch (error) {
      const message = `Undo commit failed: ${apiError(error as GitApiError)}`;
      setCommitNotice(message);
      notify(message, "commit");
    } finally {
      setUncommitLoading(false);
    }
  };
  const allFiles = status?.files || [];
  const ahead = workflow?.sync.ahead ?? status?.ahead ?? 0;
  const behind = workflow?.sync.behind ?? status?.behind ?? 0;
  const can = (capability: string) =>
    Boolean(workflow?.capabilities?.[capability]);
  const staged = allFiles.filter((file) => file.status === "S");
  const untracked = allFiles.filter((file) => file.status === "U");
  const unstaged = allFiles.filter(
    (file) => file.status !== "S" && file.status !== "U",
  );
  const pushAllowed = Boolean(
    pushPreflight?.allowed &&
      (pushPreflight.blockers?.length || 0) === 0 &&
      behind === 0 &&
      ahead > 0,
  );
  const commitAllowed = Boolean(
    commitPreflight?.allowed &&
      (commitPreflight.blockers?.length || 0) === 0 &&
      behind === 0 &&
      (status?.staged || 0) > 0,
  );
  const pullAllowed = Boolean(
    pullPreflight?.allowed &&
      (pullPreflight.blockers?.length || 0) === 0 &&
      behind > 0,
  );
  const pushTarget =
    pushPreflight?.target_branch || workflow?.current_branch || status?.branch || "—";
  const currentStatus = status
    ? (workflow?.working_tree.clean ?? status.clean)
      ? "Clean"
      : "Modified"
    : "Loading";
  const cyclePullRequest =
    endedPullRequestIndex &&
    workflow?.pull_request?.index === endedPullRequestIndex
      ? {
          ...workflow.pull_request,
          exists: false,
          index: undefined,
          state: undefined,
          merged: false,
          merge_commit_sha: undefined,
        }
      : workflow?.pull_request;
  const mergePullRequest =
    mergeDetailsIndex === cyclePullRequest?.index
      ? mergeDetails
      : cyclePullRequest;
  const mergeSucceeded =
    Boolean(mergePullRequest?.merged) ||
    mergePullRequest?.state?.toLowerCase() === "merged";
  const mergeStatus = mergeError ? "Failed" : mergeSucceeded ? "Merged" : "Ready";
  const mergeCommitHash = mergeSucceeded
    ? mergePullRequest?.merge_commit_sha || "—"
    : mergeError || "—";

  return (
    <main className="min-h-screen w-full min-w-0 space-y-3 overflow-x-hidden bg-slate-50 p-0 text-slate-900">
      <GitTestConfigPanel
        onSaved={() => load(true)}
        onNotify={notify}
        onUsernameChange={setGiteaUsername}
        refreshing={refreshing}
      />
      <header className="rounded-xl bg-slate-950 px-5 py-5 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FolderGit2 size={15} className="text-indigo-400" />
              Git / Source Control <span className="text-slate-600">
                /
              </span>{" "}
              Laravel Git Control
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {workflow?.repository || "media_tech_ai"}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              <Tooltip description="Tài khoản Gitea hiện đang được sử dụng.">
                User: {workflow?.authenticated_user?.username || "—"}
              </Tooltip>{" "}·{" "}
              <Tooltip description="Nhánh chính dùng làm nền để tạo nhánh mới và merge code về.">
                Base: {workflow?.base_branch || "—"}
              </Tooltip>{" "}·{" "}
              <Tooltip description="Nhánh Git mà bạn đang làm việc ở thời điểm hiện tại.">
                Current: {workflow?.current_branch || info?.branch || status?.branch || "—"}
              </Tooltip>
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
            <Tooltip description="Folder Git đang sạch, không còn thay đổi từ lần trước và sẵn sàng nhận code mới.">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusColor(currentStatus)}`}
              >
                {currentStatus}
              </span>
            </Tooltip>
            <Tooltip description="Cập nhật lại trạng thái mới nhất của Git trên giao diện.">
              <Button onClick={() => load(true, true)} disabled={refreshing}>
                <RefreshCw size={14} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </Tooltip>
            <Button
              onClick={resetWorkflow}
              disabled={mergeLoading || refreshing || Boolean(writeBusy)}
            >
              Reset Workflow
            </Button>
            </div>
            <div className="flex items-center gap-2">
            <Tooltip
              description="Kiểm tra và lấy thông tin mới nhất từ Gitea mà không làm thay đổi code hiện tại."
              tooltipClassName="bottom-full left-auto right-0 top-auto mb-2"
            >
              <Button
                disabled={!can("can_fetch") || Boolean(writeBusy)}
                onClick={() =>
                  void run(
                    "fetch",
                    laravelGitService.fetch.bind(laravelGitService),
                    () => {
                      notify("Fetch completed");
                      load();
                    },
                  )
                }
              >
                <Cloud size={14} />
                Fetch
              </Button>
            </Tooltip>
            <Tooltip
              description="Cập nhật code mới nhất từ Gitea về folder Git hiện tại trước khi tiếp tục làm việc."
              tooltipClassName="bottom-full left-auto right-0 top-auto mb-2"
            >
              <Button
                disabled={Boolean(writeBusy) || Boolean(loading.update_code)}
                onClick={() =>
                  void run(
                    "update_code",
                    laravelGitService.updateCode.bind(laravelGitService),
                    () => {
                      notify("Full/Sync completed successfully");
                      load(true);
                    },
                    (error) => notify(`Update Code failed: ${apiError(error)}`),
                  )
                }
              >
                <RefreshCw
                  size={14}
                  className={loading.update_code ? "animate-spin" : ""}
                />
                {loading.update_code ? "Updating…" : "Full/Sync"}
              </Button>
            </Tooltip>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-xs text-slate-400">
          <Tooltip description="Gitea mà project hiện đang kết nối để lấy và đẩy code.">
            <span>Remote: {workflow?.remote || info?.remote || "—"}</span>
          </Tooltip>
          <SyncMetric
            label="↑ Ahead"
            value={workflow?.sync.ahead ?? status?.ahead ?? 0}
            className="text-blue-300"
            description="Số commit đã có trên máy nhưng chưa được đẩy lên Gitea."
          />
          <SyncMetric
            label="↓ Behind"
            value={workflow?.sync.behind ?? status?.behind ?? 0}
            className="text-violet-300"
            description="Số commit đã có trên Gitea nhưng máy bạn chưa cập nhật về."
          />
          <Tooltip description="Thời điểm giao diện cập nhật trạng thái Git gần nhất.">
            <span>
              Last refreshed: {lastRefresh?.toLocaleTimeString("vi-VN") || "—"}
            </span>
          </Tooltip>
          {refreshWarning && (
            <span className="text-amber-300">{refreshWarning}</span>
          )}
        </div>
      </header>
      <Workflow
        status={status}
        workflow={workflow}
        pullAllowed={pullAllowed}
        commitAllowed={commitAllowed}
        commitDone={commitDone}
        pushDone={pushDone}
        pushAllowed={pushAllowed}
        writeBusy={writeBusy}
        fetching={Boolean(loading.fetch || loading.update_code)}
        pullRequestLoading={pullRequestLoading}
        mergeLoading={mergeLoading}
        mergeStatus={mergeStatus}
        pullRequest={cyclePullRequest}
        newCycle={newCycle}
      />
      {errors.info && <InlineWarning error={errors.info} />}
      {
        <Panel
          title="Repository Overview"
          icon={<Server size={16} className="text-indigo-500" />}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Tooltip description="Project Git hiện đang được quản lý và đồng bộ với Gitea.">
                <p className="text-[11px] text-slate-400">Repository</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.authenticated_user.username || "—"} /{" "}
                {workflow?.repository || "—"}
              </p>
            </div>
            <div>
              <Tooltip description="Tên project Git đang được quản lý và đồng bộ với Gitea.">
                <p className="text-[11px] text-slate-400">Project</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.repository?.split("/").pop() || "media_tech_ai"}
              </p>
            </div>
            <div>
              <Tooltip description="Cho biết folder Git trên máy hiện có sẵn và sử dụng được hay không.">
                <p className="text-[11px] text-slate-400">Local repository</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                {info?.source_available ? "Available" : "Unavailable"}
              </p>
            </div>
            <div>
              <Tooltip description="Kiểu tổ chức source code của project. Monorepo nghĩa là nhiều phần của project nằm chung trong một repository.">
                <p className="text-[11px] text-slate-400">Repository type</p>
              </Tooltip>
              <p className="mt-1 truncate text-xs font-semibold">
                {info?.repository_type || "—"}
              </p>
            </div>
            <div>
              <Tooltip description="Tài khoản Gitea hiện đang được sử dụng.">
                <p className="text-[11px] text-slate-400">Authenticated user</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.authenticated_user.username || "—"}
              </p>
            </div>
            <div>
              <Tooltip description="Quyền hiện tại của tài khoản đối với repository, ví dụ đọc, ghi, tạo PR hoặc merge.">
                <p className="text-[11px] text-slate-400">Permission</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.permission_known ? "Known" : "Unknown"}
              </p>
            </div>
          </div>
        </Panel>
      }
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-3">
          <Panel
            title="Update (Client)"
            icon={<RefreshCw size={16} className="text-indigo-500" />}
          >
            <p className="mb-3 text-xs text-slate-500">
              Remote and write capability are controlled by Laravel preflight.
              {" "}Full/Sync calls the update-code API to create and sync the dedicated Git Test project folder, then calls dashboard-state to refresh the view.
            </p>
            <div className="flex flex-wrap gap-2">
              <Tooltip description="Kéo các thay đổi mới nhất từ remote Gitea về branch hiện tại.">
                <Button
                  disabled={!pullAllowed || Boolean(writeBusy)}
                  onClick={() => void write("pull")}
                >
                  <RefreshCw size={14} className={writeBusy === "pull" ? "animate-spin" : ""} />
                  {writeBusy === "pull" ? "Pulling…" : "Pull"}
                </Button>
              </Tooltip>
              <Tooltip description="Kiểm tra và lấy thông tin mới nhất từ Gitea mà không làm thay đổi code hiện tại.">
                <Button
                  disabled={!can("can_fetch") || Boolean(writeBusy) || Boolean(loading.fetch)}
                  onClick={() =>
                    void run(
                      "fetch",
                      laravelGitService.fetch.bind(laravelGitService),
                      () => {
                        notify("Fetch completed");
                        load(true);
                      },
                      (error) => notify(`Fetch failed: ${apiError(error)}`),
                    )
                  }
                >
                  {loading.fetch ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
                  {loading.fetch ? "Fetching…" : "Fetch"}
                </Button>
              </Tooltip>
              <Tooltip description="Đồng bộ đầy đủ code mới nhất từ Gitea về branch hiện tại.">
                <Button
                  disabled={Boolean(writeBusy) || Boolean(loading.update_code)}
                  onClick={() => {
                    setUpdateNotice("Full/Sync in progress…");
                    void run(
                      "update_code",
                      laravelGitService.updateCode.bind(laravelGitService),
                      () => {
                        setUpdateNotice("Full/Sync completed successfully");
                        notify("Full/Sync completed successfully");
                        load(true);
                      },
                      (error) => {
                        const message = `Full/Sync failed: ${apiError(error)}`;
                        setUpdateNotice(message);
                        notify(message);
                      },
                    );
                  }}
                >
                  <RefreshCw size={14} className={loading.update_code ? "animate-spin" : ""} />
                  {loading.update_code ? "Updating…" : "Full/Sync"}
                </Button>
              </Tooltip>
            </div>
            {updateNotice && (
              <p className={`mt-2 text-xs font-medium ${/failed|error/i.test(updateNotice) ? "text-rose-600" : updateNotice.includes("progress") ? "text-amber-600" : "text-emerald-600"}`}>
                {updateNotice}
              </p>
            )}
          </Panel>
          <Panel
            title="Commit (Client)"
            icon={<GitCommitHorizontal size={16} className="text-indigo-500" />}
          >
            <div className="grid gap-3 sm:grid-cols-[220px_180px_minmax(0,1fr)]">
              <label className="block text-xs font-semibold text-slate-600">
                Commit type
                <select
                  value={commitType}
                  onChange={(event) => setCommitType(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-indigo-400"
                >
                  {COMMIT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Nội dung commit
                <input
                  value={commitMessage}
                  onChange={(event) => setCommitMessage(event.target.value)}
                  placeholder="Mô tả ngắn gọn thay đổi..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-indigo-400"
                />
              </label>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Sẽ tạo: <span className="font-mono text-slate-600">{commitType}: [{giteaUsername || "—"}] - {commitMessage.trim() || "..."}</span>
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {(status?.staged || 0) > 0 ? `${status?.staged} staged files` : "Bấm Stage All trước khi Commit"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!commitDone || pushDone || uncommitLoading || Boolean(writeBusy)}
                  onClick={() => void undoLastCommit()}
                  title={pushDone ? "Undo is unavailable after Push" : "Undo the latest local commit and keep its changes staged"}
                >
                  {uncommitLoading ? "Undoing…" : "Undo Commit"}
                </Button>
                <Button
                  disabled={
                    !commitAllowed ||
                    !commitMessage.trim() ||
                    Boolean(writeBusy)
                  }
                  onClick={() => void write("commit")}
                >
                  {writeBusy === "commit" ? "Committing…" : "Commit"}
                </Button>
              </div>
            </div>
            {commitNotice && (
              <p className={`mt-2 text-[11px] ${/failed|blocked|unable|error/i.test(commitNotice) ? "text-rose-600" : "text-emerald-600"}`}>
                {commitNotice}
              </p>
            )}
          </Panel>
          <Panel
            title="Push (Client)"
            icon={<ArrowUp size={16} className="text-indigo-500" />}
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Push to</p>
                <p className="mt-1 font-semibold">
                  {workflow?.remote || "gitea"}/{pushTarget}
                </p>
              </div>
              <div>
                <Tooltip description="Gitea mà project hiện đang kết nối để lấy và đẩy code.">
                  <p className="text-slate-400">Remote</p>
                </Tooltip>
                <p className="mt-1 font-semibold">{workflow?.remote || "—"}</p>
              </div>
              <div>
                <SyncMetric
                  label="Ahead"
                  className="text-slate-400"
                  description="Số commit đã có trên máy nhưng chưa được đẩy lên Gitea."
                />
                <p className="mt-1 font-semibold text-blue-600">
                  {workflow?.sync.ahead ?? 0}
                </p>
              </div>
              <div>
                <SyncMetric
                  label="Behind"
                  className="text-slate-400"
                  description="Số commit đã có trên Gitea nhưng máy bạn chưa cập nhật về."
                />
                <p className="mt-1 font-semibold text-violet-600">
                  {workflow?.sync.behind ?? 0}
                </p>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Button
                disabled={!pushAllowed || Boolean(writeBusy)}
                onClick={() => void write("push", "code")}
              >
                <ArrowUp size={14} />
                {writeBusy === "push" ? "Pushing…" : "Push Code"}
              </Button>
              <Button
                disabled={!pushAllowed || Boolean(writeBusy)}
                onClick={() => void write("push", "packages")}
              >
                Push Packages
              </Button>
              <Button
                disabled={!pushAllowed || Boolean(writeBusy)}
                onClick={() => void write("push", "all")}
              >
                Push All
              </Button>
            </div>
            {pushNotice && (
              <p className={`mt-2 text-[11px] ${/failed|blocked|unable|error/i.test(pushNotice) ? "text-rose-600" : "text-emerald-600"}`}>
                {pushNotice}
              </p>
            )}
          </Panel>
          <Panel
            title="Pull Request (Client)"
            icon={<GitFork size={16} className="text-indigo-500" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] text-slate-400">Source branch</p>
                <p className="mt-1 text-sm font-semibold">
                  {workflow?.current_branch || status?.branch || "—"}
                </p>
              </div>
              <div>
                <Tooltip description="Nhánh chính dùng làm nền để tạo nhánh mới và merge code về.">
                  <p className="text-[11px] text-slate-400">Target branch</p>
                </Tooltip>
                <p className="mt-1 text-sm font-semibold">
                  {workflow?.base_branch || "—"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(!cyclePullRequest?.exists || cyclePullRequest.state?.toLowerCase() === "closed") && (
                <Button
                  disabled={!can("can_create_pr") || Boolean(writeBusy) || pullRequestLoading}
                  onClick={() => void createPullRequest()}
                >
                  {pullRequestLoading && <RefreshCw size={14} className="animate-spin" />}
                  {pullRequestLoading ? "Creating…" : "Create Pull Request"}
                </Button>
              )}
              {cyclePullRequest?.exists && cyclePullRequest.state?.toLowerCase() === "open" && (
                <Button onClick={() => void openPullRequestDetails()} disabled={pullRequestLoading}>
                  {pullRequestLoading ? "Loading…" : "Open Details"}
                </Button>
              )}
            </div>
            <p className={`mt-3 text-[11px] ${/failed|error/i.test(pullRequestNotice) ? "text-rose-600" : (pullRequestNotice || cyclePullRequest?.state)?.toLowerCase().includes("open") ? "font-semibold text-emerald-600" : "text-slate-400"}`}>
              {pullRequestNotice || (cyclePullRequest?.exists
                ? `PR #${cyclePullRequest.index || "—"} · ${cyclePullRequest.state || "unknown"}`
                : "Pull Request: Not created")}
            </p>
          </Panel>
          <Panel
            title="Review status"
            icon={<CheckCircle2 size={16} className="text-indigo-500" />}
          >
            <p className="text-sm font-semibold text-slate-700">Waiting for review</p>
            <p className="mt-3 text-[11px] text-slate-400">
              Employee workflow ends here. Continue review and merge in Gitea.
            </p>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                <Terminal size={13} className="text-indigo-500" />
                Git Activity
              </div>
              <p className="font-mono text-xs text-slate-500">
                {lastRefresh
                  ? `${lastRefresh.toLocaleTimeString("vi-VN")}  GET workflow, source/info, status, diff, history`
                  : "Waiting for API response"}
              </p>
            </div>
          </Panel>
          <Panel
            title="Merge (Admin)"
            icon={<GitMerge size={16} className="text-indigo-500" />}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Merge to main
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Gộp thay đổi vào nhánh main
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => void mergeCurrentPullRequest()}
                  disabled={
                    !workflow?.pull_request?.index ||
                    mergeLoading ||
                    mergeSucceeded
                  }
                >
                  Merge to main
                </Button>
                <Button
                  onClick={() => void forceMergeCurrentPullRequest()}
                  disabled={
                    !workflow?.pull_request?.index ||
                    mergeLoading ||
                    mergeSucceeded
                  }
                  title="Bỏ qua một số điều kiện merge; không tự xử lý xung đột nội dung"
                >
                  {mergeLoading ? "Merging…" : "Force Merge"}
                </Button>
              </div>
            </div>
          </Panel>
          <Panel
            title="Merge Status (Admin)"
            icon={<GitMerge size={16} className="text-indigo-500" />}
            action={
              <Button
                onClick={() => void loadMergeStatus()}
                disabled={!cyclePullRequest?.index || mergeLoading || mergeSucceeded}
              >
                {mergeLoading ? "Loading…" : "Load"}
              </Button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] text-slate-400">Status</p>
                <p className="mt-1 text-sm font-semibold text-amber-600">
                  {mergeStatus}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">
                  Merge commit hash
                </p>
                <p className={`mt-1 min-w-0 break-words whitespace-pre-wrap text-sm ${mergeError ? "text-rose-600" : "font-mono text-slate-500"}`}>
                  {mergeCommitHash}
                </p>
              </div>
            </div>
          </Panel>
          <Panel
            title="Diff Viewer"
            icon={<FileCode2 size={16} className="text-indigo-500" />}
            action={
              <span className="max-w-56 truncate text-[11px] text-slate-400">
                {selectedFile?.path || "Backend diff"}
              </span>
            }
          >
            {errors.diff && <InlineWarning error={errors.diff} />}
            {loading.diff && !diff ? (
              <div className="h-40 animate-pulse rounded bg-slate-100" />
            ) : diff?.diff ? (
              <pre className="w-full min-w-0 max-w-full max-h-[420px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-300">
                {diff.diff}
              </pre>
            ) : (
              <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-400">
                No changes to display
              </div>
            )}
          </Panel>
          <Panel
            title="Advanced"
            icon={<ShieldAlert size={16} className="text-red-500" />}
          >
            <p className="text-xs leading-5 text-slate-500">
              Destructive operations are visible for workflow completeness but
              disabled until Laravel exposes capabilities.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <DisabledButton>
                <Trash2 size={13} />
                Delete Branch
              </DisabledButton>
              <DisabledButton>Abort Merge</DisabledButton>
            </div>
          </Panel>
        </div>
        <div className="min-w-0 space-y-3">
          <Panel
            title="Branch"
            icon={<GitBranch size={16} className="text-indigo-500" />}
          >
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <Tooltip description="Nhánh Git mà bạn đang làm việc ở thời điểm hiện tại.">
                <p className="text-[11px] text-indigo-600">Current branch</p>
              </Tooltip>
              <p className="mt-1 text-sm font-bold text-indigo-950">
                {workflow?.current_branch ||
                  info?.branch ||
                  status?.branch ||
                  "—"}
              </p>
            </div>
            <div className="mt-3 space-y-2">
              <Button
                disabled={!can("can_switch_branch") || Boolean(writeBusy) || Boolean(loading.switch_branch)}
                onClick={() => {
                  let targetBranch = "";
                  void run(
                    "switch_branch",
                    async () => {
                      const config = await laravelGitService.getConfig();
                      targetBranch = config.working_branch;
                      if (!targetBranch) throw new Error("Working branch chưa được cấu hình");
                      return laravelGitService.switchBranch(targetBranch);
                    },
                    () => {
                      setNewCycle(true);
                      setCommitDone(false);
                      setPushDone(false);
                      setPullRequestNotice("");
                      setMergeDetails(undefined);
                      setMergeDetailsIndex(undefined);
                      notify(`Switched to ${targetBranch}`);
                      load(true);
                    },
                    (error) => notify(`Switch branch failed: ${apiError(error)}`),
                  );
                }}
              >
                {loading.switch_branch ? <RefreshCw size={14} className="animate-spin" /> : <GitBranch size={14} />}
                {loading.switch_branch ? "Switching…" : "Switch Branch"}
              </Button>
              <Button
                disabled={!can("can_create_branch") || Boolean(writeBusy) || Boolean(loading.create_branch)}
                onClick={() => {
                  let targetBranch = "";
                  void run(
                    "create_branch",
                    async () => {
                      const config = await laravelGitService.getConfig();
                      targetBranch = config.working_branch;
                      if (!targetBranch) throw new Error("Working branch chưa được cấu hình");
                      return laravelGitService.createBranch(targetBranch);
                    },
                    () => {
                      notify(`Branch created: ${targetBranch}`);
                      load(true);
                    },
                    (error) => notify(`Create branch failed: ${apiError(error)}`),
                  );
                }}
              >
                {loading.create_branch && <RefreshCw size={14} className="animate-spin" />}
                {loading.create_branch ? "Creating…" : "Create Branch"}
              </Button>
              <Button
                disabled={!can("can_delete_branch") || Boolean(writeBusy)}
              >
                Delete Branch
              </Button>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Branch capability is controlled by the workflow response.
            </p>
          </Panel>
          <Panel
            title="Working Tree"
            icon={<Code2 size={16} className="text-indigo-500" />}
            action={status && <div className="flex gap-2 text-[11px] text-slate-500"><span>Modified {unstaged.length}</span><span>Untracked {status.untracked}</span><span>Staged {status.staged}</span></div>}
          >
            {errors.status && <InlineWarning error={errors.status} />}
            {stageNotice && <p className={`mb-3 text-xs font-semibold ${/failed|error/i.test(stageNotice) ? "text-rose-600" : "text-emerald-600"}`}>{stageNotice}</p>}
            {loading.status && !status ? <div className="h-32 animate-pulse rounded bg-slate-100" /> : <>
              <div><p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Staged</p><FileList files={staged} onSelect={setSelectedFile} /></div>
              <div className="my-3 flex flex-wrap gap-2 border-y border-slate-100 py-2">
                <Button title={(status?.unstaged ?? unstaged.length) === 0 && (status?.untracked ?? untracked.length) === 0 ? "No modified or untracked files to stage" : undefined} disabled={!can("can_stage") || behind > 0 || (status?.unstaged ?? unstaged.length) === 0 && (status?.untracked ?? untracked.length) === 0 || Boolean(writeBusy) || Boolean(loading.stage)} onClick={() => void run("stage", laravelGitService.stageAll.bind(laravelGitService), () => { setStageNotice("Files staged"); notify("Files staged"); load(true); }, (error) => { const message = `Stage All failed: ${apiError(error)}`; setStageNotice(message); notify(message); })}>{loading.stage ? <RefreshCw size={13} className="animate-spin" /> : null}{loading.stage ? "Staging…" : "Stage All"}</Button>
                <Button disabled={!can("can_stage") || behind > 0 || !selectedFile || Boolean(writeBusy)} onClick={() => selectedFile && void run("stage_file", () => laravelGitService.stage([selectedFile.path]), () => { setStageNotice("File staged"); notify("File staged"); load(true); }, (error) => { const message = `Stage failed: ${apiError(error)}`; setStageNotice(message); notify(message); })}>Stage</Button>
                <Button disabled={!can("can_unstage") || !selectedFile || Boolean(writeBusy)} onClick={() => selectedFile && void run("unstage_file", () => laravelGitService.unstage([selectedFile.path]), () => { setStageNotice("File unstaged"); notify("File unstaged"); load(true); }, (error) => { const message = `Unstage failed: ${apiError(error)}`; setStageNotice(message); notify(message); })}>Unstage</Button>
                <DisabledButton><Trash2 size={13} />Discard</DisabledButton>
              </div>
              <div className="mt-3"><p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Modified</p><FileList files={unstaged} onSelect={setSelectedFile} /></div>
              <div className="mt-3"><p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Untracked</p><FileList files={untracked} onSelect={setSelectedFile} /></div>
            </>}
          </Panel>
          <HistoryPanel
            history={history}
            error={errors.history}
            selectedCommit={selectedCommit}
            onSelect={setSelectedCommit}
          />
        </div>
      </div>
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white shadow-xl"
          onMouseEnter={() => {
            if (toastTimer.current !== undefined) {
              window.clearTimeout(toastTimer.current);
              toastTimer.current = undefined;
            }
            setToastPaused(true);
          }}
          onMouseLeave={() => {
            if (!toastPaused) {
              toastTimer.current = window.setTimeout(() => setToast(""), 3000);
            }
          }}
          onClick={() => {
            if (toastTimer.current !== undefined) {
              window.clearTimeout(toastTimer.current);
              toastTimer.current = undefined;
            }
            setToastPaused(true);
          }}
        >
          <CheckCircle2 size={15} className="text-emerald-400" />
          {toast}
        </div>
      )}
    </main>
  );
}
