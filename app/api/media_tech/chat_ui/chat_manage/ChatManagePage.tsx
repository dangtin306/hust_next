"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ShieldAlert,
  Users,
  Layers,
  MessageSquare,
  MessageSquareText,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Unlock,
  Bot,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Copy,
  Server,
  X,
  Info,
} from "lucide-react";
import ChatMessagesPanel, { RoomOption } from "./ChatMessagesPanel";

interface ChatManagePageProps {
  isHust?: boolean;
  initialTab?: "bot" | "messages";
}

export interface ManagePaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ManageOverviewData {
  users: {
    total: number;
    active: number;
    disabled: number;
    mixed_status: number;
  };
  sessions: number;
  rooms: {
    total: number;
    active: number;
  };
}

export interface ManageUserItem {
  user_id: string;
  upstream_user_id?: number | null;
  session_count: number;
  active_session_count: number;
  disabled_session_count: number;
  room_count: number;
  last_activity_at?: string | null;
  created_at: string;
  status: "active" | "disabled" | "mixed";
}

export interface ManageSessionItem {
  id: number;
  status: number; // 1: active, 0: disabled
  created_at: string;
  updated_at: string;
}

export interface ManageRoomItem {
  id: number;
  id_chat_users: number;
  title: string;
  status: number;
  model: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Realistic Fallback Mock Data for 503 CHAT_BOT_MANAGE_API_NOT_CONFIGURED
// ---------------------------------------------------------------------------
const MOCK_OVERVIEW: ManageOverviewData = {
  users: {
    total: 7,
    active: 5,
    disabled: 1,
    mixed_status: 1,
  },
  sessions: 10,
  rooms: {
    total: 18,
    active: 15,
  },
};

const INITIAL_MOCK_USERS: ManageUserItem[] = [
  {
    user_id: "user_101",
    upstream_user_id: 101,
    session_count: 2,
    active_session_count: 2,
    disabled_session_count: 0,
    room_count: 5,
    last_activity_at: "2026-10-18 21:45:10",
    created_at: "2026-10-10 08:30:00",
    status: "active",
  },
  {
    user_id: "user_204",
    upstream_user_id: 204,
    session_count: 1,
    active_session_count: 1,
    disabled_session_count: 0,
    room_count: 3,
    last_activity_at: "2026-10-18 20:12:05",
    created_at: "2026-10-12 11:15:20",
    status: "active",
  },
  {
    user_id: "guest_308",
    upstream_user_id: null,
    session_count: 1,
    active_session_count: 1,
    disabled_session_count: 0,
    room_count: 2,
    last_activity_at: "2026-10-18 19:30:00",
    created_at: "2026-10-16 14:20:10",
    status: "active",
  },
  {
    user_id: "user_415",
    upstream_user_id: 415,
    session_count: 2,
    active_session_count: 0,
    disabled_session_count: 2,
    room_count: 4,
    last_activity_at: "2026-10-16 18:05:40",
    created_at: "2026-10-08 09:00:00",
    status: "disabled",
  },
  {
    user_id: "guest_512",
    upstream_user_id: null,
    session_count: 1,
    active_session_count: 0,
    disabled_session_count: 1,
    room_count: 1,
    last_activity_at: "2026-10-15 16:42:18",
    created_at: "2026-10-15 16:40:00",
    status: "disabled",
  },
  {
    user_id: "user_689",
    upstream_user_id: 689,
    session_count: 2,
    active_session_count: 1,
    disabled_session_count: 1,
    room_count: 6,
    last_activity_at: "2026-10-18 21:10:00",
    created_at: "2026-10-05 13:40:00",
    status: "mixed",
  },
  {
    user_id: "user_777",
    upstream_user_id: 777,
    session_count: 1,
    active_session_count: 1,
    disabled_session_count: 0,
    room_count: 8,
    last_activity_at: "2026-10-18 21:50:30",
    created_at: "2026-10-01 10:00:00",
    status: "active",
  },
];

const MOCK_SESSIONS_MAP: Record<string, ManageSessionItem[]> = {
  user_101: [
    { id: 456, status: 1, created_at: "2026-10-10 08:30:00", updated_at: "2026-10-18 21:45:10" },
    { id: 457, status: 1, created_at: "2026-10-14 14:20:00", updated_at: "2026-10-18 18:10:00" },
  ],
  user_204: [
    { id: 489, status: 1, created_at: "2026-10-12 11:15:20", updated_at: "2026-10-18 20:12:05" },
  ],
  guest_308: [
    { id: 501, status: 1, created_at: "2026-10-16 14:20:10", updated_at: "2026-10-18 19:30:00" },
  ],
  user_415: [
    { id: 520, status: 0, created_at: "2026-10-08 09:00:00", updated_at: "2026-10-16 18:05:40" },
    { id: 521, status: 0, created_at: "2026-10-09 10:15:00", updated_at: "2026-10-16 18:05:40" },
  ],
  guest_512: [
    { id: 533, status: 0, created_at: "2026-10-15 16:40:00", updated_at: "2026-10-15 16:42:18" },
  ],
  user_689: [
    { id: 550, status: 1, created_at: "2026-10-05 13:40:00", updated_at: "2026-10-18 21:10:00" },
    { id: 551, status: 0, created_at: "2026-10-06 15:00:00", updated_at: "2026-10-17 11:20:00" },
  ],
  user_777: [
    { id: 590, status: 1, created_at: "2026-10-01 10:00:00", updated_at: "2026-10-18 21:50:30" },
  ],
};

const MOCK_ROOMS_MAP: Record<string, ManageRoomItem[]> = {
  user_101: [
    { id: 1001, id_chat_users: 456, title: "Tra cứu chương trình đào tạo ngành CNTT", status: 1, model: "gpt-4o-mini", created_at: "2026-10-10 09:00:00", updated_at: "2026-10-18 21:45:10" },
    { id: 1002, id_chat_users: 456, title: "Hỏi về học phí & học bổng khuyến khích", status: 1, model: "gpt-4o-mini", created_at: "2026-10-11 10:30:00", updated_at: "2026-10-18 19:10:00" },
    { id: 1003, id_chat_users: 457, title: "Đăng ký đề tài tốt nghiệp kỳ 2026-1", status: 1, model: "gpt-4o", created_at: "2026-10-15 14:00:00", updated_at: "2026-10-17 16:20:00" },
    { id: 1004, id_chat_users: 457, title: "Hỗ trợ sửa lỗi kết nối Git Auto", status: 1, model: "gpt-4o", created_at: "2026-10-16 11:10:00", updated_at: "2026-10-18 10:05:00" },
    { id: 1005, id_chat_users: 456, title: "Tra cứu thời khóa biểu phòng học", status: 1, model: "gpt-4o-mini", created_at: "2026-10-18 15:30:00", updated_at: "2026-10-18 15:45:00" },
  ],
  user_204: [
    { id: 2001, id_chat_users: 489, title: "Tìm hiểu thủ tục cấp lại thẻ sinh viên", status: 1, model: "gpt-4o-mini", created_at: "2026-10-12 11:20:00", updated_at: "2026-10-18 20:12:05" },
    { id: 2002, id_chat_users: 489, title: "Hướng dẫn cài đặt VPN trường", status: 1, model: "gpt-4o-mini", created_at: "2026-10-13 16:00:00", updated_at: "2026-10-17 14:20:00" },
    { id: 2003, id_chat_users: 489, title: "Hỏi thông tin ký túc xá Bách Khoa", status: 1, model: "gpt-4o-mini", created_at: "2026-10-14 09:10:00", updated_at: "2026-10-16 18:00:00" },
  ],
  guest_308: [
    { id: 3001, id_chat_users: 501, title: "Tư vấn tuyển sinh đại học chính quy 2026", status: 1, model: "gpt-4o-mini", created_at: "2026-10-16 14:25:00", updated_at: "2026-10-18 19:30:00" },
    { id: 3002, id_chat_users: 501, title: "Điểm chuẩn các ngành kỹ thuật 3 năm gần nhất", status: 1, model: "gpt-4o-mini", created_at: "2026-10-17 10:00:00", updated_at: "2026-10-17 10:45:00" },
  ],
  user_415: [
    { id: 4001, id_chat_users: 520, title: "Hội thoại bị vô hiệu hóa", status: 0, model: "gpt-4o-mini", created_at: "2026-10-08 09:30:00", updated_at: "2026-10-16 18:05:40" },
    { id: 4002, id_chat_users: 521, title: "Tra cứu môn học đã hủy", status: 0, model: "gpt-4o-mini", created_at: "2026-10-09 11:00:00", updated_at: "2026-10-16 18:05:40" },
  ],
  guest_512: [
    { id: 5001, id_chat_users: 533, title: "Phiên khách tạm thời - Đã khóa", status: 0, model: "gpt-4o-mini", created_at: "2026-10-15 16:41:00", updated_at: "2026-10-15 16:42:18" },
  ],
  user_689: [
    { id: 6001, id_chat_users: 550, title: "Tra cứu chứng chỉ ngoại ngữ chuẩn đầu ra", status: 1, model: "gpt-4o", created_at: "2026-10-05 14:00:00", updated_at: "2026-10-18 21:10:00" },
    { id: 6002, id_chat_users: 551, title: "Tài liệu học tập n8n & OpenClaw", status: 0, model: "gpt-4o-mini", created_at: "2026-10-06 15:30:00", updated_at: "2026-10-17 11:20:00" },
  ],
  user_777: [
    { id: 7001, id_chat_users: 590, title: "Kiểm thử API Gateway Chat Bot V2", status: 1, model: "gpt-4o", created_at: "2026-10-01 10:15:00", updated_at: "2026-10-18 21:50:30" },
    { id: 7002, id_chat_users: 590, title: "Debug token streaming latency & socket", status: 1, model: "gpt-4o", created_at: "2026-10-05 08:30:00", updated_at: "2026-10-18 20:00:00" },
  ],
};

export default function ChatManagePage({ isHust = false, initialTab = "bot" }: ChatManagePageProps) {
  // Navigation & Prefix
  const linkPrefix = isHust ? "/api/hust" : "/api/mt";
  const displayPrefix = isHust ? "/next/api/hust" : "/next/api/mt";
  const chatHomeLink = `${linkPrefix}/chat/home`;
  const chatManageUrl = `${displayPrefix}/chat/manage`;
  const chatMessagesUrl = `${displayPrefix}/chat/messages`;
  const brandName = isHust ? "Hust Media AI" : "Media Tech AI";

  // Tab & Branch State
  const [activeTab, setActiveTab] = useState<"bot" | "messages">(initialTab);
  const [selectedRoomIdForMessages, setSelectedRoomIdForMessages] = useState<number | undefined>(undefined);
  const [selectedUserForMessages, setSelectedUserForMessages] = useState<string | undefined>(undefined);

  // Sync with browser URL / query params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const rid = params.get("room_id");
      const uid = params.get("user_id") || params.get("q");
      if (rid) {
        const num = Number(rid);
        if (!isNaN(num) && num > 0) {
          setSelectedRoomIdForMessages(num);
          setActiveTab("messages");
        }
      } else if (uid) {
        setSelectedUserForMessages(uid);
        setActiveTab("messages");
      }
    }
  }, []);

  const navigateTab = (tab: "bot" | "messages", roomId?: number, userId?: string) => {
    setActiveTab(tab);
    if (roomId !== undefined) {
      setSelectedRoomIdForMessages(roomId);
    }
    if (userId !== undefined) {
      setSelectedUserForMessages(userId);
    }
    let query = "";
    if (roomId) query = `?room_id=${roomId}`;
    else if (userId) query = `?user_id=${encodeURIComponent(userId)}`;
    const targetUrl =
      tab === "bot"
        ? chatManageUrl
        : `${chatMessagesUrl}${query}`;
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", targetUrl);
    }
  };

  // State
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<ManageOverviewData | null>(null);
  const [users, setUsers] = useState<ManageUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled" | "mixed">("all");
  const [perPage, setPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [meta, setMeta] = useState<ManagePaginationMeta>({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });

  // User Action & Modal States
  const [inspectUser, setInspectUser] = useState<ManageUserItem | null>(null);
  const [inspectSessions, setInspectSessions] = useState<ManageSessionItem[]>([]);
  const [inspectRooms, setInspectRooms] = useState<ManageRoomItem[]>([]);
  const [activeModal, setActiveModal] = useState<"sessions" | "rooms" | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // All combined rooms for Messages management branch
  const allAvailableRooms = useMemo<RoomOption[]>(() => {
    const list: RoomOption[] = [];
    Object.entries(MOCK_ROOMS_MAP).forEach(([uid, rooms]) => {
      rooms.forEach((r) => {
        list.push({
          id: r.id,
          title: r.title,
          user_id: uid,
          model: r.model,
          status: r.status,
          id_chat_users: r.id_chat_users,
          created_at: r.created_at,
        });
      });
    });
    return list;
  }, []);

  // Dynamic API base with fallback
  const primaryApiBase = isHust ? "/next/api/hust/chat/bot/manage" : "/next/api/chat/bot/manage";
  const fallbackApiBase = "/next/api/chat/bot/manage";

  const fetchWithFallback = useCallback(
    async (path: string, options?: RequestInit) => {
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(options?.headers as Record<string, string>),
      };

      try {
        const primaryRes = await fetch(`${primaryApiBase}${path}`, {
          ...options,
          headers,
        });
        const primaryJson = await primaryRes.json().catch(() => null);

        if (primaryRes.ok && primaryJson?.success) {
          return { ok: true, data: primaryJson.data, meta: primaryJson.meta, isLive: true };
        }

        // If on Hust and primary returned 404 or error, fallback to MT backend
        if (isHust) {
          const fbRes = await fetch(`${fallbackApiBase}${path}`, {
            ...options,
            headers,
          });
          const fbJson = await fbRes.json().catch(() => null);
          if (fbRes.ok && fbJson?.success) {
            return { ok: true, data: fbJson.data, meta: fbJson.meta, isLive: true };
          }
        }

        return {
          ok: false,
          error: primaryJson?.error?.message || `HTTP ${primaryRes.status}`,
          isLive: false,
        };
      } catch {
        if (isHust) {
          try {
            const fbRes = await fetch(`${fallbackApiBase}${path}`, {
              ...options,
              headers,
            });
            const fbJson = await fbRes.json().catch(() => null);
            if (fbRes.ok && fbJson?.success) {
              return { ok: true, data: fbJson.data, meta: fbJson.meta, isLive: true };
            }
          } catch {
            // ignore
          }
        }
        return { ok: false, error: "Network error", isLive: false };
      }
    },
    [primaryApiBase, fallbackApiBase, isHust]
  );

  // Fetch overview & users from backend
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiErrorMessage(null);

    try {
      // 1. Fetch Overview
      const overviewResult = await fetchWithFallback("/overview");
      if (overviewResult.ok && overviewResult.data) {
        setOverview(overviewResult.data);
        setIsLiveApi(true);
      } else {
        setIsLiveApi(false);
        setOverview((prev) => prev || MOCK_OVERVIEW);
        const errMsg = overviewResult.error || "Không thể kết nối đến Chat Manage Overview API.";
        setApiErrorMessage(errMsg);
      }

      // 2. Fetch Users
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("per_page", String(perPage));
      params.set("page", String(currentPage));

      const usersResult = await fetchWithFallback(`/users?${params.toString()}`);
      if (usersResult.ok && Array.isArray(usersResult.data)) {
        setUsers(usersResult.data);
        if (usersResult.meta) {
          setMeta(usersResult.meta);
        }
        setIsLiveApi(true);
      } else {
        setUsers((prev) => (prev.length > 0 ? prev : INITIAL_MOCK_USERS));
      }
    } catch {
      setIsLiveApi(false);
      setOverview((prev) => prev || MOCK_OVERVIEW);
      setUsers((prev) => (prev.length > 0 ? prev : INITIAL_MOCK_USERS));
      setApiErrorMessage("Không thể kết nối đến Chat Manage API. Đang sử dụng chế độ Xem Trước.");
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [fetchWithFallback, searchQuery, statusFilter, perPage, currentPage]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Toggle user lock/unlock status
  const handleToggleUserStatus = async (user: ManageUserItem) => {
    const newStatusInt = user.status === "disabled" ? 1 : 0;
    const targetStatusText = newStatusInt === 1 ? "active" : "disabled";

    try {
      const res = await fetchWithFallback(`/users/${user.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatusInt }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === user.user_id
              ? {
                  ...u,
                  status: targetStatusText as "active" | "disabled",
                  active_session_count: newStatusInt === 1 ? u.session_count : 0,
                  disabled_session_count: newStatusInt === 1 ? 0 : u.session_count,
                }
              : u
          )
        );
        setActionSuccessToast(`Đã ${newStatusInt === 1 ? "mở khóa" : "khóa"} tài khoản ${user.user_id} thành công!`);
        void fetchData();
      } else {
        // Fallback optimistic update for demo / preview
        setUsers((prev) =>
          prev.map((u) => {
            if (u.user_id === user.user_id) {
              const updatedSessionActive = newStatusInt === 1 ? u.session_count : 0;
              const updatedSessionDisabled = newStatusInt === 1 ? 0 : u.session_count;
              return {
                ...u,
                status: targetStatusText as "active" | "disabled",
                active_session_count: updatedSessionActive,
                disabled_session_count: updatedSessionDisabled,
              };
            }
            return u;
          })
        );
        setActionSuccessToast(`[Xem trước] Đã ${newStatusInt === 1 ? "mở khóa" : "khóa"} tài khoản ${user.user_id}!`);
      }
    } catch {
      // Optimistic fallback
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id
            ? { ...u, status: targetStatusText as "active" | "disabled" }
            : u
        )
      );
      setActionSuccessToast(`[Xem trước] Đã ${newStatusInt === 1 ? "mở khóa" : "khóa"} tài khoản ${user.user_id}!`);
    }

    setTimeout(() => setActionSuccessToast(null), 3000);
  };

  // Inspect Sessions Modal
  const handleOpenSessionsModal = async (user: ManageUserItem) => {
    setInspectUser(user);
    setActiveModal("sessions");
    setIsModalLoading(true);

    try {
      const res = await fetchWithFallback(`/users/${user.user_id}`);
      if (res.ok && Array.isArray(res.data?.sessions)) {
        setInspectSessions(res.data.sessions);
      } else {
        setInspectSessions(
          MOCK_SESSIONS_MAP[user.user_id] || [
            {
              id: 999,
              status: user.status === "disabled" ? 0 : 1,
              created_at: user.created_at,
              updated_at: user.last_activity_at || user.created_at,
            },
          ]
        );
      }
    } catch {
      setInspectSessions(MOCK_SESSIONS_MAP[user.user_id] || []);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Inspect Rooms Modal
  const handleOpenRoomsModal = async (user: ManageUserItem) => {
    setInspectUser(user);
    setActiveModal("rooms");
    setIsModalLoading(true);

    try {
      const res = await fetchWithFallback(`/users/${user.user_id}/rooms`);
      if (res.ok && Array.isArray(res.data)) {
        setInspectRooms(res.data);
      } else {
        setInspectRooms(
          MOCK_ROOMS_MAP[user.user_id] || [
            {
              id: 888,
              id_chat_users: 101,
              title: `Phòng chat mặc định của ${user.user_id}`,
              status: 1,
              model: "gpt-4o-mini",
              created_at: user.created_at,
              updated_at: user.last_activity_at || user.created_at,
            },
          ]
        );
      }
    } catch {
      setInspectRooms(MOCK_ROOMS_MAP[user.user_id] || []);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Filtered users for table
  const displayedUsers = useMemo(() => {
    if (isLiveApi) {
      return users;
    }
    let result = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.user_id.toLowerCase().includes(q) ||
          (u.upstream_user_id !== undefined &&
            u.upstream_user_id !== null &&
            String(u.upstream_user_id).includes(q))
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }
    return result;
  }, [users, isLiveApi, searchQuery, statusFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-12">
      {/* Toast notifications */}
      {actionSuccessToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* HEADER SECTION                                                         */}
      {/* ======================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3.5 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 text-white shadow-2xs shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={chatHomeLink as unknown as Route}
                className="text-xs text-slate-500 hover:text-blue-600 font-medium transition flex items-center gap-1"
              >
                <span>Chat Bot Hub</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                Quản Trị AI Chat Bot
              </h1>
              <span className="rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                {brandName}
              </span>
              {isInitialLoading ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin text-indigo-600" />
                  Đang tải...
                </span>
              ) : isLiveApi ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 animate-in fade-in duration-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live API
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 animate-in fade-in duration-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Chế độ Xem trước
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              Theo dõi người dùng, phiên hoạt động (sessions), phòng chat và quản lý quyền truy cập.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void fetchData()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <Link
            href={chatHomeLink as unknown as Route}
            className="flex items-center gap-1 rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-bold shadow-2xs hover:bg-slate-800 transition"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Chat Hub</span>
          </Link>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4 KPI OVERVIEW CARDS                                                    */}
      {/* ======================================================================= */}
      {isInitialLoading || !overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-slate-200/80 rounded animate-pulse" />
                <div className="h-7 w-7 bg-slate-100 rounded-lg animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="h-7 w-20 bg-slate-200/80 rounded-lg animate-pulse" />
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-300">
          {/* Card 1: Users */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tổng Người Dùng
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {overview.users.total}
              </span>
              <span className="text-xs text-slate-500">người dùng</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[10px] font-semibold">
              <span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 border border-emerald-200/80">
                {overview.users.active} hoạt động
              </span>
              <span className="rounded bg-rose-50 text-rose-700 px-1.5 py-0.5 border border-rose-200/80">
                {overview.users.disabled} bị khóa
              </span>
              {overview.users.mixed_status > 0 && (
                <span className="rounded bg-amber-50 text-amber-700 px-1.5 py-0.5 border border-amber-200/80">
                  {overview.users.mixed_status} hỗn hợp
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Sessions */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-purple-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phiên Làm Việc
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {overview.sessions}
              </span>
              <span className="text-xs text-slate-500">sessions</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Đồng bộ cookie &amp; session ID</span>
            </div>
          </div>

          {/* Card 3: Rooms */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-emerald-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phòng Trò Chuyện
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {overview.rooms.total}
              </span>
              <span className="text-xs text-slate-500">phòng</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold">
              <span className="rounded bg-teal-50 text-teal-700 px-1.5 py-0.5 border border-teal-200/80">
                {overview.rooms.active} phòng mở
              </span>
              <span className="text-slate-400">
                • {overview.rooms.total - overview.rooms.active} đã đóng
              </span>
            </div>
          </div>

          {/* Card 4: Service Gateway */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-amber-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dịch Vụ AI Gateway
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-800">
                Laravel Chat Bot API
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
              <Server className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="font-mono text-[9px] text-slate-600 truncate">
                {isHust ? "laravel.hust.media" : "laravel_mt.hust.media"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info Notice when in Preview Mode */}
      {!isInitialLoading && !isLiveApi && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in duration-300">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-950">
              Chế độ Xem trước đang hoạt động (Preview Mode)
            </p>
            <p className="text-[11px] text-amber-900/80">
              Backend Laravel hiện trả về <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[10px]">CHAT_BOT_MANAGE_API_NOT_CONFIGURED</code> hoặc chưa cấu hình route. Toàn bộ thao tác lọc, xem chi tiết session/phòng và đổi trạng thái khóa/mở bên dưới đã được tích hợp mô phỏng hoàn chỉnh.
            </p>
            {apiErrorMessage && (
              <p className="text-[10px] text-amber-800 font-mono pt-0.5">
                Mã phản hồi server: {apiErrorMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2 MAIN BRANCH TABS: QUẢN TRỊ CHAT BOT & QUẢN TRỊ MESSAGES                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200">
        <div className="flex gap-2">
          <a
            href={chatManageUrl}
            onClick={(e) => {
              e.preventDefault();
              navigateTab("bot");
            }}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "bot"
                ? "border-purple-600 text-purple-700 bg-purple-50/40 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <Bot className="h-4 w-4 text-purple-600" />
            <span>Quản trị Chat Bot</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "bot"
                  ? "bg-purple-200/80 text-purple-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isInitialLoading ? "…" : users.length}
            </span>
          </a>

          <a
            href={chatMessagesUrl}
            onClick={(e) => {
              e.preventDefault();
              navigateTab("messages");
            }}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "messages"
                ? "border-purple-600 text-purple-700 bg-purple-50/40 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <MessageSquare className="h-4 w-4 text-purple-600" />
            <span>Quản trị Messages</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "messages"
                  ? "bg-purple-200/80 text-purple-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {allAvailableRooms.length} phòng
            </span>
          </a>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono pr-2">
          <span>Nhánh URL:</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 border border-slate-200">
            {activeTab === "bot" ? chatManageUrl : chatMessagesUrl}
          </span>
        </div>
      </div>

      {activeTab === "bot" ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          {/* Controls Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/70 p-3 sm:px-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm User ID (vd: user_101, guest_308, 101)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
            <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1 hidden md:flex">
              <Filter className="h-3 w-3" /> Lọc:
            </span>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Tất cả ({isInitialLoading ? "..." : meta.total || users.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("active");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Hoạt động
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("disabled");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                statusFilter === "disabled"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Đã khóa
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("mixed");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                statusFilter === "mixed"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Hỗn hợp
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className={`overflow-x-auto transition-opacity duration-200 ${isLoading && !isInitialLoading ? "opacity-60" : "opacity-100"}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Người Dùng</th>
                <th className="py-2.5 px-3.5">Trạng Thái</th>
                <th className="py-2.5 px-3.5">Phiên (Sessions)</th>
                <th className="py-2.5 px-3.5">Phòng Chat</th>
                <th className="py-2.5 px-3.5 hidden md:table-cell">Hoạt Động Gần Nhất</th>
                <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isInitialLoading ? (
                // Skeleton loading rows with pulse shimmer
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-200/80 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-20 bg-slate-200/80 rounded" />
                          <div className="h-2 w-14 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="h-5 w-16 bg-slate-100 rounded-full" />
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="h-3.5 w-24 bg-slate-200/70 rounded" />
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="h-4 w-14 bg-slate-100 rounded" />
                    </td>
                    <td className="py-3 px-3.5 hidden md:table-cell">
                      <div className="h-3 w-28 bg-slate-100 rounded" />
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="h-6 w-14 bg-slate-100 rounded-lg" />
                        <div className="h-6 w-14 bg-slate-100 rounded-lg" />
                        <div className="h-6 w-14 bg-slate-100 rounded-lg" />
                        <div className="h-6 w-12 bg-slate-100 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => {
                  const isGuest = user.user_id.startsWith("guest_");
                  return (
                    <tr
                      key={user.user_id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* User Column */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs shrink-0 ${
                              isGuest
                                ? "bg-amber-100 text-amber-700"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {isGuest ? "G" : "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-800 font-mono text-xs">
                                {user.user_id}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                                    void navigator.clipboard.writeText(user.user_id);
                                    setActionSuccessToast(`Đã sao chép ID: ${user.user_id}`);
                                    setTimeout(() => setActionSuccessToast(null), 2000);
                                  }
                                }}
                                title="Sao chép User ID"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              {isGuest ? (
                                <span className="rounded bg-amber-50 border border-amber-200/60 px-1 py-0.2 text-[9px] font-bold text-amber-700">
                                  Khách
                                </span>
                              ) : (
                                <span className="rounded bg-blue-50 border border-blue-200/60 px-1 py-0.2 text-[9px] font-bold text-blue-700">
                                  Thành viên
                                </span>
                              )}
                            </div>
                            {user.upstream_user_id ? (
                              <p className="text-[10px] text-slate-400">
                                Upstream ID: #{user.upstream_user_id}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-2.5 px-3.5">
                        {user.status === "active" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Hoạt động
                          </span>
                        ) : user.status === "disabled" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            <Lock className="h-2.5 w-2.5" />
                            Đã khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Hỗn hợp
                          </span>
                        )}
                      </td>

                      {/* Sessions Column */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">
                            {user.session_count} phiên
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({user.active_session_count} mở / {user.disabled_session_count} khóa)
                          </span>
                        </div>
                      </td>

                      {/* Rooms Column */}
                      <td className="py-2.5 px-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 text-[11px]">
                          {user.room_count} phòng
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="py-2.5 px-3.5 hidden md:table-cell text-slate-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{user.last_activity_at || user.created_at}</span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sessions inspector button */}
                          <button
                            type="button"
                            onClick={() => void handleOpenSessionsModal(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition cursor-pointer shadow-2xs"
                            title="Xem chi tiết các phiên (Sessions)"
                          >
                            <Layers className="h-3 w-3 text-purple-600" />
                            <span className="hidden sm:inline">Sessions</span>
                          </button>

                          {/* Rooms inspector button */}
                          <button
                            type="button"
                            onClick={() => void handleOpenRoomsModal(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition cursor-pointer shadow-2xs"
                            title="Xem danh sách phòng chat"
                          >
                            <MessageSquare className="h-3 w-3 text-emerald-600" />
                            <span className="hidden sm:inline">Phòng</span>
                          </button>

                          {/* Messages / Inbox button */}
                          <button
                            type="button"
                            onClick={() => {
                              navigateTab("messages", undefined, user.user_id);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 hover:text-purple-800 px-2 py-1 text-[11px] font-bold text-purple-700 transition cursor-pointer shadow-2xs"
                            title={`Xem toàn bộ tin nhắn / inbox của ${user.user_id}`}
                          >
                            <MessageSquareText className="h-3 w-3 text-purple-600" />
                            <span className="hidden sm:inline">Xem ib</span>
                          </button>

                          {/* Lock / Unlock Toggle Button */}
                          <button
                            type="button"
                            onClick={() => void handleToggleUserStatus(user)}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition cursor-pointer shadow-2xs ${
                              user.status === "disabled"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                            title={user.status === "disabled" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {user.status === "disabled" ? (
                              <>
                                <Unlock className="h-3 w-3" />
                                <span>Mở</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3" />
                                <span>Khóa</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/70 px-4 py-3 text-xs text-slate-600">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              {isInitialLoading ? (
                <span className="inline-block h-3.5 w-32 bg-slate-200/80 rounded animate-pulse" />
              ) : (
                <>
                  Tổng cộng <strong>{meta.total || displayedUsers.length}</strong> người dùng
                </>
              )}
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Mỗi trang:</span>
              <select
                value={perPage}
                disabled={isInitialLoading}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">
              Trang <strong>{isInitialLoading ? 1 : meta.current_page || currentPage}</strong> / {isInitialLoading ? "..." : meta.last_page || 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isInitialLoading || currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Trang trước"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Trước</span>
              </button>
              <button
                type="button"
                disabled={isInitialLoading || currentPage >= (meta.last_page || 1) || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(meta.last_page || 1, p + 1))}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Trang sau"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <ChatMessagesPanel
          isHust={isHust}
          initialRoomId={selectedRoomIdForMessages}
          initialUserId={selectedUserForMessages}
          availableRooms={allAvailableRooms}
          onSelectUser={(uid) => {
            setSearchQuery(uid);
            navigateTab("bot");
          }}
        />
      )}

      {/* ======================================================================= */}
      {/* MODAL 1: SESSIONS INSPECTOR                                             */}
      {/* ======================================================================= */}
      {activeModal === "sessions" && inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh Sách Phiên (Sessions) của {inspectUser.user_id}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tổng số: {inspectSessions.length} phiên làm việc
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isModalLoading ? (
                <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                  <span>Đang tải thông tin session...</span>
                </div>
              ) : inspectSessions.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  Không tìm thấy session nào của người dùng này.
                </div>
              ) : (
                inspectSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 hover:border-purple-300 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-purple-900">
                          Session #{sess.id}
                        </span>
                        {sess.status === 1 ? (
                          <span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.2 text-[10px] font-bold border border-emerald-200/80">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="rounded bg-rose-50 text-rose-700 px-1.5 py-0.2 text-[10px] font-bold border border-rose-200/80">
                            Bị khóa
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 space-x-3">
                        <span>Tạo lúc: {sess.created_at}</span>
                        <span>Cập nhật: {sess.updated_at}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 2: ROOMS INSPECTOR                                                */}
      {/* ======================================================================= */}
      {activeModal === "rooms" && inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh Sách Phòng Chat của {inspectUser.user_id}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tổng số: {inspectRooms.length} phòng hội thoại
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isModalLoading ? (
                <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>Đang tải danh sách phòng chat...</span>
                </div>
              ) : inspectRooms.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  Người dùng này chưa tạo phòng chat nào.
                </div>
              ) : (
                inspectRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 hover:border-emerald-300 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          #{room.id}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {room.title || "Phòng trò chuyện không tiêu đề"}
                        </h4>
                        <span className="rounded bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 text-[9px] font-mono text-indigo-700">
                          {room.model}
                        </span>
                        {room.status === 1 ? (
                          <span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.2 text-[9px] font-bold border border-emerald-200/80">
                            Mở
                          </span>
                        ) : (
                          <span className="rounded bg-slate-200 text-slate-600 px-1.5 py-0.2 text-[9px] font-bold">
                            Đã đóng
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                        <span>User Session ID: #{room.id_chat_users}</span>
                        <span>Tạo lúc: {room.created_at}</span>
                        <span>Cập nhật: {room.updated_at}</span>
                      </div>
                    </div>

                    {/* View Messages Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        navigateTab("messages", room.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-700 transition cursor-pointer shadow-2xs shrink-0"
                      title="Xem chi tiết các tin nhắn trong phòng này"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Xem tin nhắn</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
