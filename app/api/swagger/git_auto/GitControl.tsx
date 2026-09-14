"use client";

import { useCallback, useEffect, useState } from "react";
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
  RefreshCw,
  Server,
  ShieldAlert,
  Terminal,
  Trash2,
} from "lucide-react";
import {
  ChangedFile,
  Commit,
  GitApiError,
  SourceDiff,
  SourceInfo,
  SourceStatus,
  GitWorkflow,
  Preflight,
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
  preflightPush: "preflight:push",
} as const;

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
}: {
  children: React.ReactNode;
  description: string;
  className?: string;
}) {
  return (
    <span className={`group relative inline-flex cursor-help ${className}`}>
      {children}
      <span className="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
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
      <div className="flex min-w-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-800">
          {icon}
          {title}
        </div>
        {action}
      </div>
      <div className="min-w-0 overflow-visible p-4">{children}</div>
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

function Workflow({ status }: { status?: SourceStatus }) {
  const current = !status
    ? "Update"
    : status.clean && (status.behind || 0) > 0
      ? "Update"
      : status.clean
        ? "Push"
        : "Changes";
  const steps = [
    "Update",
    "Branch",
    "Changes",
    "Commit",
    "Push",
    "Pull Request",
  ];
  const stepDescriptions: Record<string, string> = {
    Update: "Cập nhật code mới nhất từ Gitea về folder Git trước khi bắt đầu làm việc.",
    Branch: "Tạo hoặc chuyển sang nhánh riêng để chuẩn bị thay đổi code.",
    Changes: "Xem những file đã thay đổi trước khi commit.",
    Commit: "Lưu lại một phiên bản thay đổi của code vào Git trên máy.",
    Push: "Đẩy các commit trên máy lên Gitea.",
    "Pull Request": "Tạo yêu cầu đưa thay đổi từ nhánh hiện tại vào nhánh chính.",
  };
  return (
    <Panel
      title="Workflow"
      icon={<GitMerge size={16} className="text-indigo-500" />}
    >
      <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-lg border p-3 ${step === current ? "border-indigo-300 bg-indigo-50" : "border-slate-100 bg-slate-50"}`}
          >
            <p className="text-[10px] font-bold text-slate-400">0{index + 1}</p>
            <Tooltip description={stepDescriptions[step]}>
              <p
                className={`mt-2 text-xs font-semibold ${step === current ? "text-indigo-800" : "text-slate-600"}`}
              >
                {step}
              </p>
            </Tooltip>
            {step === current && (
              <Tooltip description="Bước hiện tại mà workflow đang ở.">
                <p className="mt-1 text-[10px] uppercase tracking-wide text-indigo-500">
                  Current
                </p>
              </Tooltip>
            )}
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
  history: Commit[];
  error?: GitApiError;
  selectedCommit?: Commit;
  onSelect: (commit: Commit) => void;
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
        history.map((commit) => (
          <button
            key={commit.sha}
            onClick={() => onSelect(commit)}
            className="flex w-full items-center gap-3 border-b border-slate-100 px-2 py-3 text-left hover:bg-slate-50"
          >
            <span className="font-mono text-xs text-indigo-600">
              {commit.short_sha || commit.sha.slice(0, 7)}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
              {commit.message?.trim()}
            </span>
            <span className="hidden text-[11px] text-slate-400 sm:block">
              {commit.author}
            </span>
            <span className="text-[11px] text-slate-400">
              {formatDate(commit.created_at)}
            </span>
            <ChevronRight size={14} className="text-slate-300" />
          </button>
        ))
      ) : (
        <p className="py-4 text-center text-sm text-slate-400">
          {error ? "History temporarily unavailable." : "No history found."}
        </p>
      )}
      {selectedCommit && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs">
          <p className="font-semibold">{selectedCommit.message?.trim()}</p>
          <p className="mt-1 font-mono text-slate-500">
            {selectedCommit.sha} · {selectedCommit.author}
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
  const [history, setHistory] = useState<Commit[]>([]);
  const [pushPreflight, setPushPreflight] = useState<Preflight>();
  const [errors, setErrors] = useState<Record<string, GitApiError>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>();
  const [selectedFile, setSelectedFile] = useState<ChangedFile>();
  const [selectedCommit, setSelectedCommit] = useState<Commit>();
  const [commitMessage, setCommitMessage] = useState("");
  const [toast, setToast] = useState("");
  const [writeBusy, setWriteBusy] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshWarning, setRefreshWarning] = useState("");
  const run = useCallback(
    async <T,>(
      key: string,
      request: () => Promise<T>,
      setter: (value: T) => void,
    ) => {
      setLoading((old) => ({ ...old, [key]: true }));
      try {
        setter(await request());
        setErrors((old) => {
          const next = { ...old };
          delete next[key];
          return next;
        });
      } catch (error) {
        setErrors((old) => ({ ...old, [key]: error as GitApiError }));
      } finally {
        setLoading((old) => ({ ...old, [key]: false }));
      }
    },
    [],
  );
  const runGet = useCallback(
    async <T,>(
      key: string,
      ttl: number,
      request: () => Promise<T>,
      setter: (value: T) => void,
      force = false,
    ) => {
      const cached = readGetCache<T>(key);
      if (cached) setter(cached.data);
      const fresh = cached && Date.now() - cached.timestamp < ttl;
      if (fresh && !force) return;
      if (cached) setRefreshing(true);
      else setLoading((old) => ({ ...old, [key]: true }));
      try {
        const value = await fetchGetCache(key, request);
        writeGetCache(key, value);
        setter(value);
        setErrors((old) => {
          const next = { ...old };
          delete next[key];
          return next;
        });
      } catch (error) {
        if (!cached)
          setErrors((old) => ({ ...old, [key]: error as GitApiError }));
        else setRefreshWarning("Unable to refresh latest data.");
      } finally {
        setLoading((old) => ({ ...old, [key]: false }));
        setRefreshing(false);
      }
    },
    [],
  );
  const load = useCallback(
    (force = false) => {
      setLastRefresh(new Date());
      setRefreshWarning("");
      void runGet(
        GIT_CACHE_KEYS.workflow,
        CACHE_TTL.workflow,
        laravelGitService.getWorkflow.bind(laravelGitService),
        setWorkflow,
        force,
      );
      void runGet(
        GIT_CACHE_KEYS.info,
        CACHE_TTL.workflow,
        laravelGitService.getInfo.bind(laravelGitService),
        setInfo,
        force,
      );
      void runGet(
        GIT_CACHE_KEYS.status,
        CACHE_TTL.status,
        laravelGitService.getStatus.bind(laravelGitService),
        setStatus,
        force,
      );
      void runGet(
        GIT_CACHE_KEYS.diff,
        CACHE_TTL.diff,
        laravelGitService.getDiff.bind(laravelGitService),
        setDiff,
        force,
      );
      void runGet(
        GIT_CACHE_KEYS.history,
        CACHE_TTL.history,
        laravelGitService.getHistory.bind(laravelGitService),
        setHistory,
        force,
      );
      void runGet(
        GIT_CACHE_KEYS.preflightPush,
        CACHE_TTL.status,
        () => laravelGitService.getPreflight("push"),
        setPushPreflight,
        force,
      );
    },
    [runGet],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const write = async (operation: "pull" | "commit" | "push") => {
    const capability =
      operation === "pull" ? "can_update_base" : `can_${operation}`;
    const allowed = operation === "push" ? pushAllowed : can(capability);
    if (
      !allowed ||
      writeBusy ||
      (operation === "commit" && !commitMessage.trim())
    )
      return;
    setWriteBusy(operation);
    try {
      if (operation === "pull") await laravelGitService.pull();
      if (operation === "commit") {
        await laravelGitService.commit(commitMessage.trim());
        setCommitMessage("");
      }
      if (operation === "push") await laravelGitService.push();
      notify(`${operation} completed`);
      load();
    } catch (error) {
      const typed = error as GitApiError;
      notify(
        typed.uncertain
          ? "Unable to confirm the Git operation result. Refresh repository status before trying again."
          : apiError(typed),
      );
    } finally {
      setWriteBusy(undefined);
    }
  };
  const allFiles = status?.files || [];
  const can = (capability: string) =>
    Boolean(workflow?.capabilities?.[capability]);
  const staged = allFiles.filter((file) => file.status === "S");
  const untracked = allFiles.filter((file) => file.status === "U");
  const unstaged = allFiles.filter(
    (file) => file.status !== "S" && file.status !== "U",
  );
  const capabilityHint = (operation: "commit" | "push") =>
    workflow
      ? can(`can_${operation}`)
        ? `${operation} is available.`
        : `${operation} is disabled by backend capability.`
      : "Waiting for workflow capability data.";
  const pushAllowed = Boolean(
    pushPreflight?.allowed && (pushPreflight.blockers?.length || 0) === 0,
  );
  const pushTarget =
    pushPreflight?.target_branch || workflow?.current_branch || status?.branch || "—";
  const currentStatus = status
    ? (workflow?.working_tree.clean ?? status.clean)
      ? "Clean"
      : "Modified"
    : "Loading";

  return (
    <main className="min-h-screen w-full min-w-0 space-y-4 overflow-x-hidden bg-slate-50 p-0 text-slate-900">
      <header className="rounded-xl bg-slate-950 px-5 py-5 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
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
          <div className="flex items-center gap-2">
            <Tooltip description="Folder Git đang sạch, không còn thay đổi từ lần trước và sẵn sàng nhận code mới.">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusColor(currentStatus)}`}
              >
                {currentStatus}
              </span>
            </Tooltip>
            <Tooltip description="Cập nhật lại trạng thái mới nhất của Git trên giao diện.">
              <Button onClick={() => load(true)} disabled={refreshing}>
                <RefreshCw size={14} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </Tooltip>
            <Tooltip description="Kiểm tra và lấy thông tin mới nhất từ Gitea mà không làm thay đổi code hiện tại.">
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
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-xs text-slate-400">
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
      <Workflow status={status} />
      {errors.info && <InlineWarning error={errors.info} />}
      {
        <Panel
          title="Repository Overview"
          icon={<Server size={16} className="text-indigo-500" />}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <Tooltip description="Phần source code hiện Git Control đang quản lý trong project.">
                <p className="text-[11px] text-slate-400">Component</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {info?.component || "openclaw"}
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
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-4">
          <Panel
            title="Update"
            icon={<RefreshCw size={16} className="text-indigo-500" />}
          >
            <p className="mb-3 text-xs text-slate-500">
              Remote and write capability are controlled by Laravel preflight.
            </p>
            <div className="flex flex-wrap gap-2">
              <Tooltip description="Kiểm tra và lấy thông tin mới nhất từ Gitea mà không làm thay đổi code hiện tại.">
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
              <Button
                disabled={!can("can_update_base") || Boolean(writeBusy)}
                onClick={() =>
                  void run(
                    "update_base",
                    laravelGitService.updateBase.bind(laravelGitService),
                    () => {
                      notify("Update Main completed");
                      load();
                    },
                  )
                }
              >
                Update Main
              </Button>
              <Button
                disabled={!can("can_sync_base") || Boolean(writeBusy)}
                onClick={() =>
                  void run(
                    "sync_base",
                    laravelGitService.syncBase.bind(laravelGitService),
                    () => {
                      notify("Sync from Main completed");
                      load();
                    },
                  )
                }
              >
                Sync Current Branch from Main
              </Button>
            </div>
          </Panel>
          <Panel
            title="Commit"
            icon={<GitCommitHorizontal size={16} className="text-indigo-500" />}
          >
            <textarea
              value={commitMessage}
              onChange={(event) => setCommitMessage(event.target.value)}
              placeholder="update: [dangtin] - ..."
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-indigo-400"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {status?.staged || 0} staged files
              </span>
              <Button
                disabled={
                  !can("can_commit") ||
                  !commitMessage.trim() ||
                  Boolean(writeBusy)
                }
                onClick={() => void write("commit")}
              >
                {writeBusy === "commit" ? "Committing…" : "Commit"}
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-amber-700">
              {workflow?.capabilities
                ? can("can_commit")
                  ? "Commit is available."
                  : "Commit is disabled by backend capability."
                : capabilityHint("commit")}
            </p>
          </Panel>
          <Panel
            title="Push"
            icon={<ArrowUp size={16} className="text-indigo-500" />}
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Target branch</p>
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
            <Button
              disabled={!pushAllowed || Boolean(writeBusy)}
              onClick={() => void write("push")}
            >
              <ArrowUp size={14} />
              {writeBusy === "push" ? "Pushing…" : "Push Branch"}
            </Button>
            <p className="mt-2 text-[11px] text-amber-700">
              {pushPreflight
                ? pushAllowed
                  ? "Push Branch is available."
                  : `Push blocked${pushPreflight.blockers?.length ? `: ${pushPreflight.blockers.join(", ")}` : "."}`
                : "Waiting for push preflight data."}
            </p>
          </Panel>
          <Panel
            title="Working Tree"
            icon={<Code2 size={16} className="text-indigo-500" />}
            action={
              status && (
                <div className="flex gap-2 text-[11px] text-slate-500">
                  <span>Modified {unstaged.length}</span>
                  <span>Untracked {status.untracked}</span>
                  <span>Staged {status.staged}</span>
                </div>
              )
            }
          >
            {errors.status && <InlineWarning error={errors.status} />}
            {loading.status && !status ? (
              <div className="h-32 animate-pulse rounded bg-slate-100" />
            ) : (
              <>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Staged
                  </p>
                  <FileList files={staged} onSelect={setSelectedFile} />
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Modified
                  </p>
                  <FileList files={unstaged} onSelect={setSelectedFile} />
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Untracked
                  </p>
                  <FileList files={untracked} onSelect={setSelectedFile} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    disabled={!can("can_stage") || Boolean(writeBusy)}
                    onClick={() =>
                      void run(
                        "stage",
                        laravelGitService.stageAll.bind(laravelGitService),
                        () => {
                          notify("Files staged");
                          load();
                        },
                      )
                    }
                  >
                    Stage All
                  </Button>
                  <Button
                    disabled={
                      !can("can_stage") || !selectedFile || Boolean(writeBusy)
                    }
                    onClick={() =>
                      selectedFile &&
                      void run(
                        "stage_file",
                        () => laravelGitService.stage([selectedFile.path]),
                        () => {
                          notify("File staged");
                          load();
                        },
                      )
                    }
                  >
                    Stage
                  </Button>
                  <Button
                    disabled={
                      !can("can_unstage") || !selectedFile || Boolean(writeBusy)
                    }
                    onClick={() =>
                      selectedFile &&
                      void run(
                        "unstage_file",
                        () => laravelGitService.unstage([selectedFile.path]),
                        () => {
                          notify("File unstaged");
                          load();
                        },
                      )
                    }
                  >
                    Unstage
                  </Button>
                  <DisabledButton>
                    <Trash2 size={13} />
                    Discard
                  </DisabledButton>
                </div>
              </>
            )}
          </Panel>
        </div>
        <div className="min-w-0 space-y-4">
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
                disabled={!can("can_switch_branch") || Boolean(writeBusy)}
              >
                <GitBranch size={14} />
                Switch Branch
              </Button>
              <Button
                disabled={!can("can_create_branch") || Boolean(writeBusy)}
              >
                Create Branch
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
              <pre className="w-full min-w-0 max-w-full max-h-[420px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-4 font-mono text-[11px] leading-5 text-slate-300">
                {diff.diff}
              </pre>
            ) : (
              <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-400">
                No changes to display
              </div>
            )}
          </Panel>
          <HistoryPanel
            history={history}
            error={errors.history}
            selectedCommit={selectedCommit}
            onSelect={setSelectedCommit}
          />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Pull Request"
          icon={<GitFork size={16} className="text-indigo-500" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] text-slate-400">Head</p>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.current_branch || status?.branch || "—"}
              </p>
            </div>
            <div>
              <Tooltip description="Nhánh chính dùng làm nền để tạo nhánh mới và merge code về.">
                <p className="text-[11px] text-slate-400">Base</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.base_branch || "—"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={!can("can_create_pr") || Boolean(writeBusy)}>
              Create Pull Request
            </Button>
            <Button disabled={!workflow?.pull_request.exists}>
              Open Details
            </Button>
            <Button
              disabled={!can("can_request_review") || Boolean(writeBusy)}
            >
              Request Review
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            {workflow?.pull_request.exists
              ? `PR #${workflow.pull_request.index || "—"} · ${workflow.pull_request.state || "unknown"}`
              : "Pull Request: Not created"}
          </p>
        </Panel>
        <Panel
          title="Review status"
          icon={<CheckCircle2 size={16} className="text-indigo-500" />}
        >
          <p className="text-sm font-semibold text-slate-700">
            Waiting for review
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            Employee workflow ends here. Continue review and merge in Gitea.
          </p>
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
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
        <Panel
          title="Git Activity"
          icon={<Terminal size={16} className="text-indigo-500" />}
        >
          <p className="font-mono text-xs text-slate-500">
            {lastRefresh
              ? `${lastRefresh.toLocaleTimeString("vi-VN")}  GET workflow, source/info, status, diff, history`
              : "Waiting for API response"}
          </p>
        </Panel>
      </div>
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <CheckCircle2 size={15} className="text-emerald-400" />
          {toast}
        </div>
      )}
    </main>
  );
}
