"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/app/api/media_tech/workspace/copyText";

const IDLE_LABEL = "Sao chép prompt mẫu";

// Dùng copyText (có dự phòng execCommand) để vẫn sao chép được khi truy cập qua IP/tên miền, không chỉ localhost.
export default function CopyPromptButton({ text }: { text: string }) {
  const [label, setLabel] = useState(IDLE_LABEL);
  const [done, setDone] = useState(false);

  async function copy() {
    const ok = await copyText(text);
    setLabel(ok ? "Đã sao chép" : "Không sao chép được");
    setDone(ok);
    window.setTimeout(() => {
      setLabel(IDLE_LABEL);
      setDone(false);
    }, 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
        done
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/80"
      }`}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
