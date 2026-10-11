"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Sparkles, Layers, Terminal, ChevronRight } from "lucide-react";

export type ServiceCategory = {
  route: string | null;
  status: string;
  description: string;
};

type ServiceCategoryPanelProps = {
  categories: Array<[string, ServiceCategory]>;
  hidden?: boolean;
};

const operationByService: Record<string, string> = {
  media_responses: "createResponse",
  media_conversations: "createConversation",
  media_model_switch: "listModels",
  workspace: "listWorkspaces",
  media_text_to_image: "generateImage",
  media_text_to_text: "createResponse",
  media_content_smart: "createResponse",
  media_spell_check: "createResponse",
  media_script_writing: "createResponse",
  media_image_to_text: "createResponse",
  media_text_to_speech: "createResponse",
};

const formatServiceName = (value: string) =>
  value === "media_model_switch"
    ? "Model Selection"
    : value
      .replace(/^media_/, "")
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

const statusLabel = (status: string) => {
  if (status === "implemented") return "Đã triển khai";
  if (status === "documented") return "Đã khai báo";
  if (status === "ui-only") return "Chỉ giao diện";
  return "Service response dùng chung";
};

const exampleByService: Record<string, string[]> = {
  media_responses: ["hội thoại thông thường", "normalchat"],
  media_text_to_text: ["hội thoại thông thường", "normalchat"],
  media_content_smart: ["media_content_smart", "smartwriting"],
  media_spell_check: ["sửa lỗi chính tả", "spellcheck"],
  media_script_writing: ["media_script_writing", "scriptwriting"],
  media_image_to_text: ["media_image_to_text", "imagetotext"],
  media_text_to_speech: ["media_text_to_speech", "texttospeech"],
};

const exampleMatchers: Record<string, string[]> = {
  Responses: ["hội thoại thông thường", "normalchat"],
  media_text_to_text: ["hội thoại thông thường", "normalchat"],
  media_content_smart: ["media_content_smart", "smartwriting"],
  media_spell_check: ["sửa lỗi chính tả", "spellcheck"],
  media_script_writing: ["media_script_writing", "scriptwriting"],
  media_image_to_text: ["media_image_to_text", "imagetotext"],
  media_text_to_speech: ["media_text_to_speech", "texttospeech"],
};

export default function ServiceCategoryPanel({ categories, hidden = false }: ServiceCategoryPanelProps) {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

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

  const scrollToOperation = (serviceKey: string) => {
    const operationId = operationByService[serviceKey] || "createResponse";
    const exampleMatchersForService = exampleByService[serviceKey];
    const findTarget = () => {
      const formattedName = formatServiceName(serviceKey).toLowerCase();
      const taggedSection = Array.from(
        document.querySelectorAll<HTMLElement>(".opblock-tag-section"),
      ).find((section) => {
        const text = (section.querySelector<HTMLElement>(".opblock-tag")?.textContent || "").trim().toLowerCase();
        return text.startsWith(serviceKey.toLowerCase()) || text.includes(formattedName);
      });
      if (exampleMatchersForService && taggedSection) return taggedSection;
      return (
        document.getElementById(`operations-${operationId}`) ||
        document.querySelector(`[data-section-id="operations-${operationId}"]`) ||
        document.querySelector(`[id$="-${operationId}"]`) ||
        taggedSection
      );
    };
    const selectExample = () => {
      if (!exampleMatchersForService) return true;
      const target = findTarget();
      const section = target?.closest<HTMLElement>(".opblock-tag-section") || target;
      const exampleSelect = section?.querySelector<HTMLSelectElement>("select");
      if (!exampleSelect) return false;
      const selectedOption = Array.from(exampleSelect.options).find((option) =>
        exampleMatchersForService.some((matcher) =>
          (option.textContent || "").toLowerCase().includes(matcher),
        ),
      );
      if (selectedOption && exampleSelect.value !== selectedOption.value) {
        const nativeSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
        nativeSetter?.call(exampleSelect, selectedOption.value);
        exampleSelect.dispatchEvent(new Event("input", { bubbles: true }));
        exampleSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return Boolean(selectedOption);
    };
    const target = findTarget();
    if (!(target instanceof HTMLElement)) return;
    const scrollToTarget = () => {
      const currentTarget = findTarget();
      if (!(currentTarget instanceof HTMLElement)) return;
      const top = currentTarget.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };
    const summary = target.querySelector<HTMLElement>(".opblock-summary");
    if (exampleMatchersForService && !selectExample() && summary && !target.classList.contains("is-open")) {
      summary.click();
      window.setTimeout(() => {
        selectExample();
        scrollToTarget();
      }, 50);
      return;
    }
    scrollToTarget();
  };

  return createPortal(
    <section className={`${hidden ? "hidden" : ""} w-full mb-3.5 rounded-2xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md`}>
      <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>OpenClaw Service Matrix</span>
          </div>
          <h2 className="mt-1.5 text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Nhóm service OpenClaw
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
            Các service AI của Media Tech được cung cấp qua OpenClaw Gateway và route tương ứng.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-xs">
          <Layers className="h-3.5 w-3.5 text-slate-500" />
          <span>{categories.length} Nhóm service</span>
        </div>
      </div>

      <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
        {categories.map(([key, service]) => (
          <button
            key={key}
            type="button"
            disabled={!service.route}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3.5 text-left shadow-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
              service.route
                ? "hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5"
                : "cursor-default opacity-80"
            }`}
            onClick={() => {
              if (service.route) scrollToOperation(key);
            }}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                  {formatServiceName(key)}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide border whitespace-nowrap ${
                    service.status === "ui-only"
                      ? "border-slate-200 bg-slate-100/80 text-slate-600"
                      : service.status === "implemented"
                        ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                        : service.status === "documented"
                          ? "border-blue-200/80 bg-blue-50 text-blue-700"
                        : "border-amber-200/80 bg-amber-50 text-amber-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      service.status === "ui-only"
                        ? "bg-slate-400"
                        : service.status === "implemented"
                          ? "bg-emerald-500"
                          : service.status === "documented"
                            ? "bg-blue-500"
                          : "bg-amber-500"
                    }`}
                  />
                  {statusLabel(service.status)}
                </span>
              </div>

              <p className="mt-2.5 min-h-[40px] text-xs leading-relaxed text-slate-600 line-clamp-2">
                {service.description}
              </p>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <span className="block font-medium text-slate-500 text-[11px] mb-1">Route endpoint:</span>
                <div className="flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-slate-50/80 px-2.5 py-1.5">
                  <Terminal className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <code className="font-mono text-xs text-slate-700 truncate">
                    {service.route || "Frontend only"}
                  </code>
                </div>
              </div>
            </div>

            <div className={`mt-3.5 flex items-center justify-between border-t border-slate-100/90 pt-2.5 text-xs font-semibold ${service.route ? "text-blue-600 group-hover:text-blue-700" : "text-slate-400"}`}>
              <span>{service.route ? "Bấm để xem endpoint" : "Chưa có API riêng"}</span>
              {service.route && (
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>,
    portalNode,
  );
}
