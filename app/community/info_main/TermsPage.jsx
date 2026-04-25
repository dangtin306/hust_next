"use client";

import { useState, useSyncExternalStore } from "react";

const COOKIE_NAME = "hm_terms_accepted";
const COOKIE_DAYS = 30;

const sections = [
  {
    id: "purpose",
    title: "1. Purpose of the Site",
    content: (
      <>
        <p>
          Hust Media provides technical content, reference material, and practical platform resources for
          informational, educational, and implementation purposes. The Site may include architecture notes,
          deployment and validation workflows, monitoring references, API-related explanations, utility
          modules, and related technical materials.
        </p>
        <p>
          The Site is intended to support learning, research, documentation, and practical technical
          understanding across connected platform topics.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "2. Acceptable Use",
    content: (
      <>
        <p>
          You may use the Site only for lawful and legitimate purposes. You agree not to:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          <li>misuse, disrupt, or interfere with the Site or its infrastructure</li>
          <li>attempt unauthorized access to any part of the Site, server, or connected systems</li>
          <li>
            copy, scrape, reproduce, or redistribute large portions of the Site in a way that harms
            its operation, ownership, or content integrity
          </li>
          <li>use the Site to distribute malicious code, spam, abusive traffic, or other harmful activity</li>
        </ul>
        <p>
          We may restrict or block access if we detect misuse, abuse, or activity that threatens the
          security, stability, or normal operation of the Site.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "3. Intellectual Property and Permitted Use",
    content: (
      <>
        <p>
          Unless otherwise stated, all content on the Site, including text, diagrams, layout,
          graphics, and original technical materials, is owned by or licensed to Hust Media and
          protected by applicable intellectual property laws.
        </p>
        <p>
          You may read, reference, and share links to the content for personal, educational, or
          informational use. You may not republish, reproduce, modify, or commercially distribute Site
          content without prior written permission, except where permitted by law.
        </p>
      </>
    ),
  },
  {
    id: "technical-content",
    title: "4. Technical Content and Reference Limits",
    content: (
      <>
        <p>
          We aim to provide clear, practical, and accurate technical content. However, the Site and its
          content are provided on an &quot;as is&quot; and &quot;as available&quot; basis. Articles, diagrams, examples,
          and references may contain errors, omissions, simplified examples, or information that becomes
          outdated over time.
        </p>
        <p>
          Content on the Site does not constitute professional engineering, legal, security, financial,
          or compliance advice. You are responsible for reviewing, testing, and validating any
          implementation before using it in production or other critical environments.
        </p>
      </>
    ),
  },
  {
    id: "external-resources",
    title: "5. External Resources and Third-Party Services",
    content: (
      <>
        <p>
          The Site may reference third-party tools, frameworks, platforms, documentation, links, or
          external services for context and technical explanation. Hust Media is not responsible for the
          content, availability, accuracy, or policies of third-party resources.
        </p>
        <p>
          Any access to third-party services is at your own discretion and remains subject to their own
          terms, policies, and operational conditions.
        </p>
      </>
    ),
  },
  {
    id: "availability-liability",
    title: "6. Availability, Changes, and Liability",
    content: (
      <>
        <p>
          We may update, revise, remove, or reorganize any part of the Site at any time, including
          articles, diagrams, categories, navigation, utilities, and supporting pages, without prior
          notice.
        </p>
        <p>
          We do not guarantee uninterrupted availability of the Site and are not liable for downtime,
          temporary errors, technical interruptions, or changes in content structure or availability.
        </p>
        <p>
          To the fullest extent permitted by law, Hust Media shall not be liable for any indirect,
          incidental, consequential, or special damages arising from or related to your use of, or
          inability to use, the Site or its content. Your use of the Site and any information from it is
          at your own risk.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "7. Contact",
    content: (
      <>
        <p>For questions regarding these Terms, please contact:</p>
        <p>Hust Media</p>
        <p>
          Email:{" "}
          <a
            href="mailto:contact@hust.media"
            className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
          >
            contact@hust.media
          </a>
        </p>
      </>
    ),
  },
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
  const accepted = useSyncExternalStore(
    () => () => {},
    () => getCookie(COOKIE_NAME) === "1",
    () => false,
  );
  const [notice, setNotice] = useState("");

  const handleToggle = (event) => {
    const checked = event.target.checked;
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                Hust Media
              </p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Terms of Use
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Last updated: 2026-04-25
              </p>
              <h2 className="mt-4 text-base font-semibold text-slate-900">
                Introduction
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                These Terms of Use (&quot;Terms&quot;) govern your access to and use of the Hust Media website,
                including its technical articles, implementation notes, diagrams, documentation pages,
                digital utilities, and related content (collectively, the &quot;Site&quot;). By accessing or using
                the Site, you agree to these Terms.
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

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_12px_22px_-20px_rgba(15,23,42,0.25)] sm:px-5 sm:py-5">
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
        </main>
      </div>
    </div>
  );
}
