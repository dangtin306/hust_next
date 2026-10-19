"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Server,
  Layers,
  ChevronRight,
  KeyRound,
  MessageSquareText,
  MessageSquare,
  Briefcase,
  ExternalLink,
  Sparkles,
  Edit3,
  FileCode2,
  Users,
  Home,
  ArrowRight,
} from "lucide-react";

type EndpointItem = {
  category: "workspace" | "manage" | "messages" | "chat";
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  operationId: string;
  summary: string;
  note: string;
  isNew?: boolean;
};

const endpoints: EndpointItem[] = [
  // Nhóm Workspace API
  {
    category: "workspace",
    method: "POST",
    path: "/api/workspaces/main/data",
    operationId: "updateLaravelMainWorkspace",
    summary: "Sửa một workspace (POST main/data)",
    note: "Sửa tên, mô tả, trạng thái (active/archived), mã code, slug, parent_workspace_code theo ID.",
    isNew: true,
  },
  {
    category: "workspace",
    method: "POST",
    path: "/api/workspaces/content/markdown/edit",
    operationId: "updateWorkspaceMarkdownContentEdit",
    summary: "Ghi nội dung mới vào file .md (POST edit)",
    note: "Sửa nội dung file .md theo id và path (query string), gửi JSON body { content }.",
    isNew: true,
  },
  {
    category: "workspace",
    method: "GET",
    path: "/api/workspaces/content/markdown/get",
    operationId: "getWorkspaceMarkdownContentGet",
    summary: "Đọc nội dung file Markdown (GET get)",
    note: "Đọc nội dung file .md theo id workspace và path (full_path tương đối từ root).",
    isNew: true,
  },
  {
    category: "workspace",
    method: "GET",
    path: "/api/workspaces/content/markdown/full",
    operationId: "getWorkspaceMarkdownContentFull",
    summary: "Lấy toàn bộ Markdown workspace (GET full)",
    note: "Frontend lấy cây thư mục và nội dung tất cả file .md trong workspace con chỉ bằng 1 request theo id.",
    isNew: true,
  },
  {
    category: "workspace",
    method: "GET",
    path: "/api/workspaces/main/markdown",
    operationId: "getWorkspaceMainMarkdown",
    summary: "Xem cấu trúc Markdown workspace",
    note: "Trả về cây thư mục và danh sách file .md của workspace con theo id.",
    isNew: true,
  },
  {
    category: "workspace",
    method: "GET",
    path: "/api/workspaces/main/data",
    operationId: "listLaravelMainWorkspaces",
    summary: "Lấy cây phân cấp workspace",
    note: "Trả về toàn bộ danh mục workspace cha - con dạng lồng nhau kèm sessions và meta.",
  },
  {
    category: "workspace",
    method: "GET",
    path: "/api/workspaces/user/data",
    operationId: "listUserWorkspaces",
    summary: "Lấy workspace của user",
    note: "Lấy các workspace có session active của user theo user_id.",
  },
  {
    category: "workspace",
    method: "GET",
    path: "/api/workspaces/routing/update",
    operationId: "getWorkspaceRoutingUpdate",
    summary: "Đồng bộ routing workspace",
    note: "Đồng bộ bảng routing định tuyến OpenClaw và hệ thống.",
  },

  // Nhóm Chat Bot Manage API (11 endpoints)
  {
    category: "manage",
    method: "GET",
    path: "/api/chat/bot/manage/overview",
    operationId: "getChatBotManageOverview",
    summary: "Xem thống kê tổng quan",
    note: "Thống kê tổng user (active/disabled/mixed), sessions, rooms (total/active/archived), và messages (total/active/hidden).",
    isNew: true,
  },
  {
    category: "manage",
    method: "GET",
    path: "/api/chat/bot/manage/users",
    operationId: "listChatBotManageUsers",
    summary: "Tìm kiếm & phân trang người dùng",
    note: "Tìm theo ID/số (q), lọc status (active/disabled/mixed), phân trang per_page và page.",
    isNew: true,
  },
  {
    category: "manage",
    method: "GET",
    path: "/api/chat/bot/manage/users/{userId}",
    operationId: "getChatBotManageUserDetail",
    summary: "Chi tiết người dùng & sessions",
    note: "Xem chi tiết user (user_123 hoặc guest_456) kèm danh sách các session trực thuộc.",
    isNew: true,
  },
  {
    category: "manage",
    method: "PATCH",
    path: "/api/chat/bot/manage/users/{userId}",
    operationId: "updateChatBotManageUserStatus",
    summary: "Khóa hoặc mở người dùng",
    note: "Cập nhật status: 0 (khóa tất cả session) hoặc 1 (mở tất cả session).",
    isNew: true,
  },
  {
    category: "manage",
    method: "GET",
    path: "/api/chat/bot/manage/users/{userId}/rooms",
    operationId: "listChatBotManageUserRooms",
    summary: "Danh sách phòng chat của người dùng",
    note: "Lấy danh sách metadata phòng chat của user kèm phân trang per_page và page.",
    isNew: true,
  },
  {
    category: "manage",
    method: "GET",
    path: "/api/chat/bot/manage/users/{userId}/messages",
    operationId: "listChatBotManageUserMessages",
    summary: "Xem tin nhắn của user trên tất cả phòng",
    note: "Xem tin nhắn của user trên mọi phòng chat. Query: q, room_id, role, status, created_from, created_to, page, per_page.",
    isNew: true,
  },
  {
    category: "manage",
    method: "GET",
    path: "/api/chat/bot/manage/rooms",
    operationId: "listChatBotManageRooms",
    summary: "Tìm kiếm & lọc phòng toàn hệ thống",
    note: "Tìm theo tiêu đề phòng; lọc theo user (user_123/guest_456), status, ngày tạo và phân trang.",
    isNew: true,
  },
  {
    category: "manage",
    method: "GET",
    path: "/api/chat/bot/manage/rooms/{roomId}",
    operationId: "getChatBotManageRoomDetail",
    summary: "Xem chi tiết phòng",
    note: "Xem chi tiết phòng chat và số lượng tin nhắn theo trạng thái (total, active, hidden).",
    isNew: true,
  },
  {
    category: "manage",
    method: "PATCH",
    path: "/api/chat/bot/manage/rooms/{roomId}",
    operationId: "updateChatBotManageRoom",
    summary: "Đổi tiêu đề hoặc trạng thái phòng",
    note: "Đổi tiêu đề hoặc trạng thái (status: 0 lưu trữ, 1 hoạt động). Gửi ít nhất một trường.",
    isNew: true,
  },
  {
    category: "manage",
    method: "DELETE",
    path: "/api/chat/bot/manage/rooms/{roomId}",
    operationId: "archiveChatBotManageRoom",
    summary: "Lưu trữ mềm phòng (status = 0)",
    note: "Lưu trữ mềm phòng bằng cách đặt status: 0. Phòng và lịch sử tin nhắn không bị xóa vật lý.",
    isNew: true,
  },
  {
    category: "manage",
    method: "GET",
    path: "/api/chat/bot/manage/rooms/{roomId}/messages",
    operationId: "listChatBotManageRoomMessages",
    summary: "Xem lịch sử tin nhắn phòng quản lý",
    note: "Xem lịch sử tin nhắn phòng trong giao diện quản lý. Query: before_id, per_page (tối đa 100), status (0 hoặc 1).",
    isNew: true,
  },

  // Nhóm Quản trị Messages API (Mess_Controller & Mess_History - 6 endpoints)
  {
    category: "messages",
    method: "GET",
    path: "/api/chat/bot/messages",
    operationId: "listLaravelChatBotMessages",
    summary: "Lọc và phân trang danh sách tin nhắn",
    note: "Tìm kiếm, lọc theo user_id, room_id, role, status, khoảng ngày và phân trang. Controller: Mess_Controller.php.",
    isNew: true,
  },
  {
    category: "messages",
    method: "GET",
    path: "/api/chat/bot/messages/rooms/{roomId}",
    operationId: "listLaravelChatBotMessagesByRoom",
    summary: "Lịch sử tin nhắn trong phòng",
    note: "Xem lịch sử tin nhắn trong phòng theo thứ tự thời gian. Query: before_id, per_page, status.",
    isNew: true,
  },
  {
    category: "messages",
    method: "PATCH",
    path: "/api/chat/bot/messages/bulk-status",
    operationId: "bulkUpdateLaravelChatBotMessageStatus",
    summary: "Cập nhật trạng thái hàng loạt (bulk-status)",
    note: "Cập nhật trạng thái (0 hoặc 1) cho từ 1 đến 100 tin nhắn cùng lúc. Trả 404 nếu có ID không tồn tại.",
    isNew: true,
  },
  {
    category: "messages",
    method: "GET",
    path: "/api/chat/bot/messages/{messageId}",
    operationId: "getLaravelChatBotMessage",
    summary: "Xem chi tiết một tin nhắn",
    note: "Tra cứu thông tin chi tiết, token usage và model của tin nhắn theo ID.",
    isNew: true,
  },
  {
    category: "messages",
    method: "PATCH",
    path: "/api/chat/bot/messages/{messageId}",
    operationId: "updateLaravelChatBotMessageStatus",
    summary: "Cập nhật trạng thái (0 hoặc 1)",
    note: "Ẩn (status: 0) hoặc khôi phục (status: 1) tin nhắn. Controller: Mess_Controller.php.",
    isNew: true,
  },
  {
    category: "messages",
    method: "DELETE",
    path: "/api/chat/bot/messages/{messageId}",
    operationId: "deleteLaravelChatBotMessage",
    summary: "Ẩn mềm tin nhắn (status = 0)",
    note: "Ẩn mềm tin nhắn bằng cách đặt trạng thái status = 0, không xóa vật lý.",
    isNew: true,
  },

  // Nhóm Chat Bot Rooms API
  {
    category: "chat",
    method: "POST",
    path: "/api/chat/bot/rooms",
    operationId: "createLaravelChatBotRoom",
    summary: "Tạo hoặc liên kết phòng",
    note: "Khởi tạo session lần đầu hoặc tạo/liên kết phòng cho session hiện có.",
  },
  {
    category: "chat",
    method: "POST",
    path: "/api/chat/bot/rooms/list",
    operationId: "listLaravelChatBotRooms",
    summary: "Lấy danh sách phòng",
    note: "Dùng để hiển thị các phòng chat của session.",
  },
  {
    category: "chat",
    method: "POST",
    path: "/api/chat/bot/rooms/{roomId}/messages/list",
    operationId: "listLaravelChatBotRoomMessages",
    summary: "Lấy lịch sử tin nhắn",
    note: "Lấy nội dung trong một phòng cụ thể.",
  },
  {
    category: "chat",
    method: "POST",
    path: "/api/chat/bot/rooms/{roomId}/messages",
    operationId: "saveLaravelChatBotTurn",
    summary: "Lưu lượt chat",
    note: "Lưu tin nhắn user và phản hồi assistant vào phòng.",
  },
  {
    category: "chat",
    method: "PATCH",
    path: "/api/chat/bot/rooms/{roomId}",
    operationId: "updateLaravelChatBotRoom",
    summary: "Cập nhật phòng",
    note: "Cập nhật thông tin hoặc trạng thái phòng chat.",
  },
  {
    category: "chat",
    method: "GET",
    path: "/api/chat/bot/rooms",
    operationId: "getLaravelChatBotRooms",
    summary: "Lấy danh sách phòng (cũ)",
    note: "Route GET tương thích ngược; ưu tiên POST /rooms/list.",
  },
  {
    category: "chat",
    method: "GET",
    path: "/api/chat/bot/rooms/{roomId}/messages",
    operationId: "getLaravelChatBotRoomMessages",
    summary: "Lấy lịch sử (cũ)",
    note: "Route GET tương thích ngược; ưu tiên POST /messages/list.",
  },
];

