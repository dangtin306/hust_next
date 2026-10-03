"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Sparkles, X } from "lucide-react";
import MediaTechChatClient from "../main/media_main";

export default function ChatPublicLauncher() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => {
    try {
      const identityMigrationKey = "chat_public_identity_migrated_v1";
      if (!window.localStorage.getItem(identityMigrationKey)) {
        // Remove the old hard-coded placeholder once; preserve IDs allocated by Node later.
        if (window.localStorage.getItem("chat_public_conv_id_user_id") === "502") {
          window.localStorage.removeItem("chat_public_conv_id_user_id");
        }
        window.localStorage.setItem(identityMigrationKey, "1");
      }
    } catch {
      // The chat can still initialize through OpenClaw.
    }
    setIsChatOpen(true);
  };

  useEffect(() => {
    if (!isChatOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsChatOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChatOpen]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <section className="space-y-5 rounded-3xl border border-white/70 bg-white/90 p-8 text-center shadow-sm backdrop-blur-xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-purple-500/25">
          <MessageSquare className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" aria-hidden="true" />
            <span>Chat Public</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Trò chuyện cùng AI
          </h1>
          <p className="mx-auto max-w-md text-sm text-slate-500">
            Mở khung chat ngay trên trang này, có khôi phục lịch sử và chọn dịch vụ như Chat Test.
          </p>
        </div>
        <button
          type="button"
          onClick={openChat}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 active:translate-y-0"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Mở khung chat
        </button>
      </section>

      {isChatOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsChatOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Chat Public AI"
            className="relative flex h-[calc(100dvh-1rem)] max-h-[920px] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-slate-100 via-white to-purple-50 shadow-2xl sm:h-[min(90dvh,860px)] sm:rounded-3xl"
          >
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              aria-label="Đóng khung chat"
              title="Đóng khung chat"
              className="absolute right-2 top-2 z-40 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/95 text-slate-600 shadow-md transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 sm:right-3 sm:top-3"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="h-full min-h-0 w-full overflow-hidden">
              <MediaTechChatClient
                isDrawer
                onClose={() => setIsChatOpen(false)}
                className="h-full max-h-full"
                targetUrl="https://node_md.hust.media/openclaw"
                sessionKey="agent:test"
                storageKey="chat_public_conv_id"
                model="gpt-5.6-luna"
                useResponsesApi
                hideModel
                createUserIfMissing
                showWelcomeMessage={false}
                title="Chat Public Assistant"
                subtitle="Trợ lý AI trực tuyến"
                agentBadge="Live AI"
                defaultUserId={null}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
