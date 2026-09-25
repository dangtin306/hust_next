"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { alert_error, alert_success } from "../../../AppContext.js";
import "../port_cron/scheduler/scheduler.css";

type MoneyRow = {
  id?: number | string;
  service_name?: string;
  website?: string;
  key_money_ok?: number | string;
  check_enabled?: boolean | number | string;
};

type MoneyMeta = {
  status: string;
  message: string;
  count: number;
  has_createdate: boolean;
  has_key_money_ok: boolean;
  has_money: boolean;
  has_check_enabled: boolean;
};

const MONEY_LIST_API = "https://nginx.hust.media/go/service/money_list";
const MONEY_UPDATE_API = "https://nginx.hust.media/go/service/money_update";
const MONEY_EDIT_API = "https://nginx.hust.media/go/service/money_edit";
const MONEY_CLONE_API = "https://nginx.hust.media/go/service/money_clone";
const MONEY_DETAIL_API = "https://nginx.hust.media/go/service/money_detail";

const emptyMeta: MoneyMeta = {
  status: "",
  message: "",
  count: 0,
  has_createdate: false,
  has_key_money_ok: false,
  has_money: false,
  has_check_enabled: false,
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
    has_check_enabled?: boolean;
    id?: number | string;
    service_name?: string;
    username?: string;
    password?: string;
    api_url?: string;
    api_key?: string;
    check_enabled?: boolean | number | string;
    updated_count?: number;
    failed_count?: number;
  };
};

