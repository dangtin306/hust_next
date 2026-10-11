import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { ArrowDown, ArrowRight, Boxes, Braces, Database, Radio, Server, Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "Map mains · Cấu trúc tổng quát | Hust Media",
  description: "Bản đồ tổng quan các thành phần và luồng kết nối chính của Media Tech.",
};

const mainStages = [
  {
    title: "Người dùng",
    subtitle: "Browser / client",
    detail: "Giao diện chat, quản trị Workspace và các công cụ vận hành.",
    Icon: Boxes,
    color: "blue",
  },
  {
    title: "Frontend Next.js",
    subtitle: "App Router · basePath /next",
    detail: "Render trang, điều hướng và cung cấp API proxy cùng origin.",
    Icon: Braces,
    color: "violet",
  },
  {
    title: "API & tích hợp",
    subtitle: "Route handlers / proxies",
    detail: "Chuyển tiếp request, chuẩn hóa luồng gọi và phản hồi giữa frontend với backend.",
    Icon: Workflow,
    color: "indigo",
  },
  {
    title: "Backend & dữ liệu",
    subtitle: "Services · storage · events",
    detail: "Các dịch vụ xử lý nghiệp vụ, lưu trạng thái và phát sự kiện realtime về giao diện.",
    Icon: Radio,
    color: "cyan",
  },
];

const backends = [
  {
    title: "Laravel",
    detail: "Workspace, session và nghiệp vụ ứng dụng.",
    Icon: Server,
    href: "/api/mt/n8n/laravel",
    color: "emerald",
  },
  {
    title: "OpenClaw / Node.js",
    detail: "AI gateway, hội thoại và xử lý request.",
    Icon: Braces,
    href: "/api/mt/n8n/node_js",
    color: "blue",
  },
  {
    title: "Database & realtime",
    detail: "Dữ liệu nghiệp vụ, workflow và sự kiện theo thời gian thực.",
    Icon: Database,
    href: null,
    color: "amber",
  },
];

const colorClasses: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50/80 text-blue-700",
  violet: "border-violet-200 bg-violet-50/80 text-violet-700",
  indigo: "border-indigo-200 bg-indigo-50/80 text-indigo-700",
  emerald: "border-emerald-200 bg-emerald-50/80 text-emerald-700",
  amber: "border-amber-200 bg-amber-50/80 text-amber-700",
  cyan: "border-cyan-200 bg-cyan-50/80 text-cyan-700",
};

export default function MainSystemMapPage() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-2 pb-12 pt-3 sm:px-4">
      <header className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
          <Boxes className="h-4 w-4" aria-hidden="true" />
          Map mains
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Cấu trúc tổng quát Media Tech
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Sơ đồ mức cao từ giao diện người dùng qua frontend và lớp tích hợp tới các backend, dữ liệu và luồng realtime.
        </p>
      </header>

      <section aria-label="Luồng xử lý tổng quát" className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
          <Workflow className="h-4 w-4 text-violet-600" aria-hidden="true" />
          Luồng xử lý chính
        </div>
        <div className="grid items-stretch gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {mainStages.map(({ title, subtitle, detail, Icon, color }, index) => (
            <Fragment key={title}>
              <article className={`rounded-2xl border p-4 ${colorClasses[color]}`}>
                <Icon className="mb-3 h-6 w-6" aria-hidden="true" />
                <h2 className="font-bold">{title}</h2>
                <p className="mt-1 text-xs font-semibold opacity-80">{subtitle}</p>
                <p className="mt-3 text-xs leading-5 text-slate-600">{detail}</p>
              </article>
              {index < mainStages.length - 1 && (
                <>
                  <div className="hidden items-center justify-center text-slate-300 lg:flex" aria-hidden="true">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div className="flex justify-center text-slate-300 lg:hidden" aria-hidden="true">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                </>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      <section aria-label="Các backend và sơ đồ chi tiết" className="grid gap-4 md:grid-cols-3">
        {backends.map(({ title, detail, Icon, href, color }) => {
          const content = (
            <>
              <Icon className={`h-6 w-6 ${color === "emerald" ? "text-emerald-700" : color === "blue" ? "text-blue-700" : "text-amber-700"}`} aria-hidden="true" />
              <h2 className="mt-3 font-bold text-slate-900">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
              {href && <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-700">Mở sơ đồ chi tiết <ArrowRight className="h-3.5 w-3.5" /></span>}
            </>
          );

          return href ? (
            <Link key={title} href={href as any} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
              {content}
            </Link>
          ) : (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xs">
              {content}
            </article>
          );
        })}
      </section>
    </main>
  );
}
