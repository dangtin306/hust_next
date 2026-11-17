import type { ReactNode } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

// Thẻ sơ đồ dùng chung cho trang workflow của Hust và Media Tech, cùng bố cục với thẻ Knowledge:
// dải tiêu đề tím, thân trắng có danh sách đặc điểm, chân thẻ có nút hành động.
// Phần bọc ngoài (link, trạng thái điều hướng) do bên gọi quyết định; thẻ này không tự làm link.
export type DiagramCardProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  features: readonly string[];
  actionLabel: string;
  loading?: boolean;
};

export default function DiagramCard({
  icon,
  title,
  subtitle,
  badge,
  description,
  features,
  actionLabel,
  loading = false,
}: DiagramCardProps) {
  return (
    <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-violet-200/90 bg-white shadow-2xs transition-all group-hover:border-violet-400 group-hover:shadow-md">
      <div className="border-b border-violet-500/30 bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 px-4 py-3 text-white sm:px-4.5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-inner backdrop-blur-md sm:h-9.5 sm:w-9.5">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="truncate text-sm font-bold tracking-tight sm:text-base">{title}</h2>
              <span className="rounded border border-white/30 bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:text-[10px]">
                {badge}
              </span>
            </div>
            <p className="text-[11px] font-medium leading-snug text-violet-100">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
        <p className="text-xs leading-relaxed text-slate-600">{description}</p>
        <div className="space-y-2 text-xs">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2"
            >
              <span className="font-semibold text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-4.5">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-colors group-hover:bg-violet-700">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
          {loading ? "Đang mở..." : actionLabel}
          {loading ? null : <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
        </span>
      </div>
    </article>
  );
}
