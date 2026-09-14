"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { TechnicalInsightPost } from "../tech_api_data";
import type { TechClosingNotes } from "./tech_mdx_article";

type TechContentProps = {
  post: TechnicalInsightPost;
  lang: string;
  mdxArticle: ReactNode;
  closingNotes: TechClosingNotes;
  articleRef: React.RefObject<HTMLDivElement | null>;
  isLiked: boolean;
  onToggleLike: () => void;
  onShare: () => void;
};

type ArticleActionsProps = {
  lang: string;
  writtenDateLabel: string;
  createdate: string;
  isLiked: boolean;
  onToggleLike: () => void;
  onShare: () => void;
  borderTop?: boolean;
};

const formatUsDateTime = (value: string) => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return raw;
  const [, yyyy, mm, dd, hh, mi, ss] = match;
  return `${mm}/${dd}/${yyyy} ${hh}:${mi}:${ss}`;
};

function ArticleActions({ lang, writtenDateLabel, createdate, isLiked, onToggleLike, onShare, borderTop = true }: ArticleActionsProps) {
  return (
    <div className={`mt-2 mb-1 flex w-full flex-wrap items-center justify-between gap-2.5 ${borderTop ? "border-t border-slate-300/90 pt-3" : ""}`}>
      <div className="mt-1 inline-flex max-w-full items-center self-center rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5">
        <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-5 text-slate-500 sm:text-[13px]">
          <span className="font-medium text-slate-700">By Tín Nguyễn Đăng</span>{" "}
          <span className="text-slate-300">•</span>{" "}
          <span>{writtenDateLabel} {formatUsDateTime(createdate)}</span>
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center self-center gap-2">
        <button
          type="button"
          onClick={onToggleLike}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[20px] leading-none shadow-sm transition ${isLiked ? "border-slate-300 bg-slate-100 text-slate-900" : "border-slate-300/90 bg-white text-slate-700 hover:bg-slate-50"}`}
          aria-label={isLiked ? "Unlike article" : "Like article"}
        >
          {isLiked ? "♥" : "♡"}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
        >
          {lang === "vi" ? "Chia sẻ" : "Share"}
        </button>
      </div>
    </div>
  );
}

export default function TechContent({ post, lang, mdxArticle, closingNotes, articleRef, isLiked, onToggleLike, onShare }: TechContentProps) {
  const writtenDateLabel = lang === "vi" ? "Ngày viết:" : "Written date:";
  const actionsProps = { lang, writtenDateLabel, createdate: post.createdate, isLiked, onToggleLike, onShare };

  return (
    <div ref={articleRef} className="space-y-3">
      <section id="section-introduction" className="w-full min-w-0 rounded-3xl border border-slate-200/70 bg-white/85 shadow-2xl ring-1 ring-black/5 backdrop-blur-md lg:flex-1">
        <header className="max-lg:px-3 lg:px-7 pb-2 max-lg:pt-6 lg:pt-10">
          <div className="mb-2 mt-1 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="min-w-0 flex-1 text-balance text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{post.title}</h1>
            </div>
            <Link href="/shop/category/tips_vip" className="inline-flex shrink-0 items-center no-underline rounded-2xl border border-pink-200 bg-pink-50 px-3 py-1.5 text-[14.5px] font-semibold text-slate-900 shadow-sm transition hover:bg-pink-100 hover:no-underline active:scale-[0.98]">Back to Insights</Link>
          </div>
          {post.description ? <div className="mt-3 w-full text-sm leading-relaxed text-slate-600 sm:text-base">{post.description}</div> : null}
          <div className="mt-3 flex min-w-0 flex-row flex-nowrap items-center gap-2 text-xs text-slate-500 sm:flex-wrap sm:gap-x-3 sm:gap-y-2 sm:text-sm">
            <span className="inline-flex min-w-0 flex-1 items-start gap-2 rounded-full bg-slate-100 px-3 py-1 sm:flex-none sm:w-auto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-500" aria-hidden="true"><path d="M7 3v2M17 3v2M4 8h16M6 12h4m-4 4h6m9-8v10a2 2 0 0 1-2-2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="min-w-0 whitespace-normal break-words leading-tight">{writtenDateLabel} <span className="font-medium text-slate-700">{formatUsDateTime(post.createdate)}</span></span>
            </span>
            <span className="inline-flex max-w-[44%] shrink-0 items-center whitespace-nowrap rounded-full border border-[#D8E0E8] bg-[#EEF2F6] px-2.5 py-1 font-semibold text-[#5E6B7A] sm:max-w-none">{post.tips_hash_name || "Hust Media"}</span>
          </div>
        </header>
        <div className="max-lg:px-1 lg:px-7 pb-[23px] pt-0 sm:pb-[23px] max-lg:pt-7 lg:pt-6">
          <article className="min-w-0">
            <div>{mdxArticle}</div>
          </article>
        </div>
      </section>

      {closingNotes ? (
        <section id="section-feedback" className="rounded-2xl border border-slate-200/90 bg-slate-100/70 px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Closing Notes</div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold leading-snug text-slate-900">Reader Value</h3>
            <p className="pl-1 sm:pl-1.5 text-[15px] leading-6 text-slate-700">{closingNotes.readerValue}</p>
          </div>
          <div className="my-4 border-t border-slate-200/75" />
          <div id="section-conclusion" className="mb-1 space-y-1">
            <h3 className="text-lg font-bold leading-snug text-slate-900">Conclusion</h3>
            <p className="pl-1 sm:pl-1.5 text-[15px] leading-6 text-slate-600">{closingNotes.conclusion}</p>
          </div>
          <ArticleActions {...actionsProps} />
        </section>
      ) : (
        <ArticleActions {...actionsProps} borderTop={false} />
      )}
    </div>
  );
}
