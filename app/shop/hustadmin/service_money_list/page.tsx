"use client";

import { useCallback, useEffect, useState } from "react";

type MoneyRow = {
  id?: number | string;
  website?: string;
  money_ok?: number | string;
};

type MoneyMeta = {
  status: string;
  message: string;
  count: number;
  has_createdate: boolean;
  has_key_money_ok: boolean;
  has_money: boolean;
};

const MONEY_LIST_API = "https://nginx.hust.media/go/service/money_list";
const MONEY_UPDATE_API = "https://nginx.hust.media/go/service/money_update";

const emptyMeta: MoneyMeta = {
  status: "",
  message: "",
  count: 0,
  has_createdate: false,
  has_key_money_ok: false,
  has_money: false,
};

const readResponse = async (response: Response) => {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message?: unknown }).message || "")
        : `Request failed with status code ${response.status}`;
    throw new Error(message);
  }

  return body as {
    list?: MoneyRow[];
    status?: string | number;
    message?: string;
    count?: number | string;
    has_createdate?: boolean;
    has_key_money_ok?: boolean;
    has_money?: boolean;
  };
};

const formatMoneyParts = (value: MoneyRow["money_ok"]) => {
  if (value === null || value === undefined || value === "") return null;

  const raw = String(value).trim();
  if (!raw || raw === "-") return null;

  const isNegative = raw.startsWith("-");
  const unsignedRaw = isNegative ? raw.slice(1) : raw;
  const [integerRaw, decimalRaw] = unsignedRaw.split(".");
  const normalizedInteger = integerRaw?.replace(/\D/g, "") || "0";
  const integerWithDots = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return {
    integerPart: `${isNegative ? "-" : ""}${integerWithDots}`,
    decimalPart: decimalRaw ? `,${decimalRaw}` : "",
  };
};

export default function ServiceMoneyListPage() {
  const [rows, setRows] = useState<MoneyRow[]>([]);
  const [meta, setMeta] = useState<MoneyMeta>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMoneyList = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(MONEY_LIST_API, { cache: "no-store" });
      const payload = await readResponse(response);
      setRows(Array.isArray(payload.list) ? payload.list : []);
      setMeta({
        status: String(payload.status ?? ""),
        message: payload.message || "",
        count: Number(payload.count) || 0,
        has_createdate: Boolean(payload.has_createdate),
        has_key_money_ok: Boolean(payload.has_key_money_ok),
        has_money: Boolean(payload.has_money),
      });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to load service money list";
      setError(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReload = async () => {
    setLoading(true);
    setError("");

    try {
      const updateResponse = await fetch(MONEY_UPDATE_API, { cache: "no-store" });
      await readResponse(updateResponse);
      await loadMoneyList();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to reload service money list";
      setError(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoneyList();
  }, [loadMoneyList]);

  return (
    <main className="mx-2 my-2 rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-rose-50 p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="m-0 text-2xl font-bold text-slate-800">Service Money List</h1>
        <button
          type="button"
          onClick={handleReload}
          disabled={loading}
          className="self-start rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
        >
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>

      {error ? (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-700 sm:text-sm">
        {[
          ["Status", meta.status || "-"],
          ["Message", meta.message || "-"],
          ["Count", meta.count],
          ["has_createdate", String(meta.has_createdate)],
          ["has_key_money_ok", String(meta.has_key_money_ok)],
          ["has_money", String(meta.has_money)],
        ].map(([label, value]) => (
          <span key={label} className="rounded-full bg-slate-100 px-2 py-1">
            {label}: <b>{value}</b>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[520px] border-collapse text-sm sm:text-base">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-2 text-center">ID</th>
              <th className="border px-2 py-2 text-left">Website</th>
              <th className="border px-2 py-2 text-center">Money OK</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const money = formatMoneyParts(row.money_ok);
              return (
                <tr key={`${row.id ?? "row"}-${index}`} className="odd:bg-white even:bg-slate-50 hover:bg-sky-50">
                  <td className="border px-2 py-2 text-center">{row.id ?? "-"}</td>
                  <td className="border px-2 py-2 break-all">
                    {row.website ? (
                      <a href={row.website} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-700">
                        {row.website}
                      </a>
                    ) : "-"}
                  </td>
                  <td className="border px-2 py-2 text-center font-semibold">
                    {money ? (
                      <>
                        <span className="text-violet-700">{money.integerPart}</span>
                        <span className="text-emerald-600">{money.decimalPart}</span>
                      </>
                    ) : "-"}
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="border px-2 py-4 text-center text-slate-500">
                  No service money data
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
