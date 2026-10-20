"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Server,
  Layers,
  ChevronRight,
  Sparkles,
  Bot,
  Briefcase,
  ExternalLink,
  MessageSquareText,
  Terminal,
  Home,
  ArrowRight,
  Workflow,
} from "lucide-react";

export type ServiceCategory = {
  route: string | null;
  status: string;
  description: string;
};

type ServiceCategoryPanelProps = {
  categories?: Array<[string, ServiceCategory]>;
  hidden?: boolean;
};

type EndpointItem = {
  category: "health" | "conversations" | "models" | "workspace" | "services";
  method: "GET" | "POST";
  path: string;
  operationId: string;
  summary: string;
  note: string;
  isNew?: boolean;
};

const openclawEndpoints: EndpointItem[] = [
  // Nhóm Health (1) - lên đầu
  {
    category: "health",
    method: "GET",
    path: "/v2/health",
    operationId: "getOpenClawHealth",
    summary: "Kiểm tra Health Gateway",
    note: "Kiểm tra trạng thái liveness/readiness của hạ tầng Node.js AI Gateway.",
  },

  // Nhóm Conversations (4)
  {
    category: "conversations",
    method: "POST",
    path: "/v1/conversations",
    operationId: "createConversation",
    summary: "Khởi tạo Conversation mới",
    note: "Tạo room chat mới, nhận conversation_id liên kết với Codex và Responses.",
  },
  {
    category: "conversations",
    method: "GET",
    path: "/v1/conversations/{id}",
    operationId: "getConversation",
    summary: "Xem chi tiết Conversation",
    note: "Tra cứu thông tin metadata, thời gian tạo và trạng thái của phòng hội thoại.",
  },
  {
    category: "conversations",
    method: "GET",
    path: "/v1/conversations/{id}/items",
    operationId: "listConversationItems",
    summary: "Lấy danh sách Items phòng chat",
    note: "Tải toàn bộ danh sách tin nhắn và lịch sử tương tác trong phòng hội thoại.",
  },
  {
    category: "conversations",
    method: "POST",
    path: "/v1/conversations/{id}/items",
    operationId: "createConversationItem",
    summary: "Thêm Item vào Conversation",
    note: "Ghi thêm tin nhắn người dùng hoặc trợ lý vào lịch sử phòng hội thoại.",
  },

  // Nhóm Models (2)
  {
    category: "models",
    method: "GET",
    path: "/v1/models",
    operationId: "listModels",
    summary: "Danh sách AI Models",
    note: "Xem danh sách model, chọn model cho request hoặc gửi /reset qua Responses để làm mới.",
  },
  {
    category: "models",
    method: "POST",
    path: "/v1/chat/completions",
    operationId: "createChatCompletion",
    summary: "Chat completions chuẩn OpenAI",
    note: "Tương thích chuẩn OpenAI chat completion kèm ngữ cảnh conversation_id.",
  },

  // Nhóm Workspace (4)
  {
    category: "workspace",
    method: "GET",
    path: "/v2/workspace/list",
    operationId: "listWorkspaces",
    summary: "Lấy danh sách Workspace",
    note: "Lấy workspace cha workspace-test từ SQL và danh mục skill do OpenClaw nhận diện.",
    isNew: true,
  },
  {
    category: "workspace",
    method: "GET",
    path: "/v2/workspace/user",
    operationId: "getUserWorkspaces",
    summary: "Lấy Workspace của User",
    note: "Tra cứu workspace hiện thời của người dùng dựa theo session hoặc user_id.",
  },
  {
    category: "workspace",
    method: "POST",
    path: "/v2/workspace/new",
    operationId: "createWorkspace",
    summary: "Tạo Workspace mới",
    note: "Khởi tạo workspace mới với tên, mã code và cấu hình agent.",
  },
  {
    category: "workspace",
    method: "POST",
    path: "/v2/workspace/select",
    operationId: "selectWorkspace",
    summary: "Chọn Workspace hoạt động",
    note: "Gửi lệnh /skill {work_space_code} qua luồng chat OpenClaw để kích hoạt cho user.",
  },

  // Nhóm Services (8) - service/list lên đầu, ghi đủ 7 dịch vụ AI không gộp
  {
    category: "services",
    method: "GET",
    path: "/v2/service/list",
    operationId: "listServices",
    summary: "Lấy danh mục Service",
    note: "Trả về danh mục 7 AI service để ứng dụng hiển thị và cho người dùng chọn.",
    isNew: true,
  },
  {
    category: "services",
    method: "POST",
    path: "/v1/images/generations",
    operationId: "Text To Image",
    summary: "Text To Image (Tạo ảnh)",
    note: "Tạo hình ảnh nghệ thuật/thiết kế thông qua image route của OpenClaw.",
  },
  {
    category: "services",
    method: "POST",
    path: "/v1/responses",
    operationId: "media_text_to_text",
    summary: "media_text_to_text (Hội thoại)",
    note: "Hội thoại thông thường thông qua endpoint Responses.",
  },
  {
    category: "services",
    method: "POST",
    path: "/v1/responses",
    operationId: "media_content_smart",
    summary: "media_content_smart (Viết thông minh)",
    note: "Viết nội dung thông minh theo title, description, length và tone.",
  },
  {
    category: "services",
    method: "POST",
    path: "/v1/responses",
    operationId: "media_spell_check",
    summary: "media_spell_check (Sửa chính tả)",
    note: "Sửa lỗi chính tả tiếng Việt thông qua endpoint Responses.",
  },
  {
    category: "services",
    method: "POST",
    path: "/v1/responses",
    operationId: "media_script_writing",
    summary: "media_script_writing (Viết kịch bản)",
    note: "Viết script kịch bản video/thuyết trình thông qua endpoint Responses.",
  },
  {
    category: "services",
    method: "POST",
    path: "/v1/responses",
    operationId: "media_image_to_text",
    summary: "media_image_to_text (OCR hình ảnh)",
    note: "OCR và phân tích hình ảnh (Base64) thông qua endpoint Responses.",
  },
  {
    category: "services",
    method: "POST",
    path: "/v1/responses",
    operationId: "media_text_to_speech",
    summary: "media_text_to_speech (Giọng đọc TTS)",
    note: "Tạo giọng đọc Text-to-speech với model F5_vie thông qua endpoint Responses.",
  },
];

