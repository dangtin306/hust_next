"use client";

import Link from "next/link";
import {
    OrdersPillPackage,
} from "./orders_pill_pack";

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
    if (
        !Array.isArray(
            relatedInsights
        ) ||
        relatedInsights.length === 0
    ) {
        return null;
    }

    return (
        <section
            className={`
                -mb-2
                mt-4
                rounded-2xl
                border
                border-blue-100/80
                bg-blue-50/90
                px-3
                py-3
                text-left
                shadow-sm
                backdrop-blur-md
                lg:mb-0
                ${showOnMobile
                    ? ""
                    : "hidden lg:block"
                }
                ${className}
            `.trim()}
        >
            <h2
                className="
                    mt-2
                    text-center
                    text-lg
                    font-semibold
                    text-slate-800
                "
            >
                Related Insights
            </h2>

            <div className="mt-4 space-y-2">
                {relatedInsights.map(
                    (item, index) => {
                        const uri =
                            String(
                                item?.uri ||
                                ""
                            ).trim();

                        if (!uri) {
                            return null;
                        }

                        const title =
                            String(
                                item?.title ||
                                ""
                            ).trim();

                        const description =
                            String(
                                item?.description ||
                                ""
                            ).trim();

                        const image =
                            String(
                                item?.thumbnail_image ||
                                item?.image ||
                                ""
                            ).trim();

                        const hashName =
                            String(
                                item?.tips_hash_name ||
                                ""
                            ).trim() ||
                            "Hust Media";

                        const dateRaw =
                            String(
                                item?.createdate ||
                                ""
                            ).trim();

                        const isActive =
                            activeTool ===
                            uri;

                        const href =
                            routeRoot ===
                            "orders_once"
                            ? `/orders_once/${uri}`
                                : `/ai/plans/${uri}`;

                        const key =
                            String(
                                item?.id ||
                                uri
                            );

                        return (
                            <Link
                                key={
                                    key
                                }
                                href={
                                    href
                                }
                                className={`
                                    block
                                    rounded-xl
                                    border
                                    p-2.5
                                    no-underline
                                    transition
                                    ${isActive
                                        ? "border-emerald-300/90 bg-emerald-100/55"
                                        : "border-blue-100/80 bg-blue-200/60 hover:border-blue-300/90 hover:bg-blue-200/80"
                                    }
                                `.trim()}
                            >
                                <div className="flex items-start gap-2.5">
                                    {image ? (
                                        <img
                                            src={
                                                image
                                            }
                                            alt={
                                                title ||
                                                "related insight"
                                            }
                                            loading="lazy"
                                            decoding="async"
                                            fetchPriority="low"
                                            className="
                                                h-14
                                                w-20
                                                flex-none
                                                rounded-lg
                                                border
                                                border-blue-100/80
                                                object-cover
                                            "
                                        />
                                    ) : null}

                                    <div className="min-w-0 flex-1">
                                        <div
                                            className="
                                                text-sm
                                                font-semibold
                                                leading-[20px]
                                                text-black
                                            "
                                        >
                                            {
                                                title
                                            }
                                        </div>

                                        <div
                                            className="
                                                mt-1
                                                text-xs
                                                leading-[18px]
                                                text-slate-500
                                            "
                                            style={{
                                                display:
                                                    "-webkit-box",
                                                WebkitLineClamp:
                                                    2,
                                                WebkitBoxOrient:
                                                    "vertical",
                                                overflow:
                                                    "hidden",
                                            }}
                                        >
                                            {
                                                description
                                            }
                                        </div>
                                    </div>
                                </div>

                                <OrdersPillPackage
                                    dateRaw={
                                        dateRaw
                                    }
                                    hashName={
                                        hashName
                                    }
                                    logLayout={
                                        index === 0
                                    }
                                />
                            </Link>
                        );
                    }
                )}
            </div>
        </section>
    );
}
