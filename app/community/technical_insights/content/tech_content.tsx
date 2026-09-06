"use client";

import Link from "next/link";
import type { TechnicalInsightPost } from "../tech_api_data";

type TechContentProps = { post: TechnicalInsightPost; lang: string; articleHtml: string; articleRef: React.RefObject<HTMLElement | null>; isLiked: boolean; onToggleLike: () => void; onShare: () => void };

const formatUsDateTime = (value: string) => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return raw;
  const [, yyyy, mm, dd, hh, mi, ss] = match;
  return `${mm}/${dd}/${yyyy} ${hh}:${mi}:${ss}`;
};

export default function TechContent({ post, lang, articleHtml, articleRef, isLiked, onToggleLike, onShare }: TechContentProps) {
  const writtenDateLabel = lang === "vi" ? "Ngày viết:" : "Written date:";
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/85 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
      <header className="max-lg:px-3 lg:px-7 pb-2 max-lg:pt-7 lg:pt-12">
        <div className="flex items-start justify-between gap-3"><h1 className="min-w-0 flex-1 text-balance text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{post.title}</h1><Link href="/community/features" className="inline-flex shrink-0 items-center rounded-2xl border border-pink-200 bg-pink-50 px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-pink-100 no-underline">Back to Insights</Link></div>
        {post.description ? <div className="mt-2 line-clamp-3 text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">{post.description}</div> : null}
        <div className="mt-3 flex min-w-0 flex-row flex-wrap items-center gap-2 text-xs text-slate-500 sm:gap-x-3 sm:gap-y-2 sm:text-sm"><span className="inline-flex items-start gap-2 rounded-full bg-slate-100 px-3 py-1">{writtenDateLabel} <span className="font-medium text-slate-700">{formatUsDateTime(post.createdate)}</span></span><span className="inline-flex rounded-full border border-[#D8E0E8] bg-[#EEF2F6] px-2.5 py-1 font-semibold text-[#5E6B7A]">{post.tips_hash_name || "Hust Media"}</span></div>
      </header>
      <div className="max-lg:px-1 lg:px-7 pb-4 pt-[17px] sm:pb-4"><article ref={articleRef} className="prose prose-slate max-w-none prose-p:leading-relaxed prose-li:leading-relaxed sm:prose-base lg:prose-lg prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md prose-hr:border-slate-200 prose-blockquote:border-slate-300 prose-blockquote:text-slate-700 prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-code:before:content-none prose-code:after:content-none prose-table:block prose-table:overflow-x-auto [&>*:first-child]:mt-0 [&>*:first-child]:pt-0 [&_img]:block [&_img]:w-full [&_img]:max-w-none [&_img]:h-auto [&_table]:w-full [&_table]:max-w-none [&_iframe]:w-full [&_iframe]:max-w-full break-words" dangerouslySetInnerHTML={{ __html: articleHtml }} /><div className="mt-0 flex w-full flex-wrap items-center justify-between gap-2.5 border-t border-slate-200 pt-3"><div className="inline-flex max-w-full items-center rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"><div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-5 text-slate-500 sm:text-[13px]"><span className="font-medium text-slate-700">By Tín Nguyễn Đăng</span> <span className="text-slate-300">•</span> {writtenDateLabel} {formatUsDateTime(post.createdate)}</div></div><div className="ml-auto flex shrink-0 items-center gap-2"><button type="button" onClick={onToggleLike} className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[20px] leading-none shadow-sm transition ${isLiked ? "border-slate-300 bg-slate-100 text-slate-900" : "border-slate-300/90 bg-white text-slate-700 hover:bg-slate-50"}`} aria-label={isLiked ? "Unlike article" : "Like article"}>{isLiked ? "♥" : "♡"}</button><button type="button" onClick={onShare} className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]">{lang === "vi" ? "Chia sẻ" : "Share"}</button></div></div></div>
    </section>
  );
}
