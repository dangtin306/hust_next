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

// SỐ LIỆU KHIÊM TỐN - THỰC TẾ
const stats = [
  { label: "Active Users", value: "1000+" },
  { label: "Daily Requests", value: "10K+" }, // Đổi Transactions -> Requests (Kỹ thuật hơn)
  { label: "Data Points", value: "50K+" },      // Đổi Runs -> Data Points
  { label: "Uptime", value: "99.98%" },
];

const techStack = [
  { title: "ReactJS + NextJS Hybrid Core", icon: Atom },
  { title: "Automated Verification", icon: Brain }, // Bỏ chữ "AI-Driven" cho đỡ nổ, dùng Automated
  { title: "Python Data Processing", icon: Cpu },
  { title: "System Monitor Integration", icon: ShieldCheck },
  { title: "Cloud + On-Prem Hybrid", icon: Cloud },
  { title: "Privacy-First Architecture", icon: Lock },
];

const values = [
  {
    title: "Transparency",
    description:
      "Operational transparency in audit logs and task distribution, allowing partners to verify system efficiency in real-time.",
  },
  {
    title: "Security",
    description:
      "Security is our top priority, implemented from the infrastructure layer down to data validation mechanisms.",
  },
  {
    title: "Sustainability", // Đổi Community -> Sustainability (Bền vững)
    description:
      "Building a sustainable technical ecosystem where users contribute to system stability and data integrity.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 text-slate-900">
      <div className="relative overflow-hidden">
        {/* Background nhẹ nhàng hơn */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_12%_12%,rgba(56,189,248,0.1),transparent_60%),radial-gradient(700px_circle_at_85%_18%,rgba(165,180,252,0.1),transparent_55%)]" />
        
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
          {/* HEADER SECTION */}
          <section className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Hust Media
            </p>
            <div className="max-w-3xl">
              {/* SỬA: Bỏ span màu mè, để text đen thuần túy */}
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl text-slate-800">
                Digital Automation & System Monitor
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Hust Media provides Digital Automation and Data Verification solutions, helping users optimize online performance through an advanced Hybrid Architecture platform.
              </p>
            </div>
            {/* Badges: Kỹ thuật & An toàn */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Data Integrity
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm">
                <Cpu className="h-4 w-4 text-blue-500" />
                Hybrid Core
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm">
                <Lock className="h-4 w-4 text-emerald-500" />
                Secure Protocol
              </span>
            </div>
          </section>

          {/* STATS SECTION */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white bg-white/50 p-5 shadow-sm backdrop-blur-sm hover:bg-white/80 transition-all"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            ))}
          </section>

          {/* MISSION & VALUES */}
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Mission */}
            <div className="rounded-3xl border border-white bg-white/80 p-8 shadow-sm backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-800">Our Mission</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                We focus on providing digital automation platforms for enterprises, optimizing operational costs, protecting data, and ensuring transparency in every processing workflow.
              </p>
              <div className="mt-6 grid gap-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>
                    <strong>Unified Experience:</strong> ReactJS + NextJS Hybrid Core ensures synchronized performance across public web and internal dashboards.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>
                    <strong>Consistency:</strong> Automated Verification ensures data is validated consistently, reducing manual errors.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>
                    <strong>Flexibility:</strong> Hybrid Architecture allows for flexible deployment on Cloud or On-premise infrastructure based on security needs.
                  </span>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="rounded-3xl border border-white bg-white/60 p-8 shadow-sm backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-800">Core Values</h2>
              <div className="mt-6 space-y-4">
                {values.map((value) => (
                  <div
                    key={value.title}
                    className="rounded-2xl border border-white/50 bg-white/50 p-4 transition-colors hover:bg-white/80"
                  >
                    <p className="text-sm font-bold text-slate-700">{value.title}</p>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TECH STACK */}
          <section className="rounded-3xl border border-white bg-white/80 p-8 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Core Technology</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Built on a robust stack ensuring high performance and reliability at scale.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <Users className="h-3 w-3" />
                Enterprise-grade Ready
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {techStack.map((stack) => {
                const Icon = stack.icon;
                return (
                  <div
                    key={stack.title}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{stack.title}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* TEAM & CULTURE */}
          <section className="rounded-3xl border border-white bg-white/80 p-8 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Engineering Team</h2>
                <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                  A passionate team of engineers committed to building a clean, reliable, and secure network environment for the community.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2 text-sm text-emerald-700 font-medium">
                <ShieldCheck className="h-4 w-4" />
                Trusted Engineering Culture
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
               <Atom size={200} />
            </div>
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Ready to build together
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Join the secure automation ecosystem.
                </h2>
                <p className="mt-2 text-sm text-slate-400 max-w-xl">
                  Connect with us for technical documentation, system demos, and deployment roadmaps suitable for your business needs.
                </p>
              </div>
              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors shadow-lg"
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