const formatMoneyParts = (value: MoneyRow["key_money_ok"]) => {
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

const isCheckEnabled = (value: MoneyRow["check_enabled"]) => {
  if (value === true || value === 1) return true;
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "on";
};

export default function ServiceMoneyListPage() {
  const [rows, setRows] = useState<MoneyRow[]>([]);
  const [meta, setMeta] = useState<MoneyMeta>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeAction, setActiveAction] = useState<"edit" | "run" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [draftServiceName, setDraftServiceName] = useState("");
  const [draftUsername, setDraftUsername] = useState("");
  const [draftPassword, setDraftPassword] = useState("");
  const [draftApiUrl, setDraftApiUrl] = useState("");
  const [draftApiKey, setDraftApiKey] = useState("");
  const [draftWebsite, setDraftWebsite] = useState("");
  const [draftCheckEnabled, setDraftCheckEnabled] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [runSaving, setRunSaving] = useState(false);
  const [runMessage, setRunMessage] = useState("");
  const [cloneSavingId, setCloneSavingId] = useState<number | string | null>(null);
  const [cloneMessage, setCloneMessage] = useState("");
  const actionRef = useRef<HTMLDivElement>(null);

  const loadMoneyList = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${MONEY_LIST_API}?_=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const payload = await readResponse(response);
      setRows(
        Array.isArray(payload.list)
          ? payload.list.map((item) => ({
              ...item,
              check_enabled: isCheckEnabled(item.check_enabled),
            }))
          : [],
      );
      setMeta({
        status: String(payload.status ?? ""),
        message: payload.message || "",
        count: Number(payload.count) || 0,
        has_createdate: Boolean(payload.has_createdate),
        has_key_money_ok: Boolean(payload.has_key_money_ok),
        has_money: Boolean(payload.has_money),
        has_check_enabled: Boolean(payload.has_check_enabled),
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

  const openEdit = async (row: MoneyRow, index: number) => {
    setSelectedIndex(index);
    setDraftServiceName(row.service_name || "");
    setDraftUsername("");
    setDraftPassword("");
    setDraftApiUrl("");
    setDraftApiKey("");
    setDraftWebsite(row.website || "");
    setDraftCheckEnabled(isCheckEnabled(row.check_enabled));
    setActionMessage("Đang tải thông tin...");
    setDetailLoading(true);
    setShowPassword(false);
    setShowApiKey(false);
    setActiveAction("edit");

    try {
      const response = await fetch(`${MONEY_DETAIL_API}?id=${encodeURIComponent(String(row.id))}`, {
        cache: "no-store",
      });
      const payload = await readResponse(response);
      if (String(payload.status ?? "") === "0") {
        throw new Error(payload.message || "Không thể tải thông tin service");
      }
      setDraftServiceName(payload.service_name || row.service_name || "");
      setDraftUsername(payload.username || "");
      setDraftPassword(payload.password || "");
      setDraftApiUrl(payload.api_url || "");
      setDraftApiKey(payload.api_key || "");
      setDraftWebsite(payload.website || row.website || "");
      setDraftCheckEnabled(isCheckEnabled(payload.check_enabled));
      setActionMessage("");
    } catch (requestError) {
      setActionMessage(requestError instanceof Error ? requestError.message : "Không thể tải thông tin service");
    } finally {
      setDetailLoading(false);
    }
  };

  const openRun = (index: number) => {
    setSelectedIndex(index);
    setRunMessage("");
    setActiveAction("run");
  };

  useEffect(() => {
    if (!activeAction || selectedIndex === null) return;

    requestAnimationFrame(() => {
      const target = actionRef.current;
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 100;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }, [activeAction, selectedIndex]);

  const closeAction = () => {
    setActiveAction(null);
    setSelectedIndex(null);
    setActionMessage("");
    setRunMessage("");
  };

  const handleSavePreview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedIndex === null || !rows[selectedIndex]?.id) return;

    setEditSaving(true);
    setActionMessage("");
    try {
      const response = await fetch(MONEY_EDIT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rows[selectedIndex].id,
          service_name: draftServiceName,
          username: draftUsername,
          password: draftPassword,
          api_url: draftApiUrl,
          api_key: draftApiKey,
          website: draftWebsite,
          check_enabled: draftCheckEnabled ? 1 : 0,
        }),
      });
      const payload = await readResponse(response);
      if (String(payload.status ?? "") === "0") {
        throw new Error(payload.message || "Không thể lưu service money");
      }

      await loadMoneyList();
      closeAction();
    } catch (requestError) {
      setActionMessage(requestError instanceof Error ? requestError.message : "Không thể lưu service money");
    } finally {
      setEditSaving(false);
    }
  };

  const handleClone = async (row: MoneyRow) => {
    if (!row.id || cloneSavingId !== null) return;
    if (!window.confirm(`Clone service ${row.service_name || row.id}?`)) return;

    setCloneSavingId(row.id);
    setCloneMessage("");
    setError("");
    try {
      const response = await fetch(MONEY_CLONE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      const payload = await readResponse(response);
      if (String(payload.status ?? "") === "0") {
        throw new Error(payload.message || "Không thể clone service");
      }

      setCloneMessage(`Đã clone service ${row.id}, ID mới: ${payload.id ?? "—"}`);
      await loadMoneyList();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể clone service");
    } finally {
      setCloneSavingId(null);
    }
  };

  const handleRunUpdate = async () => {
    if (selectedIndex === null || !rows[selectedIndex]?.id || runSaving) return;

    setRunSaving(true);
    setRunMessage("");
    try {
      const response = await fetch(
        `${MONEY_UPDATE_API}?id=${encodeURIComponent(String(rows[selectedIndex].id))}`,
        { cache: "no-store" },
      );
      const payload = await readResponse(response);
      if (String(payload.status ?? "") === "0") {
        throw new Error(payload.message || "Chưa có cấu hình update coin");
      }
      if (Number(payload.failed_count) > 0 || Number(payload.updated_count) === 0) {
        throw new Error(payload.message || "Chưa cập nhật được coin cho service này");
      }

      setRunMessage("Đã update coin thành công.");
      alert_success("Đã update coin thành công.");
      await loadMoneyList();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Chưa có cấu hình update coin";
      setRunMessage(message);
      alert_error(message);
    } finally {
      setRunSaving(false);
    }
  };

  useEffect(() => {
    loadMoneyList();
  }, [loadMoneyList]);

  return (
    <main className="cron-server-page mx-2 my-2 flex flex-col gap-3">
      <div className="card-body rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-rose-50 p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="m-0 text-2xl font-bold text-slate-800">Service Money List</h1>
          <div className="flex items-center gap-2 self-start">
            <Link
              href="/hustadmin/home"
              className="rounded-lg bg-slate-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-slate-600 sm:text-sm"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handleReload}
              disabled={loading}
              className="rounded-lg bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700 sm:text-sm">
          {[
            ["Status", meta.status || "-"], ["Message", meta.message || "-"], ["Count", meta.count],
            ["has_createdate", String(meta.has_createdate)], ["has_key_money_ok", String(meta.has_key_money_ok)],
            ["has_money", String(meta.has_money)], ["has_check_enabled", String(meta.has_check_enabled)],
          ].map(([label, value]) => (
            <span key={label} className="rounded-full bg-slate-100 px-2 py-1">
              {label}: <b>{value}</b>
            </span>
          ))}
        </div>
      </div>

      {activeAction && selectedIndex !== null && rows[selectedIndex] ? (
        <div ref={actionRef}>
          {activeAction === "edit" ? (
            <div className="mx-2 mb-0 add-form">
              <form onSubmit={handleSavePreview} className="mx-2 mb-0 add-form">
                <div className="form-control">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="mb-0 text-sm leading-tight sm:text-base">
                      Chỉnh sửa service: {rows[selectedIndex].id ?? "—"}
                    </label>
                    <button
                      type="button"
                      onClick={closeAction}
                      className="mb-0 cursor-pointer border-0 bg-transparent px-2 py-0.5 text-xs leading-tight sm:text-sm"
                    >
                      Đóng
                    </button>
                  </div>

                  <label className="mb-0 text-xs leading-tight sm:text-sm">Service Name</label>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text">name</span>
                    <input
                      type="text"
                      value={draftServiceName}
                      onChange={(event) => setDraftServiceName(event.target.value)}
                      placeholder="Tên service"
                      className="form-control"
                    />
                  </div>

                  <label className="mb-0 text-xs leading-tight sm:text-sm">Username</label>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text">user</span>
                    <input
                      type="text"
                      value={draftUsername}
                      onChange={(event) => setDraftUsername(event.target.value)}
                      placeholder="Để trống nếu không đổi username"
                      autoComplete="off"
                      className="form-control"
                    />
                  </div>

                  <label className="mb-0 text-xs leading-tight sm:text-sm">Password</label>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text">pass</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={draftPassword}
                      onChange={(event) => setDraftPassword(event.target.value)}
                      placeholder="Để trống nếu không đổi password"
                      autoComplete="new-password"
                      className="form-control"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="input-group-text cursor-pointer"
                      aria-label={showPassword ? "Ẩn password" : "Hiện password"}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>

                  <label className="mb-0 text-xs leading-tight sm:text-sm">API URL</label>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text">api</span>
                    <input
                      type="text"
                      value={draftApiUrl}
                      onChange={(event) => setDraftApiUrl(event.target.value)}
                      placeholder="Để trống nếu không đổi API URL"
                      autoComplete="off"
                      className="form-control"
                    />
                  </div>

                  <label className="mb-0 text-xs leading-tight sm:text-sm">API key</label>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text">key</span>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={draftApiKey}
                      onChange={(event) => setDraftApiKey(event.target.value)}
                      placeholder="Để trống nếu không đổi API key"
                      autoComplete="off"
                      className="form-control"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((visible) => !visible)}
                      className="input-group-text cursor-pointer"
                      aria-label={showApiKey ? "Ẩn API key" : "Hiện API key"}
                    >
                      {showApiKey ? "🙈" : "👁"}
                    </button>
                  </div>

                  <label className="mb-0 text-xs leading-tight sm:text-sm">Website</label>
                  <div className="input-group flex-nowrap">
                    <span className="input-group-text">url</span>
                    <input
                      type="url"
                      value={draftWebsite}
                      onChange={(event) => setDraftWebsite(event.target.value)}
                      placeholder="https://example.com"
                      className="form-control"
                    />
                  </div>

                  <label className="mt-0 mb-0 text-xs leading-tight sm:text-sm">Trạng thái service</label>
                  <div className="mb-0.5">
                    <button
                      type="button"
                      onClick={() => setDraftCheckEnabled((enabled) => !enabled)}
                      className={`flex w-full items-center justify-between rounded border px-2 py-1 text-xs transition sm:text-sm ${
                        draftCheckEnabled
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-red-500 bg-red-50 text-red-700"
                      }`}
                    >
                      <span>check_enabled: {draftCheckEnabled ? "1 (ON)" : "0 (OFF)"}</span>
                      <span className="text-[11px]">Nhấn để {draftCheckEnabled ? "tắt" : "bật"}</span>
                    </button>
                  </div>

                  {actionMessage ? (
                    <p className="m-0 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      {actionMessage}
                    </p>
                  ) : (
                  <p className="m-0 mt-2 text-xs text-slate-500">
                      Thay đổi sẽ được lưu trực tiếp vào máy chủ.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={editSaving || detailLoading}
                    className="mt-3 flex break-inside rounded-3xl px-8 py-1.5 mb-0 w-full bg-purple-400 hover:bg-purple-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="flex flex-1 items-center justify-between">
                      <span className="text-sm font-medium sm:text-base">{detailLoading ? "Đang tải..." : editSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                      <span className="text-lg">➤</span>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <section className="card-body mx-2 rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-rose-50 p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="m-0 text-base font-semibold text-slate-800">
                  Run service: {rows[selectedIndex].id ?? "—"}
                </h2>
                <button
                  type="button"
                  onClick={closeAction}
                  className="rounded-full px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  Đóng
                </button>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <p className="m-0 break-all"><span className="font-semibold">Website:</span> {rows[selectedIndex].website || "—"}</p>
                  <p className="mb-0 mt-2"><span className="font-semibold">Money OK:</span> {rows[selectedIndex].key_money_ok ?? "—"}</p>
                </div>
                {runMessage ? (
                  <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {runMessage}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleRunUpdate}
                  disabled={runSaving}
                  className="w-full rounded-3xl bg-emerald-400 px-8 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                >
                  {runSaving ? "Đang update coin..." : "Update coin"}
                </button>
              </div>
            </section>
          )}
        </div>
      ) : null}

      <div className="card-body rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-rose-50 p-3 shadow-sm sm:p-4">
        {error ? <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
        {cloneMessage ? <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{cloneMessage}</div> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] table-fixed border-collapse text-sm">
          <thead className="bg-slate-100 text-xs sm:text-sm">
            <tr>
              <th className="border px-2 py-2 text-center">ID</th>
              <th className="border px-2 py-2 text-left">Service Name</th>
              <th className="border px-2 py-2 text-left">Website</th>
              <th className="border px-2 py-2 text-center">Money OK</th>
              <th className="min-w-[200px] border px-2 py-2 text-center whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const money = formatMoneyParts(row.key_money_ok);
              return (
                <tr key={`${row.id ?? "row"}-${index}`} className="odd:bg-white even:bg-slate-50 hover:bg-sky-50">
                  <td className="border px-2 py-2 text-center">{row.id ?? "-"}</td>
                  <td className="border px-2 py-2 break-all">{row.service_name || "-"}</td>
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
                  <td className="min-w-[200px] border px-2 py-2 text-center align-top whitespace-nowrap">
                    <div className="flex flex-col items-center gap-2">
                      <span
                        className={`inline-flex min-w-[42px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isCheckEnabled(row.check_enabled)
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {isCheckEnabled(row.check_enabled) ? "ON" : "OFF"}
                      </span>
                      <div className="flex flex-nowrap items-center justify-center gap-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(row, index)}
                        aria-label={`Edit service ${row.id ?? index}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 whitespace-nowrap"
                      >
                        <FaEdit className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openRun(index)}
                        aria-label={`Run service ${row.id ?? index}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 whitespace-nowrap"
                      >
                        Run
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClone(row)}
                        disabled={cloneSavingId !== null}
                        aria-label={`Clone service ${row.id ?? index}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-200 bg-white px-2 py-1 text-[11px] font-semibold text-violet-500 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cloneSavingId === row.id ? "..." : "Clone"}
                      </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="border px-2 py-4 text-center text-slate-500">
                  No service money data
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      </div>
    </main>
  );
}
