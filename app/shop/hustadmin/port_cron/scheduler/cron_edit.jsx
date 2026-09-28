"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Edit3,
  Plus,
  Trash2,
  Clock,
  Terminal,
  Globe,
  Tag,
  AlertTriangle,
  Check,
  Loader2,
  Sliders,
  FolderTree,
} from "lucide-react";

const Cron_edit = ({
  showedit,
  setshowedit,
  selectedCron,
  onSave,
  onDelete,
  isCreate = false,
  isDelete = false,
  isDuplicate = false,
}) => {
  const [nutxuly, setNutxuly] = useState(0);
  const [itemCronEdit, setItemCronEdit] = useState({});

  useEffect(() => {
    if (!selectedCron) return;

    const selectorFields = new Set([
      "category_key",
      "category_name",
      "topic_key",
      "topic_name",
      "__categoryIndex",
      "__topicIndex",
      "__jobIndex",
    ]);
    const initialCron = Object.fromEntries(
      Object.entries(selectedCron).filter(([key]) => !selectorFields.has(key))
    );
    setItemCronEdit(initialCron);
  }, [selectedCron]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showedit) {
        setshowedit(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showedit, setshowedit]);

  const exitedit = () => {
    setshowedit(false);
  };

  const hamcancode = (key, value) => {
    setItemCronEdit((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggle = (key) => {
    setItemCronEdit((prev) => ({
      ...prev,
      [key]: !Boolean(prev?.[key]),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNutxuly(1);

    try {
      if (isDelete) {
        await onDelete?.();
      } else {
        await onSave?.(itemCronEdit);
      }
    } finally {
      setNutxuly(0);
    }
  };

  if (!showedit || !selectedCron) return null;

  const booleanRows = [
    {
      key: "cron_status",
      label: "Trạng thái hoạt động",
      desc: "Bật hoặc tắt job",
    },
    {
      key: "cron_show",
      label: "Hiển thị công khai",
      desc: "Cho phép show cron",
    },
    {
      key: "cron_single",
      label: "Đơn luồng (Single)",
      desc: "Tránh chạy trùng lặp",
    },
    {
      key: "run_on_start_cron",
      label: "Run on Start",
      desc: "Kích hoạt khi server bật",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-5 py-4 ${
            isDelete
              ? "bg-rose-50/80 border-rose-200"
              : isCreate
              ? "bg-emerald-50/80 border-emerald-200"
              : "bg-sky-50/80 border-sky-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs text-white ${
                isDelete
                  ? "bg-rose-600"
                  : isCreate
                  ? "bg-emerald-600"
                  : "bg-blue-600"
              }`}
            >
              {isDelete ? (
                <Trash2 className="h-5 w-5" />
              ) : isCreate ? (
                <Plus className="h-5 w-5" />
              ) : (
                <Edit3 className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="m-0 text-base font-bold text-slate-900 sm:text-lg">
                {isDelete
                  ? "Xác nhận xoá Cron Job"
                  : isDuplicate
                  ? "Duplicate Cron Job"
                  : isCreate
                  ? "Tạo Cron Job Mới"
                  : "Chỉnh Sửa Cron Job"}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <FolderTree className="h-3 w-3" />
                <span>
                  {selectedCron?.category_name || selectedCron?.category_key || "Category"}
                </span>
                <span>/</span>
                <span className="font-semibold text-slate-700">
                  {selectedCron?.topic_name || selectedCron?.topic_key || "Topic"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={exitedit}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {isDelete ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-rose-900 text-sm">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Cảnh báo xoá dữ liệu</div>
                  <div className="text-xs text-rose-700 mt-1 leading-relaxed">
                    Bạn có chắc chắn muốn xoá cron job này không? Hành động này sẽ loại bỏ tiến trình khỏi hệ thống scheduler.
                  </div>
                </div>
              </div>

              {/* Target Details Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Tên Cron:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedCron?.name_cron || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Mã Task:</span>
                  <code className="rounded bg-white px-2 py-0.5 font-mono text-purple-700 border border-slate-200 text-xs">
                    {selectedCron?.task_cron || "-"}
                  </code>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Loại / Type:</span>
                  <span className="font-medium text-slate-700 uppercase text-xs">
                    {selectedCron?.cron_tyoe || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Nguồn lệnh / URL:</span>
                  <span className="text-slate-700 break-all max-w-[60%] text-right font-mono text-xs">
                    {selectedCron?.url_cron || selectedCron?.command_cron || "-"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* General Info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Tên Cron Job *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Kiểm tra trạng thái máy chủ"
                    value={itemCronEdit?.name_cron || ""}
                    onChange={(e) => hamcancode("name_cron", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Mã Task Cron (Key) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: check_server_status"
                    value={itemCronEdit?.task_cron || ""}
                    onChange={(e) => hamcancode("task_cron", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-purple-700 placeholder-slate-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-100 transition"
                  />
                </div>
              </div>

              {/* Timing & Type */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Chu kỳ (Giây)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="VD: 60"
                      value={itemCronEdit?.interval_seconds ?? ""}
                      onChange={(e) => hamcancode("interval_seconds", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition"
                    />
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Thời gian chạy (At Time)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 08:30 hoặc 23:00"
                    value={itemCronEdit?.at_time_cron || ""}
                    onChange={(e) => hamcancode("at_time_cron", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Loại Cron (Type)
                  </label>
                  <select
                    value={itemCronEdit?.cron_tyoe || ""}
                    onChange={(e) => hamcancode("cron_tyoe", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition"
                  >
                    <option value="">Tự chọn / Mặc định</option>
                    <option value="internal">internal (Nội bộ)</option>
                    <option value="powershell">powershell (CLI/Script)</option>
                    <option value="url">url (HTTP Request)</option>
                  </select>
                </div>
              </div>

              {/* Execution Commands & URL */}
              <div className="space-y-3">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Đường dẫn gọi URL (url_cron)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: https://api.domain.com/webhook/cron"
                    value={itemCronEdit?.url_cron || ""}
                    onChange={(e) => hamcancode("url_cron", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <Terminal className="h-3.5 w-3.5 text-sky-600" />
                    <span>Lệnh thực thi (command_cron)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: python D:\server\check.py"
                    value={itemCronEdit?.command_cron || ""}
                    onChange={(e) => hamcancode("command_cron", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-100 transition"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Thời gian Timeout (Giây)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 30"
                    value={itemCronEdit?.cron_timeout_seconds ?? ""}
                    onChange={(e) => hamcancode("cron_timeout_seconds", e.target.value)}
                    className="w-full sm:w-1/3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              {/* Boolean Toggles */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Cờ cấu hình &amp; Trạng thái</span>
                </label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {booleanRows.map((field) => {
                    const isChecked = Boolean(itemCronEdit?.[field.key]);
                    return (
                      <button
                        key={field.key}
                        type="button"
                        onClick={() => handleToggle(field.key)}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                          isChecked
                            ? "border-emerald-300 bg-emerald-50/70 shadow-xs"
                            : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60"
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-bold ${isChecked ? "text-emerald-900" : "text-slate-700"}`}>
                            {field.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {field.desc}
                          </div>
                        </div>

                        {/* Modern Switch UI */}
                        <div
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            isChecked ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isChecked ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={exitedit}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={nutxuly === 1}
              className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md transition disabled:opacity-50 ${
                isDelete
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                  : isCreate
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
              }`}
            >
              {nutxuly === 1 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : isDelete ? (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Xác nhận xoá</span>
                </>
              ) : isCreate ? (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Tạo Cron Mới</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cron_edit;
