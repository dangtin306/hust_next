"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  RotateCcw,
  Paperclip,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  AlertCircle,
  X,
  ExternalLink,
  Edit2,
  Hash,
  Lock,
  Plus,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  SUGGESTIONS,
  parseSpellCorrections,
  tokenNumberFormat,
  formatCompactTokenCount,
  compactTokenNumberFormat,
  type Message,
  type WorkspaceOption,
} from "./chat_process";
import { InitialChatLoader } from "../main/InitialChatLoader";

// Markdown-like text renderer with a friendly view for spelling corrections and code blocks.
export function FormattedMessageContent({
  text,
  serviceId,
}: {
  text: string;
  serviceId?: string;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeStr: string, idx: number) => {
    navigator.clipboard?.writeText(codeStr);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parts = text.split(/(```[\s\S]*?```)/g);

  if (serviceId === "media_spell_check") {
    const corrections = parseSpellCorrections(text);
    if (corrections) {
      return (
        <div className="w-full min-w-0 space-y-3">
          <div>
            <p className="font-semibold text-slate-800">Kết quả kiểm tra chính tả</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {corrections.length
                ? `Tìm thấy ${corrections.length} ${corrections.length === 1 ? "từ" : "từ/cụm từ"} có gợi ý chỉnh sửa.`
                : "Chưa tìm thấy lỗi chính tả cần chỉnh sửa."}
            </p>
          </div>
          <ul className="space-y-2">
            {corrections.map((correction, index) => (
              <li
                key={`${correction.word}-${index}`}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50/80 to-white px-3 py-2.5"
              >
                <span className="min-w-0 flex-1 break-words rounded-lg bg-rose-50 px-2.5 py-1.5 text-rose-700 line-through decoration-rose-300">
                  {correction.word}
                </span>
                <span aria-hidden="true" className="font-semibold text-purple-500">
                  →
                </span>
                <span className="min-w-0 flex-1 break-words rounded-lg bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-800">
                  {correction.suggestion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed sm:text-[15px]">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let language = "code";
          let codeContent = part.slice(3, -3).trim();

          if (lines.length > 0 && lines[0].trim().match(/^[a-zA-Z0-9_-]+$/)) {
            language = lines[0].trim();
            codeContent = lines.slice(1).join("\n");
          }

          return (
            <div
              key={index}
              className="my-2.5 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <Terminal className="h-3.5 w-3.5 text-purple-400" />
                  {language}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeContent, index)}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-slate-300 transition-all duration-150 hover:bg-slate-700 hover:text-white active:scale-95 cursor-pointer"
                >
                  {copiedIndex === index ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="h-3 w-3" /> Đã chép
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="h-3 w-3" /> Sao chép
                    </span>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3 text-xs font-mono leading-relaxed text-slate-200">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        return (
          <div key={index} className="whitespace-pre-wrap break-words">
            {part.split("\n").map((line, lIdx) => {
              const boldParts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <span key={lIdx} className="block min-h-[1.2em]">
                  {boldParts.map((sub, sIdx) => {
                    if (sub.startsWith("**") && sub.endsWith("**")) {
                      return (
                        <strong key={sIdx} className="font-semibold text-slate-900">
                          {sub.slice(2, -2)}
                        </strong>
                      );
                    }
                    if (sub.startsWith("`") && sub.endsWith("`") && sub.length > 2) {
                      return (
                        <code
                          key={sIdx}
                          className="mx-0.5 rounded bg-purple-100/80 px-1.5 py-0.5 font-mono text-[13px] text-purple-800"
                        >
                          {sub.slice(1, -1)}
                        </code>
                      );
                    }
                    return sub;
                  })}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Modal Popup trung tâm màn hình hiển thị danh sách Dịch vụ API Media Tech (Phương án 3).
 */
export function ServiceMenuModal({
  isOpen,
  onClose,
  selectedService,
  onSelectService,
  isChatLocked,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedService: string | null;
  onSelectService: (serviceKey: any) => void;
  isChatLocked: boolean;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Đóng bảng chọn dịch vụ"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-purple-200/90 bg-white shadow-2xl shadow-purple-950/20 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 id="service-modal-title" className="text-base font-bold text-slate-800 sm:text-lg">
                Dịch vụ API Media Tech
              </h3>
              <p className="text-xs text-slate-500">
                Chọn chế độ trợ lý AI phù hợp với nhu cầu của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white hover:text-slate-700 active:scale-95 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Services Grid Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-5 [scrollbar-width:thin]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SUGGESTIONS.map((item) => {
              const isSelected = selectedService === item.apiService;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    if (isChatLocked) return;
                    onSelectService(item.apiService);
                    onClose();
                  }}
                  disabled={isChatLocked}
                  className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                    isSelected
                      ? "border-purple-500 bg-gradient-to-br from-purple-50/90 to-pink-50/70 shadow-2xs ring-2 ring-purple-500/20"
                      : "border-slate-200/90 bg-white hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-xs"
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isSelected ? "text-purple-700 font-bold" : "text-slate-800 group-hover:text-purple-600"
                        }`}
                      >
                        {item.title}
                      </div>
                      {isSelected && (
                        <span className="shrink-0 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-purple-600">
                        {item.endpoint}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-purple-500" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-xs text-slate-500">
          <span>* Nhấp vào dịch vụ để chuyển chế độ chat tức thì</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-700 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-95 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal Popup nhập / thay đổi User ID cho phiên chat OpenClaw.
 * Hiển thị bắt buộc khi người dùng mới vào chưa có cấu hình trong localStorage.
 */
export function UserIdConfigModal({
  isOpen,
  onClose,
  isFirstTime = false,
  currentUserId,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
  currentUserId?: number | string | null;
  onSave: (userId: number | string) => void;
}) {
  const [inputVal, setInputVal] = useState(
    currentUserId !== undefined && currentUserId !== null && !isFirstTime
      ? String(currentUserId)
      : ""
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputVal(
        currentUserId !== undefined && currentUserId !== null && !isFirstTime
          ? String(currentUserId)
          : ""
      );
      setError(null);
    }
  }, [isOpen, currentUserId, isFirstTime]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isFirstTime) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFirstTime, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError("Vui lòng điền User ID để bắt đầu.");
      return;
    }
    const parsed = Number(trimmed);
    const finalId = Number.isInteger(parsed) ? parsed : trimmed;
    onSave(finalId);
  };

  const handleSelectPreset = (presetId: number | string) => {
    setInputVal(String(presetId));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${!isFirstTime ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (!isFirstTime) onClose();
        }}
        aria-label={!isFirstTime ? "Đóng modal" : undefined}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="userid-modal-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-purple-200/90 bg-white shadow-2xl shadow-purple-950/25 animate-in zoom-in-95 duration-200"
      >
        {/* Header gradient */}
        <div className="flex items-center justify-between border-b border-purple-100 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 id="userid-modal-title" className="text-base font-bold text-slate-800 sm:text-lg">
                {isFirstTime ? "Thiết lập User ID" : "Đổi User ID"}
              </h3>
              <p className="text-xs text-slate-500">
                {isFirstTime
                  ? "Vui lòng nhập User ID của bạn để khởi tạo phiên chat"
                  : "Chuyển sang User ID khác để đồng bộ phiên làm việc riêng biệt"}
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              User ID của bạn <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-mono text-sm font-semibold select-none">
                #
              </span>
              <input
                type="text"
                autoFocus
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Nhập User ID (VD: 502, 101, 540...)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 py-2.5 text-sm font-mono font-bold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-1.5">
              Gợi ý ID mẫu thường dùng:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[502, 101, 540, 1].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-medium transition ${
                    inputVal === String(preset)
                      ? "border-purple-400 bg-purple-50 text-purple-700 font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:bg-slate-50"
                  }`}
                >
                  #{preset} {preset === 502 ? "(Mặc định)" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            {!isFirstTime ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSave(502)}
                className="rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
              >
                Dùng mặc định (#502)
              </button>
            )}
            <button
              type="submit"
              className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/25 hover:from-purple-700 hover:to-indigo-700 transition"
            >
              {isFirstTime ? "Xác nhận & Bắt đầu" : "Lưu & Bắt đầu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type MediaUiUxProps = {
  // Config & callbacks
  onClose?: () => void;
  className?: string;
  isDrawer?: boolean;
  agent?: string;
  title?: string;
  subtitle?: string;
  agentBadge?: string;
  hideModel?: boolean;
  showWorkspaceUpdateButton?: boolean;

  // Process states
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  workspaces: WorkspaceOption[];
  selectedWorkspaceCode: string;
  isWorkspaceSelectionRequired: boolean;
  workspaceSelectionError: string;
  handleSelectWorkspace: (workspace: WorkspaceOption) => Promise<void>;
  isLoadingWorkspaces: boolean;
  isUpdatingWorkspaces: boolean;
  handleUpdateWorkspaces: () => Promise<void>;
  isSelectingWorkspace: boolean;
  workspaceSwitchProgress: number;
  workspaceSwitchStatus: string;
  workspaceSwitchName: string;
  selectedService: string | null;
  setSelectedService: (svc: any) => void;
  isServiceMenuExpanded: boolean;
  setIsServiceMenuExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
  attachedImage: any;
  setAttachedImage: (file: any) => void;
  isTyping: boolean;
  isRestoringChat: boolean;
  restoreProgress: number;
  restoreStatus: string;
  conversationId: string | null;
  copiedId: string | null;
  userId: number | string | null;
  isUserIdPromptOpen?: boolean;
  setIsUserIdPromptOpen?: (open: boolean) => void;
  isFirstTimeUser?: boolean;
  setIsFirstTimeUser?: (val: boolean) => void;
  handleSaveUserId?: (newUserId: number | string) => Promise<void>;
  isChatLocked: boolean;
  isRetryingHistory: boolean;
  effectiveSessionKey: string;
  openClawUrl: string;
  activeModel: string;

  // Refs
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  imageInputRef: React.RefObject<HTMLInputElement | null>;

  // Handlers
  handleCopy: (id: string, text: string) => void;
  handleReset: (newUserId?: number | string) => any;
  handleRetryHistory: () => any;
  handleCreateNewRoomFromError: () => any;
  onSendSubmit: () => any;
  handleImageSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleInputResize: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
};

/**
 * Giao diện chính của Media Tech AI Assistant (UI/UX).
 */
export function MediaUiUx(props: MediaUiUxProps) {
  const {
    onClose,
    className = "",
    isDrawer = false,
    agent,
    title = "Media Tech AI Assistant",
    subtitle = "Công cụ chat bot hỗ trợ bằng AI • Trực tuyến",
    agentBadge,
    hideModel = false,
    showWorkspaceUpdateButton = false,
    messages,
    input,
    workspaces,
    selectedWorkspaceCode,
    isWorkspaceSelectionRequired,
    workspaceSelectionError,
    handleSelectWorkspace,
    isLoadingWorkspaces,
    isUpdatingWorkspaces,
    handleUpdateWorkspaces,
    isSelectingWorkspace,
    workspaceSwitchProgress,
    workspaceSwitchStatus,
    workspaceSwitchName,
    selectedService,
    setSelectedService,
    isServiceMenuExpanded,
    setIsServiceMenuExpanded,
    attachedImage,
    setAttachedImage,
    isTyping,
    isRestoringChat,
    restoreProgress,
    restoreStatus,
    conversationId,
    copiedId,
    userId,
    isUserIdPromptOpen,
    setIsUserIdPromptOpen,
    isFirstTimeUser,
    setIsFirstTimeUser,
    handleSaveUserId,
    isChatLocked,
    isRetryingHistory,
    effectiveSessionKey,
    openClawUrl,
    activeModel,
    messagesContainerRef,
    messagesEndRef,
    textareaRef,
    imageInputRef,
    handleCopy,
    handleReset,
    handleRetryHistory,
    handleCreateNewRoomFromError,
    onSendSubmit,
    handleImageSelection,
    handleKeyDown,
    handleInputResize,
    handleCompositionStart,
    handleCompositionEnd,
  } = props;

  const [isWorkspacePromptDismissed, setIsWorkspacePromptDismissed] = useState(false);
  const currentSuggestion = SUGGESTIONS.find((item) => item.apiService === selectedService);
  // The chat API loader provides only selectable child workspaces; parent nodes stay in management.
  const workspaceChoices = workspaces;

  useEffect(() => {
    if (isWorkspaceSelectionRequired) setIsWorkspacePromptDismissed(false);
  }, [isWorkspaceSelectionRequired, workspaces]);

  const handleSelectServiceFromModal = (serviceKey: any) => {
    setSelectedService(serviceKey);
    if (serviceKey === "media_image_to_text") {
      imageInputRef.current?.click();
    } else {
      textareaRef.current?.focus();
    }
  };

  useEffect(() => {
    if (isDrawer) return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isDrawer]);

  return (
    <>
      <div
        className={`media-chat-root mx-auto flex w-full max-w-6xl flex-col min-h-0 ${
          isDrawer
            ? "h-full max-h-full p-0"
            : "h-full max-h-full px-1 pt-0 pb-1 sm:px-3 sm:pt-0 sm:pb-1.5"
        } ${className}`}
      >
        {/* Main Glassmorphism Chat Container */}
        <div
          className={`flex flex-1 min-h-0 flex-col overflow-hidden ${
            isDrawer
              ? "rounded-t-3xl sm:rounded-3xl border border-purple-200/90 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
              : "rounded-2xl sm:rounded-3xl border border-white/70 shadow-sm sm:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.18)]"
          } bg-white/95 backdrop-blur-xl transition-all`}
        >
          {/* Top Header */}
          <header className="relative z-20 flex shrink-0 items-center justify-between border-b border-purple-100/90 bg-white/90 px-3 py-2 sm:px-5 sm:py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 text-white shadow-md shadow-purple-500/25">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="truncate text-sm font-bold text-slate-800 sm:text-lg">
                    {title}
                  </h2>
                  <span className="hidden xs:inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {agentBadge || (agent ? `Agent: ${agent}` : "Live AI")}
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-slate-500">
                  {subtitle}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-1.5">
                  {/* User ID Tag */}
                  <div className="inline-flex items-center gap-1 rounded-md border border-purple-200/90 bg-purple-50/90 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-purple-700 shadow-2xs transition-colors hover:border-purple-300">
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600" />
                    <span>ID:</span>
                    <span className="font-mono font-bold text-purple-900">
                      {userId ? `#${userId}` : "#502"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFirstTimeUser?.(false);
                        setIsUserIdPromptOpen?.(true);
                      }}
                      title="Đổi User ID"
                      className="ml-0.5 rounded p-0.5 text-purple-500 transition-colors hover:bg-purple-200/60 hover:text-purple-800 active:scale-95"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {/* Session Key Tag */}
                  <div
                    title={`Session Key: ${effectiveSessionKey}\nClick để sao chép`}
                    onClick={() => handleCopy("session_key", effectiveSessionKey)}
                    className="hidden md:inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200/90 bg-slate-50/90 px-2 py-0.5 text-[11px] font-mono text-slate-600 transition-all hover:border-purple-300 hover:bg-purple-50/70 hover:text-purple-700 active:scale-[0.98]"
                  >
                    <Hash className="h-3 w-3 text-slate-400" />
                    <span className="max-w-[130px] truncate sm:max-w-[190px]">{effectiveSessionKey}</span>
                    {copiedId === "session_key" ? (
                      <Check className="h-2.5 w-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-2.5 w-2.5 text-slate-400" />
                    )}
                  </div>

                  {/* OpenClaw Direct Link */}
                  <a
                    href={openClawUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={`Mở phiên OpenClaw của User #${userId}`}
                    className="hidden sm:inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/80 px-2 py-0.5 text-[11px] font-medium text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-100/90 shadow-2xs active:scale-[0.98]"
                  >
                    <span>OpenClaw ({userId ? `#${userId}` : "UI"})</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>

                  {/* Open Service Menu Modal Button */}
                  <button
                    type="button"
                    onClick={() => setIsServiceMenuExpanded(true)}
                    title="Mở bảng điều khiển Menu Dịch vụ AI"
                    className="inline-flex items-center gap-1 rounded-md border border-purple-200/90 bg-purple-50/90 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-purple-700 transition-all shadow-2xs hover:border-purple-300 hover:bg-purple-100 active:scale-95 cursor-pointer"
                    aria-expanded={isServiceMenuExpanded}
                  >
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600" />
                    <span>Menu AI</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!hideModel && (
                <div className="hidden items-center gap-1.5 rounded-xl border border-purple-100 bg-purple-50/80 px-3 py-1.5 text-xs font-medium text-purple-700 sm:flex">
                  <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                  <span>{activeModel}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleReset()}
                title="Gửi /reset lên OpenClaw và tạo cuộc trò chuyện mới"
                aria-label="Reset hoàn toàn cuộc trò chuyện"
                disabled={isRestoringChat || isSelectingWorkspace || isTyping}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 active:scale-95 disabled:cursor-wait disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className={`h-4 w-4 ${isRestoringChat ? "animate-spin" : ""}`} />
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  title="Đóng cửa sổ chat"
                  aria-label="Đóng cửa sổ chat"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </header>

          <div className="shrink-0 border-b border-purple-100/80 bg-white/90 px-3 py-2 sm:px-6">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:inline-flex">
                  <Layers className="h-3 w-3" />
                  Không gian
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.work_space_code}
                      type="button"
                      onClick={() => void handleSelectWorkspace(workspace)}
                      disabled={isSelectingWorkspace || isUpdatingWorkspaces || isRestoringChat || isTyping}
                      aria-pressed={selectedWorkspaceCode === workspace.work_space_code}
                      title={workspace.description || workspace.workspace_name}
                      className={`shrink-0 max-w-[230px] truncate rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 disabled:cursor-wait disabled:opacity-60 active:scale-95 cursor-pointer ${
                        selectedWorkspaceCode === workspace.work_space_code
                          ? "border-purple-300/90 bg-purple-100/90 text-purple-800 shadow-2xs font-semibold ring-1 ring-purple-300/50"
                          : "border-slate-200/90 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50/50 hover:text-purple-700"
                      }`}
                    >
                      {workspace.workspace_name}
                    </button>
                  ))}
                  {isLoadingWorkspaces && (
                    <span className="shrink-0 animate-pulse px-2 text-[10px] text-slate-400">
                      Đang tải danh sách…
                    </span>
                  )}
                  {!isLoadingWorkspaces && workspaces.length === 0 && (
                    <span className="shrink-0 px-2 text-[10px] text-slate-400">
                      Không có workspace khả dụng
                    </span>
                  )}
                </div>
              </div>
              {showWorkspaceUpdateButton && (
                <button
                  type="button"
                  onClick={() => void handleUpdateWorkspaces()}
                  disabled={isUpdatingWorkspaces || isLoadingWorkspaces || isSelectingWorkspace || isTyping}
                  title="Đồng bộ routing và tải lại danh sách workspace"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-purple-200/90 bg-purple-50/80 px-2.5 py-1 text-[11px] font-medium text-purple-700 transition-all shadow-2xs hover:border-purple-300 hover:bg-purple-100 active:scale-95 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
                >
                  <RotateCcw className={`h-3 w-3 ${isUpdatingWorkspaces ? "animate-spin" : ""}`} />
                  {isUpdatingWorkspaces ? "Đang cập nhật…" : "Cập nhật"}
                </button>
              )}
            </div>
          </div>

          {/* Message History Area (100% clean, no clutter) */}
          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-1.5 sm:px-6 sm:pt-3 sm:pb-2 [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200/80 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
            aria-busy={isRestoringChat || isSelectingWorkspace}
          >
            <div className="flow-root space-y-3 sm:space-y-4">
              {isRestoringChat && (
                <InitialChatLoader progress={restoreProgress} status={restoreStatus} />
              )}
              {isSelectingWorkspace && (
                <InitialChatLoader
                  title="Đang đổi workspace"
                  progress={workspaceSwitchProgress}
                  status={workspaceSwitchStatus || `Đang đợi chuyển sang “${workspaceSwitchName}”…`}
                />
              )}

              {/* Messages List */}
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={`group flex items-start gap-2.5 ${
                      isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    {/* Bot Avatar on Left */}
                    {isBot && (
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs transition-transform duration-200 group-hover:scale-105 ${
                          msg.isError
                            ? "bg-rose-500 shadow-rose-500/20"
                            : "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/25"
                        }`}
                      >
                        {msg.isError ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                    )}

                    {/* Message Bubble Content */}
                    <div
                      className={`relative flex max-w-[88%] flex-col sm:max-w-[80%] ${
                        isBot ? "items-start" : "items-end"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-[15px] transition-shadow ${
                          isBot
                            ? msg.isError
                              ? "rounded-tl-xs border border-rose-200/90 bg-rose-50/95 text-rose-900 shadow-2xs"
                              : "rounded-tl-xs border border-slate-200/80 bg-white/95 text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xs hover:border-slate-300/80"
                            : "rounded-tr-xs bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 text-white shadow-[0_3px_12px_rgba(147,51,234,0.22)]"
                        }`}
                      >
                        {!isBot && msg.serviceDescription && (
                          <div className="mb-2 flex items-start gap-2 border-b border-white/20 pb-2">
                            <span className="mt-0.5 shrink-0 rounded-md border border-white/25 bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90">
                              Service
                            </span>
                            <span className="text-xs font-semibold leading-snug text-white/95">
                              {msg.serviceDescription}
                            </span>
                          </div>
                        )}
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt={isBot ? "Ảnh được tạo bởi Media Tech AI" : "Ảnh được đính kèm để phân tích"}
                            className="mb-2 max-h-[480px] max-w-full rounded-xl border border-purple-100 object-contain shadow-xs"
                          />
                        )}
                        {isBot ? (
                          <>
                            <FormattedMessageContent
                              text={msg.imageUrl ? "Mình đã tạo ảnh cho bạn đây." : msg.text}
                              serviceId={msg.serviceId}
                            />
                            {msg.isHistoryErrorPrompt && (
                              <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-rose-200/80 pt-3">
                                <button
                                  type="button"
                                  onClick={handleRetryHistory}
                                  disabled={isRetryingHistory}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs shadow-purple-500/20 transition-all hover:from-purple-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                  <RotateCcw className={`h-3.5 w-3.5 ${isRetryingHistory ? "animate-spin" : ""}`} />
                                  <span>{isRetryingHistory ? "Đang tải lại..." : "Tải lại"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCreateNewRoomFromError}
                                  disabled={isRetryingHistory}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                  <Plus className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Tạo mới</span>
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                        )}
                      </div>

                      {/* Message Meta Info: Timestamp, Copy button & Token Usage on the same row */}
                      <div
                        className={`mt-1 flex flex-wrap items-center gap-2 px-1 text-[11px] text-slate-500 ${
                          isBot ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <span className="font-medium text-slate-400">{msg.time}</span>
                        {isBot && !msg.isError && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="rounded-md px-1 py-0.5 opacity-0 transition-all hover:bg-purple-50 hover:text-purple-600 group-hover:opacity-100 active:scale-90 cursor-pointer"
                            title="Sao chép nội dung"
                          >
                            {copiedId === msg.id ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <Check className="h-3 w-3" /> Đã chép
                              </span>
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}

                        {isBot && !msg.isError && msg.usage && (
                          <div
                            className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 rounded-full border border-purple-200/70 bg-purple-50/70 px-2 py-0.5 text-[10px] leading-none text-slate-600 shadow-2xs transition-colors hover:bg-purple-50 hover:border-purple-200"
                            aria-label="Mức sử dụng token của phản hồi"
                            title={[
                              msg.usage.inputTokens !== undefined
                                ? `Input không cache: ${tokenNumberFormat.format(msg.usage.inputTokens)}`
                                : undefined,
                              `Cache-read: ${tokenNumberFormat.format(msg.usage.cacheReadTokens ?? 0)}`,
                              msg.usage.outputTokens !== undefined
                                ? `Output: ${tokenNumberFormat.format(msg.usage.outputTokens)}`
                                : undefined,
                              msg.usage.totalTokens !== undefined
                                ? `Tổng: ${tokenNumberFormat.format(msg.usage.totalTokens)}`
                                : undefined,
                            ].filter(Boolean).join(" · ")}
                          >
                            <Sparkles className="h-2.5 w-2.5 shrink-0 text-purple-600" aria-hidden="true" />
                            {msg.usage.inputTokens !== undefined && (
                              <span className="font-semibold text-slate-700">↑{formatCompactTokenCount(msg.usage.inputTokens)}</span>
                            )}
                            {msg.usage.outputTokens !== undefined && (
                              <span className="font-semibold text-slate-700">↓{formatCompactTokenCount(msg.usage.outputTokens)}</span>
                            )}
                            <span className="font-semibold text-slate-700">
                              R{formatCompactTokenCount(msg.usage.cacheReadTokens ?? 0)}
                            </span>
                            {msg.usage.contextPercentage !== undefined && (
                              <span className="font-semibold text-slate-600">ctx {compactTokenNumberFormat.format(msg.usage.contextPercentage)}%</span>
                            )}
                            {msg.usage.model && !hideModel && (
                              <span className="truncate font-medium text-slate-500">{msg.usage.model}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Avatar on Right */}
                    {!isBot && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-2xs transition-transform duration-200 group-hover:scale-105">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-xs shadow-purple-500/20">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs border border-purple-100/90 bg-white/95 px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-pink-500 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-0 w-0 -mt-3 sm:-mt-4" />
            </div>
          </div>

          {/* Input Bar & Footer Controls */}
          <footer className="shrink-0 border-t border-purple-100/90 bg-white/80 px-2 pt-2 pb-2 backdrop-blur-md sm:px-4 sm:pt-2.5 sm:pb-3">
            {isChatLocked && (
              <div className="mb-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/95 px-3.5 py-2 text-xs text-amber-900 shadow-xs">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Khung chat đang bị khóa:</strong> Không thể tải danh sách tin nhắn cũ. Chọn <strong>Tải lại</strong> hoặc <strong>Tạo mới</strong> để tiếp tục.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleRetryHistory}
                    disabled={isRetryingHistory}
                    className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-purple-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className={`h-3 w-3 ${isRetryingHistory ? "animate-spin" : ""}`} />
                    <span>{isRetryingHistory ? "Đang tải..." : "Tải lại"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewRoomFromError}
                    disabled={isRetryingHistory}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Tạo mới
                  </button>
                </div>
              </div>
            )}

            <div className="relative flex items-end gap-2 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xs transition-all duration-200 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-500/10 hover:border-slate-300">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleImageSelection}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isRestoringChat || isSelectingWorkspace || isChatLocked || isRetryingHistory}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-purple-50 hover:text-purple-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                title="Đính kèm ảnh cho dịch vụ OCR"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <div className="min-w-0 flex-1">
                {/* Active service badge (Click to open Central Modal) */}
                <div className="mb-1 flex items-center gap-1.5 px-0.5">
                  <button
                    type="button"
                    onClick={() => setIsServiceMenuExpanded(true)}
                    className="group inline-flex items-center gap-1 rounded-lg border border-purple-200/90 bg-purple-50/90 px-2 py-0.5 text-[11px] font-medium text-purple-800 transition-all duration-150 hover:border-purple-300 hover:bg-purple-100 active:scale-95 shadow-2xs cursor-pointer"
                    title="Bấm để mở danh sách dịch vụ AI"
                  >
                    <span>{currentSuggestion?.icon || "💬"}</span>
                    <span className="font-semibold">
                      {currentSuggestion?.title || selectedService || "Chatbot thuần"}
                    </span>
                    <span className="text-[10px] text-purple-500 font-normal transition-transform group-hover:translate-x-0.5">
                      · Đổi dịch vụ ▾
                    </span>
                  </button>
                  {selectedService === "media_content_smart" && (
                    <span className="hidden sm:inline text-[10px] text-slate-400 truncate">
                      (Dòng 1: tiêu đề • Dòng tiếp: mô tả)
                    </span>
                  )}
                </div>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputResize}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  rows={1}
                  disabled={isRestoringChat || isSelectingWorkspace || isChatLocked || isRetryingHistory}
                  placeholder={
                    isChatLocked
                      ? "🔒 Khung chat đang bị khóa do không tải được lịch sử tin nhắn..."
                      : !selectedService || selectedService === "media_text_to_text"
                      ? "Nhập câu hỏi hoặc nội dung bạn cần..."
                      : selectedService === "media_text_to_image"
                      ? "Mô tả hình ảnh muốn tạo..."
                      : selectedService === "media_image_to_text"
                      ? "Đính kèm ảnh và nhập điều muốn nhận diện/phân tích..."
                      : selectedService === "media_content_smart"
                      ? "Dòng 1: tiêu đề. Dòng tiếp: mô tả/ý chính cần viết..."
                      : selectedService === "media_spell_check"
                      ? "Dán đoạn văn cần sửa chính tả..."
                      : selectedService === "media_script_writing"
                      ? "Nhập chủ đề, thời lượng, đối tượng và phong cách kịch bản..."
                      : "Nhập văn bản muốn chuyển thành giọng nói..."
                  }
                  className="max-h-52 min-h-[38px] w-full resize-none bg-transparent py-2 text-sm leading-normal text-slate-800 placeholder-slate-400 focus:outline-none sm:text-[15px] disabled:cursor-not-allowed disabled:opacity-60 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                />
              </div>

              {(() => {
                const canSend =
                  !isRestoringChat &&
                  !isSelectingWorkspace &&
                  !isChatLocked &&
                  !isRetryingHistory &&
                  !isTyping &&
                  Boolean(input.trim() || textareaRef.current?.value.trim() || attachedImage);
                return (
                  <button
                    type="button"
                    onClick={() => onSendSubmit()}
                    disabled={!canSend}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                      canSend
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs shadow-purple-500/25 hover:from-purple-700 hover:to-indigo-700 hover:shadow-md hover:shadow-purple-500/30 active:scale-95 cursor-pointer"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                    title={isChatLocked ? "Khung chat đang bị khóa" : canSend ? "Gửi tin nhắn" : "Nhập nội dung để gửi"}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                );
              })()}
            </div>

            {attachedImage && (
              <div className="mt-2 flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/90 px-3 py-2 text-xs text-purple-800 shadow-2xs">
                <span className="truncate font-medium">Ảnh OCR: {attachedImage.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="ml-3 rounded-lg p-1 hover:bg-purple-200/60 transition-colors"
                  aria-label="Bỏ ảnh đính kèm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5 px-1 text-[10px] sm:text-[11px] text-slate-500">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>OpenClaw Live</span>
                </span>
                <span className="font-mono text-slate-600">
                  • User: <strong className="text-purple-700">#{userId}</strong>
                </span>
                {conversationId && (
                  <span
                    onClick={() => handleCopy("conv_id", conversationId)}
                    title="Click để sao chép conversation_id"
                    className="cursor-pointer font-mono text-slate-400 hover:text-purple-600 flex items-center gap-1 transition-colors"
                  >
                    • Conv: {conversationId.slice(0, 8)}...
                    {copiedId === "conv_id" ? <Check className="h-2 w-2 text-emerald-500" /> : <Copy className="h-2 w-2" />}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-[11px] text-slate-400">
                  Enter gửi • Shift+Enter xuống dòng
                </span>
                <a
                  href={openClawUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`Mở phiên OpenClaw của User #${userId}`}
                  className="hidden sm:inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors active:scale-95"
                >
                  <span>Mở OpenClaw UI</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                {!hideModel && (
                  <span className="hidden sm:inline font-mono text-slate-400">
                    • {activeModel}
                  </span>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Central Service Menu Modal (Phương án 3) */}
      <ServiceMenuModal
        isOpen={isServiceMenuExpanded}
        onClose={() => setIsServiceMenuExpanded(false)}
        selectedService={selectedService}
        onSelectService={handleSelectServiceFromModal}
        isChatLocked={isChatLocked}
      />

      {/* User ID Config Modal (Hiện bắt buộc khi người mới vào chưa có config) */}
      {handleSaveUserId && (
        <UserIdConfigModal
          isOpen={Boolean(isUserIdPromptOpen)}
          onClose={() => setIsUserIdPromptOpen?.(false)}
          isFirstTime={Boolean(isFirstTimeUser)}
          currentUserId={userId}
          onSave={handleSaveUserId}
        />
      )}

      {isWorkspaceSelectionRequired && !isRestoringChat && !isWorkspacePromptDismissed && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="required-workspace-title"
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-2xl shadow-purple-950/25"
          >
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="required-workspace-title" className="text-base font-bold text-slate-900 sm:text-lg">
                    Chọn workspace để tiếp tục
                  </h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                    Tài khoản này chưa có workspace đang hoạt động. Hãy chọn một workspace để bắt đầu chat.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkspacePromptDismissed(true)}
                aria-label="Đóng hộp chọn workspace"
                title="Đóng hộp chọn; chat vẫn khóa đến khi chọn workspace"
                className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-200 bg-white/80 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[55vh] space-y-2 overflow-y-auto p-4 sm:p-5">
              {workspaceChoices.length > 0 ? workspaceChoices.map((workspace) => (
                <button
                  key={workspace.work_space_code}
                  type="button"
                  onClick={() => void handleSelectWorkspace(workspace)}
                  disabled={isSelectingWorkspace || isRestoringChat}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-purple-300 hover:bg-purple-50/70 disabled:cursor-wait disabled:opacity-60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {workspace.workspace_name}
                    </span>
                    {workspace.description && (
                      <span className="mt-0.5 block line-clamp-2 text-xs text-slate-500">
                        {workspace.description}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-purple-600" />
                </button>
              )) : (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
                  Hiện chưa tải được workspace khả dụng. Chat sẽ tiếp tục bị khóa cho đến khi có workspace để chọn.
                </p>
              )}

              {isSelectingWorkspace && (
                <div className="rounded-xl bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700" role="status">
                  {workspaceSwitchStatus || "Đang gửi yêu cầu chọn workspace lên OpenClaw…"}
                </div>
              )}
              {workspaceSelectionError && !isSelectingWorkspace && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700" role="alert">
                  Chưa chọn được workspace: {workspaceSelectionError}. Hãy thử lại hoặc chọn workspace khác.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default MediaUiUx;
