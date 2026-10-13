"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Server, Layers, ChevronRight, KeyRound, MessageSquareText } from "lucide-react";

const endpoints = [
  { method: "POST", path: "/api/chat/bot/rooms", operationId: "createLaravelChatBotRoom", summary: "Tạo hoặc liên kết phòng", note: "Khởi tạo session lần đầu hoặc tạo/liên kết phòng cho session hiện có." },
  { method: "POST", path: "/api/chat/bot/rooms/list", operationId: "listLaravelChatBotRooms", summary: "Lấy danh sách phòng", note: "Dùng để hiển thị các phòng chat của session." },
  { method: "POST", path: "/api/chat/bot/rooms/{roomId}/messages/list", operationId: "listLaravelChatBotRoomMessages", summary: "Lấy lịch sử tin nhắn", note: "Lấy nội dung trong một phòng cụ thể." },
  { method: "POST", path: "/api/chat/bot/rooms/{roomId}/messages", operationId: "saveLaravelChatBotTurn", summary: "Lưu lượt chat", note: "Lưu tin nhắn user và phản hồi assistant vào phòng." },
  { method: "PATCH", path: "/api/chat/bot/rooms/{roomId}", operationId: "updateLaravelChatBotRoom", summary: "Cập nhật phòng", note: "Cập nhật thông tin hoặc trạng thái phòng chat." },
  { method: "GET", path: "/api/chat/bot/rooms", operationId: "getLaravelChatBotRooms", summary: "Lấy danh sách phòng (cũ)", note: "Route GET tương thích ngược; ưu tiên POST /rooms/list." },
  { method: "GET", path: "/api/chat/bot/rooms/{roomId}/messages", operationId: "getLaravelChatBotRoomMessages", summary: "Lấy lịch sử (cũ)", note: "Route GET tương thích ngược; ưu tiên POST /messages/list." },
];

export default function LaravelServicePanel() {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

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

  return createPortal(
    <section className="w-full mb-3.5 rounded-2xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-2.5 py-0.5 text-xs font-semibold text-blue-700 shadow-xs">
            <Server className="h-3.5 w-3.5 text-blue-600" />
            <span>Laravel Chat Bot</span>
          </div>
          <h2 className="mt-1.5 text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            API phòng chat Laravel
          </h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            Nhóm này chỉ quản lý session, phòng chat và lịch sử tin nhắn trên Laravel. Nội dung chat được gửi riêng tới Node.js OpenClaw Gateway qua proxy; các API bên dưới không tạo phản hồi AI.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-xs">
          <Layers className="h-3.5 w-3.5 text-slate-500" />
          <span>5 API chính · 2 route cũ</span>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Các endpoint và chức năng</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.operationId}
                type="button"
                onClick={() => scrollToEndpoint(endpoint.operationId)}
                className="group rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white ${endpoint.method === "GET" ? "bg-blue-500" : endpoint.method === "PATCH" ? "bg-amber-500" : "bg-emerald-600"}`}>
                    {endpoint.method}
                  </span>
                  <code className="break-all text-[11px] font-semibold text-slate-800">{endpoint.path}</code>
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
              <KeyRound className="h-4 w-4 text-blue-600" /> Session và xác thực
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Gửi <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-violet-700">chat_bot_session</code> trong JSON body của các request cần xác thực. Không thay bằng Bearer token, cookie hoặc <code className="font-mono">user_id</code>.
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
          <p className="rounded-lg border border-blue-100 bg-white/80 p-2 text-[11px] leading-relaxed text-slate-500">
            Hai route GET được đánh dấu “cũ” để tương thích ngược; với tích hợp mới, ưu tiên các route POST tương ứng.
          </p>
        </aside>
      </div>
    </section>,
    portalNode,
  );
}
