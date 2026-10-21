"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  Terminal,
  Briefcase,
  Workflow,
  Sparkles,
  ArrowRight,
  Share2,
  Check,
  FileCode2,
  Layers,
  Network,
  Cpu,
  Zap,
  Activity,
  FolderGit2,
} from "lucide-react";

interface DevHomePageProps {
  isHust?: boolean;
}

export default function DevHomePage({ isHust = false }: DevHomePageProps) {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "workspace" | "workflow">("all");

  const linkPrefix = isHust ? "/api/hust" : "/api/mt";

  const workspaceHomeLink = `${linkPrefix}/workspace/home`;
  const workspaceMarkdownLink = `${linkPrefix}/workspace/markdown`;

  const workflowHomeLink = isHust ? `${linkPrefix}/workflow` : `${linkPrefix}/n8n/home`;
  const workflowSubLink = isHust ? `${linkPrefix}/workflow/laravel` : `${linkPrefix}/n8n/laravel`;

  const getDisplayPath = (link: string) => (link.startsWith("/next") ? link : `/next${link}`);

  // Derive absolute URL (with origin) from the link for reliable sharing
  const getFullUrl = (link: string) => {
    const path = getDisplayPath(link);
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const brandName = isHust ? "Hust Media AI" : "Media Tech AI";

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
    <div className="w-full max-w-7xl xl:max-w-[1400px] mx-auto space-y-4 sm:space-y-4.5 pb-8">
      {/* ========================================================================= */}
      {/* HEADER SECTION                                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-2xs shrink-0">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                Trung Tâm Dev Tools &amp; Automation
              </h1>
              <span className="rounded-md bg-blue-50 border border-blue-200/80 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                {brandName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              Không gian công cụ phát triển: <strong>Workspace</strong> (phiên làm việc &amp; Markdown) và <strong>Workflow</strong> (n8n tự động hóa).
            </p>
          </div>
        </div>

        {/* Quick Filter Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/90 p-1 shadow-2xs text-xs shrink-0">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "all"
                ? "bg-white text-blue-700 shadow-2xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Tất cả (2 Khung)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("workspace")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "workspace"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Workspace
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("workflow")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "workflow"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Workflow
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2 MAIN FRAMES: WORKSPACE & WORKFLOW                                      */}
      {/* ========================================================================= */}
      <div
        className={`grid gap-4 sm:gap-4.5 lg:gap-5 ${
          filterMode === "all" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"
        }`}
      >
        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 1: WORKSPACE                                                      */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "workspace") && (
          <div
            onClick={() => router.push(workspaceHomeLink as Route)}
            title="Nhấp để mở Workspace"
            className="group flex flex-col justify-between rounded-2xl border border-indigo-200/90 bg-white shadow-2xs transition-all hover:border-indigo-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-3 border-b border-indigo-500/30 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      Workspace
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      AI Workspace
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-100 font-medium truncate">
                    Quản trị phiên làm việc &amp; tài liệu Markdown kỹ thuật
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Hoạt động</span>
                </div>
              </div>
            </div>

            {/* Body Description & Highlights */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ thống quản lý không gian làm việc số: Theo dõi các session hoạt động, tạo mới và chỉnh sửa workspace, đồng bộ routing qua API và biên soạn tài liệu Markdown cấu trúc bảng biểu trực quan.
              </p>

              {/* Highlights tags */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Quản trị Workspace & Session">
                  <Layers className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Quản lý Workspace &amp; Session API</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Trình xem Markdown trực quan">
                  <FileCode2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Markdown Visual Viewer &amp; Editor</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Đồng bộ Routing">
                  <Cpu className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Đồng bộ Routing &amp; Proxy linh hoạt</span>
                </div>
              </div>

              {/* Quick Sub-navigation buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={workspaceHomeLink as unknown as Route}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-center rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 transition"
                >
                  Quản Trị Workspace
                </Link>
                <Link
                  href={workspaceMarkdownLink as unknown as Route}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-center rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 transition"
                >
                  Markdown Editor
                </Link>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(workspaceHomeLink, "workspace", "Quản Trị Workspace");
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 sm:py-2 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  copiedKey === "workspace"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-bold shadow-emerald-500/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80"
                }`}
                title="Sao chép toàn bộ liên kết để chia sẻ"
              >
                {copiedKey === "workspace" ? (
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
                href={workspaceHomeLink as unknown as Route}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Workspace</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 2: WORKFLOW                                                       */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "workflow") && (
          <div
            onClick={() => router.push(workflowHomeLink as Route)}
            title="Nhấp để mở Workflow"
            className="group flex flex-col justify-between rounded-2xl border border-cyan-200/90 bg-white shadow-2xs transition-all hover:border-cyan-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-3 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-700 via-teal-600 to-blue-600 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Workflow className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      Workflow
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      n8n Automation
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-100 font-medium truncate">
                    Sơ đồ luồng tự động hóa &amp; giám sát kết nối hệ thống
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Hoạt động</span>
                </div>
              </div>
            </div>

            {/* Body Description & Highlights */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Bản đồ quy trình tự động hóa n8n: Trực quan hóa các pipeline xử lý dữ liệu, theo dõi sơ đồ kết nối realtime giữa backend Laravel, Node.js và các luồng sự kiện phân tán.
              </p>

              {/* Highlights tags */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Sơ đồ n8n Automation">
                  <Network className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Sơ đồ n8n Automation Workflows</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Bản đồ hệ thống realtime">
                  <Activity className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Giám sát Realtime Node.js &amp; Laravel</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Webhooks & Event Triggers">
                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Webhooks &amp; Xử lý Trigger tự động</span>
                </div>
              </div>

              {/* Quick Sub-navigation buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={workflowHomeLink as unknown as Route}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-center rounded-lg border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 px-2.5 py-1.5 text-[11px] font-bold text-cyan-700 transition"
                >
                  Sơ Đồ n8n
                </Link>
                <Link
                  href={workflowSubLink as unknown as Route}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-center rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100 px-2.5 py-1.5 text-[11px] font-bold text-teal-700 transition"
                >
                  Backend Luồng
                </Link>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(workflowHomeLink, "workflow", "Sơ Đồ n8n Workflow");
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 sm:py-2 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  copiedKey === "workflow"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-bold shadow-emerald-500/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80"
                }`}
                title="Sao chép toàn bộ liên kết để chia sẻ"
              >
                {copiedKey === "workflow" ? (
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
                href={workflowHomeLink as unknown as Route}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-700 via-teal-600 to-blue-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Workflow</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}
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
