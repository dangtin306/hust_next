"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Rocket,
  Sparkles,
  Users,
  Workflow,
  Wrench,
} from "lucide-react";

type Language = "vi" | "en";

type ServiceItem = {
  key: string;
  icon: "ads" | "ai" | "koc" | "auto" | "growth" | "ops";
};

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const content = {
  vi: {
    badge: "SEO & MEDIA AI",
    title: "Nhận Thuê Quảng Cáo Media Với Công Nghệ AI Mới Nhất",
    subtitle:
      "Chúng tôi triển khai trọn gói từ lập trình và vận hành bộ tools tự động, tối ưu chiến dịch quảng cáo đa nền tảng, đến thuê KOC theo quy trình lớp sóng.",
    ctaPrimary: "Nhận tư vấn chiến lược",
    ctaSecondary: "Xem quy trình triển khai",
    sectionServices: "Gói dịch vụ chính",
    sectionFlow: "Quy trình hợp tác",
    services: {
      ads: {
        title: "Quảng cáo đa kênh",
        description:
          "Chạy media trên Facebook, TikTok, Google, YouTube theo ngân sách và KPI rõ ràng.",
      },
      ai: {
        title: "AI sáng tạo nội dung",
        description:
          "Dùng AI để tạo concept, script, video ngắn và mẫu quảng cáo theo từng tệp khách hàng.",
      },
      koc: {
        title: "Thuê KOC theo mục tiêu",
        description:
          "Kết nối và quản lý KOC theo ngành hàng, theo dõi hiệu suất từng mã chiến dịch.",
      },
      auto: {
        title: "Tools tự động hoá",
        description:
          "Lập trình tool nội bộ để auto báo cáo, auto phân phối task, auto đo lường chuyển đổi.",
      },
      growth: {
        title: "Tăng trưởng có kiểm soát",
        description:
          "Theo dõi CAC, ROAS, CPL theo thời gian thực để scale đúng lúc, giảm rủi ro ngân sách.",
      },
      ops: {
        title: "Vận hành & tối ưu liên tục",
        description:
          "Đội ngũ kỹ thuật + media tối ưu hằng ngày dựa trên dữ liệu thực tế, không làm theo cảm tính.",
      },
    },
    flow: [
      {
        step: "01",
        title: "Phân tích ngành hàng",
        description: "Đánh giá chân dung khách hàng, đối thủ, ngân sách và mục tiêu tăng trưởng.",
      },
      {
        step: "02",
        title: "Thiết kế hệ thống media + AI",
        description: "Xây funnel, nội dung quảng cáo và logic tool tự động theo mục tiêu cụ thể.",
      },
      {
        step: "03",
        title: "Triển khai và mở rộng",
        description: "Vận hành chiến dịch, đo lường, tối ưu rồi scale theo hiệu quả thực tế.",
      },
    ],
  },
  en: {
    badge: "SEO & MEDIA AI",
    title: "Media Advertising Outsourcing Powered By The Latest AI",
    subtitle:
      "We deliver end-to-end execution: custom automation tools, multi-channel advertising optimization, and KOC hiring operations aligned with your growth targets.",
    ctaPrimary: "Get strategic consultation",
    ctaSecondary: "View delivery workflow",
    sectionServices: "Core service packages",
    sectionFlow: "Delivery workflow",
    services: {
      ads: {
        title: "Multi-channel advertising",
        description:
          "Run paid media on Facebook, TikTok, Google, and YouTube with clear budget and KPI controls.",
      },
      ai: {
        title: "AI creative production",
        description:
          "Use AI to generate concepts, scripts, short videos, and ad variations for each audience segment.",
      },
      koc: {
        title: "Goal-based KOC hiring",
        description:
          "Source and manage KOC networks by niche while tracking performance per campaign code.",
      },
      auto: {
        title: "Automation tools",
        description:
          "Build internal tools for automated reporting, task routing, and conversion measurement.",
      },
      growth: {
        title: "Controlled growth scaling",
        description:
          "Track CAC, ROAS, and CPL in real time to scale at the right moment with lower budget risk.",
      },
      ops: {
        title: "Continuous optimization",
        description:
          "Media and engineering teams optimize daily based on real data, not guesswork.",
      },
    },
    flow: [
      {
        step: "01",
        title: "Business diagnosis",
        description: "Audit customer profiles, competitors, budget constraints, and growth objectives.",
      },
      {
        step: "02",
        title: "Media + AI system design",
        description:
          "Build the funnel, ad creatives, and automation logic mapped to measurable outcomes.",
      },
      {
        step: "03",
        title: "Launch and scale",
        description: "Operate campaigns, measure results, optimize continuously, then scale by performance.",
      },
    ],
  },
} as const;

