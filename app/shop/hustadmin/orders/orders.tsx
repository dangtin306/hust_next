"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
  User,
  Filter,
  X,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  Sparkles,
  Link as LinkIcon,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { alert_error, alert_success } from "@/app/AppContext";
import StatusBadge from "./buttonstatus";
import "./orders.css";

export type OrderRow = {
  stt?: number | string;
  id?: number | string;
  name?: string;
  service_name?: string;
  money?: number | string;
  minorder?: number | string;
  category?: string;
  status?: string;
  username?: string;
  url?: string;
  note?: string;
  amount?: number | string;
  start_count?: number | string;
  remains?: number | string;
  order?: number | string;
  createdate?: string;
  updatedate?: string;
  [key: string]: any;
};

export default function MyTableComponent() {
  // Query States
  const [id_orders, set_id_orders] = useState("");
  const [username, set_username] = useState("");
  const [chedo, set_chedo] = useState("");
  const [status, set_status] = useState("");
  const [value, set_value] = useState("");

  // Data & Loading States - Initialize with empty array and isLoading = true (No fake mock rows on start)
  const [data, set_data] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Client-side quick filter
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientSearch, setClientSearch] = useState<string>("");

  // Modal States
  const [isModalVisible, setModalVisible] = useState(false);
  const [users_edit, set_users_edit] = useState<OrderRow | null>(null);

  // Dropdown options
  const options = [
    { id: 1, name: "edit_orders", label: "Chỉnh sửa trạng thái (edit_orders)" },
    { id: 2, name: "edit_cancel", label: "Hủy đơn & Hoàn tiền (edit_cancel)" },
  ];

  const orderStatusOptions = [
    { id: 1, name: "Processing", label: "Processing (Đang xử lý)" },
    { id: 2, name: "In progress", label: "In progress (Đang chạy)" },
    { id: 3, name: "Completed", label: "Completed (Hoàn tất)" },
  ];

  const percentageOptions = Array.from({ length: 10 }, (_, i) => {
    const val = String((i + 1) * 10);
    return { id: i + 1, name: val, label: `Hoàn ${val}%` };
  });

  const options_2 = chedo === "edit_orders" ? orderStatusOptions : percentageOptions;

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 1800);
  };

  // Fetch Data from Backend
  const fetchData = useCallback(() => {
    setIsLoading(true);
    axios
      .get(
        "https://hust.media/hustadmin_v2/orders_list.php?id_orders=" +
          encodeURIComponent(id_orders) +
          "&username=" +
          encodeURIComponent(username)
      )
      .then((response) => {
        if (Array.isArray(response.data)) {
          set_data(response.data);
        } else if (response.data && typeof response.data === "object") {
          set_data([response.data]);
        } else {
          set_data([]);
        }
      })
      .catch((error) => {
        alert_error(error?.message || "Không thể tải danh sách đơn hàng");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id_orders, username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal Handlers
  const openModal = (row: OrderRow) => {
    set_users_edit(row);
    set_chedo("edit_orders");
    set_status(row.status || "Processing");
    set_value(String(row.id || ""));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    set_users_edit(null);
  };

  useEffect(() => {
    if (users_edit?.id) {
      set_value(String(users_edit.id));
    }
  }, [users_edit]);

  const member_edit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!users_edit) return;

    axios
      .get(
        "https://hust.media/hustadmin_v2/orders_edit.php?chedo=" +
          encodeURIComponent(chedo) +
          "&value=" +
          encodeURIComponent(value) +
          "&status=" +
          encodeURIComponent(status) +
          "&username=" +
          encodeURIComponent(users_edit.username || "")
      )
      .then((response) => {
        alert_success(response.data || "Cập nhật thành công!");
        fetchData();
        closeModal();
      })
      .catch((error) => {
        alert_error(error?.message || "Có lỗi xảy ra khi cập nhật!");
      });
  };

  // Telemetry Calculations
  const stats = useMemo(() => {
    const total = data.length;
    let completed = 0;
    let inProgress = 0;
    let failed = 0;
    let totalMoney = 0;

    data.forEach((item) => {
      const s = String(item.status || "").toLowerCase();
      if (s.includes("hoantat") || s.includes("completed") || s.includes("thanhcong") || s.includes("show")) {
        completed++;
      } else if (s.includes("thatbai") || s.includes("cancel") || s.includes("hide")) {
        failed++;
      } else {
        inProgress++;
      }

      const m = Number(item.money);
      if (!isNaN(m)) totalMoney += m;
    });

    return { total, completed, inProgress, failed, totalMoney };
  }, [data]);

  // Filtered rows for client view
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Status filter
      if (statusFilter !== "all") {
        const s = String(row.status || "").toLowerCase();
        if (statusFilter === "completed" && !(s.includes("hoantat") || s.includes("completed") || s.includes("thanhcong") || s.includes("show"))) {
          return false;
        }
        if (statusFilter === "failed" && !(s.includes("thatbai") || s.includes("cancel") || s.includes("hide"))) {
          return false;
        }
        if (statusFilter === "processing" && !(s.includes("xuly") || s.includes("processing") || s.includes("pending") || s.includes("in progress"))) {
          return false;
        }
      }

      // Quick keyword search
      if (clientSearch.trim()) {
        const q = clientSearch.toLowerCase();
        const matchesId = String(row.id || "").toLowerCase().includes(q);
        const matchesUser = String(row.username || "").toLowerCase().includes(q);
        const matchesService = String(row.service_name || "").toLowerCase().includes(q);
        const matchesUrl = String(row.url || "").toLowerCase().includes(q);
        const matchesNote = String(row.note || "").toLowerCase().includes(q);
        const matchesOrder = String(row.order || "").toLowerCase().includes(q);
        return matchesId || matchesUser || matchesService || matchesUrl || matchesNote || matchesOrder;
      }

      return true;
    });
  }, [data, statusFilter, clientSearch]);

  const handleClearServerFilter = () => {
    set_id_orders("");
    set_username("");
  };

  return (
    <div className="orders-viewport w-full max-w-full overflow-x-hidden p-2 sm:p-4 lg:p-5 font-sans text-slate-800">
      <div className="w-full max-w-full space-y-3">
        {/* =========================================================================
            COMPACT LIGHT CONTROL BAR (MERGED HEADER + FILTER PILLS + SEARCH)
            Optimized UI/UX: Takes ~85px height with clear border & balanced contrast
            ========================================================================= */}
        <section className="light-glass-hud rounded-2xl p-3 sm:p-4 border border-slate-300 shadow-sm space-y-3">
          {/* Row 1: Title + Status Filter Pills + Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Left: Compact Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Quản Lý Đơn Hàng
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Hệ thống quản trị và kiểm soát đơn hàng Hust Media
                </p>
              </div>
            </div>

            {/* Right: Inline Filter Pills & Refresh */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Tất cả */}
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "all"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                }`}
              >
                <span>Tất cả</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "all" ? "bg-white/25 text-white" : "bg-white text-slate-800 border border-slate-200"}`}>
                  {stats.total}
                </span>
              </button>

              {/* Hoàn tất */}
              <button
                type="button"
                onClick={() => setStatusFilter("completed")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "completed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                <span>Hoàn tất</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "completed" ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-900"}`}>
                  {stats.completed}
                </span>
              </button>

              {/* Đang chạy */}
              <button
                type="button"
                onClick={() => setStatusFilter("processing")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "processing"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "bg-cyan-50 text-cyan-800 border border-cyan-300 hover:bg-cyan-100"
                }`}
              >
                <Clock className="w-3 h-3 shrink-0 text-cyan-600" />
                <span>Đang chạy</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "processing" ? "bg-white/25 text-white" : "bg-cyan-100 text-cyan-900"}`}>
                  {stats.inProgress}
                </span>
              </button>

              {/* Thất bại / Hủy */}
              <button
                type="button"
                onClick={() => setStatusFilter("failed")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "failed"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100"
                }`}
              >
                <AlertCircle className="w-3 h-3 shrink-0 text-rose-600" />
                <span>Hủy/Lỗi</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "failed" ? "bg-white/25 text-white" : "bg-rose-100 text-rose-900"}`}>
                  {stats.failed}
                </span>
              </button>

              {/* Nút Làm mới */}
              <button
                type="button"
                onClick={fetchData}
                disabled={isLoading}
                title="Tải lại dữ liệu"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer ml-auto sm:ml-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{isLoading ? "Đang tải" : "Làm mới"}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Search Inputs + Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pt-2 border-t border-slate-200">
            {/* Server-side Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchData();
              }}
              className="flex flex-wrap items-center gap-2 flex-1"
            >
              {/* Username Input */}
              <div className="relative flex-1 min-w-[130px] max-w-[200px]">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Lọc Username..."
                  value={username}
                  onChange={(e) => set_username(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400/20 transition font-mono"
                />
              </div>

              {/* ID Orders Input */}
              <div className="relative flex-1 min-w-[110px] max-w-[160px]">
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Mã đơn ID..."
                  value={id_orders}
                  onChange={(e) => set_id_orders(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400/20 transition font-mono"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="h-8 inline-flex items-center gap-1 px-3 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tìm</span>
              </button>

              {(username || id_orders) && (
                <button
                  type="button"
                  onClick={handleClearServerFilter}
                  className="h-8 inline-flex items-center gap-1 px-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              )}
            </form>

            {/* Quick Live Filter Input */}
            <div className="flex items-center gap-2 justify-between md:justify-end">
              <div className="relative w-full sm:w-56">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Lọc nhanh kết quả..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-6 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition"
                />
                {clientSearch && (
                  <button
                    type="button"
                    onClick={() => setClientSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-600 font-mono shrink-0 whitespace-nowrap">
                <b>{filteredData.length}</b>/{data.length} đơn
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BẢNG DỮ LIỆU ĐỊNH DẠNG GRID (CÓ VIỀN CÁCH RÕ RÀNG, DỊU MẮT, KHÔNG CUỘN NGANG)
            ========================================================================= */}
        <div className="light-glass-hud rounded-2xl overflow-hidden w-full border border-slate-300 shadow-sm">
          <table className="cyber-table w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] tracking-wider select-none border-b border-slate-300">
                <th className="py-2.5 px-3.5 w-[20%] text-left border border-slate-300">1. ĐƠN & KHÁCH HÀNG</th>
                <th className="py-2.5 px-3.5 w-[33%] text-left border border-slate-300">2. DỊCH VỤ & MỤC TIÊU</th>
                <th className="py-2.5 px-3 w-[18%] text-left border border-slate-300">3. CHI PHÍ & TIẾN ĐỘ</th>
                <th className="py-2.5 px-3 w-[16%] text-left border border-slate-300">4. TRẠNG THÁI & GIỜ</th>
                <th className="py-2.5 px-3 text-center w-[13%] border border-slate-300">5. THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {isLoading ? (
                <>
                  {/* Hàng thông báo Loading thân thiện */}
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 px-4 text-center border border-slate-200 bg-gradient-to-b from-purple-50/50 via-white to-slate-50/50"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="relative flex items-center justify-center">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-white"></span>
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
                            <span>Đang tải danh sách đơn hàng</span>
                            <span className="inline-flex gap-1 text-purple-600 font-black animate-pulse">
                              •••
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Hệ thống đang kết nối và đồng bộ dữ liệu thời gian thực từ máy chủ Hust Media...
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* 4 dòng Skeleton Shimmer tương thích 100% cột bảng */}
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse bg-slate-50/40">
                      {/* Cột 1: Đơn & Khách */}
                      <td className="py-3 px-3.5 border border-slate-200">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-5 w-16 bg-indigo-100/70 rounded-md"></div>
                            <div className="h-4 w-12 bg-slate-200/70 rounded"></div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200/80 shrink-0"></div>
                            <div className="h-4 w-20 bg-slate-200/70 rounded"></div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Dịch vụ & Link */}
                      <td className="py-3 px-3.5 border border-slate-200">
                        <div className="space-y-2">
                          <div className="h-4 w-4/5 bg-slate-200/80 rounded"></div>
                          <div className="h-3.5 w-1/2 bg-slate-200/60 rounded"></div>
                          <div className="h-4 w-36 bg-sky-50 border border-sky-100 rounded-md"></div>
                        </div>
                      </td>

                      {/* Cột 3: Chi phí & Tiến độ */}
                      <td className="py-3 px-3 border border-slate-200">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-14 bg-amber-100/70 rounded-md"></div>
                            <div className="h-3.5 w-14 bg-slate-200/60 rounded"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <div className="h-3 w-10 bg-slate-200/60 rounded"></div>
                              <div className="h-3 w-10 bg-slate-200/60 rounded"></div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 4: Trạng thái & Giờ */}
                      <td className="py-3 px-3 border border-slate-200">
                        <div className="space-y-2">
                          <div className="h-6 w-24 bg-slate-200/70 rounded-full"></div>
                          <div className="h-3.5 w-28 bg-slate-200/60 rounded"></div>
                        </div>
                      </td>

                      {/* Cột 5: Thao tác */}
                      <td className="py-3 px-3 text-center border border-slate-200">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="h-7 w-12 bg-purple-100/60 rounded-lg"></div>
                          <div className="h-7 w-12 bg-rose-100/60 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 border border-slate-200">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <SlidersHorizontal className="w-8 h-8 text-purple-400 animate-bounce" />
                      <span className="text-sm font-semibold text-slate-700">Không tìm thấy đơn hàng nào phù hợp</span>
                      <span className="text-xs text-slate-400">Hãy thử đổi từ khóa tìm kiếm hoặc bấm làm mới</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const rowId = String(row.id || "");
                  const amount = Number(row.amount) || 0;
                  const remains = Number(row.remains) || 0;
                  const startCount = Number(row.start_count) || 0;
                  const progressPercent =
                    amount > 0 ? Math.min(100, Math.max(0, Math.round(((amount - remains) / amount) * 100))) : 100;

                  return (
                    <tr
                      key={row.id ? `row-${row.id}-${index}` : index}
                      className="transition-colors duration-150 group"
                    >
                      {/* CỘT 1: ĐƠN HÀNG & KHÁCH HÀNG (Mã Đơn + Code + Avatar + Username) */}
                      <td data-label="Đơn & Khách" className="py-3 px-3.5 border border-slate-200">
                        <div className="space-y-1">
                          {/* Hàng 1: Mã đơn ID + Copy */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleCopy(rowId, `id-${rowId}`)}
                              title="Click để sao chép Mã Đơn"
                              className="inline-flex items-center gap-1 font-mono font-bold text-xs text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-300 transition cursor-pointer"
                            >
                              <span>#{rowId}</span>
                              {copiedKey === `id-${rowId}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600" />
                              )}
                            </button>

                            {row.order && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-mono text-slate-600" title="Mã đơn hệ thống">
                                Code: {row.order}
                              </span>
                            )}
                          </div>

                          {/* Hàng 2: Username (whitespace-nowrap tránh gãy dọc) */}
                          <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-[9px] text-white shrink-0 shadow-2xs">
                              {(row.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(row.username || "", `user-${rowId}`)}
                              title="Click để sao chép Username"
                              className="font-bold text-slate-900 hover:text-purple-700 transition whitespace-nowrap truncate text-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>{row.username}</span>
                              {copiedKey === `user-${rowId}` && (
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 2: DỊCH VỤ & MỤC TIÊU (Tên Dịch Vụ + Link URL + Ghi Chú) */}
                      <td data-label="Dịch vụ & Link" className="py-3 px-3.5 border border-slate-200">
                        <div className="space-y-1 max-w-full">
                          {/* Tên dịch vụ */}
                          <div className="flex items-start gap-1.5 text-xs text-slate-900 font-semibold leading-snug">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span className="break-words line-clamp-2" title={row.service_name}>
                              {row.service_name || "—"}
                            </span>
                          </div>

                          {/* Link mục tiêu & Ghi chú */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                            {row.url && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 border border-sky-300 text-sky-800 max-w-full">
                                <LinkIcon className="w-3 h-3 text-sky-600 shrink-0" />
                                <span className="truncate max-w-[180px] sm:max-w-[260px]" title={row.url}>
                                  {row.url}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(row.url || "", `url-${rowId}`)}
                                  title="Sao chép link"
                                  className="text-slate-500 hover:text-sky-800 p-0.5 shrink-0 cursor-pointer"
                                >
                                  {copiedKey === `url-${rowId}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}

                            {row.note && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 text-[11px] max-w-full font-sans">
                                <MessageSquare className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[200px]" title={row.note}>
                                  {row.note}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CỘT 3: CHI PHÍ & TIẾN ĐỘ (Tiền $ + Bắt đầu + SL & Còn + Progress Bar) */}
                      <td data-label="Chi phí & Tiến độ" className="py-3 px-3 border border-slate-200">
                        <div className="space-y-1 font-mono">
                          {/* Hàng 1: Chi phí */}
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 shadow-2xs">
                              <DollarSign className="w-3 h-3 text-amber-600" />
                              {row.money ?? 0}
                            </span>
                            <span className="text-[11px] text-slate-600">
                              Bắt đầu: <b className="text-slate-800">{startCount}</b>
                            </span>
                          </div>

                          {/* Hàng 2: Thanh tiến độ & Số lượng */}
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-700">
                              <span>SL: <b>{amount}</b></span>
                              <span className="text-purple-700 font-semibold">Còn: <b>{remains}</b></span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden border border-slate-300">
                              <div
                                className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 4: TRẠNG THÁI & THỜI GIAN (StatusBadge + Date & Time) */}
                      <td data-label="Trạng thái & Giờ" className="py-3 px-3 border border-slate-200">
                        <div className="space-y-1">
                          <div>
                            <StatusBadge status={row.status} />
                          </div>

                          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{row.createdate || "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 5: THAO TÁC (Sửa / Xóa) */}
                      <td data-label="Thao tác" className="py-3 px-3 text-center border border-slate-200">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {/* Nút Sửa */}
                          <button
                            type="button"
                            onClick={() => openModal(row)}
                            title="Chỉnh sửa đơn hàng"
                            className="btn-light-edit inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>

                          {/* Nút Xóa */}
                          <a
                            href={`dich-vu.php?delete=${row.id}`}
                            title="Xóa đơn hàng"
                            className="btn-light-delete inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          LIGHT THEME EDIT MODAL
          ========================================================================= */}
      {isModalVisible && users_edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white border border-slate-300 w-full max-w-lg rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    Hiệu Chỉnh Đơn Hàng
                  </h2>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">
                    HUST ADMIN COMMAND
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Target Preview Card */}
            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">MÃ ĐƠN HÀNG:</span>
                <span className="text-indigo-800 font-bold font-mono">#{users_edit.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">NGƯỜI DÙNG:</span>
                <span className="text-purple-800 font-semibold">{users_edit.username}</span>
              </div>
              {users_edit.service_name && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-slate-500">
                  <span>DỊCH VỤ:</span>
                  <span className="text-slate-700 truncate max-w-[220px] font-sans font-medium">{users_edit.service_name}</span>
                </div>
              )}
            </div>

            {/* Edit Form */}
            <form onSubmit={member_edit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  1. Chọn Chế Độ Can Thiệp
                </label>
                <select
                  value={chedo}
                  onChange={(e) => set_chedo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400/20 transition cursor-pointer"
                >
                  <option value="" disabled>
                    -- Chọn chế độ --
                  </option>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {chedo && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    2. {chedo === "edit_orders" ? "Chọn Trạng Thái Mới" : "Chọn Tỷ Lệ Hoàn Tiền (%)"}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => set_status(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400/20 transition cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Chọn giá trị --
                    </option>
                    {options_2.map((opt) => (
                      <option key={opt.id} value={opt.name}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  3. Giá Trị Truyền (Value ID)
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => set_value(e.target.value)}
                  placeholder="Nhập giá trị value..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400/20 font-mono transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cập Nhật</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
