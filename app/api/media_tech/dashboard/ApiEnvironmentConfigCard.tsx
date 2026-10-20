"use client";

import { useEffect, useState } from "react";
import {
  Server,
  Building2,
  Check,
  Copy,
  Settings,
  Sparkles,
  Laptop,
  Cloud,
  X,
  RotateCcw,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import {
  CHAT_BOT_API_CHANGE_EVENT,
  DEFAULT_PRESETS,
  type ChatBotApiConfig,
  getChatBotApiCookieName,
  getChatBotApiConfig,
  hasChatBotApiConfigCookie,
  saveChatBotApiConfig,
  clearChatBotApiConfig,
} from "../config/chatBotApiConfig";

type Props = {
  isHust?: boolean;
};

export default function ApiEnvironmentConfigCard({ isHust = false }: Props) {
  const cookieName = getChatBotApiCookieName(isHust);

  const [mounted, setMounted] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [config, setConfig] = useState<ChatBotApiConfig>(() =>
    getChatBotApiConfig(isHust)
  );

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customLaravel, setCustomLaravel] = useState("");
  const [customNode, setCustomNode] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshState = () => {
    const hasCookie = hasChatBotApiConfigCookie(isHust);
    setIsConfigured(hasCookie);
    const active = getChatBotApiConfig(isHust);
    setConfig(active);
    setCustomLaravel(active.backend_laravel);
    setCustomNode(active.backend_node);
  };

  useEffect(() => {
    setMounted(true);
    refreshState();

    const handleConfigChange = () => {
      refreshState();
    };

    window.addEventListener(CHAT_BOT_API_CHANGE_EVENT, handleConfigChange);
    return () => {
      window.removeEventListener(CHAT_BOT_API_CHANGE_EVENT, handleConfigChange);
    };
  }, [isHust]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleApplyPreset = (target: "company" | "production" | "localhost") => {
    let presetConfig: ChatBotApiConfig;
    let label = "";

    if (!isHust && target === "company") {
      presetConfig = DEFAULT_PRESETS.mt.company.config;
      label = DEFAULT_PRESETS.mt.company.label;
    } else if (target === "production") {
      presetConfig = isHust
        ? DEFAULT_PRESETS.hust.production.config
        : DEFAULT_PRESETS.mt.production.config;
      label = "IP Public Dev";
    } else {
      presetConfig = isHust
        ? DEFAULT_PRESETS.hust.localhost.config
        : DEFAULT_PRESETS.mt.localhost.config;
      label = "IP Local Dev";
    }

    saveChatBotApiConfig(presetConfig, isHust);
    setIsModalOpen(false);
    setIsCustomMode(false);
    showToast(`Đã chuyển sang môi trường ${label}!`);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLaravel.trim() || !customNode.trim()) {
      alert("Vui lòng nhập đầy đủ cả URL Backend Laravel và Backend Node.js");
      return;
    }
    saveChatBotApiConfig(
      {
        backend_laravel: customLaravel.trim(),
        backend_node: customNode.trim(),
      },
      isHust
    );
    setIsModalOpen(false);
    setIsCustomMode(false);
    showToast("Đã lưu cấu hình API tùy chỉnh thành công!");
  };

  const handleClear = () => {
    if (
      confirm(
        `Bạn có chắc muốn xóa cookie cấu hình API (${cookieName})? Trang sẽ quay về trạng thái chưa thiết lập.`
      )
    ) {
      clearChatBotApiConfig(isHust);
      showToast("Đã xóa cookie cấu hình API.");
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Check matching presets
  const isCompanyMatch =
    !isHust &&
    config.backend_laravel === DEFAULT_PRESETS.mt.company.config.backend_laravel &&
    config.backend_node === DEFAULT_PRESETS.mt.company.config.backend_node;

  const prodConfig = isHust
    ? DEFAULT_PRESETS.hust.production.config
    : DEFAULT_PRESETS.mt.production.config;
  const isProductionMatch =
    config.backend_laravel === prodConfig.backend_laravel &&
    config.backend_node === prodConfig.backend_node;

  const localConfig = isHust
    ? DEFAULT_PRESETS.hust.localhost.config
    : DEFAULT_PRESETS.mt.localhost.config;
  const isLocalhostMatch =
    config.backend_laravel === localConfig.backend_laravel &&
    config.backend_node === localConfig.backend_node;

  const currentEnvLabel = isCompanyMatch
    ? "Server Công Ty (189)"
    : isProductionMatch
    ? "IP Public Dev"
    : isLocalhostMatch
    ? "IP Local Dev"
    : "Tùy Chỉnh (Custom)";

  if (!mounted) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs text-slate-400 animate-pulse">
        Đang kiểm tra cấu hình kết nối API hệ thống...
      </div>
    );
  }

  return (
    <div className="mb-6 relative">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg transition-all animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CASE 1: Chưa có cookie -> Hiện khung lựa chọn nổi bật */}
      {!isConfigured ? (
        <section
          aria-label="Cấu hình API kết nối ban đầu"
          className="rounded-2xl border-2 border-blue-400/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
                <Server className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                    Cấu Hình Môi Trường API Hệ Thống
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                    Chưa thiết lập cookie
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                  Chọn môi trường máy chủ để kết nối tập trung cho toàn bộ{" "}
                  <strong>Swagger</strong>, <strong>AI Chat Bot</strong> và{" "}
                  <strong>API Gateway</strong> qua cookie{" "}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-blue-700">
                    {cookieName}
                  </code>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Cards Lựa chọn nhanh */}
          <div
            className={`mt-5 grid gap-4 ${
              !isHust ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
            }`}
          >
            {/* Card 1: Server Công Ty (CHỈ CÓ TRÊN MEDIA TECH) */}
            {!isHust && (
              <div className="flex flex-col justify-between rounded-xl border-2 border-indigo-300 bg-white p-4 shadow-xs transition hover:border-indigo-500 hover:shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                  Ưu tiên
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      <Building2 className="h-3.5 w-3.5" />
                      Server Công Ty (Khuyên dùng)
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-800">
                    {DEFAULT_PRESETS.mt.company.label}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {DEFAULT_PRESETS.mt.company.description}
                  </p>

                  <div className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Laravel:</span>
                      <span className="font-semibold text-indigo-700 truncate max-w-[210px]">
                        {DEFAULT_PRESETS.mt.company.config.backend_laravel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Node Gateway:</span>
                      <span className="font-semibold text-indigo-700 truncate max-w-[210px]">
                        {DEFAULT_PRESETS.mt.company.config.backend_node}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyPreset("company")}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  <Building2 className="h-4 w-4" />
                  Chọn Server Công Ty (1-Click)
                </button>
              </div>
            )}

            {/* Card Production Cloud */}
            <div className="flex flex-col justify-between rounded-xl border border-blue-200 bg-white p-4 shadow-xs transition hover:border-blue-400 hover:shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    <Cloud className="h-3.5 w-3.5" />
                    IP Public Dev {isHust ? "(Khuyên dùng)" : ""}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Sẵn sàng
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-800">
                  {isHust
                    ? DEFAULT_PRESETS.hust.production.label
                    : DEFAULT_PRESETS.mt.production.label}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {isHust
                    ? DEFAULT_PRESETS.hust.production.description
                    : DEFAULT_PRESETS.mt.production.description}
                </p>

                <div className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Laravel:</span>
                    <span className="font-medium text-blue-700 truncate max-w-[210px]">
                      {prodConfig.backend_laravel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Node Gateway:</span>
                    <span className="font-medium text-indigo-700 truncate max-w-[210px]">
                      {prodConfig.backend_node}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplyPreset("production")}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
              >
                <Cloud className="h-4 w-4" />
                Chọn IP Public Dev (1-Click)
              </button>
            </div>

            {/* Card Localhost */}
            <div className="flex flex-col justify-between rounded-xl border border-emerald-200 bg-white p-4 shadow-xs transition hover:border-emerald-400 hover:shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <Laptop className="h-3.5 w-3.5" />
                    IP Local Dev
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Dev cá nhân
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-800">
                  {isHust
                    ? DEFAULT_PRESETS.hust.localhost.label
                    : DEFAULT_PRESETS.mt.localhost.label}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {isHust
                    ? DEFAULT_PRESETS.hust.localhost.description
                    : DEFAULT_PRESETS.mt.localhost.description}
                </p>

                <div className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Laravel:</span>
                    <span className="font-medium text-emerald-700 truncate max-w-[210px]">
                      {localConfig.backend_laravel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Node Gateway:</span>
                    <span className="font-medium text-teal-700 truncate max-w-[210px]">
                      {localConfig.backend_node}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplyPreset("localhost")}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                <Laptop className="h-4 w-4" />
                Chọn IP Local Dev (1-Click)
              </button>
            </div>
          </div>

          {/* Collapsible custom input */}
          <div className="mt-4 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
            >
              <Sliders className="h-3.5 w-3.5" />
              {isCustomMode
                ? "Đóng phần tự nhập URL máy chủ tùy chỉnh"
                : "Hoặc tự nhập URL máy chủ tùy chỉnh (IP / Port riêng)..."}
            </button>

            {isCustomMode && (
              <form onSubmit={handleSaveCustom} className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Backend Laravel (Chat & Workspaces API):
                  </label>
                  <input
                    type="url"
                    value={customLaravel}
                    onChange={(e) => setCustomLaravel(e.target.value)}
                    placeholder={
                      !isHust
                        ? "http://192.168.0.189:8817 hoặc https://laravel_mt.hust.media"
                        : "https://laravel.hust.media hoặc http://127.0.0.1:8000"
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Backend Node.js (OpenClaw AI Gateway):
                  </label>
                  <input
                    type="url"
                    value={customNode}
                    onChange={(e) => setCustomNode(e.target.value)}
                    placeholder={
                      !isHust
                        ? "http://192.168.0.189:8818 hoặc https://node_md.hust.media"
                        : "https://node_md.hust.media hoặc http://localhost:2999"
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                  >
                    Lưu & Kích Hoạt Cấu Hình
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      ) : (
        /* CASE 2: Đã có cookie -> Thanh trạng thái kết nối tích cực */
        <section
          aria-label="Trạng thái kết nối API"
          className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50/90 via-blue-50/30 to-white p-4 shadow-xs sm:p-5"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Active badge & Endpoints */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Môi Trường API:
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs ${
                    isCompanyMatch
                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      : isProductionMatch
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : isLocalhostMatch
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-purple-100 text-purple-800 border border-purple-200"
                  }`}
                >
                  {isCompanyMatch ? (
                    <Building2 className="h-3 w-3" />
                  ) : isProductionMatch ? (
                    <Cloud className="h-3 w-3" />
                  ) : isLocalhostMatch ? (
                    <Laptop className="h-3 w-3" />
                  ) : (
                    <Server className="h-3 w-3" />
                  )}
                  {currentEnvLabel}
                </span>

                <span className="text-[11px] text-slate-500 font-mono">
                  (Cookie: <code>{cookieName}</code>)
                </span>
              </div>

              {/* Endpoint badges */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                {/* Laravel */}
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 shadow-2xs">
                  <span className="font-semibold text-slate-500">Laravel:</span>
                  <span className="font-mono text-blue-700 max-w-[200px] sm:max-w-none truncate font-medium">
                    {config.backend_laravel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(config.backend_laravel, "laravel")}
                    title="Sao chép URL Laravel"
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    {copiedField === "laravel" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Node Gateway */}
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 shadow-2xs">
                  <span className="font-semibold text-slate-500">Node Gateway:</span>
                  <span className="font-mono text-indigo-700 max-w-[200px] sm:max-w-none truncate font-medium">
                    {config.backend_node}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(config.backend_node, "node")}
                    title="Sao chép URL Node Gateway"
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    {copiedField === "node" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Edit / Config Modal Button */}
              <button
                type="button"
                onClick={() => {
                  setCustomLaravel(config.backend_laravel);
                  setCustomNode(config.backend_node);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-blue-400 hover:text-blue-600 hover:bg-slate-50 active:scale-[0.98]"
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                Đổi server / môi trường
              </button>

              {/* Reset button */}
              <button
                type="button"
                onClick={handleClear}
                title="Xóa cấu hình cookie hiện tại"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 text-xs text-slate-400 shadow-2xs transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MODAL: Đổi server / Cấu hình chi tiết */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900">
                  Cấu Hình Môi Trường API ({isHust ? "Hust Media" : "Media Tech"})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Chọn một trong các preset có sẵn hoặc nhập URL cụ thể. Giá trị sẽ được lưu
              vào cookie <code className="text-blue-600">{cookieName}</code>{" "}
              và tự động áp dụng cho Swagger, AI Chat và Proxy.
            </p>

            {/* Presets in Modal */}
            <div
              className={`mt-4 grid gap-3 ${
                !isHust ? "sm:grid-cols-3" : "sm:grid-cols-2"
              }`}
            >
              {/* Option 1: Server Công Ty (CHỈ MEDIA TECH) */}
              {!isHust && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset("company")}
                  className={`flex flex-col text-left rounded-xl border p-3.5 transition ${
                    isCompanyMatch
                      ? "border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-800">
                      🏢 Server Công Ty (189)
                    </span>
                    {isCompanyMatch && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <span className="mt-1 text-[11px] text-slate-500">
                    Nội bộ 8817 / 8818
                  </span>
                  <span className="mt-2 text-[10px] font-mono text-slate-600 truncate">
                    192.168.0.189
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleApplyPreset("production")}
                className={`flex flex-col text-left rounded-xl border p-3.5 transition ${
                  isProductionMatch
                    ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800">
                    🌐 IP Public Dev
                  </span>
                  {isProductionMatch && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <span className="mt-1 text-[11px] text-slate-500">
                  {isHust
                    ? DEFAULT_PRESETS.hust.production.description
                    : DEFAULT_PRESETS.mt.production.description}
                </span>
                <span className="mt-2 text-[10px] font-mono text-slate-600 truncate">
                  {prodConfig.backend_laravel}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("localhost")}
                className={`flex flex-col text-left rounded-xl border p-3.5 transition ${
                  isLocalhostMatch
                    ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500"
                    : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">
                    💻 IP Local Dev
                  </span>
                  {isLocalhostMatch && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <span className="mt-1 text-[11px] text-slate-500">
                  {isHust
                    ? DEFAULT_PRESETS.hust.localhost.description
                    : DEFAULT_PRESETS.mt.localhost.description}
                </span>
                <span className="mt-2 text-[10px] font-mono text-slate-600 truncate">
                  {localConfig.backend_laravel}
                </span>
              </button>
            </div>

            {/* Custom URL Form */}
            <form onSubmit={handleSaveCustom} className="mt-4 border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold text-slate-800 mb-2">
                🛠️ Hoặc tự cấu hình URL tùy chỉnh:
              </h4>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Backend Laravel:
                  </label>
                  <input
                    type="url"
                    value={customLaravel}
                    onChange={(e) => setCustomLaravel(e.target.value)}
                    required
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Backend Node.js Gateway:
                  </label>
                  <input
                    type="url"
                    value={customNode}
                    onChange={(e) => setCustomNode(e.target.value)}
                    required
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
