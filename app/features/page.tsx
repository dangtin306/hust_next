import type { Metadata } from "next";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Feature Showcase | Hust Media",
  description:
    "A GitHub Universe-inspired showcase of Hust Media's server core, anti-fraud engine, hybrid cloud architecture, and AI vibe coding workflows.",
};

const cardBase =
  "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur";

const imageFrame =
  "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]";

const atlas = [
  {
    src: "/images/features/123312231.png",
    title: "Sơ đồ hệ thống tổng quát",
    description:
      "Luồng client → API → module xử lý và đồng bộ dữ liệu qua các tầng dịch vụ.",
  },
  {
    src: "/images/features/2121221.png",
    title: "Realtime đa nền tảng",
    description:
      "Kiến trúc Web/App + WebSocket layer giúp đồng bộ trạng thái tức thời.",
  },
  {
    src: "/images/features/23132132.png",
    title: "Backend services map",
    description:
      "Tách lớp Webservices, module đa ngôn ngữ và quản trị dữ liệu an toàn.",
  },
  {
    src: "/images/features/Picture1.png",
    title: "P2P interaction flow",
    description:
      "Mô hình tương tác người dùng A/B, điểm thưởng và hệ thống kiểm duyệt.",
  },
];

export default function FeaturesPage() {
  return (
    <div
      className={`${spaceGrotesk.className} min-h-screen bg-slate-50 text-slate-900`}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:36px_36px]" />
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-sky-200/45 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 lg:pt-20">
          <header className="grid gap-6 lg:grid-cols-12">
            <div className={`${cardBase} lg:col-span-7`}>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                Automation Tools
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Your command center for Digital Automation Suite
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Hust Media tập trung vào khả năng vận hành bền vững: server core
                mạnh, thuật toán chống gian lận thời gian thực và kiến trúc
                hybrid bảo vệ IP gốc. Tất cả được tăng tốc bằng AI để đội vận
                hành luôn đi trước tốc độ tăng trưởng người dùng.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-medium text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                  128GB RAM Core
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                  IQR Anti-Fraud
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                  Cloudflare Tunnel
                </span>
              </div>
            </div>

            <div className={`${cardBase} lg:col-span-5`}>
              <p className="text-sm font-semibold text-slate-500">System Snapshot</p>
              <div className="mt-6 grid gap-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Realtime requests</span>
                  <span className="font-semibold text-slate-900">10k / day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>AI inference queue</span>
                  <span className="font-semibold text-slate-900">98% on-time</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fraud blocks</span>
                  <span className="font-semibold text-slate-900">-42% events</span>
                </div>
              </div>
              <div className="mt-7 h-24 rounded-2xl bg-gradient-to-r from-pink-200 via-slate-100 to-sky-200" />
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-12">
            <article className={`${cardBase} lg:col-span-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Core Infrastructure
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                128GB RAM Server Core
              </h2>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm text-slate-600">
                    Nền tảng phần cứng giúp xử lý hàng triệu request mỗi ngày và
                    load model AI mượt mà. RAM lớn cho phép chạy song song
                    Node.js/Go services, cache dữ liệu nóng và giữ latency thấp.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• ECC RAM giảm lỗi bộ nhớ khi chạy dài hạn.</li>
                    <li>• GPU + NVMe tối ưu inference và truy xuất media.</li>
                    <li>• Headroom mở rộng module mới mà không downtime.</li>
                  </ul>
                </div>
                <figure className={imageFrame}>
                  <Image
                    src="/images/features/1233122312.png"
                    alt="Cấu hình server vật lý Hust Media"
                    fill
                    sizes="(min-width: 1024px) 28vw, 90vw"
                    className="object-contain"
                  />
                </figure>
              </div>
            </article>

            <article className={`${cardBase} lg:col-span-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Anti-Fraud Engine
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                IQR Algorithm
              </h2>
              <p className="mt-4 text-sm text-slate-600">
                Thuật toán IQR lọc outlier thời gian thực, loại bỏ lượt tương tác
                quá nhanh/quá chậm bất thường và cảnh báo khi có hành vi bot.
              </p>
              <figure className={`${imageFrame} mt-5`}>
                <Image
                  src="/images/features/1111.png"
                  alt="Luồng chống gian lận và điểm thưởng"
                  fill
                  sizes="(min-width: 1024px) 28vw, 90vw"
                  className="object-contain"
                />
              </figure>
            </article>

            <article className={`${cardBase} lg:col-span-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Hybrid Cloud
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Cloudflare Tunnel
              </h2>
              <p className="mt-4 text-sm text-slate-600">
                Cloudflare Tunnel tạo "hầm" bảo mật giữa người dùng và server
                vật lý, ẩn IP gốc và giảm rủi ro DDoS. Hostname được map linh
                hoạt mà không mở port public.
              </p>
              <figure className={`${imageFrame} mt-5`}>
                <Image
                  src="/images/features/1321323121.png"
                  alt="Hybrid cloud architecture"
                  fill
                  sizes="(min-width: 1024px) 28vw, 90vw"
                  className="object-contain"
                />
              </figure>
            </article>

            <article className={`${cardBase} lg:col-span-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                AI Workflow
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                AI Vibe Coding
              </h2>
              <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1fr]">
                <div>
                  <p className="text-sm text-slate-600">
                    Codex/OpenAI hỗ trợ tạo skeleton code, mô tả module bằng ngôn
                    ngữ tự nhiên và tự động hóa kiểm thử để tối ưu tốc độ ship.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Auto create API handlers</li>
                    <li>• Suggest edge-case tests</li>
                    <li>• Refactor for throughput</li>
                  </ul>
                </div>
                <figure className={imageFrame}>
                  <Image
                    src="/images/features/213231231.jpg"
                    alt="AI vibe coding workflow in VS Code"
                    fill
                    sizes="(min-width: 1024px) 28vw, 90vw"
                    className="object-cover"
                  />
                </figure>
              </div>
            </article>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            {atlas.map((diagram) => (
              <figure key={diagram.src} className={`${cardBase} flex flex-col`}>
                <div className={imageFrame}>
                  <Image
                    src={diagram.src}
                    alt={diagram.title}
                    fill
                    sizes="(min-width: 1024px) 45vw, 90vw"
                    className="object-contain"
                  />
                </div>
                <figcaption className="mt-4">
                  <p className="text-base font-semibold text-slate-900">
                    {diagram.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {diagram.description}
                  </p>
                </figcaption>
              </figure>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
