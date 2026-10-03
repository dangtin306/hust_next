"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Server,
  RefreshCw,
  Edit3,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Hash,
  Filter,
  X,
  SlidersHorizontal,
  Sparkles,
  Radio,
  Plus,
  Globe,
  Terminal,
  Loader2,
  Activity,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { alert_error, alert_success } from "../../../../AppContext.js";
import PortCheck from "./port_check.jsx";
import PortEdit from "./port_edit.jsx";
import "./net_ports.css";

export type PortRecord = {
  id?: number | string;
  port_name?: string;
  port_note?: string;
  protocol?: string;
  address?: string;
  port?: number | string;
  port_status?: boolean;
  pid?: number | string;
  process?: string;
  executable?: string;
  command?: string;
  parent_process?: string;
  parent_command?: string;
  shells?: string[];
  [key: string]: any;
};

const PORTS_API = "https://nginx.hust.media/go/servers/port_cli/show";
const PORT_CHECK_API = "https://nginx.hust.media/go/servers/port_cli/main?service=check_port";
const PORT_CREATE_API = "https://nginx.hust.media/go/servers/port_cli/create";
const PORT_EDIT_API = "https://nginx.hust.media/go/servers/port_cli/edit";
const PORT_DELETE_API = "https://nginx.hust.media/go/servers/port_cli/delete";
const PORT_UPDATE_API = "https://nginx.hust.media/go/servers/port_cli/main?service=check_all";

const readApiBody = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const apiErrorMessage = (response: Response, body: unknown, fallback: string) => {
  if (body && typeof body === "object" && typeof (body as { message?: unknown }).message === "string") {
    return (body as { message: string }).message;
  }
  return `${fallback} (HTTP ${response.status})`;
};

const hasApiError = (body: unknown) =>
  body && typeof body === "object" && (body as { status?: unknown }).status === 0;

