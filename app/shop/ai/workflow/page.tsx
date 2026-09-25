import type { Metadata } from "next";
import Link from "next/link";
import ChatBotSwitcher from "./ChatBotSwitcher";
import {
  Bot,
  FileCode2,
  Workflow,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Workflow & Swagger Hub | Hust AI Assistant",
  description:
    "Trung tâm điều khiển tài liệu API, Workflow và công cụ kiểm thử AI Dự án 2 - Hust Media.",
};

export default function WorkflowHomePage() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent p-4 sm:p-6">
      {/* Switcher Navigation */}
      <ChatBotSwitcher active="home" />

      {/* Hero / Start Here Section */}
      <section className="mb-6 rounded-2xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-md sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-800 border border-blue-200/80">
                Start here
              </span>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-purple-800 border border-purple-200/80">
                Dự án 2 • AI Workflow
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Chọn tài liệu &amp; công cụ bạn muốn xem
            </h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Home giới thiệu trung tâm các công cụ kiểm thử AI, giao diện Chatbot và quy trình Workflow AI Dự án 2. Chọn một khung bên dưới để bắt đầu.
            </p>
          </div>
        </div>

        {/* Featured Project 2 Quick Action Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {/* Card: Laravel n8n */}
          <Link
            href={"/workflow/chat_bot/laravel" as any}
            className="group relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-500/20">
                <Workflow className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Workflow Sơ đồ
              </span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Sơ đồ Laravel n8n
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Sơ đồ realtime giám sát luồng telemetry, heartbeat và tương tác giữa Laravel backend và n8n workflow qua WebSocket.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <span>Mở sơ đồ Laravel n8n</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card: Chat Test */}
          <Link
            href={"/workflow/chat_bot/test_1" as any}
            className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                Chatbot AI
              </span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Chat Test (Hust AI Assistant)
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Trải nghiệm trò chuyện trực tiếp cùng trợ lý AI của Hust Media, hỗ trợ sinh viên và kết nối luồng agent OpenClaw.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
              <span>Mở phòng chat test</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card: API Test & Swagger */}
          <Link
            href={"/workflow/chat_bot/api_1" as any}
            className="group relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-pink-50/70 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white shadow-sm shadow-purple-500/20">
                <FileCode2 className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                Tài liệu &amp; Test
              </span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              API Test &amp; Swagger Embed
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Tài liệu Swagger nhúng tương tác và bộ test trực tiếp các endpoint OpenClaw Production API của Hust Media.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-purple-600">
              <span>Khám phá API &amp; Swagger</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
