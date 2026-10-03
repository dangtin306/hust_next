"use client";

import React, { useState } from "react";
import { Radio, X, Loader2, CheckCircle2, Activity } from "lucide-react";

const PortCheck = ({ showcheck, setshowcheck, selectedPort, onCheck }) => {
  const [checking, setChecking] = useState(0);
  const [buttonText, setButtonText] = useState("Kiểm tra ngay");

  const closeCheck = () => setshowcheck(false);

  const handleCheck = async (event) => {
    event.preventDefault();
    setChecking(1);
    setButtonText("Đang kiểm tra...");
    try {
      await onCheck?.(selectedPort);
    } finally {
      setChecking(0);
      setButtonText("Kiểm tra ngay");
    }
  };

  if (!showcheck || !selectedPort) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-300 w-full max-w-lg rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Kiểm Tra Trạng Thái Port
              </h2>
              <span className="text-[10px] text-slate-500 font-mono uppercase">
                HUST PORT CLI TELEMETRY
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCheck}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Details Card */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">TÊN PORT:</span>
            <span className="text-slate-900 font-bold">{selectedPort?.port_name || selectedPort?.process || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">SỐ HIỆU CỔNG:</span>
            <span className="inline-flex items-center gap-0.5 font-mono font-bold text-sm text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
              <span className="text-indigo-400 font-medium text-xs mr-0.5">#</span>
              <span className="font-extrabold text-indigo-900 tracking-[0.04em]">{selectedPort?.port ?? "—"}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">GHI CHÚ:</span>
            <span className="text-amber-800 font-sans">{selectedPort?.port_note || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">TRẠNG THÁI HIỆN TẠI:</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              selectedPort?.port_status ? "bg-emerald-50 text-emerald-800 border border-emerald-300" : "bg-rose-50 text-rose-800 border border-rose-300"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedPort?.port_status ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
              {selectedPort?.port_status ? "Listening (ON)" : "Stopped (OFF)"}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Các tham số kiểm tra: </span>
            <span>port_status, pid, process, executable, command, parent_process</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={closeCheck}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={checking === 1}
            onClick={handleCheck}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {checking === 1 ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortCheck;
