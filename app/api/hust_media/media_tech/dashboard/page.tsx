import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  MessageSquare,
  Radio,
  Server,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hust Media | Home",
  description:
    "Trang tổng quan tài liệu API và công cụ chat của Hust Media.",
};

const destinations = [
  {
    label: "Laravel API",
    title: "Laravel Backend",
    description:
      "Tài liệu và giao diện thử API Laravel cho Workspace, phòng chat, session và tin nhắn.",
    href: "/api/hust/laravel",
    action: "Mở tài liệu Laravel",
    Icon: Server,
    tone: "blue",
  },
  {
    label: "OpenClaw API",
    title: "OpenClaw Gateway",
    description:
      "Xem và thử các endpoint AI như hội thoại, responses, model, workspace và tạo ảnh.",
    href: "/api/hust/openclaw",
    action: "Mở tài liệu OpenClaw",
    Icon: Sparkles,
    tone: "violet",
  },
  {
    label: "Chat Test",
    title: "Giao diện chat thử nghiệm",
    description:
      "Kiểm tra luồng chat AI từ giao diện, gồm gửi yêu cầu và làm việc với workspace hội thoại.",
    href: "/api/hust/chat_test",
    action: "Mở Chat Test",
    Icon: Bot,
    tone: "cyan",
  },
  {
    label: "Chat Public",
    title: "Chat công khai",
    description:
      "Mở giao diện chat dành cho người dùng; trang này khởi chạy khung chat công khai.",
    href: "/api/hust/chat_public",
    action: "Mở Chat Public",
    Icon: MessageSquare,
    tone: "sky",
  },
  {
    label: "AI Chat Bot",
    title: "Ứng dụng AI Chat Bot",
    description:
      "Mở trợ lý AI Hust Media để sử dụng các chức năng hội thoại.",
    href: "/api/hust/chat_test",
    action: "Mở ứng dụng Chat Bot",
    Icon: Radio,
    tone: "purple",
  },
] as const;

const toneClasses: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  purple: "border-purple-200 bg-purple-50 text-purple-700",
};

export default function SwaggerHomePage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-7">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Hust Media · Start here
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-800 sm:text-3xl">
          Tài liệu API và công cụ chat
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Chọn tài liệu API để xem hoặc thử endpoint, hoặc mở giao diện chat của Hust Media.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {destinations.map(({ label, title, description, href, action, Icon, tone }) => (
          <Link
            key={`${href}-${label}`}
            prefetch={false}
            href={href}
            className="group flex min-h-56 flex-col rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-800">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
              {action}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
