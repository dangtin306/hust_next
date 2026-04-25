"use client";

import { useState } from "react";

type HelpfulVote = "" | "yes" | "no";

export default function DocsHelpfulFeedback() {
  const [vote, setVote] = useState<HelpfulVote>("");

  return (
    <div className="mt-5 mb-1 rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/85 via-blue-950/60 to-slate-900/85 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
      <div className="mx-2">
        {vote ? (
          <div className="text-sm font-medium text-slate-100">
            {vote === "yes"
              ? "Thank you for your feedback! We're glad you found this helpful."
              : "Thank you for your feedback! We'll work on improving our content."}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-base font-semibold text-slate-100 sm:text-lg">
              Was this content helpful to you?
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVote("yes")}
                className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-white/30 bg-white/10 px-4 text-base font-medium text-sky-300 transition hover:bg-white/20"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setVote("no")}
                className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-white/30 bg-white/10 px-4 text-base font-medium text-sky-300 transition hover:bg-white/20"
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
