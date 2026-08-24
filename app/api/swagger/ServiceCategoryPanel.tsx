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
  media_text_to_image: "generateImage",
  media_explore: "createResponse",
};

const formatServiceName = (value: string) =>
  value
    .replace(/^media_/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const statusLabel = (status: string) => {
  if (status === "implemented") return "Implemented";
  if (status === "ui-only") return "UI only";
  return "Generic response service";
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

    // Swagger mounts its operation blocks after the page shell. Retry once
    // after the next paint for clicks made during the initial mount.
    window.requestAnimationFrame(() => {
      const mountedTarget = findTarget();
      if (mountedTarget instanceof HTMLElement) {
        mountedTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  return createPortal(
    <section
      className={`${hidden ? "hidden" : ""} mx-auto mb-6 max-w-[1480px] rounded-xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm`}
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          OpenClaw services
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-800">
          Service categories
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Các chức năng được frontend sử dụng và route xử lý tương ứng.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {categories.map(([key, service]) => (
          <button
            key={key}
            type="button"
            className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => scrollToOperation(key)}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800">
                {formatServiceName(key)}
              </h3>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                  service.status === "ui-only"
                    ? "bg-slate-100 text-slate-600"
                    : service.status === "implemented"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {statusLabel(service.status)}
              </span>
            </div>
            <p className="mt-3 min-h-12 text-sm leading-5 text-slate-600">
              {service.description}
            </p>
            <code className="mt-3 block break-all rounded bg-slate-50 px-2 py-1.5 text-xs text-slate-700">
              {service.route || "Frontend only"}
            </code>
            <span className="mt-3 block text-xs font-semibold text-blue-700">
              Click to view endpoint ↓
            </span>
          </button>
        ))}
      </div>
    </section>,
    portalNode,
  );
}
