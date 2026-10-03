"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Layers,
  Terminal,
  Search,
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Server,
  FileCode2,
  X,
  Filter,
  RefreshCw,
  AlertCircle,
  Database,
  Radio,
  Cpu,
  User,
  Zap,
  Info,
  Archive,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye,
  LayoutGrid,
  List,
  Code2,
  Calendar,
  Sparkles,
} from "lucide-react";

export type WorkspaceRecord = {
  id: number;
  workspace_name: string | null;
  work_space_code: string;
  parent_workspace_code?: string | null;
  slug: string;
  description: string | null;
  status: "active" | "archived";
  sessions_count?: number;
  created_at: string;
  updated_at: string;
};

export type WorkspaceSessionRecord = {
  id: number;
  openclaw_session_key: string;
  user_id: number;
  workspace_id: number;
  user_chat_id?: number | null;
  agent_code: string;
  skill_code?: string | null;
  work_space_code: string;
  slug: string;
  description?: string | null;
  status: "active" | "ended";
  created_at: string;
  updated_at: string;
  workspace?: {
    id: number;
    workspace_name: string | null;
    work_space_code: string;
    slug: string;
    status: string;
  } | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

// Initial state modeled exactly after Laravel API response (https://laravel_mt.hust.media/api/workspaces/main/data)
const INITIAL_WORKSPACES_DATA: WorkspaceRecord[] = [
  {
    id: 1,
    workspace_name: "Hỗ trợ Media Tech Backend",
    work_space_code: "workspace_backend_support",
    parent_workspace_code: "workspace-test",
    slug: "workspace-backend-support",
    description: "Workspace hỗ trợ cài đặt, cấu hình và vận hành Media Tech Backend",
    status: "active",
    sessions_count: 0,
    created_at: "2026-09-30T10:37:59.000000Z",
    updated_at: "2026-09-30T15:49:02.000000Z",
  },
  {
    id: 4,
    workspace_name: "Hỗ trợ OpenClaw",
    work_space_code: "workspace_openclaw_support",
    parent_workspace_code: "workspace-test",
    slug: "workspace-openclaw-support",
    description: "Workspace hỗ trợ cấu hình và vận hành OpenClaw",
    status: "active",
    sessions_count: 0,
    created_at: "2026-09-30T15:48:52.000000Z",
    updated_at: "2026-09-30T15:48:52.000000Z",
  },
];

const INITIAL_META: PaginationMeta = {
  current_page: 1,
  from: 1,
  last_page: 1,
  per_page: 20,
  to: 3,
  total: 3,
};

export default function WorkspaceManagement() {
  // Navigation tab: 'workspaces' (work_space_main) | 'sessions' (work_space_session)
  const [activeTab, setActiveTab] = useState<"workspaces" | "sessions">("workspaces");

  // View Mode: 'card' (Grid cards) | 'table' (Tabular rows)
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // --- Workspaces State (work_space_main) ---
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>(INITIAL_WORKSPACES_DATA);
  const [wsMeta, setWsMeta] = useState<PaginationMeta | null>(INITIAL_META);
  const [wsLoading, setWsLoading] = useState<boolean>(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsSearch, setWsSearch] = useState<string>("");
  const [wsStatusFilter, setWsStatusFilter] = useState<"all" | "active" | "archived">("all");

  // --- Sessions State (work_space_session) ---
  const [sessions, setSessions] = useState<WorkspaceSessionRecord[]>([]);
  const [sessionMeta, setSessionMeta] = useState<PaginationMeta | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Session Filters
  const [sessionUserFilter, setSessionUserFilter] = useState<string>("");
  const [sessionAgentFilter, setSessionAgentFilter] = useState<string>("");
  const [sessionWsFilter, setSessionWsFilter] = useState<string>("all");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<"all" | "active" | "ended">("all");

  // --- Quick Drawer/Modal to view Sessions of a specific Workspace ---
  const [viewingWorkspaceSessions, setViewingWorkspaceSessions] = useState<WorkspaceRecord | null>(null);
  const [specificWsSessions, setSpecificWsSessions] = useState<WorkspaceSessionRecord[]>([]);
  const [specificWsLoading, setSpecificWsLoading] = useState<boolean>(false);

  // --- JSON Viewer Modal ---
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [rawJsonData, setRawJsonData] = useState<unknown>(null);

  // --- UI Helpers ---
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Modal Form State (Create / Edit Workspace) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingWs, setEditingWs] = useState<WorkspaceRecord | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    workspace_name: "",
    work_space_code: "",
    parent_workspace_code: "",
    slug: "",
    description: "",
    status: "active" as "active" | "archived",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopy = (key: string, text: string, label: string = "nội dung") => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    showToast(`Đã sao chép ${label}!`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // --- 1. Fetch Workspaces from Laravel API (workspaces/main/data) ---
  const fetchWorkspaces = useCallback(async () => {
    setWsLoading(true);
    setWsError(null);
    try {
      const queryParams = new URLSearchParams();
      if (wsSearch.trim()) queryParams.set("q", wsSearch.trim());
      if (wsStatusFilter !== "all") queryParams.set("status", wsStatusFilter);
      queryParams.set("per_page", "50");

      let json;
      try {
        const res = await fetch(`/next/api/workspaces-proxy/workspaces/main/data?${queryParams.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Proxy HTTP ${res.status}`);
        }
        json = await res.json();
      } catch {
        // Fallback trực tiếp tới API Laravel https://laravel_mt.hust.media/api/workspaces/main/data
        const directRes = await fetch(`https://laravel_mt.hust.media/api/workspaces/main/data?${queryParams.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!directRes.ok) {
          const errJson = await directRes.json().catch(() => ({}));
          throw new Error(errJson.message || `Lỗi máy chủ Laravel (HTTP ${directRes.status})`);
        }
        json = await directRes.json();
      }

      setRawJsonData(json);
      setWorkspaces(json.data || []);
      setWsMeta(json.meta || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setWsError(msg);
    } finally {
      setWsLoading(false);
    }
  }, [wsSearch, wsStatusFilter]);

  // --- 2. Fetch Sessions from Laravel API (work_space_session) ---
  const fetchSessions = useCallback(async () => {
    setSessionLoading(true);
    setSessionError(null);
    try {
      const queryParams = new URLSearchParams();
      if (sessionUserFilter.trim()) queryParams.set("user_id", sessionUserFilter.trim());
      if (sessionAgentFilter.trim()) queryParams.set("agent_code", sessionAgentFilter.trim());
      if (sessionWsFilter !== "all") queryParams.set("workspace_id", sessionWsFilter);
      if (sessionStatusFilter !== "all") queryParams.set("status", sessionStatusFilter);
      queryParams.set("per_page", "50");

      const res = await fetch(`/next/api/workspaces-proxy/workspace-sessions?${queryParams.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Lỗi phản hồi API Sessions (HTTP ${res.status})`);
      }

      const json = await res.json();
      setSessions(json.data || []);
      setSessionMeta(json.meta || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSessionError(msg);
    } finally {
      setSessionLoading(false);
    }
  }, [sessionUserFilter, sessionAgentFilter, sessionWsFilter, sessionStatusFilter]);

  // --- 3. Fetch Sessions of a Specific Workspace ---
  const fetchSpecificWorkspaceSessions = async (workspace: WorkspaceRecord) => {
    setViewingWorkspaceSessions(workspace);
    setSpecificWsLoading(true);
    try {
      const res = await fetch(`/next/api/workspaces-proxy/workspaces/${workspace.id}/sessions`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setSpecificWsSessions(json.data || []);
    } catch {
      setSpecificWsSessions([]);
    } finally {
      setSpecificWsLoading(false);
    }
  };

  // Switch to Sessions Tab with a specific workspace filter applied
  const filterSessionsByWorkspace = (wsId: number) => {
    setSessionWsFilter(String(wsId));
    setActiveTab("sessions");
  };

  // Initial load
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeTab === "sessions") {
      fetchSessions();
    }
  }, [activeTab, fetchSessions]);

  // --- Modal Open Helpers ---
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingWs(null);
    setFormData({
      workspace_name: "",
      work_space_code: "",
      parent_workspace_code: "",
      slug: "",
      description: "",
      status: "active",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ws: WorkspaceRecord) => {
    setModalMode("edit");
    setEditingWs(ws);
    setFormData({
      workspace_name: ws.workspace_name || "",
      work_space_code: ws.work_space_code,
      parent_workspace_code: ws.parent_workspace_code || "",
      slug: ws.slug,
      description: ws.description || "",
      status: ws.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // --- Workspace Create/Update Submit ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload: Record<string, unknown> = {
        workspace_name: formData.workspace_name.trim() || null,
        work_space_code: formData.work_space_code.trim(),
        parent_workspace_code: formData.parent_workspace_code.trim() || null,
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim() || null,
        status: formData.status,
      };

      let res;
      if (modalMode === "edit") {
        if (!editingWs?.id) {
          throw new Error("Không tìm thấy mã ID workspace để cập nhật");
        }
        payload.id = editingWs.id;

        // Gọi API edit mới: POST https://laravel_mt.hust.media/api/workspaces/main/edit
        try {
          res = await fetch("/next/api/workspaces-proxy/workspaces/main/edit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch {
          // Fallback gọi trực tiếp tới Laravel API
          res = await fetch("https://laravel_mt.hust.media/api/workspaces/main/edit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });
        }
      } else {
        // Tạo mới: POST /api/workspaces
        try {
          res = await fetch("/next/api/workspaces-proxy/workspaces", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch {
          res = await fetch("https://laravel_mt.hust.media/api/workspaces", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });
        }
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorDetail =
          json.errors && typeof json.errors === "object"
            ? Object.values(json.errors).flat().join(", ")
            : json.message || `Lỗi cập nhật (HTTP ${res.status})`;
        throw new Error(errorDetail);
      }

      setIsModalOpen(false);
      showToast(
        modalMode === "create"
          ? `Đã thêm workspace "${payload.workspace_name || payload.work_space_code}"`
          : `Đã cập nhật workspace "${payload.workspace_name || payload.work_space_code}"`
      );
      fetchWorkspaces();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // --- Toggle Workspace Status (active <-> archived) ---
  const handleToggleStatus = async (ws: WorkspaceRecord) => {
    const nextStatus = ws.status === "active" ? "archived" : "active";
    try {
      let res;
      try {
        res = await fetch("/next/api/workspaces-proxy/workspaces/main/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ id: ws.id, status: nextStatus }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        res = await fetch("https://laravel_mt.hust.media/api/workspaces/main/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ id: ws.id, status: nextStatus }),
        });
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `Không thể đổi trạng thái (HTTP ${res.status})`);
      }
      showToast(`Đã chuyển workspace sang trạng thái "${nextStatus}"`);
      fetchWorkspaces();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Lỗi: ${msg}`);
    }
  };

  // --- Delete Workspace ---
  const handleDeleteWorkspace = async (ws: WorkspaceRecord) => {
    const confirmName = ws.workspace_name || ws.work_space_code;
    if (!confirm(`Bạn có chắc muốn xóa workspace "${confirmName}" (ID: ${ws.id}) không?`)) {
      return;
    }

    try {
      const res = await fetch(`/next/api/workspaces-proxy/workspaces/${ws.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!res.ok && res.status !== 204) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `Không thể xóa (HTTP ${res.status})`);
      }
      showToast(`Đã xóa workspace "${confirmName}"`);
      fetchWorkspaces();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Lỗi xóa: ${msg}`);
    }
  };

  // --- Filtered Workspaces for client-side search smoothness ---
  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchSearch =
      !wsSearch.trim() ||
      (ws.workspace_name && ws.workspace_name.toLowerCase().includes(wsSearch.toLowerCase())) ||
      ws.work_space_code.toLowerCase().includes(wsSearch.toLowerCase()) ||
      ws.slug.toLowerCase().includes(wsSearch.toLowerCase()) ||
      (ws.description && ws.description.toLowerCase().includes(wsSearch.toLowerCase()));

    const matchStatus = wsStatusFilter === "all" || ws.status === wsStatusFilter;

    return matchSearch && matchStatus;
  });

  // --- Statistics strictly from Real Data ---
  const totalWorkspaces = wsMeta?.total ?? workspaces.length;
  const activeWorkspacesCount = workspaces.filter((w) => w.status === "active").length;
  const archivedWorkspacesCount = workspaces.filter((w) => w.status === "archived").length;
  const totalSessionsCount = sessionMeta?.total ?? sessions.length;

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-16 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-purple-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Glassmorphism Header */}
      <div className="rounded-3xl border border-white/70 bg-white/90 p-5 sm:p-7 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-purple-500/25 shrink-0">
              <Briefcase className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Quản trị Không Gian Làm Việc (Workspace)
                </h1>
                <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                  Laravel REST API
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  work_space_main
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Hiển thị và quản lý trực tiếp theo định dạng API JSON: mã code, slug, tên workspace, mô tả và số session liên kết.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsJsonModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-purple-700 active:scale-95 cursor-pointer"
              title="Xem mẫu JSON trả về từ API Laravel"
            >
              <Code2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>Xem JSON API</span>
            </button>

            <button
              type="button"
              onClick={activeTab === "workspaces" ? fetchWorkspaces : fetchSessions}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 cursor-pointer"
              title="Tải lại dữ liệu mới nhất từ máy chủ"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${wsLoading || sessionLoading ? "animate-spin text-purple-600" : ""}`} />
              <span>Làm mới</span>
            </button>

            {activeTab === "workspaces" && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-700 hover:to-indigo-700 active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm Workspace mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Real Overview Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Tổng Workspace</span>
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-800">
              {totalWorkspaces}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">meta.total từ API</div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-semibold">Đang hoạt động</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-800">
              {activeWorkspacesCount}
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">status: &quot;active&quot;</div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-semibold">Đã lưu trữ</span>
              <Archive className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-800">
              {archivedWorkspacesCount}
            </div>
            <div className="text-[11px] text-amber-600/80 mt-0.5">status: &quot;archived&quot;</div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-indigo-700">
              <span className="text-xs font-semibold">Tổng Sessions</span>
              <Radio className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-indigo-800">
              {sessionLoading ? "..." : totalSessionsCount}
            </div>
            <div className="text-[11px] text-indigo-600/80 mt-0.5">
              Bảng work_space_session
            </div>
          </div>
        </div>

        {/* Tab & View Mode Switcher */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab("workspaces")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "workspaces"
                  ? "border-purple-600 text-purple-700 bg-purple-50/40 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Danh mục Workspace</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === "workspaces" ? "bg-purple-200/80 text-purple-800" : "bg-slate-200 text-slate-600"
                }`}
              >
                {workspaces.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sessions")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "sessions"
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Radio className="h-4 w-4" />
              <span>Phiên làm việc Sessions</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === "sessions" ? "bg-indigo-200/80 text-indigo-800" : "bg-slate-200 text-slate-600"
                }`}
              >
                {sessions.length}
              </span>
            </button>
          </div>

          {/* View Mode Toggle (Card Grid vs Table) */}
          {activeTab === "workspaces" && (
            <div className="flex items-center gap-1 self-end sm:self-auto pb-2 sm:pb-0">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">Hiển thị:</span>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    viewMode === "card"
                      ? "bg-white text-purple-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Chế độ xem dạng Thẻ (Grid Cards)"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Dạng Thẻ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-purple-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Chế độ xem dạng Bảng (Table View)"
                >
                  <List className="h-3.5 w-3.5" />
                  <span>Dạng Bảng</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORKSPACES (work_space_main)                                       */}
      {/* ========================================================================= */}
      {activeTab === "workspaces" && (
        <div className="space-y-4">
          {/* Error Banner */}
          {wsError && (
            <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm text-rose-800 shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold">Lỗi tải dữ liệu Workspace: </span>
                  <span>{wsError}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchWorkspaces}
                className="rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/70 bg-white/85 p-3.5 shadow-xs backdrop-blur-md">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={wsSearch}
                onChange={(e) => setWsSearch(e.target.value)}
                placeholder="Tìm theo tên, mã code (WS-...), slug hoặc mô tả..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition focus:border-purple-400 focus:outline-none focus:ring-3 focus:ring-purple-500/10"
              />
              {wsSearch && (
                <button
                  type="button"
                  onClick={() => setWsSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setWsStatusFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  wsStatusFilter === "all"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Tất cả ({totalWorkspaces})
              </button>
              <button
                type="button"
                onClick={() => setWsStatusFilter("active")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  wsStatusFilter === "active"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Hoạt động ({activeWorkspacesCount})
              </button>
              <button
                type="button"
                onClick={() => setWsStatusFilter("archived")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  wsStatusFilter === "archived"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Lưu trữ ({archivedWorkspacesCount})
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: GRID CARDS (MODERN UI/UX) */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkspaces.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-white/80 bg-white/95 p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                    <Briefcase className="h-10 w-10 text-slate-300" />
                    <p className="font-bold text-slate-700 text-base">Không tìm thấy workspace nào</p>
                    <p className="text-xs text-slate-400">
                      Thử xóa bộ lọc tìm kiếm hoặc tạo thêm workspace mới.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Thêm Workspace mới</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredWorkspaces.map((ws) => {
                  const isActive = ws.status === "active";

                  return (
                    <div
                      key={ws.id}
                      className="group flex flex-col justify-between rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xs transition-all hover:shadow-md hover:border-purple-200 backdrop-blur-xl relative overflow-hidden"
                    >
                      {/* Top Accent Line */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500"
                            : "bg-gradient-to-r from-slate-300 via-slate-400 to-amber-400"
                        }`}
                      />

                      <div className="space-y-3.5">
                        {/* Header: Icon, Name & Status Badge */}
                        <div className="flex items-start justify-between gap-3 pt-1">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-700 shadow-2xs group-hover:from-purple-200 group-hover:to-indigo-200 transition">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate group-hover:text-purple-700 transition" title={ws.workspace_name || ws.work_space_code}>
                                  {ws.workspace_name || ws.work_space_code}
                                </h3>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                ID: #{ws.id}
                              </div>
                            </div>
                          </div>

                          {/* Status toggle pill */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(ws)}
                            title="Bấm để đổi trạng thái"
                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
                            style={{
                              backgroundColor: isActive ? "#ecfdf5" : "#f1f5f9",
                              borderColor: isActive ? "#a7f3d0" : "#cbd5e1",
                              color: isActive ? "#065f46" : "#475569",
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: isActive ? "#10b981" : "#94a3b8",
                              }}
                            />
                            <span>{isActive ? "Hoạt động" : "Lưu trữ"}</span>
                          </button>
                        </div>

                        {/* Code & Slug & Parent Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-purple-900 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-lg">
                            <span>{ws.work_space_code}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(`code-${ws.id}`, ws.work_space_code, "mã code")}
                              className="text-purple-400 hover:text-purple-700 transition ml-0.5 cursor-pointer"
                              title="Sao chép mã code"
                            >
                              {copiedKey === `code-${ws.id}` ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>

                          {ws.parent_workspace_code && (
                            <div className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded-lg" title="Mã workspace cha">
                              <span className="text-indigo-400">parent:</span>
                              <span className="font-semibold">{ws.parent_workspace_code}</span>
                            </div>
                          )}

                          <div className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg truncate max-w-[200px]">
                            <span className="truncate">slug: {ws.slug}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(`slug-${ws.id}`, ws.slug, "slug")}
                              className="text-slate-400 hover:text-slate-700 transition ml-0.5 cursor-pointer shrink-0"
                              title="Sao chép slug"
                            >
                              {copiedKey === `slug-${ws.id}` ? (
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-2.5 w-2.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-xs text-slate-600 leading-relaxed min-h-[38px] line-clamp-2" title={ws.description || ""}>
                          {ws.description || (
                            <span className="text-slate-300 italic">Chưa có mô tả chi tiết cho workspace này.</span>
                          )}
                        </div>

                        {/* Sessions Counter Bar */}
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-purple-50/40 p-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-indigo-900">
                            <Radio className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <span>{ws.sessions_count ?? 0} sessions gắn liền</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => fetchSpecificWorkspaceSessions(ws)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200/80 rounded-lg px-2 py-1 shadow-2xs hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Xem phiên</span>
                          </button>
                        </div>
                      </div>

                      {/* Footer: Dates & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 truncate mr-2" title={`Cập nhật: ${formatDate(ws.updated_at)}`}>
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="truncate">{formatDate(ws.updated_at)}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(ws)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
                            title="Chỉnh sửa Workspace"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteWorkspace(ws)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Xóa Workspace"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW MODE 2: TABULAR TABLE */}
          {viewMode === "table" && (
            <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-sm backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">ID & Tên Workspace</th>
                      <th className="py-3.5 px-4">Mã Code & Slug</th>
                      <th className="py-3.5 px-4">Sessions gắn liền</th>
                      <th className="py-3.5 px-4">Mô tả chi tiết</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Thời gian</th>
                      <th className="py-3.5 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkspaces.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Briefcase className="h-9 w-9 text-slate-300" />
                            <p className="font-semibold text-slate-600">Không tìm thấy workspace nào trong work_space_main</p>
                            <p className="text-xs text-slate-400">
                              Chưa có dữ liệu hoặc từ khóa tìm kiếm không khớp.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredWorkspaces.map((ws) => (
                        <tr key={ws.id} className="group transition-colors hover:bg-purple-50/30">
                          {/* ID & Name */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-700 shadow-2xs group-hover:from-purple-200 group-hover:to-indigo-200">
                                <Briefcase className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-purple-700">
                                  <span>{ws.workspace_name || ws.work_space_code}</span>
                                  <span className="font-mono text-[10px] text-slate-400">#{ws.id}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  ID: {ws.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Code & Slug */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md">
                                  {ws.work_space_code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(`code-${ws.id}`, ws.work_space_code, "mã code")}
                                  className="text-slate-400 hover:text-purple-600 transition cursor-pointer"
                                  title="Sao chép mã code"
                                >
                                  {copiedKey === `code-${ws.id}` ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                              {ws.parent_workspace_code && (
                                <div className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded-md inline-block">
                                  <span className="text-indigo-400">parent: </span>
                                  <span className="font-semibold">{ws.parent_workspace_code}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                                <span>slug: {ws.slug}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(`slug-${ws.id}`, ws.slug, "slug")}
                                  className="text-slate-400 hover:text-purple-600 transition cursor-pointer"
                                  title="Sao chép slug"
                                >
                                  {copiedKey === `slug-${ws.id}` ? (
                                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-2.5 w-2.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Sessions Count & Quick Preview */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => fetchSpecificWorkspaceSessions(ws)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-900 cursor-pointer"
                                title="Xem danh sách session thuộc workspace này"
                              >
                                <Radio className="h-3 w-3 text-indigo-500" />
                                <span>{ws.sessions_count ?? 0} sessions</span>
                                <Eye className="h-3 w-3 ml-0.5 opacity-60" />
                              </button>

                              <button
                                type="button"
                                onClick={() => filterSessionsByWorkspace(ws.id)}
                                className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                                title="Chuyển sang tab Sessions và lọc theo workspace này"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="py-4 px-4 max-w-xs">
                            {ws.description ? (
                              <p className="text-slate-600 text-xs line-clamp-2" title={ws.description}>
                                {ws.description}
                              </p>
                            ) : (
                              <span className="text-slate-300 italic text-xs">Chưa có mô tả</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(ws)}
                              title="Bấm để đổi trạng thái"
                              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition hover:shadow-xs active:scale-95 cursor-pointer"
                              style={{
                                backgroundColor: ws.status === "active" ? "#ecfdf5" : "#f1f5f9",
                                borderColor: ws.status === "active" ? "#a7f3d0" : "#cbd5e1",
                                color: ws.status === "active" ? "#065f46" : "#475569",
                              }}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: ws.status === "active" ? "#10b981" : "#94a3b8",
                                }}
                              />
                              <span className="capitalize">
                                {ws.status === "active" ? "Hoạt động" : "Lưu trữ"}
                              </span>
                            </button>
                          </td>

                          {/* Timestamps */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5 text-[11px] text-slate-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span>Sửa: {formatDate(ws.updated_at)}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Tạo: {formatDate(ws.created_at)}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(ws)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
                                title="Chỉnh sửa Workspace"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteWorkspace(ws)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                title="Xóa Workspace"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Toolbar from JSON meta */}
          {wsMeta && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs text-slate-600 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-2">
                <span>
                  Hiển thị <strong className="text-slate-800">{wsMeta.from || 1}</strong> - <strong className="text-slate-800">{wsMeta.to || filteredWorkspaces.length}</strong> trên tổng số <strong className="text-purple-700">{wsMeta.total}</strong> workspace
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">Trang {wsMeta.current_page} / {wsMeta.last_page}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={wsMeta.current_page <= 1}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  &laquo; Trước
                </button>
                <span className="rounded-lg bg-purple-600 px-2.5 py-1 font-bold text-white shadow-2xs">
                  {wsMeta.current_page}
                </span>
                <button
                  type="button"
                  disabled={wsMeta.current_page >= wsMeta.last_page}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sau &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SESSIONS (work_space_session)                                      */}
      {/* ========================================================================= */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {/* Active Filter Notice if filtered by a specific workspace */}
          {sessionWsFilter !== "all" && (
            <div className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50/90 p-3.5 text-xs text-indigo-900 shadow-xs">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>
                  Đang lọc các session thuộc Workspace <strong>#{sessionWsFilter}</strong>
                  {workspaces.find((w) => String(w.id) === sessionWsFilter) && (
                    <span className="ml-1 text-indigo-700">
                      ({workspaces.find((w) => String(w.id) === sessionWsFilter)?.workspace_name ||
                        workspaces.find((w) => String(w.id) === sessionWsFilter)?.work_space_code})
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSessionWsFilter("all")}
                className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
              >
                <span>Xóa lọc (Xem tất cả)</span>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Session Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-2xl border border-white/70 bg-white/85 p-3.5 shadow-xs backdrop-blur-md">
            {/* Filter: User */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Lọc theo User (ID / Chat ID)
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={sessionUserFilter}
                  onChange={(e) => setSessionUserFilter(e.target.value)}
                  placeholder="VD: 101, user_12..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Filter: Agent Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Lọc theo Mã Agent (agent_code)
              </label>
              <div className="relative">
                <Cpu className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={sessionAgentFilter}
                  onChange={(e) => setSessionAgentFilter(e.target.value)}
                  placeholder="VD: test, chatbot, codex..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Filter: Linked Workspace */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Workspace liên kết (workspace_id)
              </label>
              <select
                value={sessionWsFilter}
                onChange={(e) => setSessionWsFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              >
                <option value="all">Tất cả workspace</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={String(ws.id)}>
                    #{ws.id} - {ws.workspace_name || ws.work_space_code}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Trạng thái phiên
              </label>
              <select
                value={sessionStatusFilter}
                onChange={(e) => setSessionStatusFilter(e.target.value as "all" | "active" | "ended")}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang kết nối (active)</option>
                <option value="ended">Đã kết thúc (ended)</option>
              </select>
            </div>
          </div>

          {/* Sessions Table Container */}
          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-sm backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Session Key (openclaw_session_key)</th>
                    <th className="py-3.5 px-4">Người dùng (user_id / chat_id)</th>
                    <th className="py-3.5 px-4">Mã Agent (agent_code)</th>
                    <th className="py-3.5 px-4">Workspace liên kết</th>
                    <th className="py-3.5 px-4">Kỹ năng (skill_code)</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4">Cập nhật lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
                          <p className="font-semibold text-slate-600">Đang tải danh sách Session từ Laravel API...</p>
                        </div>
                      </td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center">
                        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Radio className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              Chưa có phiên làm việc (Session) trong cơ sở dữ liệu
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Bảng <code className="font-mono text-purple-700 bg-slate-100 px-1 py-0.5 rounded">work_space_session</code> hiện tại đang rỗng (0 bản ghi). Khi người dùng bắt đầu phiên chat hoặc kết nối qua OpenClaw Gateway, các session sẽ tự động được ghi nhận tại đây.
                            </p>
                          </div>
                          <div className="pt-1 flex gap-2">
                            <button
                              type="button"
                              onClick={fetchSessions}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Làm mới danh sách</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sessions.map((ss) => {
                      const linkedWs =
                        ss.workspace ||
                        workspaces.find((w) => w.id === ss.workspace_id);

                      return (
                        <tr key={ss.id} className="group transition-colors hover:bg-indigo-50/30">
                          {/* openclaw_session_key */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md max-w-xs truncate">
                                  {ss.openclaw_session_key}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(`ss-${ss.id}`, ss.openclaw_session_key, "session key")}
                                  className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                                  title="Sao chép Session Key"
                                >
                                  {copiedKey === `ss-${ss.id}` ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: #{ss.id} • Slug: {ss.slug}
                              </div>
                            </div>
                          </td>

                          {/* user_id / user_chat_id */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>User #{ss.user_id}</span>
                            </div>
                            {ss.user_chat_id && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Chat ID: {ss.user_chat_id}
                              </div>
                            )}
                          </td>

                          {/* agent_code */}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                              <Cpu className="h-3 w-3 text-purple-500" />
                              <span>{ss.agent_code}</span>
                            </span>
                          </td>

                          {/* Workspace link */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800">
                                {linkedWs?.workspace_name || linkedWs?.work_space_code || `Workspace #${ss.workspace_id}`}
                              </div>
                              <div className="text-[11px] font-mono text-purple-700">
                                {linkedWs?.work_space_code || ss.work_space_code}
                              </div>
                            </div>
                          </td>

                          {/* skill_code */}
                          <td className="py-4 px-4">
                            {ss.skill_code ? (
                              <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <Zap className="h-3 w-3 text-emerald-500" />
                                <span>{ss.skill_code}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 italic text-xs">Mặc định (none)</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold"
                              style={{
                                backgroundColor: ss.status === "active" ? "#ecfdf5" : "#f1f5f9",
                                borderColor: ss.status === "active" ? "#a7f3d0" : "#cbd5e1",
                                color: ss.status === "active" ? "#065f46" : "#475569",
                              }}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: ss.status === "active" ? "#10b981" : "#94a3b8",
                                }}
                              />
                              <span className="capitalize">
                                {ss.status === "active" ? "Đang kết nối" : "Đã kết thúc"}
                              </span>
                            </span>
                          </td>

                          {/* updated_at */}
                          <td className="py-4 px-4 text-xs text-slate-500">
                            {formatDate(ss.updated_at)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIVE JSON API VIEWER (Tài liệu & Cấu trúc API)                     */}
      {/* ========================================================================= */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-3xl border border-white/80 bg-slate-950 p-6 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Cấu trúc JSON Phản Hồi từ Laravel API</span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      HTTP 200 OK
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    GET http://vip.tecom.pro:8817/api/workspaces
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      "raw-json",
                      JSON.stringify(rawJsonData || { data: workspaces, meta: wsMeta }, null, 2),
                      "chuỗi JSON API"
                    )
                  }
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>Sao chép JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsJsonModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-y-auto flex-1 rounded-2xl bg-slate-900 border border-slate-800/80 p-4 font-mono text-xs leading-relaxed text-emerald-400">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  rawJsonData || {
                    data: workspaces,
                    links: {
                      first: "http://vip.tecom.pro:8817/api/workspaces?page=1",
                      last: "http://vip.tecom.pro:8817/api/workspaces?page=1",
                      prev: null,
                      next: null,
                    },
                    meta: wsMeta || INITIAL_META,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-right shrink-0">
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Xem chi tiết Sessions của Workspace cụ thể                         */}
      {/* ========================================================================= */}
      {viewingWorkspaceSessions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-3xl border border-white/80 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Sessions thuộc Workspace #{viewingWorkspaceSessions.id}: {viewingWorkspaceSessions.workspace_name || viewingWorkspaceSessions.work_space_code}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mã code: <code className="font-mono text-purple-700 font-bold">{viewingWorkspaceSessions.work_space_code}</code> • Slug: <code className="font-mono text-slate-600">{viewingWorkspaceSessions.slug}</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingWorkspaceSessions(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 overflow-y-auto flex-1">
              {specificWsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                  <p className="text-xs font-semibold text-slate-600">Đang tải sessions từ API...</p>
                </div>
              ) : specificWsSessions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Radio className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">Chưa có session nào gắn với workspace này</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Bảng <code className="font-mono text-purple-700 bg-slate-100 px-1 py-0.5 rounded">work_space_session</code> chưa có bản ghi nào liên kết với <code className="font-mono font-bold text-slate-700">workspace_id = {viewingWorkspaceSessions.id}</code>.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Session Key</th>
                      <th className="py-2.5 px-3">User ID</th>
                      <th className="py-2.5 px-3">Agent Code</th>
                      <th className="py-2.5 px-3">Skill Code</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {specificWsSessions.map((ss) => (
                      <tr key={ss.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-900">{ss.openclaw_session_key}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">User #{ss.user_id}</td>
                        <td className="py-2.5 px-3 font-mono text-purple-700">{ss.agent_code}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">{ss.skill_code || "none"}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ss.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                            {ss.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{formatDate(ss.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  const wsId = viewingWorkspaceSessions.id;
                  setViewingWorkspaceSessions(null);
                  filterSessionsByWorkspace(wsId);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Mở trong Tab Sessions với bộ lọc này</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setViewingWorkspaceSessions(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Thêm / Sửa Workspace (work_space_main)                             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span>{modalMode === "create" ? "Thêm Workspace mới" : "Chỉnh sửa Workspace"}</span>
                    {modalMode === "edit" && editingWs && (
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-lg">
                        #{editingWs.id}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {modalMode === "edit"
                      ? "Cập nhật qua API POST /api/workspaces/main/edit"
                      : "Tạo mới trực tiếp vào bảng work_space_main qua Laravel API"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              {modalMode === "edit" && editingWs && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/70 text-xs font-mono">
                  <span className="text-purple-800 font-semibold">Đang chỉnh sửa:</span>
                  <span className="font-bold text-purple-950">ID #{editingWs.id} — {editingWs.work_space_code}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Workspace (workspace_name)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: OpenClaw Codex Gateway Core"
                  value={formData.workspace_name}
                  onChange={(e) => setFormData({ ...formData, workspace_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-purple-400 focus:outline-none focus:ring-3 focus:ring-purple-500/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Code (work_space_code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: workspace_backend_support"
                    value={formData.work_space_code}
                    onChange={(e) => setFormData({ ...formData, work_space_code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800 focus:border-purple-400 focus:outline-none focus:ring-3 focus:ring-purple-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Workspace Cha (parent_workspace_code)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: workspace-test"
                    value={formData.parent_workspace_code}
                    onChange={(e) => setFormData({ ...formData, parent_workspace_code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800 focus:border-purple-400 focus:outline-none focus:ring-3 focus:ring-purple-500/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slug định danh (slug)
                  </label>
                  <input
                    type="text"
                    placeholder="Tự động theo mã code nếu để trống"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800 focus:border-purple-400 focus:outline-none focus:ring-3 focus:ring-purple-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trạng thái (status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "archived",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-purple-400 focus:outline-none focus:ring-3 focus:ring-purple-500/10 bg-white"
                  >
                    <option value="active">Hoạt động (active)</option>
                    <option value="archived">Lưu trữ (archived)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả Workspace (description)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về mục đích hoạt động của workspace..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-purple-400 focus:outline-none focus:ring-3 focus:ring-purple-500/10"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700 transition cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  <span>{modalMode === "create" ? "Tạo Workspace" : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