export default function NetPortsPage() {
  const [ports, setPorts] = useState<PortRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingAll, setUpdatingAll] = useState(false);

  // Client search & filter & sort
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<string>("port_asc"); // Mặc định sắp xếp Port từ bé đến lớn
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal dialog states
  const [showcheck, setshowcheck] = useState(false);
  const [showedit, setshowedit] = useState(false);
  const [selectedPort, setSelectedPort] = useState<PortRecord | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 1800);
  };

  // Open modals
  const openCheck = (port: PortRecord) => {
    setSelectedPort(port);
    setshowcheck(true);
  };

  const openEdit = (port: PortRecord) => {
    setSelectedPort(port);
    setIsCreate(false);
    setIsDelete(false);
    setshowedit(true);
  };

  const openDelete = (port: PortRecord) => {
    setSelectedPort(port);
    setIsCreate(false);
    setIsDelete(true);
    setshowedit(true);
  };

  const openCreate = () => {
    setSelectedPort(null);
    setIsCreate(true);
    setIsDelete(false);
    setshowedit(true);
  };

  // API: Delete Port
  const deletePort = async () => {
    if (selectedPort?.id === undefined || selectedPort?.id === null) {
      alert_error("Port không có id để xoá");
      return;
    }
    try {
      const response = await fetch(PORT_DELETE_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ id_show: selectedPort.id, cron_delete: true }),
      });
      const body = await readApiBody(response);
      if (response.status !== 200 || hasApiError(body)) {
        throw new Error(apiErrorMessage(response, body, "API xoá port lỗi"));
      }
      setPorts((current) => current.filter((item) => item.id !== selectedPort.id));
      setshowedit(false);
      setIsDelete(false);
      alert_success("Đã xoá port thành công");
      await fetchPorts();
    } catch (error: any) {
      alert_error(error?.message || error || "Lỗi khi xoá port");
    }
  };

  // API: Save Port (Create / Edit)
  const savePort = async (updatedPort: PortRecord) => {
    if (isCreate) {
      try {
        const response = await fetch(PORT_CREATE_API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(updatedPort),
        });
        const body = await readApiBody(response);
        if (![200, 201].includes(response.status) || hasApiError(body)) {
          throw new Error(apiErrorMessage(response, body, "API tạo port lỗi"));
        }
        setshowedit(false);
        setIsCreate(false);
        alert_success("Đã tạo port mới thành công");
        await fetchPorts();
      } catch (error: any) {
        alert_error(error?.message || error || "Lỗi khi tạo port");
      }
      return;
    }

    try {
      const response = await fetch(PORT_EDIT_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({
          id_show: updatedPort.id,
          port_name: updatedPort.port_name || "",
          port_note: updatedPort.port_note || "",
          port: updatedPort.port === "" || updatedPort.port == null ? "" : Number(updatedPort.port),
          port_status: Boolean(updatedPort.port_status),
        }),
      });
      const body = await readApiBody(response);
      if (response.status !== 200 || hasApiError(body)) {
        throw new Error(apiErrorMessage(response, body, "API sửa port lỗi"));
      }
      setshowedit(false);
      setIsDelete(false);
      alert_success("Đã cập nhật port thành công");
      await fetchPorts();
    } catch (error: any) {
      alert_error(error?.message || error || "Lỗi khi sửa port");
    }
  };

  // API: Update All Ports (check all active live ports)
  const updateAllPorts = async () => {
    setUpdatingAll(true);
    try {
      const response = await fetch(PORT_UPDATE_API, { cache: "no-store" });
      const body = await readApiBody(response);
      if (response.status !== 200 || hasApiError(body)) {
        throw new Error(apiErrorMessage(response, body, "API cập nhật port lỗi"));
      }
      await fetchPorts();
      alert_success("Đã cập nhật port sống mới");
    } catch (error: any) {
      alert_error(error?.message || error || "Lỗi khi cập nhật");
    } finally {
      setUpdatingAll(false);
    }
  };

  // API: Check single port status
  const checkPortStatus = async (port: PortRecord) => {
    if (port.id === undefined || port.id === null) {
      alert_error("Port không có id để kiểm tra");
      return;
    }

    try {
      const response = await fetch(
        `${PORT_CHECK_API}&id_show=${encodeURIComponent(String(port.id))}`,
        { cache: "no-store" }
      );
      const data: unknown = await readApiBody(response);
      if (!response.ok || hasApiError(data)) {
        throw new Error(apiErrorMessage(response, data, "API kiểm tra port lỗi"));
      }
      const raw = data as { api_results?: unknown };
      const nested = raw?.api_results;
      const payload = Array.isArray(nested)
        ? nested[0]
        : nested && typeof nested === "object" && Array.isArray((nested as { mongo_results?: unknown }).mongo_results)
          ? (nested as { mongo_results: unknown[] }).mongo_results[0]
          : nested && typeof nested === "object"
            ? nested
            : data;

      if (payload && typeof payload === "object") {
        const updatedPort = { ...port, ...(payload as PortRecord) };
        setPorts((current) => current.map((item) => (item.id === port.id ? updatedPort : item)));
        setSelectedPort(updatedPort);
      }
      await fetchPorts();
      alert_success("Đã kiểm tra port thành công");
    } catch (error: any) {
      alert_error(error?.message || error || "Lỗi khi kiểm tra port");
    }
  };

  // API: Fetch Port List
  const fetchPorts = useCallback(async (manual = false) => {
    if (manual) setUpdating(true);
    else setLoading(true);

    try {
      const response = await fetch(PORTS_API, { cache: "no-store" });
      const data: unknown = await readApiBody(response);
      if (!response.ok || hasApiError(data)) {
        throw new Error(apiErrorMessage(response, data, "API lấy danh sách port lỗi"));
      }
      const nextPorts = Array.isArray(data)
        ? data
        : Array.isArray((data as { api_results?: { mongo_results?: unknown } })?.api_results?.mongo_results)
          ? (data as { api_results: { mongo_results: PortRecord[] } }).api_results.mongo_results
          : [];
      setPorts(nextPorts as PortRecord[]);
      if (manual) alert_success("Đã làm mới danh sách port");
    } catch (error: any) {
      alert_error(error?.message || error || "Lỗi khi tải danh sách port");
      setPorts([]);
    } finally {
      if (manual) setUpdating(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPorts();
  }, [fetchPorts]);

  // Statistics
  const listenCount = useMemo(
    () => ports.filter((item) => item.port_status === true).length,
    [ports]
  );
  const offlineCount = useMemo(
    () => ports.filter((item) => !item.port_status).length,
    [ports]
  );

  // Filtered & Sorted Ports
  const filteredPorts = useMemo(() => {
    const list = ports.filter((item) => {
      // Status filter
      if (statusFilter === "active" && !item.port_status) return false;
      if (statusFilter === "inactive" && item.port_status) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPort = String(item.port || "").toLowerCase().includes(q);
        const matchesName = String(item.port_name || "").toLowerCase().includes(q);
        const matchesNote = String(item.port_note || "").toLowerCase().includes(q);
        const matchesProc = String(item.process || "").toLowerCase().includes(q);
        const matchesCmd = String(item.command || "").toLowerCase().includes(q);
        const matchesAddr = String(item.address || "").toLowerCase().includes(q);
        const matchesPid = String(item.pid || "").toLowerCase().includes(q);
        return matchesPort || matchesName || matchesNote || matchesProc || matchesCmd || matchesAddr || matchesPid;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "port_asc") {
        const pA = Number(a.port) || 0;
        const pB = Number(b.port) || 0;
        if (pA !== pB) return pA - pB;
        return (Number(a.id) || 0) - (Number(b.id) || 0);
      }
      if (sortBy === "port_desc") {
        const pA = Number(a.port) || 0;
        const pB = Number(b.port) || 0;
        if (pA !== pB) return pB - pA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
      if (sortBy === "name_asc") {
        const nameA = String(a.port_name || a.process || "").toLowerCase();
        const nameB = String(b.port_name || b.process || "").toLowerCase();
        return nameA.localeCompare(nameB, "vi");
      }
      if (sortBy === "name_desc") {
        const nameA = String(a.port_name || a.process || "").toLowerCase();
        const nameB = String(b.port_name || b.process || "").toLowerCase();
        return nameB.localeCompare(nameA, "vi");
      }
      if (sortBy === "id_asc") {
        return (Number(a.id) || 0) - (Number(b.id) || 0);
      }
      if (sortBy === "id_desc") {
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
      const pA = Number(a.port) || 0;
      const pB = Number(b.port) || 0;
      return pA - pB;
    });
  }, [ports, statusFilter, searchQuery, sortBy]);

  return (
    <div className="netports-viewport w-full max-w-full overflow-x-hidden p-2 sm:p-4 lg:p-5 font-sans text-slate-800">
      <div className="w-full max-w-full space-y-3">
        {/* =========================================================================
            COMPACT LIGHT CONTROL BAR (HEADER + STATS CHIPS + ACTIONS + SEARCH)
            Optimized UI/UX: Single cohesive panel taking ~85px height with clear borders
            ========================================================================= */}
        <section className="light-glass-hud rounded-2xl p-3 sm:p-4 border border-slate-300 shadow-sm space-y-3">
          {/* Row 1: Title + Status Pills + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Left: Compact Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Quản Trị Net Ports
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Giám sát và kiểm soát cổng mạng dịch vụ hệ thống Hust Media
                </p>
              </div>
            </div>

            {/* Right: Inline Filter Pills & Actions */}
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
                  {ports.length}
                </span>
              </button>

              {/* Listening (ON) */}
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "active"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                <span>Listening</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "active" ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-900"}`}>
                  {listenCount}
                </span>
              </button>

              {/* Stopped (OFF) */}
              <button
                type="button"
                onClick={() => setStatusFilter("inactive")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "inactive"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100"
                }`}
              >
                <AlertCircle className="w-3 h-3 shrink-0 text-rose-600" />
                <span>Stopped</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === "inactive" ? "bg-white/25 text-white" : "bg-rose-100 text-rose-900"}`}>
                  {offlineCount}
                </span>
              </button>

              {/* Thêm Port Mới */}
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition active:scale-95 cursor-pointer ml-auto sm:ml-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Port</span>
              </button>

              {/* Update All Ports */}
              <button
                type="button"
                onClick={updateAllPorts}
                disabled={updatingAll || updating}
                title="Kiểm tra trạng thái toàn bộ ports trên server"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Activity className={`w-3.5 h-3.5 text-emerald-600 ${updatingAll ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{updatingAll ? "Đang quét..." : "Update All"}</span>
              </button>

              {/* Làm mới */}
              <button
                type="button"
                onClick={() => fetchPorts(true)}
                disabled={updating || updatingAll}
                title="Tải lại danh sách"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${updating ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{updating ? "Đang tải" : "Làm mới"}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Search Input & Sort & Showing Count */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200">
            {/* Quick Keyword Search */}
            <div className="relative flex-1 max-w-md">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm nhanh theo Port, Tên dịch vụ, IP, PID, Command..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-6 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Right: Sắp xếp (nằm bên trái Hiển thị ...) + Hiển thị số lượng */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 self-stretch sm:self-auto">
              {/* Lựa chọn cách sắp xếp */}
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-600 hidden md:inline">Sắp xếp:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-8 pl-2.5 pr-7 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500 shadow-2xs appearance-none cursor-pointer transition"
                    title="Lựa chọn cách sắp xếp danh sách"
                  >
                    <option value="port_asc">Port: Bé → Lớn (Mặc định)</option>
                    <option value="port_desc">Port: Lớn → Bé</option>
                    <option value="name_asc">Tên: A → Z</option>
                    <option value="name_desc">Tên: Z → A</option>
                    <option value="id_asc">ID: Tăng dần</option>
                    <option value="id_desc">ID: Giảm dần</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Showing Count */}
              <span className="text-[11px] text-slate-600 font-mono shrink-0 whitespace-nowrap pl-2 border-l border-slate-300">
                Hiển thị <b>{filteredPorts.length}</b>/{ports.length} ports
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BẢNG DỮ LIỆU GRID 5 CỘT (CÓ VIỀN CÁCH RÕ RÀNG, DỊU MẮT, KHÔNG CUỘN NGANG)
            ========================================================================= */}
        <div className="light-glass-hud rounded-2xl overflow-hidden w-full border border-slate-300 shadow-sm">
          <table className="cyber-table w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px] tracking-wider select-none border-b border-slate-300">
                <th className="py-2.5 px-3.5 w-[15%] text-left border border-slate-300">1. CỔNG & ID</th>
                <th className="py-2.5 px-3.5 w-[26%] text-left border border-slate-300">2. TÊN DỊCH VỤ & GHI CHÚ</th>
                <th className="py-2.5 px-3 w-[23%] text-left border border-slate-300">3. ĐỊA CHỈ & TIẾN TRÌNH</th>
                <th className="py-2.5 px-3 w-[22%] text-left border border-slate-300">4. LỆNH & THỰC THI</th>
                <th className="py-2.5 px-3 text-center w-[14%] border border-slate-300">5. TRẠNG THÁI & THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {loading ? (
                <>
                  {/* Friendly Loading State Banner */}
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
                            <span>Đang tải danh sách Net Ports</span>
                            <span className="inline-flex gap-1 text-purple-600 font-black animate-pulse">
                              •••
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Hệ thống đang kết nối và đồng bộ dữ liệu cổng dịch vụ thời gian thực từ máy chủ Hust Media...
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* 4 Skeleton Shimmer Rows */}
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse bg-slate-50/40">
                      {/* Cột 1 */}
                      <td className="py-3 px-3.5 border border-slate-200">
                        <div className="space-y-1.5">
                          <div className="h-6 w-20 bg-indigo-100/70 rounded-lg"></div>
                          <div className="h-3.5 w-16 bg-slate-200/70 rounded"></div>
                        </div>
                      </td>
                      {/* Cột 2 */}
                      <td className="py-3 px-3.5 border border-slate-200">
                        <div className="space-y-2">
                          <div className="h-4 w-4/5 bg-slate-200/80 rounded"></div>
                          <div className="h-3.5 w-1/2 bg-slate-200/60 rounded"></div>
                        </div>
                      </td>
                      {/* Cột 3 */}
                      <td className="py-3 px-3 border border-slate-200">
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-sky-50 border border-sky-100 rounded-md"></div>
                          <div className="h-3.5 w-16 bg-slate-200/60 rounded"></div>
                        </div>
                      </td>
                      {/* Cột 4 */}
                      <td className="py-3 px-3 border border-slate-200">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200/70 rounded"></div>
                          <div className="h-3.5 w-24 bg-slate-200/50 rounded"></div>
                        </div>
                      </td>
                      {/* Cột 5 */}
                      <td className="py-3 px-3 text-center border border-slate-200">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="h-6 w-14 bg-emerald-100/60 rounded-full"></div>
                          <div className="h-7 w-12 bg-purple-100/60 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredPorts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 border border-slate-200">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <SlidersHorizontal className="w-8 h-8 text-purple-400 animate-bounce" />
                      <span className="text-sm font-semibold text-slate-700">Không tìm thấy port nào phù hợp</span>
                      <span className="text-xs text-slate-400">Hãy thử đổi từ khóa tìm kiếm hoặc bấm Thêm Port mới</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPorts.map((item, index) => {
                  const portId = String(item.id ?? index);
                  const portNum = String(item.port ?? "");

                  return (
                    <tr
                      key={`${item.protocol || "port"}-${item.port || index}`}
                      className="transition-colors duration-150 group"
                    >
                      {/* CỘT 1: CỔNG & ID (Số Port NỔI BẬT DỊU MẮT, HÀI HÒA + Copy + Protocol + ID) */}
                      <td data-label="Cổng & ID" className="py-3 px-3.5 border border-slate-200">
                        <div className="space-y-1.5">
                          {/* Nút Port chính - Thân thiện, thanh thoát, hài hòa với bảng */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleCopy(portNum, `port-${portId}`)}
                              title="Click để sao chép số hiệu Port"
                              className="group inline-flex items-center gap-1.5 font-mono text-[14px] sm:text-[15px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/90 border border-indigo-200/80 hover:border-indigo-300 px-2.5 py-0.5 rounded-lg shadow-2xs transition-all duration-150 active:scale-95 cursor-pointer"
                            >
                              <span className="text-indigo-400 font-semibold text-xs mr-0.5">#</span>
                              <span className="tracking-[0.04em] font-extrabold text-indigo-900">{item.port ?? "—"}</span>
                              {copiedKey === `port-${portId}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-0.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-indigo-300 group-hover:text-indigo-600 shrink-0 ml-0.5 transition-colors" />
                              )}
                            </button>
                          </div>

                          {/* Thông số phụ bên dưới: Giao thức & Mã ID */}
                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                            {item.protocol && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-[10px] text-slate-600 uppercase">
                                {item.protocol}
                              </span>
                            )}
                            <span className="text-slate-400 text-[10px]">
                              ID: <b className="text-slate-600 font-semibold">{item.id ?? "—"}</b>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 2: TÊN DỊCH VỤ & GHI CHÚ */}
                      <td data-label="Tên & Ghi chú" className="py-3 px-3.5 border border-slate-200">
                        <div className="space-y-1 max-w-full">
                          <div className="flex items-start gap-1.5 text-xs text-slate-900 font-semibold leading-snug">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span className="break-words line-clamp-2" title={item.port_name || item.process}>
                              {item.port_name || item.process || "—"}
                            </span>
                          </div>

                          {item.port_note && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 text-[11px] max-w-full font-sans">
                              <span className="truncate max-w-[220px]" title={item.port_note}>
                                {item.port_note}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* CỘT 3: ĐỊA CHỈ & TIẾN TRÌNH (IP Address + PID) */}
                      <td data-label="Địa chỉ & PID" className="py-3 px-3 border border-slate-200">
                        <div className="space-y-1 font-mono">
                          {/* Address IP */}
                          <div className="flex items-center gap-1 text-[11px] text-sky-800 bg-sky-50 border border-sky-300 rounded px-1.5 py-0.5 w-fit">
                            <Globe className="w-3 h-3 text-sky-600 shrink-0" />
                            <span className="truncate max-w-[160px]">{item.address || "0.0.0.0"}</span>
                          </div>

                          {/* PID */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>PID: <b className="text-slate-800">{item.pid ?? "—"}</b></span>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 4: LỆNH THỰC THI (Command & Executable) */}
                      <td data-label="Lệnh thực thi" className="py-3 px-3 border border-slate-200">
                        <div className="space-y-1 max-w-full">
                          {item.command ? (
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 font-mono text-[11px] text-slate-800 max-w-full">
                              <span className="truncate max-w-[180px]" title={item.command}>
                                {item.command}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.command || "", `cmd-${portId}`)}
                                title="Sao chép lệnh"
                                className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0 cursor-pointer"
                              >
                                {copiedKey === `cmd-${portId}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}

                          {item.executable && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono truncate max-w-[200px]" title={item.executable}>
                              <Terminal className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.executable}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* CỘT 5: TRẠNG THÁI & THAO TÁC */}
                      <td data-label="Trạng thái & Thao tác" className="py-3 px-3 text-center border border-slate-200">
                        <div className="flex flex-col items-center gap-1.5 whitespace-nowrap">
                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              item.port_status === true
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs"
                                : "bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.port_status === true ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                              }`}
                            ></span>
                            {item.port_status === true ? "Listening" : "Stopped"}
                          </span>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                            {/* Check Button */}
                            <button
                              type="button"
                              onClick={() => openCheck(item)}
                              title="Kiểm tra trạng thái cổng"
                              className="btn-light-check inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                            >
                              <Activity className="w-3 h-3" />
                              <span>Check</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              title="Chỉnh sửa thông tin port"
                              className="btn-light-edit inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Sửa</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => openDelete(item)}
                              title="Xóa cổng này"
                              className="btn-light-delete inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
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
          MODAL CHECK PORT & MODAL EDIT/CREATE/DELETE PORT
          ========================================================================= */}
      <PortCheck
        showcheck={showcheck}
        setshowcheck={setshowcheck}
        selectedPort={selectedPort}
        onCheck={checkPortStatus}
      />

      <PortEdit
        showedit={showedit}
        setshowedit={setshowedit}
        selectedPort={selectedPort}
        onSave={savePort}
        isCreate={isCreate}
        isDelete={isDelete}
        onDelete={deletePort}
      />
    </div>
  );
}
