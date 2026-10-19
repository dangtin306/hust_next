import type { Metadata, Route } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  GitBranch,
  Workflow,
  Video,
  Code2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Media Tech | Home",
  description:
    "Trang tổng quan tài liệu API, công cụ chat, quản trị Workspace, sơ đồ hệ thống và tích hợp Git/Gitea.",
};

const destinations = [
  {
    label: "API List · 2 Hệ thống",
    title: "Danh Sách API Hệ Thống",
    description:
      "Trung tâm tra cứu nhanh 2 hệ thống API: Laravel Backend REST API và OpenClaw AI Gateway trên giao diện 2 khung tập trung.",
    href: "/api/mt/list/home",
    action: "Mở API List",
    Icon: Code2,
    tone: "blue",
  },
  {
    label: "Media Studio · MC Ảo",
    title: "Trung Tâm AI Media & Video",
    description:
      "Tạo video MC ảo từ kịch bản, trải nghiệm Live Avatar streaming và các giải pháp media thông minh.",
    href: "/api/mt/media/home",
    action: "Mở Media Hub",
    Icon: Video,
    tone: "rose",
  },
  {
    label: "AI Chat Bot · 2 Giao diện",
    title: "Trung Tâm AI Chat Bot",
    description:
      "Trung tâm AI Chat Bot gồm 2 giao diện: Chat Test kiểm thử Prompt/Session Laravel và Chat Public dành cho người dùng cuối.",
    href: "/api/mt/chat/home",
    action: "Mở Chat Bot Hub",
    Icon: Bot,
    tone: "purple",
  },
  {
    label: "Workflow & Maps",
    title: "Sơ đồ và giám sát luồng",
    description:
      "Xem bản đồ kiến trúc tổng quát và sơ đồ realtime của backend Laravel, Node.js cùng luồng sự kiện n8n.",
    href: "/api/mt/n8n/home",
    action: "Mở sơ đồ hệ thống",
    Icon: Workflow,
    tone: "emerald",
  },
  {
    label: "Workspace",
    title: "Quản trị Workspace",
    description:
      "Xem session và quản lý Workspace: tạo, sửa, đổi trạng thái, xóa hoặc đồng bộ routing qua API.",
    href: "/api/mt/workspace/home",
    action: "Mở quản trị Workspace",
    Icon: BriefcaseBusiness,
    tone: "indigo",
  },
  {
    label: "Git Auto · 3 Phân Hệ",
    title: "Trung Tâm Git Control",
    description:
      "Trung tâm Git Hub quản trị 3 phân hệ: Git Auto tự động đồng bộ & commit, Git Test kiểm thử thao tác qua API, và Gitea Test kết nối kho lưu trữ.",
    href: "/api/mt/git/home",
    action: "Mở Git Auto Hub",
    Icon: GitBranch,
    tone: "amber",
  },
] as const;

const toneClasses: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  purple: "border-purple-200 bg-purple-50 text-purple-700",
};

export default function SwaggerHomePage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-7">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Media Tech · Start here
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-800 sm:text-3xl">
          Tài liệu và công cụ hệ thống
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Chọn tài liệu API để xem/thử endpoint, hoặc mở công cụ chat, quản trị Workspace,
          sơ đồ hệ thống và tích hợp Git/Gitea. Các thao tác Git ghi dữ liệu được ghi chú
          riêng bên dưới.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {destinations.map(({ label, title, description, href, action, Icon, tone }) => (
          <Link
            key={`${href}-${label}`}
            prefetch={false}
            href={href as unknown as Route}
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
