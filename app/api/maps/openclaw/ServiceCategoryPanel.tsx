"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

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
  media_text_to_image: "generateImage",
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
  if (status === "ui-only") return "Chỉ giao diện";
  return "Service response dùng chung";
};

const exampleByService: Record<string, string[]> = {
  media_responses: ["hội thoại thông thường"],
  media_text_to_text: ["hội thoại thông thường"],
  media_content_smart: ["media_content_smart"],
  media_spell_check: ["sửa lỗi chính tả"],
  media_script_writing: ["media_script_writing"],
  media_image_to_text: ["media_image_to_text"],
  media_text_to_speech: ["media_text_to_speech"],
};

const exampleMatchers: Record<string, string[]> = {
  Responses: ["hội thoại thông thường"],
  media_text_to_text: ["hội thoại thông thường"],
  media_content_smart: ["media_content_smart"],
  media_spell_check: ["sửa lỗi chính tả"],
  media_script_writing: ["media_script_writing"],
  media_image_to_text: ["media_image_to_text"],
  media_text_to_speech: ["media_text_to_speech"],
};

export default function ServiceCategoryPanel({ categories, hidden = false }: ServiceCategoryPanelProps) {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!portalNode) return;
    const configureExamplesByTag = () => {
      document.querySelectorAll<HTMLElement>(".opblock-tag-section").forEach((section) => {
        const heading = section.querySelector<HTMLElement>(".opblock-tag");
        const tag = Object.keys(exampleMatchers).find((name) =>
          (heading?.textContent || "").trim().startsWith(name),
        );
        if (!tag) return;
        const matchingOptions = Array.from(section.querySelectorAll<HTMLSelectElement>("select")).flatMap((select) =>
          Array.from(select.options).filter((option) =>
            exampleMatchers[tag].some((matcher) =>
              (option.textContent || "").toLowerCase().includes(matcher),
            ),
          ),
        );
        section.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
          const selectedOption = matchingOptions.find((option) => option.parentElement === select);
          if (!selectedOption) return;
          Array.from(select.options).forEach((option) => {
            const shouldHide = option !== selectedOption;
            option.hidden = shouldHide;
          });
          if (select.value !== selectedOption.value) {
            const nativeSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
            nativeSetter?.call(select, selectedOption.value);
            select.dispatchEvent(new Event("input", { bubbles: true }));
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
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
      if (exampleMatchersForService) {
        const taggedSection = Array.from(
          document.querySelectorAll<HTMLElement>(".opblock-tag-section"),
        ).find((section) =>
          (section.querySelector<HTMLElement>(".opblock-tag")?.textContent || "")
            .trim()
            .startsWith(serviceKey),
        );
        if (taggedSection) return taggedSection;
      }
      return (
        document.getElementById(`operations-${operationId}`) ||
        document.querySelector(`[data-section-id="operations-${operationId}"]`) ||
        document.querySelector(`[id$="-${operationId}"]`)
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
    <section className={`${hidden ? "hidden" : ""} mx-auto mb-6 max-w-[1480px] rounded-xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm`}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Các service OpenClaw</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-800">Nhóm service</h2>
        <p className="mt-1 text-sm text-slate-600">Các service AI của Media Tech được cung cấp qua OpenClaw và route tương ứng.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {categories.map(([key, service]) => (
          <button key={key} type="button" className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => scrollToOperation(key)}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800">{formatServiceName(key)}</h3>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${service.status === "ui-only" ? "bg-slate-100 text-slate-600" : service.status === "implemented" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {statusLabel(service.status)}
              </span>
            </div>
            <p className="mt-3 min-h-12 text-sm leading-5 text-slate-600">{service.description}</p>
            <code className="mt-3 block break-all rounded bg-slate-50 px-2 py-1.5 text-xs text-slate-700">{service.route || "Frontend only"}</code>
            <span className="mt-3 block text-xs font-semibold text-blue-700">Bấm để xem endpoint ↓</span>
          </button>
        ))}
      </div>
    </section>,
    portalNode,
  );
}
