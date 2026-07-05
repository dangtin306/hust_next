"use client";

import type { Lang, ToolKey } from "./orders_data";
import type { RelatedPostItem } from "./orders_api_data";
import { OrdersRelatedInsights } from "./orders_pill";

type OrdersProcessProps = {
  lang: Lang;
  activeTool: ToolKey;
  routeRoot: "plans" | "orders_once";
  relatedInsights?: RelatedPostItem[];
  hasSetupGuide?: boolean;
  showToc?: boolean;
  showUtilities?: boolean;
  showUtilitiesOnMobile?: boolean;
  className?: string;
};

const OrdersProcess = ({
  lang,
  activeTool,
  routeRoot,
  relatedInsights = [],
  hasSetupGuide = false,
  showToc = true,
  showUtilities = true,
  showUtilitiesOnMobile = true,
  className = "",
}: OrdersProcessProps) => {
  const tocItems: Array<{ id: string; en: string; vi: string }> = [
    { id: "section-introduction", en: "Introduction", vi: "Introduction" },
    { id: "section-practical-notes", en: "Practical Notes", vi: "Practical Notes" },
    { id: "section-audience", en: "Who This Module Helps", vi: "Who This Module Helps" },
    { id: "section-notes", en: "How This Module Works", vi: "How This Module Works" },
    { id: "section-examples", en: "Module Usage Guide", vi: "Module Usage Guide" },
    { id: "section-workflow", en: "Try the Module", vi: "Try the Module" },
    { id: "section-feedback", en: "Reader Value & Conclusion", vi: "Reader Value & Conclusion" },
  ];
  const displayTocItems =
    hasSetupGuide
      ? [
          tocItems[0],
          tocItems[1],
          tocItems[2],
          { id: "section-setup-guide", en: "Module Setup Guide", vi: "Module Setup Guide" },
          ...tocItems.slice(3),
        ]
      : tocItems;

  const scrollToSection = (id: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 55;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className={`w-full lg:w-[var(--tool-col)] lg:flex-none ${className}`.trim()}>
      {showToc && (
      <section className="rounded-2xl border border-blue-100/80 bg-blue-50/90 px-4 pb-4 pt-3 text-slate-700 shadow-sm backdrop-blur-md">
        <div className="max-lg:pt-1 lg:pt-4">
          <div className="text-center text-lg font-semibold whitespace-nowrap text-slate-800">
            Table of Contents
          </div>
          <div className="max-lg:mt-3 lg:mt-5 space-y-1.5 sm:mt-4">
            {displayTocItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="block w-full rounded-lg border border-blue-100/80 bg-blue-200/60 px-3 py-1.5 text-left text-sm font-medium text-black transition hover:border-blue-400/90 hover:bg-blue-300/65 sm:py-2"
              >
                {lang === "vi" ? item.vi : item.en}
              </button>
            ))}
          </div>
        </div>
      </section>
      )}

      {showUtilities && (
        <OrdersRelatedInsights
          relatedInsights={relatedInsights}
          activeTool={activeTool}
          routeRoot={routeRoot}
          showOnMobile={showUtilitiesOnMobile}
        />
      )}
    </div>
  );
};

export default OrdersProcess;
