"use client";

import React, { useEffect, useState } from "react";
import { Edit3, Plus, Trash2, X, Sparkles, Loader2, AlertTriangle, Power } from "lucide-react";

const Port_edit = ({
  showedit,
  setshowedit,
  selectedPort,
  onSave,
  onDelete,
  isCreate = false,
  isDelete = false,
}) => {
  const [nutxuly, setNutxuly] = useState(0);
  const [nutorder, setNutorder] = useState("Lưu thay đổi");
  const [itemPortEdit, setItemPortEdit] = useState({});

  useEffect(() => {
    setItemPortEdit(selectedPort ? { ...selectedPort } : { port_status: true });
  }, [selectedPort, isCreate]);

  const handleChange = (key, value) =>
    setItemPortEdit((current) => ({ ...current, [key]: value }));

  const handleToggle = (key) =>
    setItemPortEdit((current) => ({ ...current, [key]: !Boolean(current?.[key]) }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNutxuly(1);
    setNutorder("Đang xử lý...");
    const payload = isCreate
      ? {
          port_name: itemPortEdit?.port_name || "",
          port_note: itemPortEdit?.port_note || "",
          port: itemPortEdit?.port === "" || itemPortEdit?.port == null ? "" : Number(itemPortEdit.port),
          port_status: Boolean(itemPortEdit?.port_status),
        }
      : itemPortEdit;

    try {
      if (isDelete) await onDelete?.();
      else await onSave?.(payload);
    } finally {
      setNutxuly(0);
      setNutorder(isDelete ? "Xác nhận xoá" : "Lưu thay đổi");
    }
  };

  if (!showedit || (!selectedPort && !isCreate)) return null;
  const currentPort = selectedPort || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-300 w-full max-w-lg rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Top accent line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            isDelete
              ? "from-rose-500 via-red-500 to-amber-500"
              : isCreate
              ? "from-emerald-500 via-indigo-500 to-purple-500"
              : "from-purple-500 via-indigo-500 to-cyan-500"
          }`}
        ></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                isDelete
                  ? "bg-rose-100 text-rose-700"
                  : isCreate
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {isDelete ? (
                <Trash2 className="w-4 h-4" />
              ) : isCreate ? (
                <Plus className="w-4 h-4" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                {isDelete
                  ? "Xác Nhận Xoá Port"
                  : isCreate
                  ? "Thêm Mới Cổng Dịch Vụ"
                  : "Hiệu Chỉnh Cổng Dịch Vụ"}
                {!isCreate && currentPort?.port && (
                  <span className="inline-flex items-center gap-0.5 font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
                    <span className="text-indigo-400 font-medium text-[11px] mr-0.5">#</span>
                    <span className="font-extrabold text-indigo-900 tracking-[0.04em]">{currentPort.port}</span>
                  </span>
                )}
              </h2>
              <span className="text-[10px] text-slate-500 font-mono uppercase">
                HUST NET PORTS MANAGER
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setshowedit(false)}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDelete ? (
          /* Delete Confirmation Card */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-rose-800">
                <p className="font-semibold text-rose-900 text-sm">
                  Bạn có chắc chắn muốn xoá cổng này?
                </p>
                <p className="leading-relaxed">
                  Hành động này sẽ xoá thông tin cấu hình cổng{" "}
                  <span className="inline-flex items-center gap-0.5 font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-lg">
                    <span className="text-indigo-400 font-medium text-[11px] mr-0.5">#</span>
                    <span className="font-extrabold text-indigo-900 tracking-[0.04em]">{currentPort?.port}</span>
                  </span>{" "}
                  ({currentPort?.port_name || currentPort?.process || "Không tên"}) khỏi hệ thống quản lý.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">MÃ ID:</span>
                <span className="text-slate-800 font-bold">#{currentPort?.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">PORT:</span>
                <span className="inline-flex items-center gap-0.5 font-mono font-bold text-sm text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  <span className="text-indigo-400 font-medium text-xs mr-0.5">#</span>
                  <span className="font-extrabold text-indigo-900 tracking-[0.04em]">{currentPort?.port ?? "—"}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">TÊN PORT:</span>
                <span className="text-slate-900 font-medium">{currentPort?.port_name || currentPort?.process || "—"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setshowedit(false)}
                className="px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={nutxuly === 1}
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md transition active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {nutxuly === 1 && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xác nhận xoá</span>
              </button>
            </div>
          </div>
        ) : (
          /* Create / Edit Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Port Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tên Dịch Vụ / Port (Name)
              </label>
              <input
                type="text"
                value={itemPortEdit?.port_name ?? ""}
                onChange={(e) => handleChange("port_name", e.target.value)}
                placeholder="VD: Nginx Web Server, Backend API..."
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400/20 transition"
              />
            </div>

            {/* Port Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Số Hiệu Cổng (Port Number)
              </label>
              <input
                type="number"
                value={itemPortEdit?.port ?? ""}
                onChange={(e) => handleChange("port", e.target.value)}
                placeholder="VD: 80, 443, 3000, 8080..."
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400/20 font-mono transition"
              />
            </div>

            {/* Port Note Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ghi Chú (Note)
              </label>
              <input
                type="text"
                value={itemPortEdit?.port_note ?? ""}
                onChange={(e) => handleChange("port_note", e.target.value)}
                placeholder="Ghi chú thêm về cổng hoặc tiến trình..."
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400/20 transition"
              />
            </div>

            {/* Port Status Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Trạng Thái Hoạt Động (Status)
              </label>
              <button
                type="button"
                onClick={() => handleToggle("port_status")}
                className={`flex w-full items-center justify-between px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  itemPortEdit?.port_status
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-slate-100 border-slate-300 text-slate-600"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Power className={`w-4 h-4 ${itemPortEdit?.port_status ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{itemPortEdit?.port_status ? "Đang bật (Listening - ON)" : "Đang tắt (Stopped - OFF)"}</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  Nhấn để {itemPortEdit?.port_status ? "tắt" : "bật"}
                </span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setshowedit(false)}
                className="px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={nutxuly === 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {nutxuly === 1 ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isCreate ? "Tạo Port Mới" : nutorder}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Port_edit;
