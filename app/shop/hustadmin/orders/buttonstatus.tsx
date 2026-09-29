"use client";

import React, { useEffect, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import { AlertTriangle, XCircle, Eye, EyeOff } from "lucide-react";

const translations: Record<string, Record<string, string>> = {
  vi: {
    processing: "Đang xử lý",
    completed: "Hoàn tất",
    show: "Đang hiện",
    inProgress: "Đang chạy",
    processingError: "Chờ hoàn tiền",
    failed: "Thất bại",
    hide: "Đã ẩn",
    other: "Khác",
  },
  en: {
    processing: "Processing",
    completed: "Completed",
    show: "Showing",
    inProgress: "In progress",
    processingError: "Awaiting refund",
    failed: "Canceled",
    hide: "Hidden",
    other: "Other",
  },
};

const getNationalMarket = () => {
  if (typeof document === "undefined") return "vi";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("national_market="));
  const val = match ? decodeURIComponent(match.split("=")[1]) : "vi";
  return val === "en" ? "en" : "vi";
};

export default function StatusBadge({ status }: { status?: string }) {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  useEffect(() => {
    setLang(getNationalMarket());
  }, []);

  const t = translations[lang] || translations.vi;
  const normalized = String(status || "").trim();

  if (normalized === "xuly" || normalized === "Pending" || normalized === "Processing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-2xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        {t.processing}
      </span>
    );
  } else if (normalized === "hoantat" || normalized === "thanhcong" || normalized === "Completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
        <AiFillCheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        {t.completed}
      </span>
    );
  } else if (normalized === "show") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
        <Eye className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        {t.show}
      </span>
    );
  } else if (normalized === "In progress") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-300 shadow-2xs">
        <FaSpinner className="animate-spin h-3.5 w-3.5 text-purple-600 shrink-0" />
        {t.inProgress}
      </span>
    );
  } else if (normalized === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span>{t.processingError}</span>
      </span>
    );
  } else if (normalized === "thatbai" || normalized === "Canceled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
        <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
        {t.failed}
      </span>
    );
  } else if (normalized === "hide") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
        <EyeOff className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        {t.hide}
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
        {normalized || t.other}
      </span>
    );
  }
}
