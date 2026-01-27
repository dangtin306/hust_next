"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "hm_terms_accepted";
const COOKIE_DAYS = 30;

const sections = [
  { id: "account-usage", title: "1. Account Usage" },
  { id: "digital-credits", title: "2. Digital Credits Policy" },
  { id: "user-conduct", title: "3. User Conduct" },
  { id: "disclaimer", title: "4. Disclaimer and Moderation" },
  { id: "changes", title: "5. Changes to Terms" },
  { id: "contact", title: "6. Contact" },
];

const getCookie = (name) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : "";
};

const setCookie = (name, value, days) => {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

const clearCookie = (name) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

export default function TermsPage() {
  const [accepted, setAccepted] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = getCookie(COOKIE_NAME) === "1";
    setAccepted(saved);
  }, []);

  const handleToggle = (event) => {
    const checked = event.target.checked;
    setAccepted(checked);
    if (checked) {
      setCookie(COOKIE_NAME, "1", COOKIE_DAYS);
      setNotice("Saved. Your acceptance has been recorded.");
    } else {
      clearCookie(COOKIE_NAME);
      setNotice("Acceptance removed.");
    }
    window.clearTimeout(handleToggle._timer);
    handleToggle._timer = window.setTimeout(() => setNotice(""), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/80 via-purple-100/80 to-pink-100/80 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.25)] backdrop-blur-sm lg:sticky lg:top-8">
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

        <main className="flex-1">
          <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_20px_36px_-28px_rgba(15,23,42,0.25)] backdrop-blur-sm">
            <header className="border-b border-slate-200/70 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                Hust Media
              </p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Terms of Service
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Last updated: 2025-01-08
              </p>
              <p className="mt-4 text-sm text-slate-600">
                These Terms of Service ("Terms") govern your access to and use
                of the Hust Media platform, including all web, mobile, and
                related services (collectively, the "Services"). By accessing or
                using the Services, you agree to be bound by these Terms.
              </p>
            </header>

            <section id="account-usage" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">1. Account Usage</h2>
              <p className="text-sm text-slate-700">
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You must provide accurate identification information
                and promptly update it if it changes. Hust Media may use
                security intelligence and risk signals, including checkscam and
                anti-abuse systems, to protect users, prevent misuse, and enforce
                these Terms.
              </p>
              <p className="text-sm text-slate-700">
                You agree to notify us immediately of any unauthorized access or
                suspected security breach related to your account.
              </p>
            </section>

            <section id="digital-credits" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">
                2. Digital Credits Policy
              </h2>
              <p className="text-sm text-slate-700">
                The Services may provide "Digital Credits" as an internal
                utility unit that can be used to access or redeem Micro-Services
                on the platform. Digital Credits are not legal tender, do not
                represent any fiat currency, and have no cash or monetary value.
                Digital Credits cannot be converted to cash, transferred outside
                the platform, or used for any unlawful activity.
              </p>
              <p className="text-sm text-slate-700">
                The purchase, sale, barter, or unauthorized transfer of Digital
                Credits is strictly prohibited. Hust Media may suspend or revoke
                Digital Credits and related access if it detects fraud, abuse, or
                violation of these Terms.
              </p>
            </section>

            <section id="user-conduct" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">3. User Conduct</h2>
              <p className="text-sm text-slate-700">
                You agree not to engage in any activity that undermines the
                integrity of the Services, including but not limited to fraud,
                spam, manipulation of tasks, use of bots or hacking tools, or
                attempts to bypass verification mechanisms. Anti-fraud systems
                may apply penalties, including removal of credits, restriction
                of access, or account suspension.
              </p>
              <p className="text-sm text-slate-700">
                You are solely responsible for all content you submit, and you
                must comply with applicable laws and regulations.
              </p>
            </section>

            <section id="disclaimer" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">
                4. Disclaimer and Moderation
              </h2>
              <p className="text-sm text-slate-700">
                The Services may include user-generated content ("UGC"). Hust
                Media does not endorse UGC and is not responsible for the
                accuracy, legality, or appropriateness of UGC posted by users.
              </p>
              <p className="text-sm text-slate-700">
                To maintain a safe environment, Hust Media employs AI-driven
                content moderation and verification workflows. We reserve the
                right to remove content, restrict access, or take enforcement
                actions when content violates our policies or these Terms.
              </p>
            </section>

            <section id="changes" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">5. Changes to Terms</h2>
              <p className="text-sm text-slate-700">
                We may update these Terms from time to time to reflect changes
                in the Services, legal requirements, or operational practices.
                Continued use of the Services after changes become effective
                constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section id="contact" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">6. Contact</h2>
              <p className="text-sm text-slate-700">
                For questions or concerns regarding these Terms, please contact
                Hust Media Support at: support@hust.media.
              </p>
            </section>

            <div className="mt-8 border-t border-slate-200/70 pt-6">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  checked={accepted}
                  onChange={handleToggle}
                  suppressHydrationWarning
                />
                I agree to these Terms.
              </label>
              {notice && (
                <div className="mt-3 rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-800 shadow-sm">
                  {notice}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
