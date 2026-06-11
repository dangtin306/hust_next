"use client";

import Link from "next/link";
import type { Lang, ToolKey } from "./orders_data";
import type { RelatedPostItem } from "./orders_api_data";

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
      <section className={`-mb-2 lg:mb-0 mt-4 rounded-2xl border border-blue-100/80 bg-blue-50/90 px-3 py-3 text-left shadow-sm backdrop-blur-md ${showUtilitiesOnMobile ? "" : "hidden lg:block"}`.trim()}>
        <h2 className="mt-2 text-center text-lg font-semibold text-slate-800">
          Related Insights
        </h2>
        <div className="mt-4 space-y-2">
          {relatedInsights.map((item) => {
            const uri = String(item?.uri || "").trim();
            if (!uri) return null;
            const title = String(item?.title || "").trim();
            const description = String(item?.description || "").trim();
            const image = String(item?.thumbnail_image || item?.image || "").trim();
            const hashName =
              String(item?.tips_hash_name || "").trim() || "Hust Media";
            const dateRaw = String(item?.createdate || "").trim();
            const dateLabel = dateRaw
              ? (() => {
                  const parsed = new Date(dateRaw.replace(" ", "T"));
                  if (Number.isNaN(parsed.getTime())) return dateRaw;
                  return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
                })()
              : "";
            const isActive = activeTool === uri;
            const href = routeRoot === "orders_once" ? `/next/orders_once/${uri}` : `/ai/plans/${uri}`;
            const key = String(item?.id || uri);
            return (
              <Link
                key={key}
                href={href}
                className={`block no-underline rounded-xl border p-2.5 transition ${
                  isActive
                    ? "border-emerald-300/90 bg-emerald-100/55"
                    : "border-blue-100/80 bg-blue-200/60 hover:border-blue-300/90 hover:bg-blue-200/80"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {image ? (
                    <img
                      src={image}
                      alt={title || "related insight"}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-14 w-20 flex-none rounded-lg border border-blue-100/80 object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold leading-snug text-black">
                      {title}
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
                      {description}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {dateLabel ? (
                    <span className="inline-flex items-center rounded-full border border-slate-300/80 bg-slate-200/80 px-2 py-0.5 text-slate-600">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="mr-1 shrink-0"
                      >
                        <path
                          d="M7.5 2.75v2.5M16.5 2.75v2.5M3.75 8.75h16.5M6 4.75h12A2.25 2.25 0 0 1 20.25 7v11A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V7A2.25 2.25 0 0 1 6 4.75Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {dateLabel}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center rounded-full border border-slate-300/80 bg-slate-200/80 px-2 py-0.5 text-slate-600">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="mr-1 shrink-0"
                    >
                      <path
                        d="M10.25 4.75H6.75A2.25 2.25 0 0 0 4.5 7v4.043a2.25 2.25 0 0 0 .659 1.591l5.707 5.707a2.25 2.25 0 0 0 3.182 0l4.293-4.293a2.25 2.25 0 0 0 0-3.182l-5.909-5.909a2.25 2.25 0 0 0-1.591-.659Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="8.25" cy="8.25" r="1.1" fill="currentColor" />
                    </svg>
                    {hashName}
                  </span>
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
