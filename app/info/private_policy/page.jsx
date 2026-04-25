export const metadata = {
  title: "Privacy Policy | Hust Media",
  description:
    "How Hust Media collects, processes, and protects data for security audits, fraud prevention, and platform operations.",
};

const lastUpdated = new Date().toISOString().slice(0, 10);

const sections = [
  {
    id: "data-collection",
    title: "1. Data Collection",
    content: (
      <>
        <p>
          We collect limited technical data such as Device ID, IP Address,
          browser, session, and security log data to support system
          integrity, abuse prevention, and anomaly detection. This data is
          collected only for operational security, service stability,
          fraud-control workflows, and essential platform operations.
        </p>
        <p>
          We do not use this data for unauthorized personal profiling or
          unrelated tracking.
        </p>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
          Purpose-limited: security audit, system integrity, abuse prevention,
          and essential platform operations only.
        </div>
      </>
    ),
  },
  {
    id: "media-handling",
    title: "2. Media Handling",
    content: (
      <>
        <p>
          Verification artifacts such as images, videos, and related evidence
          files may be processed through a controlled validation flow that
          includes encryption, automated analysis (including OCR where
          needed), secure storage, and scheduled deletion under the
          platform&apos;s data retention rules.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>Encryption at rest and controlled access permissions</li>
          <li>
            AI/OCR used only for verification, validation, or operational
            review
          </li>
          <li>
            Retention and deletion cycles applied under internal data-handling
            rules
          </li>
        </ul>
        <p>
          Uploaded media is not reused outside the verification or operational
          scope unless required for security review, support, or legal
          compliance.
        </p>
      </>
    ),
  },
  {
    id: "cookies-sessions",
    title: "3. Cookies & Sessions",
    content: (
      <>
        <p>
          Hust Media uses cookies, session tokens, and related storage
          mechanisms to maintain user sessions, protect platform integrity, and
          synchronize state across connected modules, including shared React and
          NextJS flows.
        </p>
        <p>These technologies are used for:</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>session identification and login continuity</li>
          <li>module state synchronization</li>
          <li>security checks and abuse prevention</li>
          <li>essential platform functionality</li>
        </ul>
        <p>
          They are not used for unauthorized external tracking outside
          the legitimate platform, analytics, security, or advertising purposes
          described in this policy.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "4. Third-Party Disclosure",
    content: (
      <>
        <p>
          We do not sell user data. We may share limited data with trusted
          infrastructure, security, analytics, advertising, or service
          providers only when necessary to operate, protect, improve, or
          monetize the platform.
        </p>
        <p>
          Where possible, shared data is minimized, aggregated, or anonymized.
          Third-party access is limited to legitimate operational, security,
          compliance, analytics, advertising, or service-delivery purposes.
        </p>
      </>
    ),
  },
  {
    id: "advertising-services",
    title: "5. Advertising & Google AdSense",
    content: (
      <>
        <p>
          Hust Media may use Google AdSense and other third-party advertising
          services to display ads on the platform. These providers, including
          Google, may use cookies, web beacons, or similar technologies to
          serve ads, measure ad performance, and improve advertising services.
        </p>
        <p>
          Google and its partners may use advertising cookies to show ads based
          on a user&apos;s visits to this site and other sites on the Internet.
        </p>
        <p>
          Users can learn more about how Google uses data from sites or apps
          that use its services through Google&apos;s own policy materials and
          service disclosures.
        </p>
        <p>Users may manage cookie or advertising preferences through:</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>browser privacy and cookie settings</li>
          <li>consent tools shown on the site, where applicable</li>
          <li>
            Google ad settings or provider-specific controls, where available
          </li>
        </ul>
        <p>
          If personalized advertising is enabled, advertising providers may
          process data under their own privacy policies and applicable user
          settings.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-slate-200 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-3 py-8 sm:px-6 sm:py-12 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.25)] backdrop-blur-sm lg:sticky lg:top-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">
              Table of Contents
            </p>
            <nav className="mt-4 space-y-2 text-sm">
              {sections.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-lg px-2 py-1 text-slate-700 hover:bg-white/70"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 space-y-4">
          <header className="rounded-3xl border border-white/80 bg-white/80 px-4 py-6 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.25)] backdrop-blur-sm sm:px-6 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Hust Media
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Last updated: {lastUpdated}
            </p>
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Introduction
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This policy describes how Hust Media handles data across the
              platform, including technical logs, verification media, cookies,
              session mechanisms, third-party services, and advertising-related
              technologies where enabled. It outlines how data is collected and
              processed to maintain security, protect stable operation, support
              validation and fraud-control workflows, and keep connected platform
              components running in a controlled and consistent way.
            </p>
          </header>

          <div className="space-y-4">
            {sections.map((section) => (
              <details
                key={section.id}
                id={section.id}
                className="group scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_12px_22px_-20px_rgba(15,23,42,0.25)] sm:p-5"
                open
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900">
                  <span>{section.title}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-180">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 8l5 5 5-5" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  {section.content}
                </div>
              </details>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
