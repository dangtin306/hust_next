"use client";

import React, { useEffect } from "react";
import ChatBotClient from "../ChatBotClient";
import { X } from "lucide-react";

type RealChatDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RealChatDrawer({ isOpen, onClose }: RealChatDrawerProps) {
  // Listen for Escape key to close drawer
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-2 backdrop-blur-sm transition-all duration-300 sm:p-4">
      {/* Backdrop Click to close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Đóng cửa sổ Real chat"
      />

      {/* Responsive, framed modal: full-width on mobile and centered on desktop */}
      <div className="relative z-10 flex h-[calc(100dvh-1rem)] max-h-[920px] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-slate-100 via-white to-purple-50 shadow-2xl shadow-slate-950/30 animate-in zoom-in-95 duration-300 ease-out sm:h-[min(88dvh,860px)] sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ Real chat"
          title="Đóng Real chat"
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/95 text-slate-600 shadow-md transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="h-full min-h-0 w-full overflow-y-auto">
          <ChatBotClient isDrawer onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
