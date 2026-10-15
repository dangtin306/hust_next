import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Mic2, Play, Radio, Sparkles, Video } from "lucide-react";

export const metadata: Metadata = {
  title: "HeyGen Studio | Tạo video MC ảo",
  description: "Tạo video MC ảo từ kịch bản hoặc trải nghiệm Live Avatar với HeyGen.",
};

const videoSteps = ["Chọn avatar", "Thêm lời thoại", "Xuất video MP4"];

export default function HeyGenHomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-7 sm:pt-8 lg:px-9">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/75 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            HeyGen Studio
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.7rem]">
            Tạo video MC ảo từ kịch bản
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Chọn avatar, thêm lời thoại và tạo video có thể xem lại hoặc chia sẻ.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm sm:flex">
          <Video className="h-4 w-4 text-indigo-600" />
          Video avatar · MP4
        </div>
      </header>

      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.8fr)]">
        <Link
          href="/api/mt/media/heygen/video"
          className="group relative isolate overflow-hidden rounded-[28px] border border-white/90 bg-gradient-to-br from-white via-white to-indigo-50/90 p-5 shadow-[0_18px_55px_-32px_rgba(49,46,129,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-30px_rgba(49,46,129,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:p-7 lg:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="grid h-full gap-7 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.82fr)] md:items-center md:gap-5 lg:gap-8">
            <div className="flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">
                <Video className="h-3.5 w-3.5" />
                Tạo video
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-[1.8rem]">
                Biến lời thoại thành video MC ảo
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Dùng ảnh hoặc avatar, chọn giọng đọc rồi gửi kịch bản để tạo video hoàn chỉnh.
              </p>

              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {videoSteps.map((step) => (
                  <li key={step} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Check className="h-3.5 w-3.5 rounded-full bg-emerald-100 p-0.5 text-emerald-700" />
                    {step}
                  </li>
                ))}
              </ul>

              <span className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition group-hover:bg-indigo-700">
                Mở studio tạo video
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>

            <div aria-hidden="true" className="relative mx-auto w-full max-w-[380px]">
              <div className="absolute -inset-3 rounded-[26px] bg-gradient-to-br from-indigo-300/35 via-violet-300/20 to-fuchsia-300/30 blur-xl" />
              <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-3.5 shadow-2xl shadow-indigo-950/20 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-white/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Video preview
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[9px] font-semibold text-white/70">
                    HeyGen
                  </span>
                </div>

                <div className="relative flex aspect-[1.45/1] items-center justify-center overflow-hidden rounded-[16px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(167,139,250,0.42),transparent_45%),linear-gradient(145deg,#312e81,#111827_68%)]">
                  <div className="absolute -bottom-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full border border-white/10 bg-gradient-to-b from-violet-200/25 to-indigo-300/5 shadow-[0_0_70px_rgba(167,139,250,0.25)]" />
                  <div className="absolute bottom-0 left-1/2 h-[48%] w-[52%] -translate-x-1/2 rounded-t-[48%] bg-gradient-to-b from-indigo-100/30 to-indigo-300/10" />
                  <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[9px] font-medium text-white/70 backdrop-blur">
                    Avatar scene
                  </div>
                  <span className="relative grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/15 text-white shadow-lg backdrop-blur transition group-hover:scale-105">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </span>
                  <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/45 px-2.5 py-2 backdrop-blur">
                    <Mic2 className="h-3.5 w-3.5 shrink-0 text-violet-200" />
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                      <span className="block h-full w-2/5 rounded-full bg-gradient-to-r from-violet-300 to-indigo-300" />
                    </span>
                    <span className="text-[9px] font-medium text-white/65">Script</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">Kịch bản của bạn</p>
                    <p className="mt-0.5 text-[10px] text-white/55">Avatar · Giọng đọc · Video</p>
                  </div>
                  <div className="flex h-7 items-end gap-0.5" aria-hidden="true">
                    {[10, 17, 12, 22, 15, 24, 12, 18, 9].map((height, index) => (
                      <span
                        key={index}
                        className="w-1 rounded-full bg-violet-300/80"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/api/mt/media/heygen/live"
          className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/90 bg-white/75 p-5 shadow-[0_18px_55px_-35px_rgba(15,118,110,0.35)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_24px_60px_-32px_rgba(15,118,110,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:p-6 lg:p-7"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Radio className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              Live Avatar
            </span>
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Tương tác trực tiếp</p>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950">
              Trò chuyện với avatar
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Mở phiên realtime, nói chuyện và gửi lời thoại ngay trong lúc avatar đang hoạt động.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/65 px-3 py-2.5 text-xs font-medium text-emerald-900/75">
            <span className="flex h-5 items-center gap-0.5" aria-hidden="true">
              {[8, 14, 10, 18, 11].map((height, index) => (
                <span key={index} className="w-1 rounded-full bg-emerald-500/70" style={{ height: `${height}px` }} />
              ))}
            </span>
            LiveAvatar SDK · Phiên tương tác
          </div>

          <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-bold text-emerald-800">
            Mở Live Avatar
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </main>
  );
}
