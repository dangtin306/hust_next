import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import FeatureMedia from "./FeatureMedia";
import fs from "fs";
import path from "path";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Platform Features | Hust Media",
  description:
    "Feature overview for the reward-based collaboration platform: task orchestration, proof-based verification, risk lookup, and hybrid deployment with modular services.",
};

const cardBase =
  "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur";

const cardTight =
  "relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_70px_-55px_rgba(15,23,42,0.4)] backdrop-blur";

const imageFrame =
  "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]";

const featuresImage = (filename: string) => `/images/features/${filename}`;

const moduleA2Path = featuresImage("module_a_2.png");
const moduleA2Available = (() => {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "features",
      "module_a_2.png"
    );
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
})();

const moduleBPath = featuresImage("module_b.png");
const moduleBAvailable = (() => {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "features",
      "module_b.png"
    );
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
})();

const moduleCPath = featuresImage("module_c.png");
const moduleCAvailable = (() => {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "features",
      "module_c.png"
    );
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
})();

const moduleAQcScalePath = "/images/features/module_a_qc_scale.png";
const moduleAQcScaleAvailable = (() => {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "features",
      "module_a_qc_scale.png"
    );
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
})();
const moduleAImageSrc = moduleA2Available
  ? moduleA2Path
  : moduleAQcScaleAvailable
    ? moduleAQcScalePath
    : "/images/features/what_is.png";
const moduleAImageAlt = moduleA2Available
  ? "Module A — Campaign orchestration and scaling workflow"
  : moduleAQcScaleAvailable
    ? "Figure 3.6 — Module A quality control & scaling workflow"
    : "Figure 0.1 — Application functions";
const moduleBImageSrc = moduleBAvailable ? moduleBPath : undefined;
const moduleCImageSrc = moduleCAvailable ? moduleCPath : undefined;

const thesisFiguresBase = [
  {
    src: featuresImage("what_is.png"),
    title: "Figure 0.1 — Application functions",
    description:
      "High-level feature map of the platform: campaigns, tasks, proof submission, rewards, and supporting modules.",
  },
  {
    src: featuresImage("1111.png"),
    title: "Figure 1.1 — System technical diagram",
    description:
      "Client requests are handled by the server core, routed to modular services, and stored across dedicated data layers with update automation.",
  },
  {
    src: featuresImage("1233122312.png"),
    title: "Figure 2.2 — Server structure",
    description:
      "On-prem server resources used to run long-lived services and handle proof/media workloads in the prototype.",
  },
  {
    src: featuresImage("123312231.png"),
    title: "Figure 2.4 — Hybrid network architecture",
    description:
      "Hybrid access model using tunnel/reverse proxy to protect the origin server while keeping deployment practical.",
  },
  {
    src: featuresImage("213231231.jpg"),
    title: "Figure 2.6 — AI assistant in VS Code",
    description:
      "AI-assisted development used to speed up implementation while keeping review and testing in the loop.",
  },
  {
    src: featuresImage("23132132.png"),
    title: "Figure 2.7 — Multi-platform frontend",
    description:
      "Frontend architecture overview across surfaces, focused on consistent UX and interoperable data contracts.",
  },
  {
    src: featuresImage("backend.png"),
    title: "Figure 2.10 — Backend overview",
    description:
      "Service layout showing modular responsibilities across Node.js/PHP/Go/Python with shared API endpoints.",
  },
  {
    src: featuresImage("p2p_main.png"),
    title: "Figure 3.x — Requester/Worker flow",
    description:
      "Requester (A) creates campaigns; workers (B) execute tasks, submit proof, and receive points after review.",
  },
  {
    src: featuresImage("first_1.png"),
    title: "Figure 4.1 — Initial release architecture",
    description:
      "First App Store deployment flow for the prototype release and its hybrid client strategy.",
  },
  {
    src: featuresImage("first_2.png"),
    title: "Figure 4.2 — Current release architecture",
    description:
      "Current deployment model with a React Native shell, WebView core, deep links, and runtime updates.",
  },
  {
    src: featuresImage("performance.png"),
    title: "Figure 4.5 — Performance monitoring overview",
    description:
      "Operational monitoring of CPU/RAM/disk/network combined with simple alerts to support stability.",
  },
  {
    src: featuresImage("admin.png"),
    title: "Figure 4.6 — Admin dashboard overview",
    description:
      "Admin interface for user/order management, proof moderation, and operational KPIs.",
  },
  {
    src: featuresImage("backup.png"),
    title: "Figure 4.7 — Backup and update workflow",
    description:
      "Automated backups and lightweight CI/CD sync to keep deployments recoverable and maintainable.",
  },
  {
    src: moduleAQcScalePath,
    title: "Figure 3.6 — Module A quality control & scaling workflow",
    description:
      "Quality control checks and scaling/dispatch flow for Module A (campaign distribution and post-audit).",
  },
];

