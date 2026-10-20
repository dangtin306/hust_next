"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MessageSquare,
  MessageSquareText,
  Search,
  Filter,
  RefreshCw,
  Bot,
  User,
  Clock,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Code2,
  Sparkles,
  Zap,
  Server,
  Layers,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Hash,
  Database,
  ExternalLink,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  apiFetchManageMessages,
  apiFetchManageRoomMessages,
  apiFetchManageMessageDetail,
  apiUpdateManageMessageStatus,
  apiDeleteManageMessage,
  apiBulkUpdateManageMessageStatus,
  ChatBotMessageItem,
} from "../api/media_api";

export type { ChatBotMessageItem };

export interface RoomOption {
  id: number;
  title: string;
  user_id?: string;
  model?: string;
  status?: number;
  id_chat_users?: number;
  created_at?: string;
}

interface ChatMessagesPanelProps {
  isHust?: boolean;
  initialRoomId?: number | string;
  initialUserId?: string;
  availableRooms?: RoomOption[];
  onSelectUser?: (userId: string) => void;
  onBackToManage?: () => void;
}

// ---------------------------------------------------------------------------
// Realistic Fallback Mock Messages covering all 7 AI Services
// ---------------------------------------------------------------------------
const MOCK_MESSAGES: ChatBotMessageItem[] = [
  {
    id: 619,
    user_id: "user_502",
    room: { id: 2, title: "Hướng dẫn tích hợp OpenClaw" },
    id_chat_rooms: 2,
    role: "assistant",
    content: "Cảm ơn bạn! 😊 Tôi luôn sẵn sàng hỗ trợ bạn cấu hình và tích hợp toàn bộ hệ thống API.",
    status: 1,
    service_id: "media_text_to_text",
    model: "gpt-5.6-luna",
    created_at: "2026-10-18 21:40:22",
    upstream: {
      response_id: "resp_92d0e29f-3c2d-497c-a563-9a60bf804f9d",
      usage: { prompt_tokens: 22, completion_tokens: 145, cached_tokens: 0, total_tokens: 167 },
      http_status: 200,
      error_message: null,
    },
    usage: { prompt_tokens: 22, completion_tokens: 145, total_tokens: 167 },
  },
  {
    id: 618,
    user_id: "user_502",
    room: { id: 2, title: "Hướng dẫn tích hợp OpenClaw" },
    id_chat_rooms: 2,
    role: "user",
    content: "Hãy hướng dẫn tôi cách lấy danh sách workspace và tạo conversation trong OpenClaw.",
    status: 1,
    service_id: "media_text_to_text",
    model: "gpt-5.6-luna",
    created_at: "2026-10-18 21:40:15",
    upstream: {
      response_id: "resp_8829f001-11a2-4bb3-9cf1-88390bca1123",
      usage: { prompt_tokens: 35, completion_tokens: 0, cached_tokens: 0, total_tokens: 35 },
      http_status: 200,
      error_message: null,
    },
    usage: { prompt_tokens: 35, completion_tokens: 0, total_tokens: 35 },
  },
  {
    id: 617,
    user_id: "user_101",
    room: { id: 1002, title: "Soạn thảo thông báo học bổng" },
    id_chat_rooms: 1002,
    role: "assistant",
    content:
      "THÔNG BÁO VỀ VIỆC XÉT HỌC BỔNG KHUYẾN KHÍCH HỌC TẬP KỲ 2026-1\n\nKính gửi các bạn sinh viên,\nNhà trường xin thông báo kế hoạch xét cấp học bổng khuyến khích học tập kỳ 2026-1 như sau:\n1. Đối tượng & Tiêu chuẩn: Sinh viên hệ chính quy có CPA kỳ đạt từ 3.2 trở lên và Điểm rèn luyện đạt từ 80 điểm.\n2. Thời hạn nộp hồ sơ: Trước 17h00 ngày 30/11/2026.",
    status: 1,
    service_id: "media_content_smart",
    model: "gpt-4o-mini",
    created_at: "2026-10-18 19:05:12",
    upstream: {
      response_id: "resp_77cbb201-99af-4022-8721-aabcfef91112",
      usage: { prompt_tokens: 45, completion_tokens: 220, cached_tokens: 0, total_tokens: 265 },
      http_status: 200,
      error_message: null,
    },
    usage: { prompt_tokens: 45, completion_tokens: 220, total_tokens: 265 },
  },
  {
    id: 616,
    user_id: "user_101",
    room: { id: 1003, title: "Sửa lỗi chính tả đề cương" },
    id_chat_rooms: 1003,
    role: "assistant",
    content:
      "Đoạn văn sau khi chuẩn hóa chính tả tiếng Việt:\n'Nghiên cứu xây dựng hệ thống quản lý phòng chat thông minh ứng dụng kiến trúc vi dịch vụ và mô hình ngôn ngữ lớn để hỗ trợ sinh viên nhanh chóng.'",
    status: 1,
    service_id: "media_spell_check",
    model: "gpt-4o",
    created_at: "2026-10-17 16:15:10",
    upstream: {
      response_id: "resp_55aae302-33dd-4119-9021-fefc99182033",
      usage: { prompt_tokens: 50, completion_tokens: 140, cached_tokens: 0, total_tokens: 190 },
      http_status: 200,
      error_message: null,
    },
    usage: { prompt_tokens: 50, completion_tokens: 140, total_tokens: 190 },
  },
  {
    id: 615,
    user_id: "user_101",
    room: { id: 1004, title: "Viết script video Git Auto" },
    id_chat_rooms: 1004,
    role: "assistant",
    content:
      "KỊCH BẢN VIDEO HƯỚNG DẪN GIT AUTO (Thời lượng: 60 giây)\n[00:00 - 00:15] Giới thiệu giao diện điều khiển tự động hóa triển khai kho code.\n[00:15 - 00:40] Cấu hình webhook và secret token đồng bộ git.",
    status: 1,
    service_id: "media_script_writing",
    model: "gpt-4o",
    created_at: "2026-10-18 10:00:15",
    upstream: {
      response_id: "resp_44bbd902-88ee-4552-8711-ddeebbf09911",
      usage: { prompt_tokens: 38, completion_tokens: 190, cached_tokens: 0, total_tokens: 228 },
      http_status: 200,
      error_message: null,
    },
    usage: { prompt_tokens: 38, completion_tokens: 190, total_tokens: 228 },
  },
  {
    id: 614,
    user_id: "user_101",
    room: { id: 1005, title: "OCR lịch thi học kỳ" },
    id_chat_rooms: 1005,
    role: "assistant",
    content:
      "Kết quả nhận diện OCR từ hình ảnh:\n- Thứ 2 (Tiết 1-3): Lập trình Web nâng cao - Phòng B1-302\n- Thứ 4 (Tiết 4-6): Trí tuệ nhân tạo - Phòng B1-305.",
    status: 1,
    service_id: "media_image_to_text",
    model: "gpt-4o-mini",
    created_at: "2026-10-18 15:30:15",
    upstream: {
      response_id: "resp_33cca011-77aa-4221-bb11-ccddaa887722",
      usage: { prompt_tokens: 85, completion_tokens: 95, cached_tokens: 0, total_tokens: 180 },
      http_status: 200,
      error_message: null,
    },
    usage: { prompt_tokens: 85, completion_tokens: 95, total_tokens: 180 },
  },
  {
    id: 613,
    user_id: "user_204",
    room: { id: 2001, title: "Chuyển văn bản thành giọng nói" },
    id_chat_rooms: 2001,
    role: "assistant",
    content:
      "Đã tạo file audio giọng đọc tiếng Việt qua TTS F5_vie. File xuất khẩu: audio_announcement_20261018.wav (Độ dài: 6.2s, Tần số lấy mẫu: 24kHz).",
    status: 1,
    service_id: "media_text_to_speech",
    model: "F5_vie",
    created_at: "2026-10-18 20:10:08",
    upstream: {
      response_id: "resp_22aa8811-66bb-4991-aa00-bbccdd112233",
      usage: { prompt_tokens: 28, completion_tokens: 65, cached_tokens: 0, total_tokens: 93 },
      http_status: 200,
      error_message: null,
    },
    usage: { prompt_tokens: 28, completion_tokens: 65, total_tokens: 93 },
  },
  {
    id: 612,
    user_id: "user_777",
    room: { id: 7001, title: "Tạo hình ảnh robot thông minh" },
    id_chat_rooms: 7001,
    role: "assistant",
    content:
      "Đã khởi tạo task tạo hình ảnh qua endpoint /openclaw/v1/images/generations. Ảnh PNG 1024x1024 chất lượng cao đã lưu vào volume.",
    status: 0,
    service_id: "text_to_image",
    model: "openai/gpt-image-2",
    created_at: "2026-10-18 21:50:30",
    upstream: {
      response_id: "resp_11aa0099-55cc-4881-8811-aabbcc990011",
      usage: { prompt_tokens: 25, completion_tokens: 58, cached_tokens: 0, total_tokens: 83 },
      http_status: 200,
      error_message: null,
    },
    usage: { prompt_tokens: 25, completion_tokens: 58, total_tokens: 83 },
  },
];

