import { Mail, MapPin, Send, ShieldAlert } from "lucide-react";

export default function SupportPage() {
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
            Hust Media is dedicated to democratizing AI education and protecting
            digital sovereignty for Vietnamese users.
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
                    Times City, Hanoi
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
                    dangtinn306@gmail.com
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
            <form className="space-y-6" suppressHydrationWarning>
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
                  <option>Student AI Package Support</option>
                  <option>Report Security Incident (Threat Intelligence)</option>
                  <option>Technical Issues</option>
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:from-blue-500 hover:to-purple-500"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Send
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
