import type { Route } from "next";
import { ArrowRight, Bot, FileText, FolderOpen, Network } from "lucide-react";
import WorkspaceMapCard from "./WorkspaceMapCard";
import { NavigationToastLink } from "@/app/api/hust_media/media_tech/HomeNavigationToast";

type WorkspaceHomeGuideProps = {
  projectName: string;
  agentHomeHref: Route;
  agentWorkspacePattern: string;
  workspaceMapHref: Route;
};

export default function WorkspaceHomeGuide({
  projectName,
  agentHomeHref,
  agentWorkspacePattern,
  workspaceMapHref,
}: WorkspaceHomeGuideProps) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-indigo-900/5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20">
              <Bot className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-violet-700">{projectName} · Workspace</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Hướng dẫn Workspace theo Agent
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Workspace được phân theo mã agent. Mỗi agent có danh sách workspace và tài liệu riêng; hãy mở workspace từ đúng agent để xem đủ dữ liệu.
              </p>
            </div>
          </div>
          <NavigationToastLink
            href={agentHomeHref}
            label="Danh sách Agent"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
          >
            Mở danh sách Agent <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </NavigationToastLink>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Cách sử dụng Workspace">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-slate-900">1. Chọn agent</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Mở danh sách Agent và chọn agent cần làm việc. Workspace được xác định theo <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-violet-700">agent_code</code>.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <FolderOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-slate-900">2. Mở workspace của agent</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tại trang agent, mở Workspace để xem và quản lý các workspace thuộc agent đó. Trang này không gộp workspace của nhiều agent.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-slate-900">3. Đọc Markdown</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chọn workspace trong danh sách của agent để xem cây thư mục, mở nội dung Markdown hoặc chỉnh sửa tài liệu.
          </p>
        </article>

        <WorkspaceMapCard href={workspaceMapHref} />
      </section>

      <section className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-violet-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Network className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
          <div>
            <h2 className="font-extrabold text-slate-900">Cấu trúc đường dẫn</h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Mỗi agent có trang workspace riêng theo mẫu <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-violet-700">{agentWorkspacePattern}</code>.
              Quay lại trang này để xem hướng dẫn; dùng danh sách Agent để chuyển sang agent khác.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
