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
          We collect technical data such as Device ID, IP Address, and Browser
          Fingerprint exclusively for Security Audits and Anomaly Detection.
          This data is strictly not used for unauthorized personal tracking or
          purposes outside the scope of system security.
        </p>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
          Purpose-limited: Security Audit + System Integrity only.
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
          Verification artifacts (images/videos) uploaded by users are processed
          via a multi-layer security protocol: Data Encryption → Automated
          Analysis (OCR) → Secure Storage or Scheduled Deletion according to our
          Data Retention Policy.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>Encryption at rest and strict access control.</li>
          <li>AI/OCR is used solely for validating verification data.</li>
          <li>Data deletion cycles are enforced per the retention policy.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies-sessions",
    title: "3. Cookies & Sessions",
    content: (
      <>
        <p>
          Hust Media uses cookies to maintain user sessions and synchronize
          state across modules (Shared Session React-NextJS). Cookies are used
          solely for session identification and essential operations, not for
          external tracking.
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
          We do not sell user data. We only share anonymized data with
          analytical partners when strictly necessary to improve system
          performance and security.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-slate-200 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="rounded-3xl border border-white/80 bg-white/80 px-6 py-8 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.25)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Hust Media
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-sm text-slate-600">
            This policy describes how Hust Media collects, processes, and protects
            data to ensure system integrity and prevent abuse.
          </p>
        </header>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <details
              key={section.id}
              className="group rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_22px_-20px_rgba(15,23,42,0.25)]"
              open={index === 0}
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
      </div>
    </div>
  );
}