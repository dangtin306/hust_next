"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  Bot,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Activity,
  Briefcase,
  Code2,
  Workflow,
  Share2,
  GitBranch,
  ShieldAlert,
  Users,
} from "lucide-react";

interface ChatBotHomeProps {
  isHust?: boolean;
}

export default function ChatBotHome({ isHust = false }: ChatBotHomeProps) {
  const router = useRouter();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "manage" | "test" | "public">("all");

  // Client-side Link routing prefix (Next.js automatically adds basePath /next)
  const linkPrefix = isHust ? "/api/hust" : "/api/mt";
  const chatManageLink = `${linkPrefix}/chat/manage`;
  const chatMessagesLink = `${linkPrefix}/chat/messages`;
  const chatTestLink = `${linkPrefix}/chat/test`;
  const chatPublicLink = `${linkPrefix}/chat/public`;
  const workspaceLink = `${linkPrefix}/workspace/home`;
  const apiListLink = `${linkPrefix}/list/home`;
  const workflowLink = isHust ? `${linkPrefix}/workflow` : `${linkPrefix}/n8n/home`;

  // Display & copy URI (includes basePath /next)
  const displayPrefix = isHust ? "/next/api/hust" : "/next/api/mt";
  const chatManageUrl = `${displayPrefix}/chat/manage`;
  const chatMessagesUrl = `${displayPrefix}/chat/messages`;
  const chatTestUrl = `${displayPrefix}/chat/test`;
  const chatPublicUrl = `${displayPrefix}/chat/public`;

  const brandName = isHust ? "Hust Media AI" : "Media Tech AI";

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  return (
    <div className="w-full max-w-7xl xl:max-w-[1400px] mx-auto space-y-4 sm:space-y-4.5 pb-8">
      {/* ========================================================================= */}
      {/* HEADER SECTION (Slim & Balanced)                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xs shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                Trung Tâm AI Chat Bot
              </h1>
              <span className="rounded-md bg-blue-50 border border-blue-200/80 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                {brandName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              Không gian làm việc: <strong>Quản Trị</strong>, <strong>Chat Test</strong> (kiểm thử) &amp; <strong>Chat Public</strong> (người dùng).
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
            Tất cả (3 Khung)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("manage")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "manage"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Quản lý
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("test")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "test"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Chat Test
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("public")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "public"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Chat Public
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 MAIN CHAT FRAMES (Quản lý để đầu đi, Chat Test, Chat Public)            */}
      {/* ========================================================================= */}
      <div
        className={`grid gap-4 sm:gap-4.5 lg:gap-5 ${
          filterMode === "all" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 max-w-2xl mx-auto"
        }`}
      >
        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 1: QUẢN TRỊ CHAT BOT (Placed FIRST - "để đầu đi")                 */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "manage") && (
          <div
            onClick={() => router.push(chatManageLink as Route)}
            title="Nhấp để mở Quản Trị Chat Bot"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-indigo-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-3 border-b border-indigo-500/30 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      Quản Trị Chat Bot
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      Quản trị
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-100 font-medium truncate">
                    KPI, User, Session &amp; Room Inspector
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Sẵn sàng</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 sm:p-4.5 space-y-3">
              {/* Path & Copy bar */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs">
                <span className="text-[11px] text-slate-500 font-medium shrink-0">Đường dẫn:</span>
                <code className="font-mono text-[11px] text-indigo-700 font-semibold truncate flex-1">
                  {chatManageUrl}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(chatManageUrl);
                  }}
                  className="flex items-center gap-1 rounded-md border border-slate-200/90 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 px-2 py-0.5 text-slate-500 transition cursor-pointer shrink-0 shadow-2xs text-[10px] font-medium"
                  title="Sao chép URI"
                >
                  {copiedText === chatManageUrl ? (
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
              <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                Bảng điều khiển quản trị trung tâm: theo dõi thống kê người dùng, kiểm soát phiên làm việc (sessions), rà soát danh sách phòng chat và phân quyền/khóa tài khoản theo thời gian thực.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Thống Kê Tổng Quan">
                  <Users className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Thống Kê Tổng Quan</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Kiểm Soát Sessions">
                  <Layers className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Kiểm Soát Sessions</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Tra Cứu Phòng Chat">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Tra Cứu Phòng Chat</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Khóa / Mở Tài Khoản">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Khóa / Mở Tài Khoản</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(typeof window !== "undefined" ? `${window.location.origin}${chatManageUrl}` : chatManageUrl);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-100/80 transition-all cursor-pointer shadow-2xs"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">Sao chép Link</span>
                <span className="sm:hidden">Share</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={chatMessagesLink as unknown as Route}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Messages</span>
                </Link>

                <Link
                  href={chatManageLink as unknown as Route}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
                >
                  <span>Mở Quản Lý</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 2: CHAT TEST                                                      */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "test") && (
          <div
            onClick={() => router.push(chatTestLink as Route)}
            title="Nhấp để mở Chat Test"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-blue-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-3 border-b border-blue-500/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      Chat Test
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      Môi trường Test
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium truncate">
                    Kiểm thử AI Bot, Prompt &amp; Session Laravel
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Sẵn sàng</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 sm:p-4.5 space-y-3">
              {/* Path & Copy bar */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs">
                <span className="text-[11px] text-slate-500 font-medium shrink-0">Đường dẫn:</span>
                <code className="font-mono text-[11px] text-blue-700 font-semibold truncate flex-1">
                  {chatTestUrl}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(chatTestUrl);
                  }}
                  className="flex items-center gap-1 rounded-md border border-slate-200/90 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-2 py-0.5 text-slate-500 transition cursor-pointer shrink-0 shadow-2xs text-[10px] font-medium"
                  title="Sao chép URI"
                >
                  {copiedText === chatTestUrl ? (
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
              <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                Không gian làm việc chuyên sâu cho developer &amp; tester: kết nối trực tiếp OpenClaw Gateway, theo dõi streaming token, đồng bộ session và quản lý lịch sử phòng chat Laravel.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="OpenClaw AI Gateway">
                  <Cpu className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">OpenClaw AI Gateway</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Đồng Bộ Session & Room">
                  <Layers className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Đồng Bộ Session &amp; Room</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Streaming Phản Hồi">
                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Streaming Phản Hồi</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Gỡ Lỗi & Tool Calls">
                  <Activity className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Gỡ Lỗi &amp; Tool Calls</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(typeof window !== "undefined" ? `${window.location.origin}${chatTestUrl}` : chatTestUrl);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-100/80 transition-all cursor-pointer shadow-2xs"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">Sao chép Link</span>
                <span className="sm:hidden">Share</span>
              </button>

              <Link
                href={chatTestLink as unknown as Route}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Chat Test</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 3: CHAT PUBLIC                                                    */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "public") && (
          <div
            onClick={() => router.push(chatPublicLink as Route)}
            title="Nhấp để mở Chat Public"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-emerald-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-3 border-b border-emerald-500/30 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      Chat Public
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      Giao diện Public
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 font-medium truncate">
                    Giao diện trò chuyện tinh gọn cho người dùng cuối
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Sẵn sàng</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 sm:p-4.5 space-y-3">
              {/* Path & Copy bar */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs">
                <span className="text-[11px] text-slate-500 font-medium shrink-0">Đường dẫn:</span>
                <code className="font-mono text-[11px] text-emerald-700 font-semibold truncate flex-1">
                  {chatPublicUrl}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(chatPublicUrl);
                  }}
                  className="flex items-center gap-1 rounded-md border border-slate-200/90 bg-white hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 px-2 py-0.5 text-slate-500 transition cursor-pointer shrink-0 shadow-2xs text-[10px] font-medium"
                  title="Sao chép URI"
                >
                  {copiedText === chatPublicUrl ? (
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
              <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                Giao diện tinh giản, thân thiện và bảo mật: ẩn toàn bộ cấu hình kỹ thuật, tối ưu hóa tốc độ tải trang, lưu trữ phiên riêng biệt và tương thích hoàn hảo mọi kích thước màn hình.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Thân Thiện & An Toàn">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Thân Thiện &amp; An Toàn</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Tối Ưu Trải Nghiệm">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Tối Ưu Trải Nghiệm</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Khôi Phục Hội Thoại">
                  <Layers className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Khôi Phục Hội Thoại</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Tốc Độ Phản Hồi Cao">
                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Tốc Độ Phản Hồi Cao</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(typeof window !== "undefined" ? `${window.location.origin}${chatPublicUrl}` : chatPublicUrl);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-100/80 transition-all cursor-pointer shadow-2xs"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">Sao chép Link</span>
                <span className="sm:hidden">Share</span>
              </button>

              <Link
                href={chatPublicLink as unknown as Route}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Chat Public</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* QUICK SHORTCUTS BAR (Slim & Compact)                                      */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Liên kết nhanh:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={workspaceLink as unknown as Route}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
            >
              <Briefcase className="h-3.5 w-3.5 text-slate-500" />
              <span>Workspace</span>
            </Link>

            <Link
              href={apiListLink as unknown as Route}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
            >
              <Code2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Danh Sách API</span>
            </Link>

            <Link
              href={workflowLink as unknown as Route}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
            >
              <Workflow className="h-3.5 w-3.5 text-slate-500" />
              <span>Workflow</span>
            </Link>

            <Link
              href={`${linkPrefix}/git/home` as unknown as Route}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
            >
              <GitBranch className="h-3.5 w-3.5 text-slate-500" />
              <span>Git Auto</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
