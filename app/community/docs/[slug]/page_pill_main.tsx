"use client";

import Link from "next/link";
import {
    OrdersPillPackage,
} from "./page_pill_pack";

type NavItem = {
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    createdate: string;
    tips_hash_name: string;
};

type DocsRelatedInsightsPanelProps = {
    slug: string;
    nav: NavItem[];
};

/**
 * @param {DocsRelatedInsightsPanelProps} props
 */
export function DocsRelatedInsightsPanel({
    slug,
    nav,
}: DocsRelatedInsightsPanelProps) {
    return (
        <section className="rounded-2xl border border-blue-100/80 bg-blue-50/90 px-3 py-3 text-left shadow-sm backdrop-blur-md">
            <h2 className="mt-2 text-center text-lg font-semibold text-slate-800">
                Related Insights
            </h2>

            <div className="mt-4 space-y-2">
                {nav.map((item) => {
                    const uri = String(item?.slug || "").trim();

                    if (!uri) {
                        return null;
                    }

                    const title = String(item?.title || "").trim();
                    const description = String(item?.description || "").trim();
                    const image = String(item?.thumbnail || "").trim();
                    const hashName =
                        String(item?.tips_hash_name || "").trim() ||
                        "Hust Media";
                    const dateRaw = String(item?.createdate || "").trim();
                    const isActive = uri === slug;
                    const href = `/community/docs/${uri}`;

                    return (
                        <Link
                            key={uri}
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

                            <OrdersPillPackage
                                dateRaw={dateRaw}
                                hashName={hashName}
                            />
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
