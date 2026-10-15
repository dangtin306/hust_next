"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Server, Workflow, Loader2 } from "lucide-react";

type DiagramChoice = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly label: string;
  readonly badge: string;
  readonly Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  readonly color: "emerald" | "blue" | "violet";
};

const diagramChoices: readonly DiagramChoice[] = [
  {
    title: "Laravel",
    description:
      "Sơ đồ realtime theo dõi Laravel backend, telemetry và workflow n8n.",
    href: "/api/hust/n8n/laravel",
    label: "Mở sơ đồ Laravel",
    badge: "Laravel backend",
    Icon: Server,
    color: "emerald",
  },
];

export default function N8nRealtimePage() {
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!navigatingHref) return;
    const timer = setTimeout(() => {
      setNavigatingHref(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [navigatingHref]);

  const handleCardClick = (href: string) => {
    setNavigatingHref(href);
  };

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
        {diagramChoices.map(({ title, description, href, label, badge, Icon, color }) => {
          const isNavigating = navigatingHref === href;
          const isOtherNavigating = Boolean(navigatingHref && navigatingHref !== href);

          return (
            <Link
              key={title}
              href={href as any}
              prefetch={false}
              onClick={() => handleCardClick(href)}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-all duration-200 sm:p-7 ${
                isNavigating
                  ? "scale-[0.99] border-blue-500 shadow-md ring-2 ring-blue-500/30"
                  : isOtherNavigating
                    ? "pointer-events-none opacity-60"
                    : "hover:-translate-y-0.5 hover:shadow-md"
              } ${
                color === "blue"
                  ? isNavigating
                    ? "border-blue-400 from-blue-100/90 to-indigo-100/80"
                    : "border-blue-200 from-blue-50/90 to-indigo-50/80 hover:border-blue-400"
                  : color === "emerald"
                    ? isNavigating
                      ? "border-emerald-400 from-emerald-100/90 to-teal-100/80"
                      : "border-emerald-200 from-emerald-50/90 to-teal-50/80 hover:border-emerald-400"
                    : isNavigating
                      ? "border-violet-400 from-violet-100/90 to-fuchsia-100/80"
                      : "border-violet-200 from-violet-50/90 to-fuchsia-50/80 hover:border-violet-400"
              }`}
            >
              {/* Top Progress Loading Line */}
              {isNavigating && (
                <div className="absolute inset-x-0 top-0 h-1 overflow-hidden z-20 pointer-events-none">
                  <div
                    className={`h-full w-full animate-[pulse_1s_ease-in-out_infinite] ${
                      color === "blue"
                        ? "bg-blue-600"
                        : color === "emerald"
                          ? "bg-emerald-600"
                          : "bg-violet-600"
                    }`}
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm transition-transform ${
                    isNavigating ? "scale-105" : ""
                  } ${
                    color === "blue"
                      ? "bg-blue-600"
                      : color === "emerald"
                        ? "bg-emerald-600"
                        : "bg-violet-600"
                  }`}
                >
                  {isNavigating ? (
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  )}
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
                  {isNavigating ? "Đang mở..." : badge}
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
                  color === "blue"
                    ? "text-blue-700"
                    : color === "emerald"
                      ? "text-emerald-700"
                      : "text-violet-700"
                }`}
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang mở {title}...</span>
                  </>
                ) : (
                  <>
                    <span>{label}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
