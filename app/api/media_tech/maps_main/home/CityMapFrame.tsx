import { ArrowLeft, Network } from "lucide-react";

type CityMapFrameProps = {
  viewPath: string;
  title: string;
  backHref: string;
};

// Khung bản đồ (deck.gl) từ máy chủ maps_main, nhúng bằng rewrite trong uri_config.
// Giữ đúng khung trắng, viền slate và thanh tiêu đề như các trang khác của app.
export default function CityMapFrame({ viewPath, title, backHref }: CityMapFrameProps) {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent p-4 sm:p-6">
      <div className="w-full max-w-7xl xl:max-w-[1400px] mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-violet-600 to-fuchsia-500 text-white shadow-2xs shrink-0">
              <Network className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">{title}</h1>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">Knowledge · Semantic City Map</p>
            </div>
          </div>
          <a
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-100/80"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Knowledge
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <iframe
            src={viewPath}
            title={title}
            className="block w-full h-[calc(100vh-11rem)] min-h-[600px] border-0 bg-slate-950"
          />
        </div>
      </div>
    </main>
  );
}
