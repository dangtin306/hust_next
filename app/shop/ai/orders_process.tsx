"use client";

import Link from "next/link";
import { toolProcessCards, type Lang, type ToolKey } from "./orders_data";

type OrdersProcessProps = {
  lang: Lang;
  activeTool: ToolKey;
  routeRoot: "plans" | "orders_once";
  showToc?: boolean;
  showUtilities?: boolean;
  showUtilitiesOnMobile?: boolean;
  className?: string;
};

const OrdersProcess = ({
  lang,
  activeTool,
  routeRoot,
  showToc = true,
  showUtilities = true,
  showUtilitiesOnMobile = true,
  className = "",
}: OrdersProcessProps) => {
  const tocItems: Array<{ id: string; en: string; vi: string }> = [
    { id: "section-introduction", en: "Introduction", vi: "Introduction" },
    { id: "section-audience", en: "Who This Module Helps", vi: "Who This Module Helps" },
    { id: "section-notes", en: "How This Module Works", vi: "How This Module Works" },
    { id: "section-workflow", en: "User Interface", vi: "User Interface" },
    { id: "section-examples", en: "Input/Output Examples", vi: "Input/Output Examples" },
    { id: "section-feedback", en: "Reader Value", vi: "Reader Value" },
    { id: "section-conclusion", en: "Conclusion", vi: "Conclusion" },
  ];

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
            {tocItems.map((item) => (
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
      <section className={`-mb-2 lg:mb-0 mt-4 rounded-2xl border border-blue-100/80 bg-blue-50/90 px-3 py-3 text-left shadow-sm backdrop-blur-md ${showUtilitiesOnMobile ? "" : "hidden lg:block"}`.trim()}>
        <h2 className="mt-2 text-center text-lg font-semibold text-slate-800">
          Practical AI Utilities
        </h2>
        <div className="mt-4 space-y-2">
          {toolProcessCards.map((card) => {
            const isActive = activeTool === card.key;
            return (
              <Link
                key={card.key}
                href={card.href(routeRoot)}
                className={`block no-underline rounded-xl border p-2.5 transition ${
                  isActive
                    ? "border-emerald-300/90 bg-emerald-100/55"
                    : "border-blue-100/80 bg-blue-200/60 hover:border-blue-300/90 hover:bg-blue-200/80"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={card.image}
                    alt={card.title[lang]}
                    loading="lazy"
                    className="h-14 w-20 flex-none rounded-lg border border-blue-100/80 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold leading-snug text-black">
                      {card.title[lang]}
                    </div>
                    <div
                      className="mt-1 text-xs leading-relaxed text-slate-500"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {card.description[lang]}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      )}
    </div>
  );
};

export default OrdersProcess;
