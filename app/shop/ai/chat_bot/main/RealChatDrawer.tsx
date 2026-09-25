"use client";

import React, { useEffect } from "react";
import ChatBotClient from "../ChatBotClient";

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
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs transition-all duration-300">
      {/* Backdrop Click to close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Đóng cửa sổ Real chat"
      />

      {/* Slide-up Container from Bottom */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-2 pb-2 sm:px-4 sm:pb-4 animate-in slide-in-from-bottom duration-300 ease-out">
        <ChatBotClient isDrawer onClose={onClose} />
      </div>
    </div>
  );
}
