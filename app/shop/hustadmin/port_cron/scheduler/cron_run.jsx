"use client";

import React, { useEffect, useState } from "react";
import {
  Play,
  Copy,
  X,
  Clock,
  Terminal,
  Globe,
  Loader2,
  FolderTree,
  AlertCircle,
  Zap,
} from "lucide-react";

const Cron_run = ({ showrun, setshowrun, selectedCron, onRun, isDuplicate = false }) => {
  const [running, setRunning] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showrun) {
        setshowrun(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showrun, setshowrun]);

  const closeRun = () => {
    setshowrun(false);
  };

  const handleRun = async (event) => {
    event.preventDefault();
    setRunning(1);

    try {
      await onRun?.();
    } finally {
      setRunning(0);
    }
  };

  if (!showrun || !selectedCron) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-5 py-4 ${
            isDuplicate
              ? "bg-violet-50/80 border-violet-200"
              : "bg-emerald-50/80 border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs text-white ${
                isDuplicate ? "bg-violet-600" : "bg-emerald-600"
              }`}
            >
              {isDuplicate ? (
                <Copy className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 fill-white" />
              )}
            </div>
            <div>
              <h3 className="m-0 text-base font-bold text-slate-900 sm:text-lg">
                {isDuplicate ? "Duplicate Cron Job" : "Chạy Thử Tác Vụ Cron"}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <FolderTree className="h-3 w-3" />
                <span>{selectedCron?.category_name || selectedCron?.category_key || "Category"}</span>
                <span>/</span>
                <span className="font-semibold text-slate-700">
                  {selectedCron?.topic_name || selectedCron?.topic_key || "Topic"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeRun}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs sm:text-sm text-blue-900">
            <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {isDuplicate
                  ? "Tạo bản sao độc lập của tiến trình"
                  : "Gửi tín hiệu kích hoạt thủ công"}
              </span>
              <p className="mt-0.5 text-xs text-blue-700 leading-relaxed">
                {isDuplicate
                  ? "Tiến trình sẽ được nhân bản với cùng cấu hình vào nhóm hiện tại."
                  : "Lệnh chạy thử sẽ được server xử lý ngay lập tức độc lập với chu kỳ tự động."}
              </p>
            </div>
          </div>

          {/* Job Details Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">Tên Cron Job:</span>
              <span className="font-bold text-slate-900 sm:text-right">
                {selectedCron?.name_cron || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">Mã Task:</span>
              <code className="rounded bg-white px-2 py-0.5 font-mono text-purple-700 border border-slate-200 text-xs">
                {selectedCron?.task_cron || "-"}
              </code>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">Chu kỳ / Lịch:</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {selectedCron?.at_time_cron
                  ? `At: ${selectedCron.at_time_cron}`
                  : selectedCron?.interval_seconds
                  ? `Mỗi ${selectedCron.interval_seconds}s`
                  : "-"}
              </span>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                {selectedCron?.url_cron ? (
                  <>
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span>URL Nguồn:</span>
                  </>
                ) : (
                  <>
                    <Terminal className="h-3.5 w-3.5 text-sky-600" />
                    <span>Lệnh Thực Thi:</span>
                  </>
                )}
              </span>
              <div className="rounded-lg bg-white p-2 font-mono text-xs text-slate-800 border border-slate-200 break-all max-h-20 overflow-y-auto">
                {selectedCron?.url_cron || selectedCron?.command_cron || "Không có lệnh cụ thể"}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={closeRun}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Đóng
            </button>

            <button
              type="button"
              disabled={running === 1}
              onClick={handleRun}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md transition disabled:opacity-50 ${
                isDuplicate
                  ? "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              }`}
            >
              {running === 1 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : isDuplicate ? (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Xác nhận Duplicate</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Kích hoạt Chạy Thử</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cron_run;
