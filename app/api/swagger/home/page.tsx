import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Documentation Home",
  description: "Overview of the available API documentation.",
};

export default function SwaggerHomePage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Start here
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-800">
          Chọn tài liệu bạn muốn xem
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Home chỉ giới thiệu hai nhóm tài liệu API. Chọn một khung bên dưới để bắt đầu.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/api/swagger/laravel"
          className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            Laravel
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-800">
            Laravel OpenClawService
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Xem cách Laravel tích hợp các service AI như chat, viết tin, kiểm tra chính tả,
            OCR, TTS và tạo hình ảnh.
          </p>
          <span className="mt-4 block text-sm font-semibold text-blue-700">
            Xem tài liệu Laravel →
          </span>
        </Link>

        <Link
          href="/api/swagger/openclaw"
          className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            OpenClaw
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-800">
            OpenClaw Gateway API
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Xem các endpoint và service trực tiếp do OpenClaw Gateway cung cấp cho hệ thống
            AI của Media Tech.
          </p>
          <span className="mt-4 block text-sm font-semibold text-blue-700">
            Xem tài liệu OpenClaw →
          </span>
        </Link>
      </div>
    </section>
  );
}
