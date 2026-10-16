"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Server,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Bot,
  Briefcase,
  Boxes,
} from "lucide-react";

interface ApiListHomeProps {
  isHust?: boolean;
}

export default function ApiListHome({ isHust = false }: ApiListHomeProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "laravel" | "openclaw">("all");

  const basePrefix = isHust ? "/next/api/hust" : "/next/api/mt";
  const laravelUrl = `${basePrefix}/list/laravel`;
  const openclawUrl = `${basePrefix}/list/openclaw`;
  const workspaceUrl = `${basePrefix}/workspace/home`;
  const chatTestUrl = `${basePrefix}/chat_test`;
  const laravelHost = isHust ? "laravel.hust.media" : "laravel_mt.hust.media";

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const laravelEndpoints = [
    { method: "POST", path: "/api/chat/bot/messages", desc: "Lưu & phản hồi tin nhắn chat bot" },
    { method: "GET", path: "/api/chat/bot/rooms", desc: "Danh sách phòng chat" },
    { method: "GET", path: "/api/workspaces/main/data", desc: "Dữ liệu danh sách Workspace" },
  ];

  const openclawEndpoints = [
    { method: "POST", path: "/v1/responses", desc: "Lượt gọi AI tạo phản hồi văn bản" },
    { method: "GET", path: "/v1/conversations", desc: "Quản lý ngữ cảnh hội thoại" },
    { method: "POST", path: "/v1/model/switch", desc: "Chuyển đổi mô hình AI" },
  ];

  return (
    <div className="w-full space-y-3.5">
      {/* ========================================================================= */}
      {/* SLIM HEADER SECTION                                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-2xs shrink-0">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
              Danh Sách API Hệ Thống (API List)
            </h1>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              Tra cứu và mở nhanh 2 hệ thống API: Laravel Backend REST API và OpenClaw AI Gateway.
            </p>
          </div>
        </div>

        {/* Quick Filter Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/90 p-1 shadow-2xs text-xs shrink-0">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "all"
                ? "bg-white text-blue-700 shadow-2xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Tất cả (2 Khung)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("laravel")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "laravel"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Laravel
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("openclaw")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "openclaw"
                ? "bg-purple-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            OpenClaw
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2 MAIN COMPACT API FRAMES                                                */}
      {/* ========================================================================= */}
      <div className={`grid gap-4 ${filterMode === "all" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 1: LARAVEL BACKEND API                                            */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "laravel") && (
          <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-blue-300 hover:shadow-sm overflow-hidden">
            {/* Clickable Frame Header - Direct entry to Swagger */}
            <Link
              href={laravelUrl as unknown as Route}
              title="Nhấp để mở Swagger Laravel"
              className="group/hdr flex items-center justify-between gap-3 border-b border-blue-500/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-4 py-3 text-white transition-all hover:brightness-105 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover/hdr:scale-105 transition-transform">
                  <Server className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold tracking-tight text-white truncate">
                      Laravel REST API
                    </h2>
                    <span className="rounded-md bg-white/20 border border-white/30 px-1.5 py-0.2 text-[10px] font-bold text-white tracking-wide uppercase">
                      v1.0
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium truncate">
                    Backend Chat Sessions & Quản trị Workspace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all group-hover/hdr:bg-white group-hover/hdr:text-blue-700 shadow-2xs">
                  <span>Mở Swagger</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover/hdr:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Frame Body */}
            <div className="flex-1 p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 gap-2 pb-1.5 border-b border-slate-100">
                <span>Host: <strong className="font-mono text-blue-700">{laravelHost}</strong></span>
                <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">REST JSON</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                Hệ thống Backend chịu trách nhiệm quản lý phiên làm việc của Chat Bot, lưu trữ lịch sử phòng chat (Rooms) và đồng bộ Workspace dự án.
              </p>

              {/* Endpoints List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>Endpoint Tiêu Biểu</span>
                  <span className="text-[10px] text-blue-600 font-semibold">3 endpoint chính</span>
                </div>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden text-xs">
                  {laravelEndpoints.map((ep) => (
                    <div
                      key={ep.path}
                      className="flex items-center justify-between px-3 py-2 hover:bg-white transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono shrink-0 ${
                            ep.method === "GET"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {ep.method}
                        </span>
                        <code className="font-mono font-semibold text-slate-800 truncate text-[11px]">
                          {ep.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 hidden sm:inline truncate max-w-[140px]">{ep.desc}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ep.path)}
                          title="Sao chép endpoint"
                          className="flex items-center gap-1 rounded-lg border border-slate-200/60 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-2 py-1 text-slate-400 transition cursor-pointer shadow-2xs"
                        >
                          {copiedText === ep.path ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-[10px] font-bold text-emerald-600">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[10px] font-medium hidden md:inline">Chép</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Frame Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/90 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <Link
                href={workspaceUrl as unknown as Route}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100/80 transition-all hover:scale-[1.01] active:scale-95 shadow-2xs"
              >
                <Briefcase className="h-4 w-4 text-slate-500" />
                <span>Quản trị Workspace</span>
              </Link>

              <Link
                href={laravelUrl as unknown as Route}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Swagger Laravel</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 2: OPENCLAW AI GATEWAY API                                        */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "openclaw") && (
          <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-purple-300 hover:shadow-sm overflow-hidden">
            {/* Clickable Frame Header - Direct entry to Swagger */}
            <Link
              href={openclawUrl as unknown as Route}
              title="Nhấp để mở Swagger OpenClaw"
              className="group/hdr flex items-center justify-between gap-3 border-b border-purple-500/30 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-4 py-3 text-white transition-all hover:brightness-105 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover/hdr:scale-105 transition-transform">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold tracking-tight text-white truncate">
                      OpenClaw AI Gateway
                    </h2>
                    <span className="rounded-md bg-white/20 border border-white/30 px-1.5 py-0.2 text-[10px] font-bold text-white tracking-wide uppercase">
                      OpenAPI 3.0
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-100 font-medium truncate">
                    Cổng kết nối AI Đa Mô Hình & Dịch Vụ Thông Minh
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all group-hover/hdr:bg-white group-hover/hdr:text-purple-700 shadow-2xs">
                  <span>Mở Swagger</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover/hdr:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Frame Body */}
            <div className="flex-1 p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 gap-2 pb-1.5 border-b border-slate-100">
                <span>Cổng: <strong className="font-mono text-purple-700">Codex Gateway (:8818)</strong></span>
                <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">OpenAI Compatible</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                Cổng API AI đa mô hình kết nối LLM, lưu trữ ngữ cảnh hội thoại bền vững (Conversations), thực thi lượt gọi AI (Responses) và đa phương tiện.
              </p>

              {/* Endpoints List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>Endpoint Tiêu Biểu</span>
                  <span className="text-[10px] text-purple-600 font-semibold">3 endpoint chính</span>
                </div>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden text-xs">
                  {openclawEndpoints.map((ep) => (
                    <div
                      key={ep.path}
                      className="flex items-center justify-between px-3 py-2 hover:bg-white transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono shrink-0 ${
                            ep.method === "GET"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-purple-100 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {ep.method}
                        </span>
                        <code className="font-mono font-semibold text-slate-800 truncate text-[11px]">
                          {ep.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 hidden sm:inline truncate max-w-[140px]">{ep.desc}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ep.path)}
                          title="Sao chép endpoint"
                          className="flex items-center gap-1 rounded-lg border border-slate-200/60 bg-white hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 px-2 py-1 text-slate-400 transition cursor-pointer shadow-2xs"
                        >
                          {copiedText === ep.path ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-[10px] font-bold text-emerald-600">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[10px] font-medium hidden md:inline">Chép</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Frame Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/90 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <Link
                href={chatTestUrl as unknown as Route}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100/80 transition-all hover:scale-[1.01] active:scale-95 shadow-2xs"
              >
                <Bot className="h-4 w-4 text-purple-600" />
                <span>Thử Chat Bot</span>
              </Link>

              <Link
                href={openclawUrl as unknown as Route}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md hover:from-violet-700 hover:to-purple-700 transition-all hover:scale-[1.02] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở Swagger OpenClaw</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
