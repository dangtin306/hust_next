"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "hm_terms_accepted";
const COOKIE_DAYS = 30;

const sections = [
  { id: "purpose", title: "1. Purpose of the Site" },
  { id: "acceptable-use", title: "2. Acceptable Use" },
  { id: "intellectual-property", title: "3. Intellectual Property" },
  { id: "content-accuracy", title: "4. Content Accuracy and Technical Reference" },
  { id: "external-links", title: "5. External Links and Third-Party Resources" },
  { id: "availability", title: "6. Availability and Changes" },
  { id: "liability", title: "7. Limitation of Liability" },
  { id: "changes-to-terms", title: "8. Changes to These Terms" },
  { id: "contact", title: "9. Contact" },
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
                Terms of Use
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Last updated: 2026-02-08
              </p>
              <p className="mt-4 text-sm text-slate-600">
                These Terms of Use ("Terms") govern your access to and use of the Hust Media website,
                including its technical articles, diagrams, documentation pages, and related content
                (collectively, the "Site"). By accessing or using the Site, you agree to these Terms.
              </p>
            </header>

            <section id="purpose" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">1. Purpose of the Site</h2>
              <p className="text-sm text-slate-700">
                Hust Media provides technical content for informational and reference purposes. The Site may
                include articles, architecture notes, deployment guides, monitoring workflows, API references,
                and related technical materials intended to support learning, research, and practical
                implementation.
              </p>
            </section>

            <section id="acceptable-use" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">2. Acceptable Use</h2>
              <p className="text-sm text-slate-700">
                You may use the Site only for lawful purposes. You agree not to:
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>misuse, disrupt, or interfere with the Site or its infrastructure;</li>
                <li>
                  attempt unauthorized access to any part of the Site, server, or connected systems;
                </li>
                <li>
                  copy, scrape, reproduce, or redistribute large portions of the Site in a way that harms
                  its operation or ownership;
                </li>
                <li>use the Site to distribute malicious code, spam, or abusive traffic.</li>
              </ul>
              <p className="text-sm text-slate-700">
                We reserve the right to restrict access if we detect misuse, abuse, or activity that
                threatens the security or stability of the platform.
              </p>
            </section>

            <section id="intellectual-property" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">3. Intellectual Property</h2>
              <p className="text-sm text-slate-700">
                Unless otherwise stated, all content on the Site, including text, diagrams, layout,
                graphics, and original technical materials, is owned by or licensed to Hust Media and
                protected by applicable intellectual property laws.
              </p>
              <p className="text-sm text-slate-700">
                You may read, reference, and share links to the content for personal, educational, or
                informational use. You may not republish, reproduce, modify, or commercially distribute Site
                content without prior written permission, except where permitted by law.
              </p>
            </section>

            <section id="content-accuracy" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">4. Content Accuracy and Technical Reference</h2>
              <p className="text-sm text-slate-700">
                We aim to provide clear, practical, and accurate technical content. However, the Site is
                provided on an "as is" and "as available" basis. Technical articles may contain errors,
                omissions, simplified examples, or information that may become outdated over time.
              </p>
              <p className="text-sm text-slate-700">
                The content on the Site does not constitute professional engineering, legal, security,
                financial, or compliance advice. You are responsible for reviewing, testing, and validating
                any implementation before using it in a production environment.
              </p>
            </section>

            <section id="external-links" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">5. External Links and Third-Party Resources</h2>
              <p className="text-sm text-slate-700">
                The Site may reference third-party tools, frameworks, platforms, documentation, or external
                websites for context and technical explanation. Hust Media is not responsible for the
                content, availability, or policies of third-party resources.
              </p>
              <p className="text-sm text-slate-700">
                Access to any third-party service is at your own discretion and subject to its own terms and
                policies.
              </p>
            </section>

            <section id="availability" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">6. Availability and Changes</h2>
              <p className="text-sm text-slate-700">
                We may update, revise, remove, or reorganize any part of the Site at any time, including
                articles, diagrams, categories, navigation, and supporting pages, without prior notice.
              </p>
              <p className="text-sm text-slate-700">
                We do not guarantee uninterrupted availability of the Site and are not liable for downtime,
                temporary errors, or technical interruptions.
              </p>
            </section>

            <section id="liability" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
              <p className="text-sm text-slate-700">
                To the fullest extent permitted by law, Hust Media shall not be liable for any indirect,
                incidental, consequential, or special damages arising from or related to your use of, or
                inability to use, the Site or its content.
              </p>
              <p className="text-sm text-slate-700">
                Your use of any information from the Site is at your own risk.
              </p>
            </section>

            <section id="changes-to-terms" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">8. Changes to These Terms</h2>
              <p className="text-sm text-slate-700">
                We may update these Terms from time to time to reflect changes in the Site, legal
                requirements, or operational practices. Continued use of the Site after updated Terms are
                posted constitutes your acceptance of those changes.
              </p>
            </section>

            <section id="contact" className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">9. Contact</h2>
              <p className="text-sm text-slate-700">For questions regarding these Terms, please contact:</p>
              <p className="text-sm text-slate-700">
                Hust Media
                <br />
                Email: contact@hust.media
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
