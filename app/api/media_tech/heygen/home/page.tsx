import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Radio, Sparkles, Video } from "lucide-react";

export const metadata: Metadata = {
  title: "HeyGen | Chọn chế độ demo",
  description: "Chọn tạo video MC ảo hoặc thử nghiệm Live Avatar với HeyGen.",
};

export default function HeyGenHomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
      <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <span>HeyGen · MC ảo</span>
      </div>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Bạn muốn thử chế độ nào?
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Chọn tạo video hoàn chỉnh từ lời thoại hoặc kết nối avatar tương tác trực tiếp.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Link
          href={"/api/mt/media/heygen" as any}
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-8"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Video className="h-6 w-6" />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                Video đầu ra
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Tạo video MC ảo</h2>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Gửi lời thoại và thông tin avatar lên API HeyGen để tạo video có thể xem lại.
          </p>
          <span className="mt-6 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Video tạo xong · có đường dẫn MP4
          </span>
        </Link>

        <Link
          href={"/api/mt/media/heygen/live" as any}
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:p-8"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Radio className="h-6 w-6" />
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Live Avatar
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Trải nghiệm trực tiếp</h2>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Mở phiên realtime với avatar và gửi lời thoại ngay trong lúc phiên đang chạy.
          </p>
          <span className="mt-6 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Phiên trực tiếp · LiveAvatar SDK
          </span>
        </Link>
      </div>
    </main>
  );
}
