import type { Metadata, Route } from "next";
import SwaggerSwitcher from "@/app/api/hust_media/media_tech/SwaggerSwitcher";
import { NavigationToastLink } from "@/app/api/hust_media/media_tech/HomeNavigationToast";
import KnowledgeFrame from "@/app/api/media_tech/maps_main/home/KnowledgeFrame";
import DiagramCard from "@/app/api/media_tech/n8n/DiagramCard";
import { Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "Sơ đồ Workflow | Hust AI Assistant",
  description:
    "Sơ đồ realtime Laravel n8n và các luồng workflow của Hust Media.",
};

export default function WorkflowHomePage() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent p-4 sm:p-6">
      {/* Switcher Navigation */}
      <SwaggerSwitcher active="workflow" />

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
              Sơ đồ Laravel n8n
            </h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Sơ đồ realtime theo dõi luồng telemetry, heartbeat và tương tác giữa Laravel backend với n8n workflow.
            </p>
          </div>
        </div>

        {/* Workflow diagram: khung Knowledge đứng đầu, cùng vị trí với bên Media Tech */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <KnowledgeFrame product="hust" />
          {/* Card: Laravel n8n */}
          <NavigationToastLink
            href={"/api/hust/n8n/laravel" as unknown as Route}
            label="Sơ đồ Laravel n8n"
            className="group block h-full rounded-2xl focus:outline-none"
          >
            <DiagramCard
              icon={<Workflow className="h-5 w-5" aria-hidden="true" />}
              title="Sơ đồ Laravel n8n"
              subtitle="Telemetry, heartbeat và WebSocket"
              badge="Laravel backend"
              description="Sơ đồ realtime giám sát luồng telemetry, heartbeat và tương tác giữa Laravel backend và n8n workflow qua WebSocket."
              features={["Luồng telemetry", "Heartbeat", "Tương tác n8n qua WebSocket"]}
              actionLabel="Mở sơ đồ Laravel n8n"
            />
          </NavigationToastLink>
        </div>
      </section>
    </main>
  );
}
