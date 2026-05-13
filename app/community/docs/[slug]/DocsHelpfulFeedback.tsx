"use client";

import { useState } from "react";

type HelpfulVote = "" | "yes" | "no";

export default function DocsHelpfulFeedback() {
  const [vote, setVote] = useState<HelpfulVote>("");

  return (
    <div className="mt-3 mb-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm lg:mt-4 lg:-mb-2">
      <div>
        {vote ? (
          <div className="text-sm font-medium text-slate-700">
            {vote === "yes"
              ? "Thank you for your feedback! We're glad you found this helpful."
              : "Thank you for your feedback! We'll work on improving our content."}
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-base font-semibold text-slate-800">
              Was this content helpful to you?
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVote("yes")}
                className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-slate-400/70 bg-white px-4 text-base font-medium text-blue-700 transition hover:bg-slate-50"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setVote("no")}
                className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-slate-400/70 bg-white px-4 text-base font-medium text-blue-700 transition hover:bg-slate-50"
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
