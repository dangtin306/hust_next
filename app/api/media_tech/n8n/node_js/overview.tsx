"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Code2, Server, Workflow } from "lucide-react";
import DiagramCard from "../DiagramCard";

const diagramChoices = [
  {
    title: "Node.js",
    subtitle: "SSE và luồng workflow n8n",
    description:
      "Sơ đồ realtime theo dõi Node.js backend, SSE và luồng workflow n8n.",
    features: ["Theo dõi Node.js backend", "SSE", "Luồng workflow n8n"],
    href: "/api/mt/n8n/node_js",
    label: "Mở sơ đồ Node.js",
    badge: "Node.js backend",
    Icon: Code2,
  },
  {
    title: "Laravel",
    subtitle: "Telemetry và workflow n8n",
    description:
      "Sơ đồ realtime theo dõi Laravel backend, telemetry và workflow n8n.",
    features: ["Theo dõi Laravel backend", "Telemetry", "Workflow n8n"],
    href: "/api/mt/n8n/laravel",
    label: "Mở sơ đồ Laravel",
    badge: "Laravel backend",
    Icon: Server,
  },
] as const;

// leading: phần tử đặt đầu lưới thẻ (dùng cho khung Knowledge ở trang workflow home); các trang khác không truyền.
export default function N8nRealtimePage({ leading }: { leading?: ReactNode } = {}) {
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
        {leading}
        {diagramChoices.map(({ title, subtitle, description, features, href, label, badge, Icon }) => {
          const isNavigating = navigatingHref === href;
          const isOtherNavigating = Boolean(navigatingHref && navigatingHref !== href);

          return (
            <Link
              key={title}
              href={href as unknown as Route}
              prefetch={false}
              onClick={() => handleCardClick(href)}
              className={`group block h-full rounded-2xl focus:outline-none ${
                isOtherNavigating ? "pointer-events-none opacity-60" : ""
              } ${isNavigating ? "ring-2 ring-violet-500/40" : ""}`}
            >
              <DiagramCard
                icon={<Icon className="h-5 w-5" aria-hidden="true" />}
                title={title}
                subtitle={subtitle}
                badge={badge}
                description={description}
                features={features}
                actionLabel={label}
                loading={isNavigating}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
