"use client";

import React, { useState } from "react";
import SwaggerClient from "@/app/api/maps/SwaggerClient";
import ChatBotApiClient from "./ChatBotApiClient";
import { openClawSwaggerSpec } from "./openclaw_spec";
import {
  FileCode2,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function SwaggerEmbedClient() {
  const [activeTab, setActiveTab] = useState<"swagger" | "chat">("swagger");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.hash === "#chat" ||
        window.location.search.includes("tab=chat") ||
        window.location.search.includes("view=chat")
      ) {
        setActiveTab("chat");
      }
    }
  }, []);

  const handleTabChange = (tab: "swagger" | "chat") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      if (tab === "chat") {
        window.history.replaceState(null, "", window.location.pathname + "#chat");
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  };

  return (
    <div className="w-full bg-transparent text-slate-800 antialiased selection:bg-purple-200">
      {/* Top Glassmorphic Navigation Header */}
      <header className="mb-4 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md shadow-purple-500/20">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                  Hust AI Assistant | API Test & Swagger
                </h1>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800 border border-purple-200/70">
                  OpenClaw Swagger
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Nhúng tài liệu Swagger tương tác & Test trực tiếp API OpenClaw Production
              </p>
            </div>
          </div>

          {/* Tab Switcher: Swagger UI vs Chatbot View */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/90 p-1">
            <button
              type="button"
              onClick={() => handleTabChange("swagger")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "swagger"
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>Swagger UI (Nhúng)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("chat")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "chat"
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Giao diện Chatbot</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === "swagger" ? (
        <div className="mx-auto max-w-7xl space-y-4">
          {/* Quick API Overview Banner */}
          <div className="rounded-2xl border border-white/70 bg-white/75 p-4 sm:p-5 shadow-xs backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Media Tech OpenClaw Gateway API (Production)
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Base URL chuẩn:{" "}
                  <code className="rounded bg-white/90 px-2 py-0.5 font-mono font-semibold text-purple-700 border border-purple-200">
                    https://node_js.hust.media/openclaw
                  </code>
                </p>
              </div>

              {/* 5-step badge checklist */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-700">
                <span className="rounded-lg bg-white/80 border border-purple-100 px-2 py-1 shadow-2xs font-mono">
                  1. POST /v1/conversations
                </span>
                <span className="text-purple-400">➔</span>
                <span className="rounded-lg bg-white/80 border border-purple-100 px-2 py-1 shadow-2xs font-mono">
                  2. POST /v1/chat/completions
                </span>
                <span className="text-purple-400">➔</span>
                <span className="rounded-lg bg-white/80 border border-purple-100 px-2 py-1 shadow-2xs font-mono">
                  3. GET /v1/conversations/:id/items
                </span>
              </div>
            </div>
          </div>

          {/* Embedded Swagger UI Container with Glassmorphism */}
          <div className="swagger-ui-transparent overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-3 sm:p-6 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.15)] backdrop-blur-xl">
            <SwaggerClient spec={openClawSwaggerSpec} />
          </div>

          {/* Scoped CSS for transparent Swagger UI */}
          <style jsx global>{`
            .swagger-ui-transparent .swagger-ui {
              background: transparent !important;
              background-color: transparent !important;
            }
            .swagger-ui-transparent .swagger-ui .scheme-container {
              background: transparent !important;
              background-color: transparent !important;
              box-shadow: none !important;
              border-bottom: 1px solid rgba(226, 232, 240, 0.8) !important;
              padding: 0 0 16px 0 !important;
              margin-bottom: 20px !important;
            }
            .swagger-ui-transparent .swagger-ui .wrapper {
              padding: 0 !important;
              max-width: none !important;
            }
            .swagger-ui-transparent .swagger-ui section.models {
              background: rgba(255, 255, 255, 0.7) !important;
              border-radius: 1.25rem !important;
              border: 1px solid rgba(226, 232, 240, 0.8) !important;
              backdrop-filter: blur(8px) !important;
            }
            .swagger-ui-transparent .swagger-ui .opblock {
              border-radius: 1rem !important;
              backdrop-filter: blur(8px) !important;
            }
            .swagger-ui-transparent .swagger-ui .opblock .opblock-summary {
              border-radius: 1rem !important;
            }
            .swagger-ui-transparent .swagger-ui .information-container {
              background: transparent !important;
            }
            .swagger-ui-transparent .swagger-ui .info {
              margin: 10px 0 20px 0 !important;
            }
          `}</style>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl">
          <ChatBotApiClient />
        </div>
      )}
    </div>
  );
}
