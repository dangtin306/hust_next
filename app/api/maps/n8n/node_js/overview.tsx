import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Network, Server, Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "System Maps | Hust Media",
  description: "Chọn bản đồ tổng quan hoặc sơ đồ realtime theo backend.",
};

const diagramChoices = [
  {
    title: "Map mains",
    description:
      "Bản đồ cấu trúc tổng quát, thể hiện các thành phần chính và luồng kết nối của hệ thống Media Tech.",
    href: "/api/mt/n8n/maps_main",
    label: "Mở cấu trúc tổng quát",
    badge: "System overview",
    Icon: Network,
    color: "violet",
  },
  {
    title: "Node.js",
    description:
      "Sơ đồ realtime theo dõi Node.js backend, SSE và luồng workflow n8n.",
    href: "/api/mt/n8n/node_js",
    label: "Mở sơ đồ Node.js",
    badge: "Node.js backend",
    Icon: Code2,
    color: "blue",
  },
  {
    title: "Laravel",
    description:
      "Sơ đồ realtime theo dõi Laravel backend, telemetry và workflow n8n.",
    href: "/api/mt/n8n/laravel",
    label: "Mở sơ đồ Laravel",
    badge: "Laravel backend",
    Icon: Server,
    color: "emerald",
  },
] as const;

export default function N8nRealtimePage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-1 pb-10 pt-3 sm:px-3">
      <header className="mb-6 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
          <Workflow className="h-4 w-4" aria-hidden="true" />
          Sơ đồ hệ thống
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Chọn bản đồ cần xem
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Xem bản đồ cấu trúc chung hoặc mở sơ đồ realtime theo từng backend.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {diagramChoices.map(({ title, description, href, label, badge, Icon, color }) => (
          <Link
            key={title}
            href={href as any}
            className={`group rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-7 ${
              color === "blue"
                ? "border-blue-200 from-blue-50/90 to-indigo-50/80 hover:border-blue-400"
                : color === "emerald"
                  ? "border-emerald-200 from-emerald-50/90 to-teal-50/80 hover:border-emerald-400"
                  : "border-violet-200 from-violet-50/90 to-fuchsia-50/80 hover:border-violet-400"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm ${
                  color === "blue" ? "bg-blue-600" : color === "emerald" ? "bg-emerald-600" : "bg-violet-600"
                }`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  color === "blue"
                    ? "bg-blue-100 text-blue-800"
                    : color === "emerald"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-violet-100 text-violet-800"
                }`}
              >
                {badge}
              </span>
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900 sm:text-2xl">
              {title}
            </h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
              {description}
            </p>
            <div
              className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${
                color === "blue" ? "text-blue-700" : color === "emerald" ? "text-emerald-700" : "text-violet-700"
              }`}
            >
              {label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
