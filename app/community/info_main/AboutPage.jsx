import {
  ArrowRight,
  Atom,
  Brain,
  CheckCircle2,
  Cloud,
  Cpu,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Users", value: "2.4M+" },
  { label: "Transactions", value: "180M+" },
  { label: "Automation Runs", value: "6.8B+" },
  { label: "Uptime", value: "99.98%" },
];

const techStack = [
  { title: "ReactJS + NextJS Hybrid Core", icon: Atom },
  { title: "AI-Driven Verification", icon: Brain },
  { title: "Python & Data Automation", icon: Cpu },
  { title: "Security Intelligence", icon: ShieldCheck },
  { title: "Cloud + On-Prem Hybrid", icon: Cloud },
  { title: "Privacy-First Architecture", icon: Lock },
];

const values = [
  {
    title: "Transparency",
    description:
      "Minh bạch trong quy trình vận hành, audit và phân phối nhiệm vụ, giúp đối tác kiểm chứng hiệu quả theo thời gian thực.",
  },
  {
    title: "Security",
    description:
      "Bảo mật là ưu tiên số một, từ lớp hạ tầng, dữ liệu đến cơ chế xác thực minh chứng bằng AI.",
  },
  {
    title: "Community",
    description:
      "Xây dựng hệ sinh thái cộng đồng sạch và bền vững, nơi người dùng chủ động đóng góp và được bảo vệ.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/80 via-purple-100/80 to-pink-100/80 text-slate-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_12%_12%,rgba(56,189,248,0.22),transparent_60%),radial-gradient(700px_circle_at_85%_18%,rgba(244,114,182,0.18),transparent_55%),radial-gradient(900px_circle_at_50%_90%,rgba(129,140,248,0.16),transparent_65%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
          <section className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600">
              Hust Media
            </p>
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Digital Automation & Security Intelligence Platform
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Hust Media cung cấp giải pháp Tự động hóa Kỹ thuật số
                (Digital Automation) và Trí tuệ An ninh mạng (Security
                Intelligence), giúp người dùng tối ưu hóa hiệu suất trực tuyến
                thông qua nền tảng Hybrid Architecture tiên tiến.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                AI-Driven Verification
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm">
                <Cpu className="h-4 w-4" />
                Hybrid Core Architecture
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm">
                <Lock className="h-4 w-4" />
                Security First
              </span>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.28)] backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-600/90">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_20px_36px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm">
              <h2 className="text-xl font-semibold">Our Mission</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Chúng tôi tập trung vào việc cung cấp nền tảng tự động hóa kỹ
                thuật số cho doanh nghiệp và cộng đồng, giúp tối ưu chi phí vận
                hành, bảo vệ dữ liệu và đảm bảo tính minh bạch trong mọi luồng
                xử lý.
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>
                    ReactJS + NextJS Hybrid Core giúp đồng bộ trải nghiệm nhanh
                    trên web public và dashboard nội bộ.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>
                    AI-Driven Verification đảm bảo minh chứng được kiểm chứng
                    nhất quán, giảm rủi ro gian lận.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>
                    Hybrid Architecture cho phép triển khai linh hoạt trên cloud
                    hoặc on-premise tùy yêu cầu bảo mật.
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/65 p-6 shadow-[0_20px_36px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm">
              <h2 className="text-xl font-semibold">Core Values</h2>
              <div className="mt-4 space-y-4">
                {values.map((value) => (
                  <div
                    key={value.title}
                    className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_14px_24px_-20px_rgba(15,23,42,0.22)] backdrop-blur-sm"
                  >
                    <p className="text-sm font-semibold">{value.title}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_20px_36px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Core Technology</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Nền tảng kết hợp ReactJS + NextJS Hybrid Core, cùng AI-Driven
                  Verification để đảm bảo hiệu suất và độ tin cậy ở quy mô lớn.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                Hybrid-ready for enterprise teams
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {techStack.map((stack) => {
                const Icon = stack.icon;
                return (
                  <div
                    key={stack.title}
                    className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/65 p-4 shadow-[0_14px_24px_-20px_rgba(15,23,42,0.22)] backdrop-blur-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">{stack.title}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_20px_36px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">The Team</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Đội ngũ kỹ sư đam mê từ Đại học Bách Khoa Hà Nội, cam kết xây
                  dựng môi trường mạng sạch, đáng tin cậy và an toàn cho cộng
                  đồng.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Trusted engineering culture
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/80 bg-white/70 p-6 text-slate-900 shadow-[0_20px_36px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Ready to build together
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  Hãy cùng Hust Media mở rộng hệ sinh thái tự động hóa an toàn.
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Kết nối với chúng tôi để nhận tài liệu kỹ thuật, demo và lộ
                  trình triển khai phù hợp cho doanh nghiệp.
                </p>
              </div>
              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg"
              >
                Contact Hust Media
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