export default function LaravelServicePanel() {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"home" | "all" | "workspace" | "manage" | "messages" | "chat">("home");
  const pathname = usePathname() || "";
  const isHust = pathname.includes("/api/hust");
  const workspacePath = isHust ? "/next/api/hust/workspace/home" : "/next/api/mt/workspace/home";

  useEffect(() => {
    const ensurePanelSlot = () => {
      const swaggerRoot = document.querySelector(".swagger-ui");
      const firstOperation = document.querySelector(".opblock-tag-section");
      const parent = firstOperation?.parentElement;
      if (!swaggerRoot || !firstOperation || !parent) return;
      let slot = swaggerRoot.querySelector<HTMLElement>("#laravel-service-contracts-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "laravel-service-contracts-slot";
        parent.insertBefore(slot, firstOperation);
      }
      setPortalNode(slot);
    };

    ensurePanelSlot();
    const observer = new MutationObserver(ensurePanelSlot);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortalNode(null);
      document.getElementById("laravel-service-contracts-slot")?.remove();
    };
  }, []);

  if (!portalNode) return null;

  const scrollToEndpoint = (operationId: string) => {
    const link = Array.from(document.querySelectorAll<HTMLAnchorElement>(".swagger-ui a[href]")).find(
      (anchor) => anchor.getAttribute("href")?.includes(operationId),
    );
    const target = link?.closest<HTMLElement>(".opblock") || link;
    if (target instanceof HTMLElement) {
      const scroll = () => {
        const top = target.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      };
      scroll();
      window.setTimeout(scroll, 180);
    }
  };

  const displayedEndpoints =
    categoryFilter === "all" || categoryFilter === "home"
      ? endpoints
      : endpoints.filter((e) => e.category === categoryFilter);

  const workspaceCount = endpoints.filter((e) => e.category === "workspace").length;
  const manageCount = endpoints.filter((e) => e.category === "manage").length;
  const messagesCount = endpoints.filter((e) => e.category === "messages").length;
  const chatCount = endpoints.filter((e) => e.category === "chat").length;

  const laravelCategories = [
    {
      id: "workspace" as const,
      name: "Workspace & Markdown",
      count: workspaceCount,
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
      borderHover: "hover:border-purple-300 hover:bg-purple-50/40",
      iconBg: "bg-purple-100 text-purple-700",
      icon: Briefcase,
      description:
        "Quản lý cây danh mục workspace cha - con, sửa thông tin workspace theo ID, đọc/ghi và đồng bộ toàn bộ tài liệu Markdown (.md).",
      highlights: ["POST /main/data (sửa ID)", "GET /markdown/full", "POST /markdown/edit", "GET /user/data"],
    },
    {
      id: "manage" as const,
      name: "Quản trị Chat Bot (Manage API)",
      count: manageCount,
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      borderHover: "hover:border-emerald-300 hover:bg-emerald-50/40",
      iconBg: "bg-emerald-100 text-emerald-700",
      icon: Users,
      description:
        "Quản lý user, session, phòng chat và lịch sử tin nhắn. Xem tổng quan, tìm kiếm phân trang user, chi tiết user và session, xem phòng của user, xem tin nhắn user trên mọi phòng, tìm kiếm lọc phòng chat toàn hệ thống, xem chi tiết phòng, xem lịch sử tin nhắn phòng, đổi tiêu đề/trạng thái phòng và lưu trữ mềm phòng.",
      highlights: ["GET /manage/overview", "GET /manage/users", "GET /manage/rooms", "GET /manage/rooms/{id}/messages", "PATCH /rooms/{id}"],
    },
    {
      id: "messages" as const,
      name: "Quản trị Tin Nhắn (Messages API)",
      count: messagesCount,
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
      borderHover: "hover:border-purple-300 hover:bg-purple-50/40",
      iconBg: "bg-purple-100 text-purple-700",
      icon: MessageSquare,
      description:
        "Tìm kiếm, xem và quản lý trạng thái tin nhắn (status = 1 hiển thị, status = 0 ẩn). Lọc theo user_id, room_id, role, status, khoảng ngày; xem lịch sử trong phòng; xem chi tiết tin nhắn; cập nhật trạng thái (0/1); ẩn mềm tin nhắn và cập nhật trạng thái hàng loạt (bulk-status). Xử lý bởi Mess_Controller.php và Mess_History.php.",
      highlights: ["GET /messages", "GET /messages/rooms/{id}", "PATCH /messages/bulk-status", "PATCH /messages/{id}", "DELETE /messages/{id}"],
    },
    {
      id: "chat" as const,
      name: "Phòng Chat & Lịch Sử (Rooms API)",
      count: chatCount,
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      borderHover: "hover:border-blue-300 hover:bg-blue-50/40",
      iconBg: "bg-blue-100 text-blue-700",
      icon: MessageSquareText,
      description:
        "Tạo và liên kết phòng chat cho session, lấy danh sách phòng, lấy lịch sử tin nhắn và lưu trữ hội thoại giữa người dùng và trợ lý ảo.",
      highlights: ["POST /rooms", "POST /rooms/list", "POST /messages/list", "POST /messages"],
    },
  ];

  return createPortal(
    <section className="w-full mb-3.5 rounded-2xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-2.5 py-0.5 text-xs font-semibold text-blue-700 shadow-xs">
              <Server className="h-3.5 w-3.5 text-blue-600" />
              <span>Laravel REST API {isHust ? "(Hust)" : "(Media Tech)"}</span>
            </div>
            <a
              href={workspacePath}
              className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition cursor-pointer"
            >
              <Briefcase className="h-3 w-3" />
              <span>Mở Quản trị Workspace</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Tài liệu &amp; Danh mục API Laravel
          </h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            Bao gồm nhóm API Quản trị Không gian làm việc (Workspace CRUD, sửa workspace theo ID), nhóm Quản trị Người dùng Chat Bot (Manage API), nhóm Quản trị Tin Nhắn (Messages API), và nhóm API Phòng chat Laravel.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/90 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCategoryFilter("home")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "home" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "all" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả ({endpoints.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("workspace")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "workspace" ? "bg-white text-purple-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3 w-3" />
            <span>Workspace ({workspaceCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("manage")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "manage" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-3 w-3" />
            <span>Manage ({manageCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("messages")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "messages" ? "bg-white text-purple-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3 w-3" />
            <span>Messages ({messagesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("chat")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "chat" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquareText className="h-3 w-3" />
            <span>Chat Bot ({chatCount})</span>
          </button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4">
          {categoryFilter === "home" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  <span>Danh mục các thể loại API Laravel ({laravelCategories.length} nhóm)</span>
                </h3>
                <span className="text-[11px] text-slate-400">Chọn một thể loại để xem các endpoint chi tiết</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-1">
                {laravelCategories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`group relative rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 text-left transition-all ${cat.borderHover} hover:shadow-2xs cursor-pointer`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cat.iconBg} mt-0.5`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {cat.name}
                              </h4>
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cat.badgeBg}`}>
                                {cat.count} endpoints
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                              {cat.description}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryFilter(cat.id);
                          }}
                          className="hidden sm:inline-flex items-center gap-1 shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-blue-300 group-hover:text-blue-700 transition"
                        >
                          <span>Xem API</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-200/60">
                        <span className="text-[11px] font-semibold text-slate-400 mr-1">Endpoints tiêu biểu:</span>
                        {cat.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700 border border-slate-200/80 shadow-2xs"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>Các endpoint ({displayedEndpoints.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("home")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    <Home className="h-3 w-3" />
                    <span>Về Home</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <span className="text-[11px] text-slate-400">Bấm endpoint để cuộn tới Swagger</span>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {displayedEndpoints.map((endpoint) => (
                  <button
                    key={endpoint.operationId}
                    type="button"
                    onClick={() => scrollToEndpoint(endpoint.operationId)}
                    className="group relative rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white ${
                          endpoint.method === "GET"
                            ? "bg-blue-500"
                            : endpoint.method === "PATCH"
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="break-all text-[11px] font-semibold text-slate-800">
                        {endpoint.path}
                      </code>
                      {endpoint.isNew && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 font-sans text-[10px] font-bold">
                          <Sparkles className="h-2.5 w-2.5" />
                          Mới
                        </span>
                      )}
                      <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-blue-500 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-slate-700">{endpoint.summary}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{endpoint.note}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 sm:p-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Edit3 className="h-4 w-4 text-purple-600" /> API Edit Workspace
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Endpoint <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-purple-700">POST /api/workspaces/main/edit</code> nhận trường <code className="font-mono text-purple-800 font-bold">id</code> và các trường cần sửa: <code className="font-mono">workspace_name</code>, <code className="font-mono">agent_code</code>, <code className="font-mono">work_space_code</code>, <code className="font-mono">parent_workspace_code</code>, <code className="font-mono">slug</code>, <code className="font-mono">status</code>, <code className="font-mono">description</code>.
            </p>
          </div>

          <div className="border-t border-blue-100 pt-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FileCode2 className="h-4 w-4 text-emerald-600" /> Bộ API Xem, Lấy Toàn Bộ và Sửa Markdown Workspace
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              1. <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-emerald-700">GET /api/workspaces/content/markdown/full?id={"{id}"}</code>: Lấy cây thư mục kèm toàn bộ nội dung của tất cả file <code className="font-mono font-bold text-slate-800">.md</code> trong workspace con chỉ bằng 1 request duy nhất (trả về trường <code className="font-mono">content</code> ở từng node file, không cần gọi lẻ từng file).
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              2. <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-emerald-700">GET /api/workspaces/main/markdown?id={"{id}"}</code>: Trả về cây thư mục (<code className="font-mono font-semibold">tree</code> có <code className="font-mono">full_path</code>) và số lượng (<code className="font-mono font-semibold">markdown_count</code>) file <code className="font-mono font-bold text-slate-800">.md</code> của workspace con (chỉ metadata, không có content).
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              3. <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-emerald-700">GET /api/workspaces/content/markdown/get?id={"{id}"}&path={"{full_path}"}</code>: Đọc toàn bộ nội dung của một file <code className="font-mono font-bold text-slate-800">.md</code> lẻ với đường dẫn tương đối từ workspace root (<code className="font-mono">path</code>).
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              4. <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-emerald-700">POST /api/workspaces/content/markdown/edit?id={"{id}"}&path={"{full_path}"}</code>: Ghi nội dung mới vào file <code className="font-mono font-bold text-slate-800">.md</code> đã có qua JSON body <code className="font-mono">{"{\"content\": \"...\"}"}</code>. Trả về <code className="font-mono font-semibold">bytes_written</code>.
            </p>
          </div>

          <div className="border-t border-blue-100 pt-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Users className="h-4 w-4 text-emerald-600" /> Quản lý Người dùng Chat Bot (Manage API)
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Gồm các API thống kê tổng quan, tìm kiếm và phân trang, xem chi tiết user, xem phòng chat, khóa hoặc mở user. Các API này <span className="font-semibold text-emerald-700">không yêu cầu Bearer token</span>.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Quy ước <code className="font-mono font-semibold">userId</code>: <code className="font-mono text-emerald-800 font-bold">user_123</code> (người dùng liên kết) hoặc <code className="font-mono text-emerald-800 font-bold">guest_456</code> (session guest).
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Khóa / Mở user (<code className="font-mono">PATCH /api/chat/bot/manage/users/{"{userId}"}</code>): gửi body <code className="font-mono">{"{\"status\": 0}"}</code> để khóa tất cả session, hoặc <code className="font-mono">{"{\"status\": 1}"}</code> để mở lại.
            </p>
          </div>

          <div className="border-t border-blue-100 pt-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <KeyRound className="h-4 w-4 text-blue-600" /> Xác thực Chat Bot
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Gửi <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-violet-700">chat_bot_session</code> trong JSON body của các request chat cần xác thực.
            </p>
          </div>

          <div className="border-t border-blue-100 pt-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <MessageSquareText className="h-4 w-4 text-blue-600" /> Luồng tích hợp
            </h3>
            <ol className="mt-1.5 list-inside list-decimal space-y-1 text-xs leading-relaxed text-slate-600">
              <li>Gọi <code className="font-mono">POST /rooms</code> để tạo session/phòng và nhận session token.</li>
              <li>Dùng token đó để lấy danh sách phòng, tải lịch sử và lưu lượt chat.</li>
              <li>Gọi Node Gateway riêng để sinh câu trả lời AI; sau đó dùng API Laravel lưu lượt chat.</li>
            </ol>
          </div>
        </aside>
      </div>
    </section>,
    portalNode,
  );
}
