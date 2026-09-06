"use client";

import type { TechnicalInsightRelatedPost } from "../tech_api_data";
import { TechRelatedInsights } from "./tech_pill_main";

type TocItem = { id: string; text: string };
type TechProcessProps = { tocItems: TocItem[]; activeTocId: string; onSelect: (id: string) => void; relatedPosts: TechnicalInsightRelatedPost[]; activeUri: string };

export default function TechProcess({ tocItems, activeTocId, onSelect, relatedPosts, activeUri }: TechProcessProps) {
  return (
    <div className="w-full lg:w-[var(--tool-col)] lg:flex-none">
      <section className="rounded-2xl border border-blue-100/80 bg-blue-50/90 px-4 pb-4 pt-3 text-slate-700 shadow-sm backdrop-blur-md">
        <div className="max-lg:pt-1 lg:pt-4"><div className="text-center text-lg font-semibold whitespace-nowrap text-slate-800">Table of Contents</div>{tocItems.length > 0 ? <div className="max-lg:mt-3 lg:mt-5 space-y-1.5 sm:mt-4">{tocItems.map((item) => <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium transition sm:py-2 ${activeTocId === item.id ? "border-2 border-blue-400/90 bg-blue-300/65 text-black" : "border border-blue-100/80 bg-blue-200/60 text-black hover:border-blue-400/90 hover:bg-blue-300/65"}`}>{item.text}</button>)}</div> : null}</div>
      </section>
      <TechRelatedInsights relatedPosts={relatedPosts} activeUri={activeUri} />
    </div>
  );
}
