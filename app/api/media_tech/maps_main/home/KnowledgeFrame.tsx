"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, BookOpen, Check, FileCode2, Network, Share2, Sparkles } from "lucide-react";
import { copyText } from "@/app/api/media_tech/workspace/copyText";
import {
  handleHomeNavigationLink,
  HomeNavigationToast,
  useHomeNavigationToast,
} from "@/app/api/hust_media/media_tech/HomeNavigationToast";

// Khung Knowledge giữ đúng giao diện thẻ trước đây ở dev home, dùng ở đầu trang workflow của cả Hust và Media Tech.
// Nút "Sao chép Link" dùng copyText để vẫn chạy khi truy cập qua IP/tên miền (không phải localhost).
type KnowledgeFrameProps = {
  product: "mt" | "hust";
};

const getDisplayPath = (link: string) => (link.startsWith("/next") ? link : `/next${link}`);

export default function KnowledgeFrame({ product }: KnowledgeFrameProps) {
  const linkPrefix = product === "hust" ? "/api/hust" : "/api/mt";
  const mapHomeLink = `${linkPrefix}/maps_main/home`;
  const [copied, setCopied] = useState(false);
  const { pendingNavigation, showNavigationLoading } = useHomeNavigationToast();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}${getDisplayPath(mapHomeLink)}`;
    const ok = await copyText(fullUrl);
    if (!ok) return;
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-violet-200/90 bg-white shadow-2xs">
      <div className="flex items-center justify-between gap-3 border-b border-violet-500/30 bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white shadow-inner backdrop-blur-md sm:h-9.5 sm:w-9.5">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="truncate text-sm font-bold tracking-tight text-white sm:text-base">Knowledge</h2>
              <span className="rounded border border-white/30 bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white sm:text-[10px]">
                Semantic City Map
              </span>
            </div>
            <p className="text-[11px] font-medium leading-snug text-violet-100">
              Bản đồ tri thức: quận, khu phố, công trình, ga và tuyến
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
        <p className="text-xs leading-relaxed text-slate-600">
          Người xem tra cứu bản đồ tương tác (2.5D) theo lĩnh vực, khu phố và công trình. AI đọc cùng dữ liệu qua
          maps_main.jsonl.
        </p>

        <div className="space-y-2 text-xs">
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
            <Network className="h-3.5 w-3.5 shrink-0 text-violet-600" />
            <span className="truncate font-semibold text-slate-700">Bản đồ 2.5D tương tác</span>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-fuchsia-600" />
            <span className="truncate font-semibold text-slate-700">Tìm công trình, tuyến, lĩnh vực</span>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
            <span className="truncate font-semibold text-slate-700">Tri thức cho AI: maps_main.jsonl</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5">
        <button
          type="button"
          onClick={() => void handleCopy()}
          title="Sao chép liên kết để chia sẻ"
          className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all sm:py-2 ${
            copied
              ? "border-emerald-300 bg-emerald-50 font-bold text-emerald-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Đã sao chép
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" /> Sao chép Link
            </>
          )}
        </button>
        <Link
          href={mapHomeLink as unknown as Route}
          onClick={(event) => handleHomeNavigationLink(event, "Knowledge", showNavigationLoading)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-violet-700"
        >
          Mở bản đồ <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <HomeNavigationToast label={pendingNavigation} />
    </article>
  );
}
