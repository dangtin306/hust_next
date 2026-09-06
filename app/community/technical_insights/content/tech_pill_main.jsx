"use client";

import Link from "next/link";
import { OrdersPillPackage } from "@/app/shop/ai/orders_pill_pack";

/**
 * @param {{ relatedPosts?: import("../tech_api_data").TechnicalInsightRelatedPost[]; activeUri?: string }} props
 */
export function TechRelatedInsights({ relatedPosts = [], activeUri = "" }) {
  if (!Array.isArray(relatedPosts) || relatedPosts.length === 0) return null;

  return (
    <section className="-mb-2 mt-4 rounded-2xl border border-blue-100/80 bg-blue-50/90 px-3 py-3 text-left shadow-sm backdrop-blur-md lg:mb-0">
      <h2 className="mt-2 text-center text-lg font-semibold text-slate-800">Related Insights</h2>
      <div className="mt-4 space-y-2">
        {relatedPosts.map((item, index) => {
          const uri = String(item?.uri || "").trim();
          if (!uri) return null;
          const title = String(item?.title || "").trim();
          const image = String(item?.thumbnail_image || item?.image || "").trim();
          const isActive = activeUri === uri;
          return (
            <Link key={String(item?.id || uri)} href={`/tech/${uri}`} className={`block rounded-xl border p-2.5 no-underline transition ${isActive ? "border-emerald-300/90 bg-emerald-100/55" : "border-blue-100/80 bg-blue-200/60 hover:border-blue-300/90 hover:bg-blue-200/80"}`}>
              <div className="flex items-start gap-2.5">
                {image ? <img src={image} alt={title || "related insight"} loading="lazy" decoding="async" fetchPriority="low" className="h-14 w-20 flex-none rounded-lg border border-blue-100/80 object-cover" /> : null}
                <div className="min-w-0 flex-1"><div className="text-sm font-semibold leading-[20px] text-black">{title || uri}</div><div className="mt-1 text-xs leading-[18px] text-slate-500" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item?.description || ""}</div></div>
              </div>
              <OrdersPillPackage dateRaw={String(item?.createdate || "")} hashName={String(item?.tips_hash_name || "").trim() || "Hust Media"} logLayout={index === 0} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
