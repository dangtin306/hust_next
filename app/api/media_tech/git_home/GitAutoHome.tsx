"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  GitBranch,
  Terminal,
  Code2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Zap,
  Activity,
  Briefcase,
  Workflow,
  Share2,
  FolderGit2,
  GitCommitHorizontal,
  GitPullRequest,
  Network,
  Bot,
} from "lucide-react";

interface GitAutoHomeProps {
  isHust?: boolean;
}

export default function GitAutoHome({ isHust = false }: GitAutoHomeProps) {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "auto" | "test" | "gitea">("all");

  // Client-side Link routing prefix
  const linkPrefix = isHust ? "/api/hust" : "/api/mt";
  const gitAutoLink = `${linkPrefix}/git/auto`;
  const gitTestLink = `${linkPrefix}/git/test`;
  const giteaTestLink = `${linkPrefix}/git/gitea`;
  const workspaceLink = `${linkPrefix}/workspace/home`;
  const apiListLink = `${linkPrefix}/list/home`;
  const chatBotLink = `${linkPrefix}/chat/home`;
  const workflowLink = isHust ? `${linkPrefix}/workflow` : `${linkPrefix}/n8n/home`;

  const getDisplayPath = (link: string) => (link.startsWith("/next") ? link : `/next${link}`);

  const gitAutoUrl = getDisplayPath(gitAutoLink);
  const gitTestUrl = getDisplayPath(gitTestLink);
  const giteaTestUrl = getDisplayPath(giteaTestLink);

  // Derive absolute URL (with origin) from the link for reliable sharing
  const getFullUrl = (link: string) => {
    const path = getDisplayPath(link);
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const brandName = isHust ? "Hust Media Git" : "Media Tech Git";

  const handleCopy = (link: string, key: string, label: string) => {
    const fullUrl = getFullUrl(link);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(fullUrl);
      setCopiedKey(key);
      setToastMessage(fullUrl);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => {
        setCopiedKey(null);
        setToastMessage(null);
      }, 2500);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 sm:space-y-3.5 pb-4">
      {/* ========================================================================= */}
      {/* HEADER SECTION (Slim & Balanced)                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 text-white shadow-2xs shrink-0">
            <GitBranch className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                Trung Tâm Git Automation &amp; Control
              </h1>
              <span className="rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 text-[10px] font-bold text-amber-700">
                {brandName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              Không gian quản trị kho mã nguồn: <strong>Git Auto</strong> (production), <strong>Git Test</strong> (kiểm thử), và <strong>Gitea Test</strong> (webhook/API).
            </p>
          </div>
        </div>

        {/* Quick Filter Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/90 p-1 shadow-2xs text-xs shrink-0">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              filterMode === "all"
                ? "bg-white text-amber-700 shadow-2xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Tất cả (3 Khung)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("auto")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              filterMode === "auto"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Git Auto
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("test")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              filterMode === "test"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Git Test
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("gitea")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              filterMode === "gitea"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Gitea Test
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 MAIN GIT FRAMES (Clickable Cards)                                      */}
      {/* ========================================================================= */}
      <div
        className={`grid gap-3.5 sm:gap-4 ${
          filterMode === "all" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 max-w-2xl mx-auto"
        }`}
      >
        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 1: GIT AUTO                                                       */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "auto") && (
          <div
            onClick={() => router.push(gitAutoLink as Route)}
            title="Nhấp để mở Git Auto"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-amber-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-2.5 border-b border-amber-500/30 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 px-3.5 py-2.5 sm:px-4 sm:py-3 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <GitBranch className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      Git Auto
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      Có Ghi Dữ Liệu
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100 font-medium truncate">
                    Quản lý repository production, commit &amp; push
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Sẵn sàng</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-3.5 sm:p-4 space-y-2.5">
              {/* Path & Copy bar */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 text-xs">
                <span className="text-[11px] text-slate-500 font-medium shrink-0">Đường dẫn:</span>
                <code className="font-mono text-[11px] text-amber-700 font-semibold truncate flex-1">
                  {gitAutoUrl}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(gitAutoLink, "auto-path", "Đường dẫn Git Auto");
                  }}
                  className="flex items-center gap-1 rounded-md border border-slate-200/90 bg-white hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 px-2 py-0.5 text-slate-500 transition cursor-pointer shrink-0 shadow-2xs text-[10px] font-medium"
                  title="Sao chép URI"
                >
                  {copiedKey === "auto-path" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="font-bold text-emerald-600">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                Theo dõi repository thực tế: hỗ trợ fetch/pull, stage file, tạo commit, push lên remote, chuyển nhánh và tạo Pull Request tự động.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <GitCommitHorizontal className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Stage, Commit &amp; Push</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <GitPullRequest className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Tạo &amp; Đồng Bộ Pull Request</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Preflight An Toàn Dữ Liệu</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-3.5 py-2.5 sm:px-4 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(gitAutoLink, "auto", "Git Auto");
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  copiedKey === "auto"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-bold shadow-emerald-500/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80"
                }`}
                title="Sao chép toàn bộ liên kết để chia sẻ"
              >
                {copiedKey === "auto" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Đã chép Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Sao chép Link</span>
                    <span className="sm:hidden">Share</span>
                  </>
                )}
              </button>

              <Link
                href={gitAutoLink as unknown as Route}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Git Auto</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 2: GIT TEST                                                       */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "test") && (
          <div
            onClick={() => router.push(gitTestLink as Route)}
            title="Nhấp để mở Git Test"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-blue-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-2.5 border-b border-blue-500/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-3.5 py-2.5 sm:px-4 sm:py-3 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Terminal className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      Git Test
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      Môi Trường Test
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium truncate">
                    Kiểm thử Git Control API &amp; sandbox biệt lập
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Sẵn sàng</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-3.5 sm:p-4 space-y-2.5">
              {/* Path & Copy bar */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 text-xs">
                <span className="text-[11px] text-slate-500 font-medium shrink-0">Đường dẫn:</span>
                <code className="font-mono text-[11px] text-blue-700 font-semibold truncate flex-1">
                  {gitTestUrl}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(gitTestLink, "test-path", "Đường dẫn Git Test");
                  }}
                  className="flex items-center gap-1 rounded-md border border-slate-200/90 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-2 py-0.5 text-slate-500 transition cursor-pointer shrink-0 shadow-2xs text-[10px] font-medium"
                  title="Sao chép URI"
                >
                  {copiedKey === "test-path" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="font-bold text-emerald-600">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                Môi trường kiểm thử thao tác Git API: xác nhận kho thử nghiệm, chạy mock command và kiểm tra tính tương thích với Laravel Git Service.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <Terminal className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Git API Sandbox Endpoint</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <Cpu className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Laravel Git Service Backend</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <Activity className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Kiểm Tra Trạng Thái &amp; Log</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-3.5 py-2.5 sm:px-4 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(gitTestLink, "test", "Git Test");
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  copiedKey === "test"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-bold shadow-emerald-500/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80"
                }`}
                title="Sao chép toàn bộ liên kết để chia sẻ"
              >
                {copiedKey === "test" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Đã chép Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Sao chép Link</span>
                    <span className="sm:hidden">Share</span>
                  </>
                )}
              </button>

              <Link
                href={gitTestLink as unknown as Route}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Git Test</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 3: GITEA TEST                                                     */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "gitea") && (
          <div
            onClick={() => router.push(giteaTestLink as Route)}
            title="Nhấp để mở Gitea Test"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-emerald-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-2.5 border-b border-emerald-500/30 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-3.5 py-2.5 sm:px-4 sm:py-3 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Code2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      Gitea Test
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      Gitea Webhook &amp; API
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 font-medium truncate">
                    Giám sát repository, commit tree &amp; webhook
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Sẵn sàng</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-3.5 sm:p-4 space-y-2.5">
              {/* Path & Copy bar */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 text-xs">
                <span className="text-[11px] text-slate-500 font-medium shrink-0">Đường dẫn:</span>
                <code className="font-mono text-[11px] text-emerald-700 font-semibold truncate flex-1">
                  {giteaTestUrl}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(giteaTestLink, "gitea-path", "Đường dẫn Gitea Test");
                  }}
                  className="flex items-center gap-1 rounded-md border border-slate-200/90 bg-white hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 px-2 py-0.5 text-slate-500 transition cursor-pointer shrink-0 shadow-2xs text-[10px] font-medium"
                  title="Sao chép URI"
                >
                  {copiedKey === "gitea-path" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="font-bold text-emerald-600">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                Kiểm tra kết nối và hiển thị chi tiết repository Gitea: danh sách branch, commit history, cấu trúc cây file, package và luồng sự kiện webhook.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <Network className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Webhook &amp; Event Delivery</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <FolderGit2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Cây Thư Mục &amp; Branch Gitea</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 min-w-0">
                  <Zap className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Đồng Bộ Deploy &amp; Package</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-3.5 py-2.5 sm:px-4 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(giteaTestLink, "gitea", "Gitea Test");
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  copiedKey === "gitea"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-bold shadow-emerald-500/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80"
                }`}
                title="Sao chép toàn bộ liên kết để chia sẻ"
              >
                {copiedKey === "gitea" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Đã chép Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Sao chép Link</span>
                    <span className="sm:hidden">Share</span>
                  </>
                )}
              </button>

              <Link
                href={giteaTestLink as unknown as Route}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Gitea Test</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* QUICK SHORTCUTS BAR (Slim & Compact)                                      */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2 shadow-2xs backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Liên kết nhanh hệ thống:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={chatBotLink as unknown as Route}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Bot className="h-3 w-3 text-slate-500" />
              <span>Chat Bot</span>
            </Link>

            <Link
              href={workspaceLink as unknown as Route}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Briefcase className="h-3 w-3 text-slate-500" />
              <span>Workspace</span>
            </Link>

            <Link
              href={apiListLink as unknown as Route}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Code2 className="h-3 w-3 text-slate-500" />
              <span>Danh Sách API</span>
            </Link>

            <Link
              href={workflowLink as unknown as Route}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Workflow className="h-3 w-3 text-slate-500" />
              <span>Workflow</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING TOAST NOTIFICATION (Khi sao chép link thành công)                 */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200/90 bg-white px-4 py-3 text-slate-800 shadow-[0_10px_30px_rgba(16,185,129,0.2)] backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 max-w-[90vw] sm:max-w-md"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
            <Check className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-emerald-700">Đã sao chép link thành công!</p>
            <p className="font-mono text-[11px] text-slate-600 truncate mt-0.5 select-all">
              {toastMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-1 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Đóng thông báo"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
