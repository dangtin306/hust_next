"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  Video,
  Sparkles,
  ArrowRight,
  Share2,
  Check,
  Mic2,
  Radio,
  Play,
  Film,
  Camera,
  Layers,
  Wand2,
  Clock,
  ScanFace,
  Target,
  Cpu,
  ExternalLink,
} from "lucide-react";

interface MediaHomePageProps {
  isHust?: boolean;
}

export default function MediaHomePage({ isHust = false }: MediaHomePageProps) {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "heygen" | "voice" | "image">("all");

  const linkPrefix = isHust ? "/api/hust" : "/api/mt";

  const heygenHomeLink = `${linkPrefix}/media/heygen/home`;
  const heygenVideoLink = `${linkPrefix}/media/heygen/video`;
  const heygenLiveLink = `${linkPrefix}/media/heygen/live`;

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
      {/* HEADER SECTION (Slim & Balanced)                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xs shrink-0">
            <Film className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                Trung Tâm AI Media &amp; Studio
              </h1>
              <span className="rounded-md bg-purple-50 border border-purple-200/80 px-1.5 py-0.2 text-[10px] font-bold text-purple-700">
                {brandName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              Không gian sáng tạo MC ảo, sản xuất video tự động và giải pháp media trí tuệ nhân tạo.
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
                ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("heygen")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "heygen"
                ? "bg-purple-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            MC Ảo
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("voice")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "voice"
                ? "bg-slate-800 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            AI Voice
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("image")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterMode === "image"
                ? "bg-slate-800 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            AI Image
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 MEDIA FRAMES (Khung HeyGen Studio, AI Voice, AI Visual)                */}
      {/* ========================================================================= */}
      <div
        className={`grid gap-4 sm:gap-4.5 lg:gap-5 ${
          filterMode === "all" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 max-w-2xl mx-auto"
        }`}
      >
        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 1: HEYGEN STUDIO (Active & Core)                                  */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "heygen") && (
          <div
            onClick={() => router.push(heygenHomeLink as Route)}
            title="Nhấp để mở Studio MC Ảo"
            className="group flex flex-col justify-between rounded-2xl border border-purple-200/90 bg-white shadow-2xs transition-all hover:border-purple-400 hover:shadow-md cursor-pointer overflow-hidden active:scale-[0.995]"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between gap-3 border-b border-purple-500/30 bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-600 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white transition-all group-hover:brightness-105">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner border border-white/30 shrink-0 group-hover:scale-105 transition-transform">
                  <Video className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      MC Ảo
                    </h2>
                    <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                      AI Studio
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-100 font-medium truncate">
                    Tạo video MC ảo &amp; Live Avatar streaming
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
                Nền tảng sinh video MC kĩ thuật số: Chọn avatar, giọng đọc tiếng Việt hoặc đa ngôn ngữ, gửi kịch bản để tạo video MP4 sắc nét hoặc tương tác trực tiếp với Live Avatar qua WebRTC.
              </p>

              {/* Highlights tags */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Tạo Video MC ảo từ văn bản">
                  <Play className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Biến kịch bản thành Video MP4</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Tương tác Live Avatar">
                  <Radio className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Live Avatar tương tác thời gian thực</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0" title="Thư viện nhân vật & Giọng đọc phong phú">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">100+ Avatars &amp; Đa ngôn ngữ</span>
                </div>
              </div>

              {/* Quick Sub-navigation buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={heygenVideoLink as unknown as Route}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-center rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 transition"
                >
                  Tạo Video
                </Link>
                <Link
                  href={heygenLiveLink as unknown as Route}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-center rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 transition"
                >
                  Live Avatar
                </Link>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(heygenHomeLink, "heygen", "HeyGen Studio");
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 sm:py-2 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  copiedKey === "heygen"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-bold shadow-emerald-500/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80"
                }`}
                title="Sao chép toàn bộ liên kết để chia sẻ"
              >
                {copiedKey === "heygen" ? (
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
                href={heygenHomeLink as unknown as Route}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs hover:brightness-105 transition-all hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
              >
                <span>Mở MC Ảo</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 2: AI VOICE & AUDIO LAB (Coming Soon)                             */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "voice") && (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/80 shadow-2xs overflow-hidden opacity-90 hover:opacity-100 transition-all">
            {/* Header banner */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-700/30 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md shadow-inner border border-white/20 shrink-0">
                  <Mic2 className="h-5 w-5 text-slate-200" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      AI Voice &amp; TTS
                    </h2>
                    <span className="rounded bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Sắp có
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">
                    Âm thanh &amp; nhân bản giọng nói AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-300">
                  Phase 2
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Phòng thu tổng hợp âm thanh trí tuệ nhân tạo: Chuyển kịch bản thành giọng đọc truyền cảm, sao chép mẫu âm thanh (Voice Cloning) và tự động lồng tiếng cho video.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <Mic2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">TTS đa cảm xúc &amp; sắc thái</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <Sparkles className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Nhân bản giọng nói (Voice Cloning)</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Xử lý lọc nhiễu &amp; Mastering</span>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 text-center text-xs text-slate-500">
                Đang tích hợp API mô hình giọng đọc chuyên sâu
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5 flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-slate-400">Dự kiến phát hành quý tiếp theo</span>
              <button
                type="button"
                disabled
                className="rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
              >
                Đang chuẩn bị
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* KHUNG 3: AI IMAGE (YOLO & InsightFace)                                  */}
        {/* ----------------------------------------------------------------------- */}
        {(filterMode === "all" || filterMode === "image") && (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/80 shadow-2xs overflow-hidden opacity-90 hover:opacity-100 transition-all">
            {/* Header banner */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-700/30 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-4 py-3 sm:px-4.5 sm:py-3.5 text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md shadow-inner border border-white/20 shrink-0">
                  <ScanFace className="h-5 w-5 text-slate-200" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                      AI Image
                    </h2>
                    <span className="rounded bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Sắp có
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">
                    Thị giác máy tính: YOLO &amp; InsightFace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-300">
                  Phase 2
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Nền tảng thị giác máy tính và xử lý hình ảnh thông minh: Tích hợp YOLO phát hiện đối tượng đa lớp thời gian thực và InsightFace chuyên sâu cho nhận diện, so khớp và phân tích khuôn mặt.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <Target className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Mô hình YOLO: Phát hiện đối tượng &amp; Bounding Box realtime</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <ScanFace className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">InsightFace: Nhận diện, so khớp &amp; trích xuất đặc trưng khuôn mặt</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <Cpu className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">Inference tốc độ cao &amp; API trích xuất dữ liệu đa phương tiện</span>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 text-center text-xs text-slate-500">
                Đang chuẩn bị mô hình YOLOv11 &amp; InsightFace Model Zoo
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5 flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-slate-400">Dự kiến phát hành quý tiếp theo</span>
              <button
                type="button"
                disabled
                className="rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
              >
                Đang chuẩn bị
              </button>
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
