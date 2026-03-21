"use client";

import { useState } from "react";
import { alert_success } from "@/app/AppContext";

type AccountsProductPayload = {
  status?: string | null;
  msg?: string | null;
  trans_id?: string | number | null;
  data?: string[];
};

type AccountsProductProps = {
  accountsProduct: AccountsProductPayload | string[] | null;
};

const copyText = async (value: string) => {
  if (!value) return;
  alert_success("Copied");
  if (typeof window !== "undefined" && (window as Window & { saochepnative?: (v: string) => void }).saochepnative) {
    (window as Window & { saochepnative?: (v: string) => void }).saochepnative?.(value);
    return;
  }
  if (navigator?.clipboard) {
    await navigator.clipboard.writeText(value);
  }
};

export default function AccountsProduct({ accountsProduct }: AccountsProductProps) {
  const normalized: AccountsProductPayload =
    accountsProduct &&
    !Array.isArray(accountsProduct) &&
    Array.isArray((accountsProduct as AccountsProductPayload).data)
      ? (accountsProduct as AccountsProductPayload)
      : {
          status: null,
          msg: null,
          trans_id: null,
          data: Array.isArray(accountsProduct) ? accountsProduct : [],
        };

  const { status, msg, trans_id } = normalized;
  const data = Array.isArray(normalized.data) ? normalized.data : [];
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (value: string, idx: number | null = null) => {
    if (!value) return;
    try {
      await copyText(value);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch {
      // ignore copy failures to keep UX simple
    }
  };

  const downloadCSV = () => {
    if (!data || data.length === 0) return;
    const csv = data.map((row) => `"${String(row).replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = trans_id ? `accounts_${trans_id}.csv` : "accounts.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full mt-3">
      <div className="rounded-md bg-gradient-to-r from-indigo-50 to-sky-50 border border-gray-100">
        <div className="flex items-center justify-between gap-2 px-2 py-0.5">
          <div className="min-w-0">
            {status ? (
              <div
                className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  status === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {status}
              </div>
            ) : null}

            {msg ? <div className="mt-1 text-sm font-medium truncate text-gray-800">{msg}</div> : null}

            {trans_id ? (
              <div className="mt-0.5 text-[11px] text-gray-500 truncate">
                Order ID: <span className="font-mono">{trans_id}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCopy(JSON.stringify(data, null, 2))}
              className="px-2 py-1 text-xs font-medium rounded border shadow-sm bg-white/90"
            >
              Copy
            </button>

            <button
              onClick={downloadCSV}
              className="px-2 py-1 text-xs font-medium rounded border shadow-sm bg-white/90"
            >
              CSV
            </button>
          </div>
        </div>

        <div className="mt-0.5 grid gap-1 px-1 pb-1 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <div
                key={`${idx}-${row}`}
                className="p-2 bg-white rounded-md border flex flex-col justify-between min-h-[72px] break-words"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-gray-400">ACC {idx + 1}</div>
                    <button
                      onClick={() => handleCopy(row, idx)}
                      className={`px-2 py-1 text-xs font-medium rounded border bg-white ${
                        copiedIndex === idx ? "opacity-80" : ""
                      }`}
                      aria-label={`Copy account ${idx + 1}`}
                    >
                      {copiedIndex === idx ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="font-mono mt-1 text-xs leading-tight text-gray-900 break-all">
                    {row}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-xs text-gray-500 py-4">
              No accounts to show
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
