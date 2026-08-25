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
  media_text_to_image: "generateImage",
};

const formatServiceName = (value: string) =>
  value
    .replace(/^media_/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const statusLabel = (status: string) => {
  if (status === "implemented") return "Đã triển khai";
  if (status === "ui-only") return "Chỉ giao diện";
  return "Service response dùng chung";
};

const exampleMatchers: Record<string, string[]> = {
  media_text_to_text: ["normal conversation"],
  media_content_smart: ["media_content_smart"],
  media_image_to_text: ["media_image_to_text"],
  media_text_to_speech: ["media_text_to_speech"],
};

export default function ServiceCategoryPanel({ categories, hidden = false }: ServiceCategoryPanelProps) {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const ensurePanelSlot = () => {
      const swaggerRoot = document.querySelector(".swagger-ui");
      if (!swaggerRoot) return;
      const firstOperation = document.querySelector(".opblock-tag-section");
      const parent = firstOperation?.parentElement;
      if (!firstOperation || !parent) return;
      let slot = swaggerRoot.querySelector<HTMLElement>("#openclaw-service-categories-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "openclaw-service-categories-slot";
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
      document.getElementById("openclaw-service-categories-slot")?.remove();
    };
  }, []);

  useEffect(() => {
    if (!portalNode) return;
    const configuredSelects = new WeakSet<HTMLSelectElement>();
    const configureExamplesByTag = () => {
      document.querySelectorAll<HTMLElement>(".opblock-tag-section").forEach((section) => {
        const heading = section.querySelector<HTMLElement>(".opblock-tag");
        const tag = Object.keys(exampleMatchers).find((name) =>
          (heading?.textContent || "").trim().startsWith(name),
        );
        if (!tag) return;
        const matchers = exampleMatchers[tag];
        section.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
          if (configuredSelects.has(select)) return;
          const matchingOptions = Array.from(select.options).filter((option) =>
            matchers.some((matcher) => (option.textContent || "").toLowerCase().includes(matcher)),
          );
          if (matchingOptions.length === 0) return;
          configuredSelects.add(select);
          Array.from(select.options).forEach((option) => {
            option.hidden = !matchingOptions.includes(option);
          });
          const selectedOption = matchingOptions[0];
          const nativeSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
          if (selectedOption && select.value !== selectedOption.value) {
            nativeSetter?.call(select, selectedOption.value);
            select.dispatchEvent(new Event("input", { bubbles: true }));
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    };
    configureExamplesByTag();
    const observer = new MutationObserver(configureExamplesByTag);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [portalNode]);

  if (!portalNode) return null;

  const scrollToOperation = (serviceKey: string) => {
    const operationId = operationByService[serviceKey] || "createResponse";
    const findTarget = () =>
      document.getElementById(`operations-${operationId}`) ||
      document.querySelector(`[data-section-id="operations-${operationId}"]`) ||
      document.querySelector(`[id$="-${operationId}"]`);
    const target = findTarget();
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.requestAnimationFrame(() => {
      const mountedTarget = findTarget();
      if (mountedTarget instanceof HTMLElement) {
        mountedTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  return createPortal(
    <section className={`${hidden ? "hidden" : ""} mx-auto mb-6 max-w-[1480px] rounded-xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm`}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Các service OpenClaw</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-800">Nhóm service</h2>
        <p className="mt-1 text-sm text-slate-600">Các service AI của Media Tech và route tương ứng.</p>
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
