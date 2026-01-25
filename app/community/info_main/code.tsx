import Link from "next/link";
import {
  Code2,
  Database,
  Bot, // Icon Robot cho AI
  Brain, // Icon não bộ
  ShieldCheck,
  Wrench,
  Cpu, // Icon vi xử lý
  Sparkles,
} from "lucide-react";

const services = [
  {
    title: "Custom AI Agent Development",
    description:
      "Build intelligent bots that handle customer support, data entry, and workflow automation 24/7.",
    icon: Bot,
  },
  {
    title: "LLM & API Integration",
    description:
      "Integrate GPT-4, Gemini, or Claude into your existing software to enhance intelligence.",
    icon: Brain,
  },
  {
    title: "RAG & Knowledge Bases",
    description:
      "Train AI on your company's private data (PDFs, Docs) for accurate, context-aware answers.",
    icon: Database,
  },
  {
    title: "Process Automation (RPA)",
    description:
      "Automate repetitive tasks with AI-driven scripts, reducing manual labor by up to 90%.",
    icon: Cpu,
  },
  {
    title: "Enterprise Security & Privacy",
    description:
      "Data sanitization, PII protection, and secure deployment on private servers or cloud.",
    icon: ShieldCheck,
  },
  {
    title: "Maintenance & Fine-tuning",
    description:
      "Continuous model monitoring, prompt engineering updates, and infrastructure scaling.",
    icon: Wrench,
  },
];

const workflow = [
  {
    step: "01",
    title: "Data Strategy & Scope",
    description:
      "We analyze your data structure and define clear AI use cases with measurable ROI.",
  },
  {
    step: "02",
    title: "Development & Training",
    description:
      "Building the pipeline, setting up Vector DBs, and fine-tuning prompts for accuracy.",
  },
  {
    step: "03",
    title: "Deployment & Handoff",
    description:
      "Secure API deployment, integration testing, and full source code transfer.",
  },
];

const deliverables = [
  "Source Code (Python/Node.js) & API Documentation",
  "Custom AI Models & Prompt Templates",
  "Vector Database Setup (Pinecone/Milvus)",
  "Admin Dashboard for Monitoring Usage",
];

export default function DevelopmentServicesPage() {
  return (
    // THAY ĐỔI: Chuyển nền sang tông Xanh lá (Emerald/Green)
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50 to-green-50 text-slate-900 font-sans">
      <div className="relative overflow-hidden">
        {/* THAY ĐỔI: Gradient hiệu ứng nền xanh lá */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_10%_20%,rgba(16,185,129,0.1),transparent_55%),radial-gradient(600px_circle_at_90%_10%,rgba(52,211,153,0.1),transparent_45%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-600">
                Hust Media Solutions
              </p>
              <div>
                <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl text-slate-900">
                  Custom AI Software Development
                </h1>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  Transform your business with intelligent automation. We design, build,
                  and ship <strong>AI-powered software</strong> tailored to your specific data and workflows.
                  From simple bots to complex RAG systems.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Generative AI
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                  <Database className="h-3 w-3" />
                  Vector Search
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                  <Code2 className="h-3 w-3" />
                  Python & Golang
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  Book a Consultation
                </Link>
                <Link
                  href="/demos"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white/80 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-white"
                >
                  View Case Studies
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_20px_50px_-35px_rgba(16,185,129,0.25)] backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Engagement Models
              </p>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl border border-emerald-50 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm font-bold text-slate-800">
                    MVP / POC Delivery
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Rapid prototype in 2-4 weeks to validate your AI idea with real data.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-50 bg-white/90 p-4 shadow-sm">
                  <p className="text-sm font-bold text-slate-800">
                    Full System Integration
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    End-to-end development, API integration, and production deployment.
                  </p>
                </div>
              </div>
              {/* THAY ĐỔI: Code block nhìn giống config AI */}
              <div className="mt-6 rounded-2xl border border-emerald-900/10 bg-slate-900 p-4 text-xs text-emerald-400 font-mono">
                <p><span className="text-slate-400">service:</span> ai-automation</p>
                <p><span className="text-slate-400">stack:</span> python + langchain</p>
                <p><span className="text-slate-400">model:</span> gpt-4o / llama-3</p>
                <p><span className="text-slate-400">status:</span> <span className="text-green-400">production_ready</span></p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="rounded-3xl border border-emerald-100/50 bg-white/70 p-6 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)] backdrop-blur transition hover:bg-white hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-800">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Our Process
              </p>
              <div className="mt-6 space-y-4">
                {workflow.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-2xl border border-emerald-50 bg-white/80 p-4"
                  >
                    <p className="text-xs font-bold text-emerald-600">
                      Step {item.step}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/60 bg-emerald-50/50 p-6 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Delivery Guarantee
              </p>
              <h2 className="mt-4 text-xl font-bold text-slate-800">
                What you receive
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                We don't just deliver code; we deliver a functioning, documented, and scalable AI system.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {deliverables.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-medium text-emerald-900 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-emerald-900 p-8 text-white shadow-xl shadow-emerald-900/20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                  Ready to Automate?
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Build your Custom AI Solution today.
                </h2>
                <p className="mt-2 text-sm text-emerald-100 max-w-xl">
                  Share your problem with us. We will provide a technical proposal, 
                  timeline, and cost estimate for your AI project.
                </p>
              </div>
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-emerald-900 shadow-lg hover:bg-emerald-50 transition"
              >
                Talk to Engineers
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}