export default function ServiceCategoryPanel({ hidden = false }: ServiceCategoryPanelProps) {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"home" | "all" | "health" | "conversations" | "models" | "workspace" | "services">("home");
  const pathname = usePathname() || "";
  const isHust = pathname.includes("/api/hust");

  const chatPath = isHust ? "/next/api/hust/chat/home" : "/next/api/mt/chat/home";
  const diagramPath = isHust ? "/next/api/hust/n8n/laravel" : "/next/api/mt/n8n/node_js";
  const devPath = isHust ? "/next/api/hust/dev/home" : "/next/api/mt/dev/home";

  const getDisplayPath = (relPath: string) => (isHust ? relPath : `/openclaw${relPath}`);

  useEffect(() => {
    if (!portalNode) return;
    const configureExamplesByTag = () => {
      document.querySelectorAll<HTMLElement>(".opblock-tag-section").forEach((section) => {
        section.querySelectorAll<HTMLTextAreaElement>("textarea.body-param__text").forEach((textarea) => {
          textarea.readOnly = false;
          textarea.disabled = false;
          textarea.style.pointerEvents = "auto";
          textarea.style.userSelect = "text";
        });
      });
    };
    configureExamplesByTag();
    let frame = 0;
    const scheduleConfigure = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        configureExamplesByTag();
      });
    };
    const observer = new MutationObserver(scheduleConfigure);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [portalNode]);

  useEffect(() => {
    const ensurePanelSlot = () => {
      const swaggerRoot = document.querySelector(".swagger-ui");
      if (!swaggerRoot) return;
      const information = swaggerRoot.querySelector<HTMLElement>(".information-container");
      const firstOperation = swaggerRoot.querySelector<HTMLElement>(".opblock-tag-section");
      const operationParent = firstOperation?.parentElement;
      if (!information && !firstOperation) return;
      let slot = swaggerRoot.querySelector<HTMLElement>("#openclaw-service-categories-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "openclaw-service-categories-slot";
      }
      if (firstOperation && operationParent) {
        if (slot.parentElement !== operationParent || slot.nextElementSibling !== firstOperation) {
          try {
            operationParent.insertBefore(slot, firstOperation);
          } catch {
            if (slot.parentElement !== swaggerRoot) swaggerRoot.appendChild(slot);
          }
        }
      } else if (information) {
        try {
          const informationParent = information.parentElement;
          if (informationParent) informationParent.insertBefore(slot, information.nextSibling);
        } catch {
          if (slot.parentElement !== swaggerRoot) swaggerRoot.appendChild(slot);
        }
      }
      setPortalNode(slot);
    };

    ensurePanelSlot();
    const observer = new MutationObserver(ensurePanelSlot);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortalNode(null);
      document.getElementById("openclaw-service-categories-slot")?.remove();
    };
  }, []);

  if (!portalNode) return null;

  const scrollToEndpoint = (targetId: string) => {
    const encoded = encodeURIComponent(targetId);
    const link = Array.from(document.querySelectorAll<HTMLAnchorElement>(".swagger-ui a[href]")).find(
      (anchor) => {
        const href = anchor.getAttribute("href") || "";
        return href.includes(targetId) || href.includes(encoded);
      },
    );
    const tagSection = Array.from(document.querySelectorAll<HTMLElement>(".swagger-ui .opblock-tag-section")).find(
      (sec) => {
        const id = sec.getAttribute("id") || "";
        const tag = sec.querySelector("[data-tag]")?.getAttribute("data-tag") || "";
        return id.includes(targetId) || tag === targetId || sec.textContent?.includes(targetId);
      },
    );
    const target =
      tagSection ||
      link?.closest<HTMLElement>(".opblock") ||
      document.getElementById(`operations-${targetId}`) ||
      document.querySelector(`[data-section-id="operations-${targetId}"]`) ||
      document.querySelector(`[id$="-${targetId}"]`) ||
      link;
    if (target instanceof HTMLElement) {
      const scroll = () => {
        const top = target.getBoundingClientRect().top + window.scrollY - 30;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      };
      scroll();
      window.setTimeout(scroll, 180);
    }
  };

  const displayedEndpoints =
    categoryFilter === "all" || categoryFilter === "home"
      ? openclawEndpoints
      : openclawEndpoints.filter((e) => e.category === categoryFilter);

  const healthCount = openclawEndpoints.filter((e) => e.category === "health").length;
  const convCount = openclawEndpoints.filter((e) => e.category === "conversations").length;
  const modelsCount = openclawEndpoints.filter((e) => e.category === "models").length;
  const wsCount = openclawEndpoints.filter((e) => e.category === "workspace").length;
  const servicesCount = openclawEndpoints.filter((e) => e.category === "services").length;

  const openclawCategories = [
    {
      id: "health" as const,
      name: "Health Gateway",
      count: healthCount,
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      borderHover: "hover:border-emerald-300 hover:bg-emerald-50/40",
      iconBg: "bg-emerald-100 text-emerald-700",
      icon: Server,
      description:
        "Kiểm tra trạng thái sẵn sàng (liveness/readiness) của hạ tầng Node.js AI Gateway và các kết nối dịch vụ phụ trợ.",
      highlights: ["GET /v2/health (200 OK)"],
    },
    {
      id: "conversations" as const,
      name: "Conversations & Codex",
      count: convCount,
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      borderHover: "hover:border-blue-300 hover:bg-blue-50/40",
      iconBg: "bg-blue-100 text-blue-700",
      icon: MessageSquareText,
      description:
        "Khởi tạo và quản lý phòng hội thoại (Conversations), lưu trữ metadata và quản lý danh sách tin nhắn (items) kết nối ngữ cảnh với OpenResponses.",
      highlights: ["POST /v1/conversations", "GET /v1/conversations/{id}", "GET /items", "POST /items"],
    },
    {
      id: "models" as const,
      name: "Mô hình AI (Models)",
      count: modelsCount,
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      borderHover: "hover:border-indigo-300 hover:bg-indigo-50/40",
      iconBg: "bg-indigo-100 text-indigo-700",
      icon: Terminal,
      description:
        "Xem danh sách mô hình AI hỗ trợ, gửi lệnh /reset và gọi chat completions theo định dạng chuẩn OpenAI.",
      highlights: ["GET /v1/models", "POST /v1/chat/completions"],
    },
    {
      id: "workspace" as const,
      name: "Quản trị Workspace & Kỹ năng",
      count: wsCount,
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
      borderHover: "hover:border-purple-300 hover:bg-purple-50/40",
      iconBg: "bg-purple-100 text-purple-700",
      icon: Briefcase,
      description:
        "Tra cứu danh mục workspace cha - con từ cơ sở dữ liệu, xem workspace của user, tạo workspace mới và kích hoạt kỹ năng (/skill) cho phiên làm việc.",
      highlights: ["GET /v2/workspace/list (Mới)", "GET /v2/workspace/user", "POST /v2/workspace/new", "POST /v2/workspace/select"],
    },
    {
      id: "services" as const,
      name: "Services (Dịch vụ AI)",
      count: servicesCount,
      badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
      borderHover: "hover:border-pink-300 hover:bg-pink-50/40",
      iconBg: "bg-pink-100 text-pink-700",
      icon: Sparkles,
      description:
        "Danh mục service để ứng dụng hiển thị và cho người dùng chọn (GET /service/list lên đầu) cùng đầy đủ 7 dịch vụ AI: Chat, Viết thông minh, Sửa chính tả, Viết kịch bản, OCR hình ảnh, TTS và Tạo ảnh Text to Image.",
      highlights: ["GET /v2/service/list (Mới)", "POST /v1/images/generations", "POST /v1/responses (6 Services)"],
    },
  ];

  return createPortal(
    <section className={`${hidden ? "hidden" : ""} w-full mb-3.5 rounded-2xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 shadow-xs">
              <Server className="h-3.5 w-3.5 text-indigo-600" />
              <span>Node.js OpenClaw API {isHust ? "(Hust)" : "(Media Tech)"}</span>
            </div>
            <a
              href={chatPath}
              className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition cursor-pointer"
            >
              <Bot className="h-3 w-3" />
              <span>Mở Chat Bot</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <a
              href={diagramPath}
              className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
            >
              <Workflow className="h-3 w-3" />
              <span>Mở sơ đồ cấu trúc</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            <a
              href={devPath}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
            >
              <Terminal className="h-3 w-3" />
              <span>Mở Dev Hub</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Tài liệu &amp; Danh mục API Node.js (OpenClaw)
          </h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            Bao gồm nhóm Gateway Health, nhóm Quản lý Conversations (phòng hội thoại và lịch sử item), nhóm Models, nhóm Quản trị Workspace, và nhóm API Services (7 AI Skills &amp; Sinh ảnh).
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/90 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCategoryFilter("home")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "home" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "all" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả ({openclawEndpoints.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("health")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "health" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Server className="h-3 w-3" />
            <span>Health ({healthCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("conversations")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "conversations" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquareText className="h-3 w-3" />
            <span>Conversations ({convCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("models")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "models" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Terminal className="h-3 w-3" />
            <span>Models ({modelsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("workspace")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "workspace" ? "bg-white text-purple-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3 w-3" />
            <span>Workspace ({wsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("services")}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
              categoryFilter === "services" ? "bg-white text-pink-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Services ({servicesCount})</span>
          </button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4">
          {categoryFilter === "home" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Home className="h-4 w-4 text-indigo-600" />
                  <span>Danh mục các thể loại API Node.js ({openclawCategories.length} nhóm)</span>
                </h3>
                <span className="text-[11px] text-slate-400">Chọn một thể loại để xem các endpoint chi tiết</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-1">
                {openclawCategories.map((cat) => {
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
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
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
                          className="hidden sm:inline-flex items-center gap-1 shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-indigo-300 group-hover:text-indigo-700 transition"
                        >
                          <span>Xem API</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
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
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span>Các endpoint ({displayedEndpoints.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("home")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
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
                    className="group relative rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white ${
                          endpoint.method === "GET"
                            ? "bg-blue-500"
                            : "bg-emerald-600"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="break-all text-[11px] font-semibold text-slate-800">
                        {getDisplayPath(endpoint.path)}
                      </code>
                      {endpoint.isNew && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 font-sans text-[10px] font-bold">
                          <Sparkles className="h-2.5 w-2.5" />
                          Mới
                        </span>
                      )}
                      <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-indigo-500 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-slate-700">{endpoint.summary}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{endpoint.note}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 sm:p-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Sparkles className="h-4 w-4 text-indigo-600" /> Endpoint Responses &amp; 7 AI Skills
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Endpoint <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-indigo-700">POST {getDisplayPath("/v1/responses")}</code> là cổng xử lý AI trung tâm tương thích OpenResponses:
            </p>
            <div className="mt-1.5 space-y-1 text-xs text-slate-600">
              <p>• <code className="font-mono font-semibold text-slate-700">media_text_to_text</code>: Hội thoại thông thường.</p>
              <p>• <code className="font-mono font-semibold text-slate-700">media_content_smart</code>: Soạn thảo theo title, desc, tone, length.</p>
              <p>• <code className="font-mono font-semibold text-slate-700">media_spell_check</code>: Sửa lỗi chính tả tiếng Việt.</p>
              <p>• <code className="font-mono font-semibold text-slate-700">media_script_writing</code>: Viết kịch bản video / thuyết trình.</p>
              <p>• <code className="font-mono font-semibold text-slate-700">media_image_to_text</code>: Nhận diện OCR &amp; phân tích ảnh.</p>
              <p>• <code className="font-mono font-semibold text-slate-700">media_text_to_speech</code>: Tạo giọng đọc AI model <code className="font-mono text-purple-700">F5_vie</code>.</p>
            </div>
          </div>

          <div className="border-t border-indigo-100 pt-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Layers className="h-4 w-4 text-emerald-600" /> Danh mục Service (GET service/list)
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Endpoint <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-emerald-700">GET {getDisplayPath("/v2/service/list")}</code> cung cấp danh mục 7 service AI khả dụng để ứng dụng hiển thị và cho người dùng chọn.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              API chỉ trả danh sách (<code className="font-mono">service_id</code>, <code className="font-mono">endpoint</code>, <code className="font-mono">operation_id</code>); không thực thi. Nếu gọi khác GET sẽ trả lỗi <code className="font-mono text-rose-600">405 method_not_allowed</code>.
            </p>
          </div>

          <div className="border-t border-indigo-100 pt-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <MessageSquareText className="h-4 w-4 text-blue-600" /> Quản lý Conversations &amp; Codex
            </h3>
            <ol className="mt-1.5 list-inside list-decimal space-y-1 text-xs leading-relaxed text-slate-600">
              <li>Tạo phòng qua <code className="font-mono">POST {getDisplayPath("/v1/conversations")}</code> và nhận <code className="font-mono text-blue-700">conversation_id</code>.</li>
              <li>Gửi tin nhắn kèm <code className="font-mono">conversation_id</code> qua <code className="font-mono">POST /responses</code> hoặc <code className="font-mono">POST /chat/completions</code> để giữ ngữ cảnh.</li>
              <li>Tra cứu lịch sử tin nhắn bằng <code className="font-mono">GET /items</code>.</li>
            </ol>
          </div>

          <div className="border-t border-indigo-100 pt-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Briefcase className="h-4 w-4 text-purple-600" /> Quản trị Workspace &amp; Kích hoạt Skill
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Lấy danh sách qua <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-purple-700">GET {getDisplayPath("/v2/workspace/list")}</code>.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Kích hoạt workspace cho user bằng <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px] text-purple-700">POST {getDisplayPath("/v2/workspace/select")}</code> với body <code className="font-mono">{"{\"user_id\": 502, \"work_space_code\": \"...\"}"}</code>.
            </p>
          </div>
        </aside>
      </div>
    </section>,
    portalNode,
  );
}