const DEFAULT_ROOMS: RoomOption[] = [
  { id: 2, title: "Hướng dẫn tích hợp OpenClaw", user_id: "user_502", model: "gpt-5.6-luna", status: 1 },
  { id: 1001, title: "Tra cứu chương trình đào tạo ngành CNTT", user_id: "user_101", model: "gpt-4o-mini", status: 1 },
  { id: 1002, title: "Soạn thảo thông báo học bổng", user_id: "user_101", model: "gpt-4o-mini", status: 1 },
  { id: 1003, title: "Sửa lỗi chính tả đề cương", user_id: "user_101", model: "gpt-4o", status: 1 },
  { id: 1004, title: "Viết script video Git Auto", user_id: "user_101", model: "gpt-4o", status: 1 },
  { id: 1005, title: "OCR lịch thi học kỳ", user_id: "user_101", model: "gpt-4o-mini", status: 1 },
  { id: 2001, title: "Chuyển văn bản thành giọng nói", user_id: "user_204", model: "F5_vie", status: 1 },
  { id: 7001, title: "Tạo hình ảnh robot thông minh", user_id: "user_777", model: "openai/gpt-image-2", status: 1 },
];

export default function ChatMessagesPanel({
  isHust = false,
  initialRoomId,
  initialUserId,
  availableRooms = DEFAULT_ROOMS,
  onSelectUser,
  onBackToManage,
}: ChatMessagesPanelProps) {
  // Mode: "all" (System-wide GET /api/chat/bot/messages) vs "room" (GET /api/chat/bot/messages/rooms/{roomId})
  const [viewMode, setViewMode] = useState<"all" | "room">(() => {
    if (initialRoomId) return "room";
    return "all";
  });

  // Selected room for "room" mode
  const [selectedRoomId, setSelectedRoomId] = useState<number>(() => {
    if (initialRoomId) {
      const parsed = Number(initialRoomId);
      if (Number.isInteger(parsed) && parsed > 0) return parsed;
    }
    return availableRooms[0]?.id || 2;
  });
  const [inputRoomId, setInputRoomId] = useState<string>(String(selectedRoomId));

  // Messages list state
  const [messages, setMessages] = useState<ChatBotMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>(initialUserId || "");
  const [searchInput, setSearchInput] = useState<string>(initialUserId || "");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "assistant" | "system">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "1" | "0">("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [filterRoomId, setFilterRoomId] = useState<string>("");

  // Bulk Status Update (PATCH /api/chat/bot/messages/bulk-status)
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);

  // Inspect message detail modal
  const [inspectMessage, setInspectMessage] = useState<ChatBotMessageItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Action status (loading states & toasts)
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic sync when initialRoomId or initialUserId changes from parent / navigation
  useEffect(() => {
    if (initialRoomId) {
      const parsed = Number(initialRoomId);
      if (Number.isInteger(parsed) && parsed > 0) {
        setSelectedRoomId(parsed);
        setInputRoomId(String(parsed));
        setViewMode("room");
      }
    }
  }, [initialRoomId]);

  useEffect(() => {
    if (initialUserId) {
      setViewMode("all");
      setSearchInput(initialUserId);
      setSearchQuery(initialUserId);
    }
  }, [initialUserId]);

  // Sync with browser URL search params on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const rid = params.get("room_id");
      const uid = params.get("user_id") || params.get("q");
      if (rid) {
        const num = Number(rid);
        if (!isNaN(num) && num > 0) {
          setSelectedRoomId(num);
          setInputRoomId(String(num));
          setViewMode("room");
        }
      } else if (uid) {
        setViewMode("all");
        setSearchInput(uid);
        setSearchQuery(uid);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // Load data based on viewMode
  // ---------------------------------------------------------------------------
  const loadMessages = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setApiErrorMessage(null);

      try {
        if (viewMode === "room") {
          const res = await apiFetchManageRoomMessages(selectedRoomId, {
            page: pageToLoad,
            per_page: pagination.per_page,
            isHust,
          });

          if (res?.success && Array.isArray(res.data)) {
            setMessages(res.data);
            setPagination({
              page: res.pagination?.page || pageToLoad,
              per_page: res.pagination?.per_page || pagination.per_page,
              total: res.pagination?.total ?? res.data.length,
              last_page: res.pagination?.last_page || 1,
            });
            setIsLiveApi(true);
          } else {
            throw new Error("Không nhận được dữ liệu tin nhắn từ phòng");
          }
        } else {
          // System-wide GET /api/chat/bot/messages
          const res = await apiFetchManageMessages({
            room_id: filterRoomId.trim() ? Number(filterRoomId.trim()) : undefined,
            role: roleFilter !== "all" ? roleFilter : undefined,
            status: statusFilter !== "all" ? Number(statusFilter) : undefined,
            q: searchQuery.trim() || undefined,
            page: pageToLoad,
            per_page: pagination.per_page,
            isHust,
          });

          if (res?.success && Array.isArray(res.data)) {
            setMessages(res.data);
            setPagination({
              page: res.pagination?.page || pageToLoad,
              per_page: res.pagination?.per_page || pagination.per_page,
              total: res.pagination?.total ?? res.data.length,
              last_page: res.pagination?.last_page || 1,
            });
            setIsLiveApi(true);
          } else {
            throw new Error("Không nhận được danh sách tin nhắn");
          }
        }
      } catch (err: any) {
        console.warn("Failed fetching messages from Laravel API, falling back to mock:", err);
        setApiErrorMessage(err?.message || "Lỗi kết nối Laravel API");
        setIsLiveApi(false);

        // Fallback filter locally on mock data
        let filtered = [...MOCK_MESSAGES];
        if (viewMode === "room") {
          filtered = filtered.filter(
            (m) => (m.room?.id ?? m.id_chat_rooms) === selectedRoomId,
          );
        } else {
          if (filterRoomId.trim()) {
            filtered = filtered.filter(
              (m) => String(m.room?.id ?? m.id_chat_rooms) === filterRoomId.trim(),
            );
          }
        }
        if (roleFilter !== "all") {
          filtered = filtered.filter((m) => m.role === roleFilter);
        }
        if (statusFilter !== "all") {
          filtered = filtered.filter((m) => String(m.status) === statusFilter);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.content.toLowerCase().includes(q) ||
              String(m.id).includes(q) ||
              (m.user_id && m.user_id.toLowerCase().includes(q)),
          );
        }

        setMessages(filtered);
        setPagination({
          page: 1,
          per_page: pagination.per_page,
          total: filtered.length,
          last_page: Math.max(1, Math.ceil(filtered.length / pagination.per_page)),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      viewMode,
      selectedRoomId,
      filterRoomId,
      roleFilter,
      statusFilter,
      searchQuery,
      pagination.per_page,
      isHust,
    ],
  );

  // Trigger load when parameters change
  useEffect(() => {
    void loadMessages(1);
  }, [loadMessages]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  // ---------------------------------------------------------------------------
  // Action 1: View Message Detail (GET /api/chat/bot/messages/{messageId})
  // ---------------------------------------------------------------------------
  const handleViewDetail = async (msg: ChatBotMessageItem) => {
    setIsLoadingDetail(true);
    setInspectMessage(msg);
    try {
      const res = await apiFetchManageMessageDetail(msg.id, { isHust });
      if (res?.success && res.data) {
        setInspectMessage(res.data);
      }
    } catch (err) {
      // Keep existing data if detail fetch fails
      console.warn("Could not fetch detail from server, showing cached:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Action 2: Update Status (PATCH /api/chat/bot/messages/{messageId})
  // ---------------------------------------------------------------------------
  const handleToggleStatus = async (msg: ChatBotMessageItem) => {
    const newStatus: 0 | 1 = msg.status === 1 ? 0 : 1;
    setProcessingId(msg.id);

    try {
      await apiUpdateManageMessageStatus(msg.id, newStatus, { isHust });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m)),
      );
      showToast(
        newStatus === 1
          ? `Đã kích hoạt hiển thị tin nhắn #${msg.id} (status: 1)`
          : `Đã ẩn tin nhắn #${msg.id} (status: 0)`,
      );
    } catch (err: any) {
      // Fallback local update
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m)),
      );
      showToast(`Đã đổi trạng thái tin nhắn #${msg.id} thành ${newStatus}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Action 3: Soft Delete (DELETE /api/chat/bot/messages/{messageId})
  // ---------------------------------------------------------------------------
  const handleDeleteMessage = async (msg: ChatBotMessageItem) => {
    if (!confirm(`Bạn có chắc muốn ẩn mềm tin nhắn #${msg.id}? (status sẽ được đặt thành 0)`)) {
      return;
    }

    setProcessingId(msg.id);
    try {
      await apiDeleteManageMessage(msg.id, { isHust });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 0 } : m)),
      );
      showToast(`Đã ẩn mềm thành công tin nhắn #${msg.id} (DELETE API: status = 0)`);
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: 0 } : m)),
      );
      showToast(`Đã ẩn mềm tin nhắn #${msg.id} (status = 0)`);
    } finally {
      setProcessingId(null);
    }
  };

  // Copy helper
  const handleCopy = (text: string, msgId: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      showToast(`Đã sao chép nội dung tin nhắn #${msgId}!`);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Service Badge styling
  const getServiceBadge = (serviceId?: string | null) => {
    switch (serviceId) {
      case "text_to_image":
        return { label: "Text To Image", bg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" };
      case "media_text_to_text":
        return { label: "Hội thoại", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "media_content_smart":
        return { label: "Viết thông minh", bg: "bg-pink-50 text-pink-700 border-pink-200" };
      case "media_spell_check":
        return { label: "Sửa chính tả", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "media_script_writing":
        return { label: "Viết kịch bản", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "media_image_to_text":
        return { label: "OCR hình ảnh", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "media_text_to_speech":
        return { label: "Text-to-speech", bg: "bg-teal-50 text-teal-700 border-teal-200" };
      default:
        return { label: serviceId || "media_text_to_text", bg: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  // Filter messages by service client-side if needed
  const displayMessages = useMemo(() => {
    if (serviceFilter === "all") return messages;
    return messages.filter((m) => (m.service_id || "media_text_to_text") === serviceFilter);
  }, [messages, serviceFilter]);

  // Bulk selection computed states
  const allVisibleIds = useMemo(() => displayMessages.map((m) => m.id), [displayMessages]);
  const isAllSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedMessageIds.includes(id));
  const isSomeSelected = selectedMessageIds.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(allVisibleIds);
    }
  };

  const toggleSelectMessage = (id: number) => {
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Status Update (PATCH /api/chat/bot/messages/bulk-status)
  const handleBulkStatusChange = async (targetStatus: 0 | 1) => {
    if (selectedMessageIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await apiBulkUpdateManageMessageStatus(selectedMessageIds, targetStatus, { isHust });
      setMessages((prev) =>
        prev.map((m) =>
          selectedMessageIds.includes(m.id) ? { ...m, status: targetStatus } : m
        )
      );
      showToast(
        `Đã cập nhật trạng thái cho ${selectedMessageIds.length} tin nhắn (status: ${targetStatus})!`
      );
      setSelectedMessageIds([]);
    } catch {
      // Fallback optimistic update
      setMessages((prev) =>
        prev.map((m) =>
          selectedMessageIds.includes(m.id) ? { ...m, status: targetStatus } : m
        )
      );
      showToast(
        `[Xem trước] Đã cập nhật trạng thái cho ${selectedMessageIds.length} tin nhắn (status: ${targetStatus})!`
      );
      setSelectedMessageIds([]);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Back to Manage */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (onBackToManage) onBackToManage();
            else if (onSelectUser) onSelectUser("");
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 px-3.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
          title="Quay lại giao diện Quản Trị AI Chat Bot"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Quay lại Quản trị Chat Bot</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. API DOCUMENTATION & LIVE STATUS BANNER                             */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-purple-200/90 bg-gradient-to-r from-purple-50/80 via-indigo-50/60 to-pink-50/40 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-2xs shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Quản Trị Tin Nhắn AI (Messages API)
                </h2>
                {isLiveApi ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Laravel API • {pagination.total} tin nhắn
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Chế độ Xem trước • {messages.length} tin nhắn mẫu
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600">
                Xử lý bởi <code className="font-mono font-bold text-purple-700">Mess_Controller.php</code> và{" "}
                <code className="font-mono font-bold text-purple-700">Mess_History.php</code>. Hỗ trợ lọc theo user_id, phân trang, tra cứu phòng, cập nhật trạng thái (0/1), cập nhật hàng loạt và ẩn mềm tin nhắn.
              </p>
            </div>
          </div>

          {/* 6 Endpoints quick reference badges */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono font-bold">
            <span className="rounded-md bg-white/90 border border-purple-200 px-2 py-1 text-purple-700 shadow-2xs">
              GET /messages
            </span>
            <span className="rounded-md bg-white/90 border border-indigo-200 px-2 py-1 text-indigo-700 shadow-2xs">
              GET /messages/rooms/&#123;id&#125;
            </span>
            <span className="rounded-md bg-white/90 border border-blue-200 px-2 py-1 text-blue-700 shadow-2xs">
              GET /messages/&#123;id&#125;
            </span>
            <span className="rounded-md bg-white/90 border border-amber-200 px-2 py-1 text-amber-700 shadow-2xs">
              PATCH /messages/&#123;id&#125;
            </span>
            <span className="rounded-md bg-white/90 border border-purple-300 bg-purple-50 px-2 py-1 text-purple-800 shadow-2xs">
              PATCH /messages/bulk-status
            </span>
            <span className="rounded-md bg-white/90 border border-rose-200 px-2 py-1 text-rose-700 shadow-2xs">
              DELETE /messages/&#123;id&#125;
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MODE SELECTOR & CONTROLS TOOLBAR                                    */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setViewMode("all");
                setFilterRoomId("");
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs ${
                viewMode === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Toàn Hệ Thống (GET /messages)</span>
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                {viewMode === "all" ? pagination.total : ""}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("room")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs ${
                viewMode === "room"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Theo Phòng Chat (GET /rooms/&#123;roomId&#125;)</span>
            </button>
          </div>

          {/* Reload button */}
          <button
            type="button"
            onClick={() => void loadMessages(pagination.page)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs disabled:opacity-60 shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Tải lại</span>
          </button>
        </div>

        {/* ViewMode: Room Chat Selector Bar */}
        {viewMode === "room" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              <span>Chọn Phòng:</span>
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setSelectedRoomId(newId);
                setInputRoomId(String(newId));
              }}
              className="flex-1 max-w-lg rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs cursor-pointer truncate"
            >
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} - {r.title} ({r.user_id || `User ${r.id_chat_users || ""}`}) [{r.model || "gpt-4o"}]
                </option>
              ))}
            </select>

            {/* Custom Room ID Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsed = parseInt(inputRoomId.trim(), 10);
                if (!isNaN(parsed) && parsed > 0) setSelectedRoomId(parsed);
              }}
              className="flex items-center gap-1 shrink-0"
            >
              <input
                type="number"
                placeholder="ID phòng khác..."
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="w-24 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
              <button
                type="submit"
                className="rounded-xl border border-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                Mở phòng
              </button>
            </form>
          </div>
        )}

        {/* Active Room Mode Banner */}
        {viewMode === "room" && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs text-indigo-900 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
              <span className="truncate">
                Đang xem lịch sử hội thoại phòng:{" "}
                <strong className="font-mono text-indigo-950 font-extrabold">#{selectedRoomId}</strong>
                {availableRooms.find((r) => r.id === selectedRoomId)?.title && (
                  <span className="text-indigo-700 font-medium">
                    {" "}
                    ({availableRooms.find((r) => r.id === selectedRoomId)?.title})
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded bg-indigo-100 border border-indigo-200 px-1.5 py-0.2 text-[10px] font-mono text-indigo-800 hidden sm:inline">
                GET /api/chat/bot/messages/rooms/{selectedRoomId}
              </span>
              <button
                type="button"
                onClick={() => {
                  setViewMode("all");
                  setFilterRoomId("");
                }}
                className="inline-flex items-center gap-1 rounded-md bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer shadow-2xs"
              >
                <span>Xem toàn hệ thống</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Active User Inbox Filter Banner */}
        {searchQuery && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-purple-200 bg-purple-50/80 px-3.5 py-2 text-xs text-purple-900 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquareText className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="truncate">
                Đang lọc tin nhắn / inbox của tài khoản:{" "}
                <strong className="font-mono text-purple-950 font-extrabold">{searchQuery}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onSelectUser && (
                <button
                  type="button"
                  onClick={() => onSelectUser(searchQuery)}
                  className="inline-flex items-center gap-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer shadow-2xs"
                  title="Chuyển sang Quản trị Chat Bot để xem và quản lý tài khoản này"
                >
                  <User className="h-3 w-3" />
                  <span>Quản trị User này</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-white border border-purple-200 px-2 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 cursor-pointer shadow-2xs"
              >
                <X className="h-3 w-3" />
                <span>Bỏ lọc</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 3. FILTERS & SEARCH TOOLBAR                                           */}
        {/* ===================================================================== */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md flex items-center gap-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nội dung tin nhắn, ID, người dùng (q)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8.5 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 font-bold transition cursor-pointer shadow-2xs"
            >
              Tìm
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter: Role */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-0.5">
                <Filter className="h-3 w-3" /> Vai trò:
              </span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="user">User (Người dùng)</option>
                <option value="assistant">Assistant (Trợ lý AI)</option>
                <option value="system">System (Hệ thống)</option>
              </select>
            </div>

            {/* Filter: Status (0 vs 1) */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-semibold">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                <option value="all">Tất cả (0 &amp; 1)</option>
                <option value="1">Hiển thị (status: 1)</option>
                <option value="0">Đã ẩn mềm (status: 0)</option>
              </select>
            </div>

            {/* Filter: Service ID */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-semibold">Dịch vụ AI:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                <option value="all">Tất cả dịch vụ</option>
                <option value="media_text_to_text">Hội thoại (text_to_text)</option>
                <option value="media_content_smart">Viết thông minh (smart)</option>
                <option value="media_spell_check">Sửa chính tả (spell_check)</option>
                <option value="media_script_writing">Kịch bản (script_writing)</option>
                <option value="media_image_to_text">OCR hình ảnh (image_to_text)</option>
                <option value="media_text_to_speech">Text-to-speech (TTS)</option>
                <option value="text_to_image">Tạo hình ảnh (text_to_image)</option>
              </select>
            </div>

            {/* Filter Room ID (when in system-wide mode) */}
            {viewMode === "all" && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 font-semibold">Phòng:</span>
                <input
                  type="number"
                  placeholder="Lọc room_id..."
                  value={filterRoomId}
                  onChange={(e) => setFilterRoomId(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-2xs placeholder-slate-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Select All on Page & Bulk Actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2.5 text-xs">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span>Chọn tất cả trang này ({displayMessages.length} tin)</span>
            </label>
            {isSomeSelected && (
              <span className="text-[11px] text-purple-700 font-bold bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                Đã chọn {selectedMessageIds.length}
              </span>
            )}
          </div>

          {isSomeSelected && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                disabled={isBulkUpdating}
                onClick={() => void handleBulkStatusChange(0)}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 text-[11px] transition cursor-pointer shadow-2xs disabled:opacity-50"
                title="Đặt status = 0 cho các tin nhắn đã chọn (PATCH /messages/bulk-status)"
              >
                <EyeOff className="h-3 w-3" />
                <span>Ẩn hàng loạt (status = 0)</span>
              </button>
              <button
                type="button"
                disabled={isBulkUpdating}
                onClick={() => void handleBulkStatusChange(1)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 text-[11px] transition cursor-pointer shadow-2xs disabled:opacity-50"
                title="Đặt status = 1 cho các tin nhắn đã chọn (PATCH /messages/bulk-status)"
              >
                <Eye className="h-3 w-3" />
                <span>Hiện hàng loạt (status = 1)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMessageIds([])}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-1 text-[11px] cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Bỏ chọn</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. MESSAGES LIST & TIMELINE                                            */}
      {/* ===================================================================== */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 shadow-2xs">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
            <p className="text-xs font-semibold text-slate-600">
              Đang tải dữ liệu tin nhắn từ Laravel backend...
            </p>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 shadow-2xs">
            <MessageSquare className="h-8 w-8 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              Không tìm thấy tin nhắn nào khớp với bộ lọc
            </p>
            <p className="text-[11px] text-slate-400">
              Hãy thử chọn trạng thái khác, xóa từ khóa tìm kiếm hoặc chọn phòng hội thoại khác.
            </p>
          </div>
        ) : (
          displayMessages.map((msg) => {
            const isUser = msg.role === "user";
            const serviceBadge = getServiceBadge(msg.service_id);
            const isSoftDeleted = msg.status === 0;
            const isProcessing = processingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`rounded-2xl border p-4 shadow-2xs transition hover:shadow-xs relative ${
                  isSoftDeleted
                    ? "border-amber-200 bg-amber-50/20 opacity-80"
                    : isUser
                    ? "border-blue-100 bg-gradient-to-r from-blue-50/25 to-white"
                    : "border-purple-100 bg-gradient-to-r from-purple-50/25 via-indigo-50/15 to-white"
                }`}
              >
                {/* Message Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Checkbox for Bulk Selection */}
                    <input
                      type="checkbox"
                      checked={selectedMessageIds.includes(msg.id)}
                      onChange={() => toggleSelectMessage(msg.id)}
                      className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0 mr-1"
                      title="Chọn tin nhắn để thao tác hàng loạt"
                    />

                    {/* Role Avatar Badge */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-lg text-white shadow-2xs ${
                        isUser
                          ? "bg-gradient-to-tr from-blue-600 to-indigo-600"
                          : "bg-gradient-to-tr from-purple-600 to-emerald-600"
                      }`}
                    >
                      {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>

                    <span className="font-bold text-slate-800">
                      {isUser ? "Người dùng (User)" : "Trợ lý AI (Assistant)"}
                    </span>

                    {/* Message ID */}
                    <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                      ID #{msg.id}
                    </span>

                    {/* Room Info */}
                    {(msg.room || msg.id_chat_rooms) && (
                      <button
                        type="button"
                        onClick={() => {
                          const rid = msg.room?.id || msg.id_chat_rooms!;
                          setSelectedRoomId(rid);
                          setInputRoomId(String(rid));
                          setViewMode("room");
                        }}
                        title="Xem toàn bộ lịch sử tin nhắn của phòng này"
                        className="rounded-md border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Layers className="h-3 w-3 text-indigo-500" />
                        <span>Phòng #{msg.room?.id || msg.id_chat_rooms}</span>
                        {msg.room?.title && (
                          <span className="text-slate-400 font-normal truncate max-w-[140px]">
                            : {msg.room.title}
                          </span>
                        )}
                      </button>
                    )}

                    {/* User ID */}
                    {msg.user_id && (
                      <button
                        type="button"
                        onClick={() => onSelectUser && onSelectUser(msg.user_id!)}
                        title={`Quản trị user ${msg.user_id} trong Quản trị Chat Bot`}
                        className="rounded-md border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 flex items-center gap-1 cursor-pointer transition"
                      >
                        <User className="h-2.5 w-2.5 text-slate-400" />
                        <span>{msg.user_id}</span>
                        <ExternalLink className="h-2 w-2 text-slate-400" />
                      </button>
                    )}

                    {/* Service Badge */}
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${serviceBadge.bg}`}
                    >
                      {serviceBadge.label}
                    </span>

                    {/* Model Badge */}
                    {msg.model && (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
                        {msg.model}
                      </span>
                    )}

                    {/* Status Badge (0 vs 1) */}
                    {msg.status === 1 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold">
                        <Eye className="h-2.5 w-2.5" />
                        Hiển thị (1)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 text-[10px] font-bold">
                        <EyeOff className="h-2.5 w-2.5" />
                        Đã ẩn mềm (0)
                      </span>
                    )}
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 mr-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{msg.created_at}</span>
                    </div>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 px-2 py-0.8 text-[10px] font-semibold text-slate-600 transition cursor-pointer shadow-2xs"
                      title="Sao chép nội dung tin nhắn"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>

                    {/* Action 1: Toggle Status (PATCH /api/chat/bot/messages/{messageId}) */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(msg)}
                      disabled={isProcessing}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.8 text-[10px] font-bold transition cursor-pointer shadow-2xs disabled:opacity-50 ${
                        msg.status === 1
                          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                      title="Cập nhật trạng thái hiển thị (PATCH API)"
                    >
                      {isProcessing ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : msg.status === 1 ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Ẩn tin</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Hiện lại</span>
                        </>
                      )}
                    </button>

                    {/* Action 2: Soft Delete (DELETE /api/chat/bot/messages/{messageId}) */}
                    {msg.status === 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-0.8 text-[10px] font-bold transition cursor-pointer shadow-2xs disabled:opacity-50"
                        title="Ẩn mềm tin nhắn (DELETE API: status = 0)"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Ẩn mềm</span>
                      </button>
                    )}

                    {/* Action 3: Inspect Message Detail & JSON (GET /api/chat/bot/messages/{messageId}) */}
                    <button
                      type="button"
                      onClick={() => handleViewDetail(msg)}
                      className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-0.8 text-[10px] font-bold transition cursor-pointer shadow-2xs"
                      title="Xem chi tiết & payload JSON (GET API)"
                    >
                      <Code2 className="h-3 w-3" />
                      <span>Chi tiết</span>
                    </button>
                  </div>
                </div>

                {/* Message Body Content */}
                <div
                  className={`pt-3 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-sans ${
                    isSoftDeleted ? "text-slate-500 italic line-through" : "text-slate-800"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Message Footer: Token Usage & Upstream Stats */}
                {(msg.usage || msg.upstream?.usage) && (
                  <div className="mt-3 flex items-center gap-3 border-t border-slate-100/90 pt-2 text-[10px] text-slate-400 flex-wrap">
                    <span className="font-semibold text-slate-500">Token Usage:</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-slate-600">
                      Input: {msg.usage?.prompt_tokens ?? msg.upstream?.usage?.input_tokens ?? 0}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-slate-600">
                      Output: {msg.usage?.completion_tokens ?? msg.upstream?.usage?.output_tokens ?? 0}
                    </span>
                    {(msg.upstream?.usage?.cached_tokens ?? 0) > 0 && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-slate-600">
                        Cached: {msg.upstream?.usage?.cached_tokens}
                      </span>
                    )}
                    <span className="rounded bg-purple-100 text-purple-800 px-1.5 py-0.2 font-mono font-bold">
                      Tổng: {msg.usage?.total_tokens ?? msg.upstream?.usage?.total_tokens ?? 0} tokens
                    </span>
                    {msg.upstream?.response_id && (
                      <span className="text-slate-400 ml-auto font-mono text-[9px] truncate max-w-[200px]">
                        Upstream: {msg.upstream.response_id}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. PAGINATION CONTROLS                                                  */}
      {/* ===================================================================== */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs text-xs">
          <div className="text-slate-500 text-[11px]">
            Hiển thị trang <strong className="text-slate-800">{pagination.page}</strong> /{" "}
            <strong className="text-slate-800">{pagination.last_page}</strong> • Tổng cộng{" "}
            <strong className="text-purple-700">{pagination.total}</strong> tin nhắn
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadMessages(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 transition cursor-pointer shadow-2xs disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Trước</span>
            </button>

            {/* Page indicator pills */}
            <span className="rounded-xl bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 font-bold">
              {pagination.page}
            </span>

            <button
              type="button"
              onClick={() => void loadMessages(pagination.page + 1)}
              disabled={pagination.page >= pagination.last_page || isLoading}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 transition cursor-pointer shadow-2xs disabled:opacity-40"
            >
              <span>Sau</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL: MESSAGE DETAIL & PAYLOAD INSPECTOR (GET /messages/{id})     */}
      {/* ===================================================================== */}
      {inspectMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Chi Tiết Tin Nhắn #{inspectMessage.id}</span>
                    <span className="font-mono text-[10px] text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.2 rounded font-normal">
                      GET /api/chat/bot/messages/{inspectMessage.id}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phòng #{inspectMessage.room?.id || inspectMessage.id_chat_rooms} • Vai trò:{" "}
                    <strong>{inspectMessage.role}</strong> • Trạng thái:{" "}
                    <strong>{inspectMessage.status === 1 ? "Hoạt động (1)" : "Đã ẩn mềm (0)"}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectMessage(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Metadata & JSON View */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Chủ phòng / User</span>
                  <strong className="text-slate-800 font-mono text-[11px]">
                    {inspectMessage.user_id || "guest"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Dịch vụ AI</span>
                  <strong className="text-slate-800 text-[11px]">
                    {inspectMessage.service_id || "media_text_to_text"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Model AI</span>
                  <strong className="text-slate-800 font-mono text-[11px]">
                    {inspectMessage.model || "gpt-5.6-luna"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Thời gian</span>
                  <strong className="text-slate-800 text-[11px]">
                    {inspectMessage.created_at}
                  </strong>
                </div>
              </div>

              {/* Message Content Full */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <span className="text-[11px] font-bold text-slate-700 block">Nội dung tin nhắn:</span>
                <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                  {inspectMessage.content}
                </p>
              </div>

              {/* Upstream / Token Usage breakdown */}
              {inspectMessage.upstream && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-1.5 text-[11px]">
                  <span className="font-bold text-indigo-900 block">Thông số Upstream Response:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Response ID:</span>
                      <span className="font-mono text-[10px] text-slate-800 truncate block">
                        {inspectMessage.upstream.response_id || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">HTTP Status:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {inspectMessage.upstream.http_status || 200} OK
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Cached Tokens:</span>
                      <span className="font-mono">
                        {inspectMessage.upstream.usage?.cached_tokens ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Tokens:</span>
                      <span className="font-mono font-bold text-purple-700">
                        {inspectMessage.upstream.usage?.total_tokens ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw JSON Payload */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700 block">JSON Payload gốc:</span>
                <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed shadow-inner max-h-60">
                  {JSON.stringify(inspectMessage, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    void navigator.clipboard.writeText(JSON.stringify(inspectMessage, null, 2));
                    showToast("Đã sao chép toàn bộ JSON payload!");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 font-bold text-slate-700 transition cursor-pointer shadow-2xs"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Sao chép JSON</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void handleToggleStatus(inspectMessage);
                    setInspectMessage(null);
                  }}
                  className={`rounded-xl px-3 py-1.5 font-bold transition cursor-pointer shadow-2xs ${
                    inspectMessage.status === 1
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  }`}
                >
                  {inspectMessage.status === 1 ? "Ẩn tin nhắn này (status: 0)" : "Hiện lại tin nhắn (status: 1)"}
                </button>

                <button
                  type="button"
                  onClick={() => setInspectMessage(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. FLOATING BULK STATUS ACTIONS TOOLBAR                                */}
      {/* ===================================================================== */}
      {selectedMessageIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 text-white px-5 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 text-xs">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700 font-bold">
            <span className="rounded-full bg-purple-500 text-white px-2 py-0.5 text-[10px]">
              {selectedMessageIds.length}
            </span>
            <span>tin nhắn đã chọn</span>
          </div>

          <button
            type="button"
            disabled={isBulkUpdating}
            onClick={() => void handleBulkStatusChange(0)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="Ẩn tất cả các tin nhắn đã chọn (status: 0)"
          >
            {isBulkUpdating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            <span>Ẩn đã chọn (status: 0)</span>
          </button>

          <button
            type="button"
            disabled={isBulkUpdating}
            onClick={() => void handleBulkStatusChange(1)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="Hiện lại tất cả các tin nhắn đã chọn (status: 1)"
          >
            {isBulkUpdating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            <span>Hiện đã chọn (status: 1)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMessageIds([])}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer ml-1"
            title="Bỏ chọn tất cả"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
