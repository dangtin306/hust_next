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
  Briefcase,
  ExternalLink,
  Sparkles,
  Edit3,
  FileCode2,
} from "lucide-react";

type EndpointItem = {
  category: "workspace" | "chat";
  method: "GET" | "POST" | "PATCH";
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
  const [categoryFilter, setCategoryFilter] = useState<"all" | "workspace" | "chat">("all");
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
    categoryFilter === "all" ? endpoints : endpoints.filter((e) => e.category === categoryFilter);

  const workspaceCount = endpoints.filter((e) => e.category === "workspace").length;
  const chatCount = endpoints.filter((e) => e.category === "chat").length;

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
            Tài liệu & Danh mục API Laravel
          </h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            Bao gồm nhóm API Quản trị Không gian làm việc (Workspace CRUD, sửa workspace theo ID) và nhóm API Phòng chat Laravel (quản lý session, phòng và lịch sử chat).
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/90 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "all" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả ({endpoints.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("workspace")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "workspace" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3 w-3" />
            <span>Workspace ({workspaceCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("chat")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "chat" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquareText className="h-3 w-3" />
            <span>Chat Bot ({chatCount})</span>
          </button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Các endpoint ({displayedEndpoints.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Bấm endpoint để cuộn tới Swagger</span>
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
              <FileCode2 className="h-4 w-4 text-emerald-600" /> Bộ 3 API Xem và Sửa Markdown Workspace
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              1. <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-emerald-700">GET /api/workspaces/main/markdown?id={"{id}"}</code>: Trả về cây thư mục (<code className="font-mono font-semibold">tree</code> có <code className="font-mono">full_path</code>) và số lượng (<code className="font-mono font-semibold">markdown_count</code>) file <code className="font-mono font-bold text-slate-800">.md</code> của workspace con.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              2. <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-emerald-700">GET /api/workspaces/content/markdown/get?id={"{id}"}&path={"{full_path}"}</code>: Đọc toàn bộ nội dung file <code className="font-mono font-bold text-slate-800">.md</code> với đường dẫn tương đối từ workspace root (<code className="font-mono">path</code>).
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              3. <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-emerald-700">POST /api/workspaces/content/markdown/edit?id={"{id}"}&path={"{full_path}"}</code>: Ghi nội dung mới vào file <code className="font-mono font-bold text-slate-800">.md</code> đã có qua JSON body <code className="font-mono">{"{\"content\": \"...\"}"}</code>. Trả về <code className="font-mono font-semibold">bytes_written</code>.
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