const serviceOrder: ServiceItem[] = [
  { key: "ads", icon: "ads" },
  { key: "ai", icon: "ai" },
  { key: "koc", icon: "koc" },
  { key: "auto", icon: "auto" },
  { key: "growth", icon: "growth" },
  { key: "ops", icon: "ops" },
];

const iconMap = {
  ads: Megaphone,
  ai: Bot,
  koc: Users,
  auto: Workflow,
  growth: Rocket,
  ops: Wrench,
} as const;

export default function SeoMediaPage() {
  const consultationRef = useRef<HTMLDivElement | null>(null);
  const [showConsultants, setShowConsultants] = useState(false);
  const lang = useSyncExternalStore<Language>(
    () => () => {},
    () => (readCookie("national_market") === "en" ? "en" : "vi"),
    () => "vi",
  );
  const t = content[lang];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!consultationRef.current) return;
      const target = event.target as Node;
      if (!consultationRef.current.contains(target)) {
        setShowConsultants(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showConsultants) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowConsultants(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showConsultants]);

  const consultants = [
    {
      key: "thuy",
      name: lang === "vi" ? "Liên hệ bạn Thúy" : "Contact Ms. Thuy",
      role: lang === "vi" ? "Tư vấn chiến lược media" : "Media strategy consultant",
      badge: lang === "vi" ? "Sẵn sàng" : "Available",
      href: "https://t.me/Cogicuhoidi",
      Icon: MessageSquare,
      iconBg: "bg-indigo-100 text-indigo-700",
      cardBg: "from-fuchsia-50/90 via-white to-pink-50/90",
    },
    {
      key: "huyen",
      name: lang === "vi" ? "Liên hệ bạn Huyền" : "Contact Ms. Huyen",
      role: lang === "vi" ? "Vận hành & tối ưu chiến dịch" : "Campaign ops and optimization",
      badge: lang === "vi" ? "Sẵn sàng" : "Available",
      href: "https://t.me/xuzinxikgai",
      Icon: MessageCircle,
      iconBg: "bg-fuchsia-100 text-fuchsia-700",
      cardBg: "from-fuchsia-50/90 via-white to-pink-50/90",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-pink-100 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="relative z-30 overflow-visible rounded-3xl border border-white/70 bg-white/55 p-7 shadow-lg backdrop-blur-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">{t.badge}</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-slate-700 sm:text-lg">{t.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div ref={consultationRef} className="relative">
              <button
                type="button"
                onClick={() => setShowConsultants((prev) => !prev)}
                className="inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2.5 text-[15px] font-semibold text-white shadow-[0_12px_26px_rgba(79,70,229,0.35)] ring-1 ring-indigo-300/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(79,70,229,0.4)] sm:px-5 sm:text-sm"
                aria-expanded={showConsultants}
                aria-haspopup="menu"
              >
                <Sparkles className="h-4 w-4" />
                {t.ctaPrimary}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${showConsultants ? "rotate-180" : "rotate-0"}`}
                />
              </button>
              <div
                className={`absolute left-0 top-full z-[70] mt-3 w-[min(23rem,calc(100vw-2.5rem))] rounded-3xl border border-white/90 bg-white/75 p-3 shadow-[0_24px_60px_rgba(30,41,59,0.22)] backdrop-blur-xl transition-all duration-200 ${
                  showConsultants
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                <div className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l border-t border-white/90 bg-white/80" />
                <div className="mb-2 flex items-center gap-2 px-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                    {lang === "vi" ? "Chọn chuyên viên" : "Choose a consultant"}
                  </p>
                </div>
                <div className="space-y-2">
                  {consultants.map((advisor) => (
                    <a
                      key={advisor.key}
                      href={advisor.href}
                      onClick={() => setShowConsultants(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group block rounded-2xl border border-indigo-100/80 bg-gradient-to-r ${advisor.cardBg} p-3 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_10px_22px_rgba(79,70,229,0.12)]`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${advisor.iconBg}`}>
                          <advisor.Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-base font-semibold text-slate-800">{advisor.name}</p>
                            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                              {advisor.badge}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-slate-600">{advisor.role}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-600" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <a
              href="#delivery-flow"
              className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white/85 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-white"
            >
              {t.ctaSecondary}
            </a>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t.sectionServices}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceOrder.map((item) => {
              const service = t.services[item.key as keyof typeof t.services];
              const Icon = iconMap[item.icon];
              return (
                <article
                  key={item.key}
                  className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{service.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="delivery-flow" className="mt-8 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t.sectionFlow}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {t.flow.map((step) => (
              <article key={step.step} className="rounded-2xl border border-indigo-100 bg-white/90 p-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-indigo-600">STEP {step.step}</p>
                <h3 className="mt-2 text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
