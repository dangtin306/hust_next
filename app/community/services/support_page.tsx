"use client";

import { useRef, useState } from "react";
import { Mail, MapPin, Send, ShieldAlert } from "lucide-react";

export default function SupportPage() {
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent">(
    "idle"
  );
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitState === "sending") return;
    setSubmitState("sending");
    const formEl = formRef.current;

    window.setTimeout(() => {
      setSubmitState("sent");
      formEl?.reset();
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
            Tech For Good
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            How can we help you?
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Do you need assistance with the Hust Media app? Our team is here to support you with any technical issues or inquiries.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Address</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Park Hill Premium, Times City Complex, 458 Minh Khai St.,<br/> Hai Ba Trung Dist., Hanoi, Vietnam
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Email</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    contact@hust.media
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-200/80 bg-blue-50 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white p-3 text-blue-700">
                  <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">
                    Security Notice
                  </h2>
                  <p className="mt-2 text-sm text-blue-900/80">
                    To prevent impersonation and fraud, we DO NOT provide support
                    via Telegram, Zalo, or Facebook. Please use this official
                    form for all inquiries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
            <form
              className="space-y-6"
              onSubmit={handleSubmit}
              ref={formRef}
              suppressHydrationWarning
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  suppressHydrationWarning
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  suppressHydrationWarning
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Topic
                </label>
                <select
                  suppressHydrationWarning
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option>App Installation Issues</option>
                  <option>Account & Subscription</option>
                  <option>Report a Bug</option>
                  <option>Feature Request</option>
                  <option>Enterprise Partnership</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us how we can help."
                  suppressHydrationWarning
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button
                type="submit"
                disabled={submitState === "sending"}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {submitState === "sending" ? "Sending..." : "Send"}
              </button>

              {submitState === "sent" && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Message sent. We will get back to you soon.
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