const thesisFigures = [
  ...thesisFiguresBase.filter((fig) =>
    fig.src === moduleAQcScalePath ? moduleAQcScaleAvailable : true
  ),
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
                Graduation Project • HUST EEE
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Reward-Based Collaboration Platform
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                The system standardizes online service needs into campaigns and
                micro-tasks. Participants submit completion proof, the backend
                verifies and awards points, and points can be redeemed to request
                services—forming a measurable, auditable workflow loop.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 text-sm font-medium text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                  Campaign → Micro-tasks
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                  Proof-based verification
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                  MariaDB + MongoDB
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
                  On-prem + Tunnel
                </span>
              </div>
            </div>

            <div className={`${cardBase} lg:col-span-5`}>
              <p className="text-sm font-semibold text-slate-500">
                Project Snapshot
              </p>
              <div className="mt-6 grid gap-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Core modules</span>
                  <span className="font-semibold text-slate-900">A / B / C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Frontends</span>
                  <span className="font-semibold text-slate-900">
                    Web / App
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backend stack</span>
                  <span className="font-semibold text-slate-900">
                    Node / PHP / Go / Python
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Deployment</span>
                  <span className="font-semibold text-slate-900">Hybrid</span>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-slate-200 bg-gradient-to-r from-pink-200 via-slate-100 to-sky-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Intended outcomes
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  <li>• Standardize workflows into campaigns and tasks.</li>
                  <li>• Keep verification auditable with proof and history.</li>
                  <li>• Operate efficiently with maintainable deployment.</li>
                </ul>
              </div>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-12">
            <article className={`${cardBase} lg:col-span-12`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Core Modules
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                What the platform delivers
              </h2>
              <p className="mt-4 max-w-3xl text-sm text-slate-600">
                The platform is designed around a closed-loop flow: campaigns
                are created, split into tasks, completed by participants, verified
                through proof, and rewarded by points. This creates a consistent
                way to manage collaboration at scale.
              </p>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className={cardTight}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Module A
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    Campaign & Task Orchestration
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Convert a request into structured tasks and distribute them
                    to participants with basic constraints and status tracking.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-600">
                    <li>• Campaign lifecycle & task queue</li>
                    <li>• Requester / Worker roles</li>
                    <li>• Status + history (audit)</li>
                  </ul>
                  <div className={`${imageFrame} mt-4`}>
                    <FeatureMedia
                      src={moduleAImageSrc}
                      alt={moduleAImageAlt}
                    />
                  </div>
                </div>

                <div className={cardTight}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Module B
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    Proof-Based Completion & Rewards
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Participants submit image/video proof; the system records,
                    reviews, and credits points according to task rules.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-600">
                    <li>• Proof upload and storage paths</li>
                    <li>• Review workflow and audit trail</li>
                    <li>• Points → redemption loop</li>
                  </ul>
                  <div className={`${imageFrame} mt-4`}>
                    <FeatureMedia
                      src={moduleBImageSrc}
                      alt="Figure 3.7 — Module B (rating with proof)"
                      label={
                        moduleBAvailable
                          ? undefined
                          : "Image not included in this build. Replace with Figure 3.7 from the thesis."
                      }
                    />
                  </div>
                </div>

                <div className={cardTight}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Module C
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    Risk Lookup & Safety Alerts
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    A lightweight lookup module helps users check identifiers
                    and shows warnings when risk signals are detected.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-600">
                    <li>• Fast lookup + result scoring</li>
                    <li>• Community reports (moderated)</li>
                    <li>• Clear warnings in UI</li>
                  </ul>
                  <div className={`${imageFrame} mt-4`}>
                    <FeatureMedia
                      src={moduleCImageSrc}
                      alt="Figure 3.8 / 3.9 — Risk lookup & processing pipeline"
                      label={
                        moduleCAvailable
                          ? undefined
                          : "Image not included in this build. Replace with Figures 3.8 and 3.9 from the thesis."
                      }
                    />
                  </div>
                </div>
              </div>
            </article>

            <article className={`${cardBase} lg:col-span-12`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Infrastructure
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                On-prem server core (prototype deployment)
              </h2>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm text-slate-600">
                    The system is deployed on a physical server to keep operating costs low while
                    maintaining stable performance for long-running services. This setup supports
                    modular services, file-based proof storage, and future AI extensions.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Multi-service runtime: Node.js / PHP / Go / Python</li>
                    <li>• Room for caching and parallel processing</li>
                    <li>• Designed for continuous operation with planned backups</li>
                  </ul>
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">
                      Image notes
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      You can replace this with the final hardware table and photos in the thesis.
                    </p>
                  </div>
                </div>
                <figure className={imageFrame}>
                  <FeatureMedia
                    src={featuresImage("server.png")}
                    alt="On-prem server configuration"
                  />
                </figure>
              </div>
            </article>

            <article className={`${cardBase} lg:col-span-7`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Architecture
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Modular services & hybrid data layer
              </h2>
              <p className="mt-4 text-sm text-slate-600">
                The system follows a client–server model with modular services.
                APIs are standardized for multi-platform clients, while data is
                stored using a hybrid approach: relational tables for core
                transactions and document storage for flexible records/logs.
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">
                      Data contracts & API gateway
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Consistent JSON contracts reduce coupling and simplify
                      long-term extension.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">
                      MariaDB + MongoDB
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      SQL stores transactional records; NoSQL stores
                      semi-structured content and operational data.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">
                      Proof storage
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Proof files can be stored on dedicated disks or storage
                      services; the DB stores references for auditing.
                    </p>
                  </div>
                </div>

                <figure className={imageFrame}>
                  <FeatureMedia
                    src={featuresImage("locgic_1.png")}
                    alt="Backend services and data layer map"
                  />
                </figure>
              </div>
            </article>

            <article className={`${cardBase} lg:col-span-5`}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Deployment & Ops
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Low-cost, maintainable operations
              </h2>
              <p className="mt-4 text-sm text-slate-600">
                The prototype emphasizes practical operation: on-prem servers,
                protected ingress via a tunnel/reverse proxy, and lightweight
                automation for backup and updates.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>• Tunnel-based access to hide origin infrastructure.</li>
                <li>• Scripted service start/stop in correct order.</li>
                <li>• Periodic sync updates and automated backups.</li>
              </ul>
              <figure className={`${imageFrame} mt-5`}>
                <FeatureMedia
                  src={featuresImage("hybrid.png")}
                  alt="Hybrid deployment using tunnel and reverse proxy"
                />
              </figure>
            </article>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            {thesisFigures.map((diagram) => (
              <figure
                key={`${diagram.title}-${diagram.src}`}
                className={`${cardBase} flex flex-col`}
              >
                <div className={imageFrame}>
                  <FeatureMedia
                    src={diagram.src}
                    alt={diagram.title}
                    priority={diagram.src.includes("123312231.png")}
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
