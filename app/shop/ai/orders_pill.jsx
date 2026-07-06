"use client";

import Link from "next/link";

function formatRelatedPostDate(dateRaw) {
    const value = String(dateRaw || "").trim();
    if (!value) return "";

    const parsed = new Date(value.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return value;

    return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
}

function CalendarIcon({ className = "" }) {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
        >
            <path
                d="M7.5 2.75v2.5M16.5 2.75v2.5M3.75 8.75h16.5M6 4.75h12A2.25 2.25 0 0 1 20.25 7v11A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V7A2.25 2.25 0 0 1 6 4.75Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TagIcon({ className = "" }) {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
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
    );
}

function MetaPill({ label, Icon, className = "" }) {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <div
                className={`inline-flex items-center rounded-full whitespace-nowrap px-2 text-slate-600 ${className}`.trim()}
                style={{
                    lineHeight: 1,
                    paddingTop: "0.3rem",
                    paddingBottom: "0.3rem",
                }}
            >
                <div className="inline-flex items-center gap-1 whitespace-nowrap leading-none"
                    style={{
                        lineHeight: 1,
                        paddingTop: 0,
                        paddingBottom: 0,
                    }}>
                    <Icon className="block shrink-0" />
                    <div
                        className="block whitespace-nowrap text-[11px] leading-none"
                        style={{
                            lineHeight: 1,
                        }}
                    >
                        {label}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * @typedef {import("./orders_api_data").RelatedPostItem} RelatedPostItem
 */

/**
 * @param {{
 *   relatedInsights?: RelatedPostItem[];
 *   activeTool: import("./orders_data").ToolKey | null;
 *   routeRoot: "plans" | "orders_once";
 *   showOnMobile?: boolean;
 *   className?: string;
 * }} props
 */
export function OrdersRelatedInsights({
    relatedInsights = [],
    activeTool,
    routeRoot,
    showOnMobile = true,
    className = "",
}) {
    if (!Array.isArray(relatedInsights) || relatedInsights.length === 0) return null;

    return (
        <section className={`-mb-2 lg:mb-0 mt-4 rounded-2xl border border-blue-100/80 bg-blue-50/90 px-3 py-3 text-left shadow-sm backdrop-blur-md ${showOnMobile ? "" : "hidden lg:block"} ${className}`.trim()}>
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
                    const dateLabel = formatRelatedPostDate(dateRaw);
                    const isActive = activeTool === uri;
                    const href = routeRoot === "orders_once" ? `/next/orders_once/${uri}` : `/ai/plans/${uri}`;
                    const key = String(item?.id || uri);

                    return (
                        <Link
                            key={key}
                            href={href}
                            className={`block no-underline rounded-xl border p-2.5 transition ${isActive
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
                                    <MetaPill
                                        label={dateLabel}
                                        Icon={CalendarIcon}
                                        className="border border-slate-300/80 bg-slate-200/80"
                                    />
                                ) : null}
                                <MetaPill
                                    label={hashName}
                                    Icon={TagIcon}
                                    className="border border-slate-300/80 bg-slate-200/80"
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
