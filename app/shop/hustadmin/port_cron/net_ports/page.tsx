"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { alert_error, alert_success } from "../../../../AppContext.js";
import PortCheck from "./port_check.jsx";
import PortEdit from "./port_edit.jsx";
import "../scheduler/scheduler.css";

type PortRecord = {
  id?: number | string;
  port_name?: string;
  port_code?: string;
  protocol?: string;
  address?: string;
  port?: number | string;
  port_status?: boolean;
  pid?: number | string;
  process?: string;
  executable?: string;
  command?: string;
  parent_process?: string;
  parent_command?: string;
  shells?: string[];
};

const PORTS_API = "https://nginx.hust.media/go/servers/port_cli/show";
const PORT_CHECK_API = "https://nginx.hust.media/go/servers/port_cli/main?service=check_port";
const PORT_CREATE_API = "https://nginx.hust.media/go/servers/port_cli/create";
const PORT_EDIT_API = "https://nginx.hust.media/go/servers/port_cli/edit";
const PORT_DELETE_API = "https://nginx.hust.media/go/servers/port_cli/delete";
const PORT_UPDATE_API = "https://nginx.hust.media/go/servers/port_cli/main?service=check_all";

const readApiBody = async (response: Response) => {
  try { return await response.json(); } catch { return null; }
};

const apiErrorMessage = (response: Response, body: unknown, fallback: string) => {
  if (body && typeof body === "object" && typeof (body as { message?: unknown }).message === "string") {
    return (body as { message: string }).message;
  }
  return `${fallback} (HTTP ${response.status})`;
};

const hasApiError = (body: unknown) => body && typeof body === "object" && (body as { status?: unknown }).status === 0;

const PortRow = ({ item, index, onCheck, onEdit, onDelete }: { item: PortRecord; index: number; onCheck: () => void; onEdit: () => void; onDelete: () => void }) => (
  <tr
    key={`${item.protocol || "port"}-${item.port || "unknown"}-${index}`}
    className="odd:bg-white even:bg-slate-50 hover:bg-sky-50"
  >
    <td className="border px-2 py-2 text-center align-top whitespace-nowrap min-w-[82px]">
      <div className="text-xs text-slate-500">{item.id ?? "-"}</div>
      <div className="mt-1 font-semibold">{item.port ?? "-"}</div>
    </td>
    <td className="border px-2 py-2 align-top break-all">
      <div>
        <span className="font-semibold">Name:</span> {item.port_name || item.process || "-"}
      </div>
      <div className="mt-1">
        <span className="font-semibold">Code:</span> {item.port_code || "-"}
      </div>
    </td>
    <td className="border px-2 py-2 align-top break-all">
      <div>
        <span className="font-semibold">Protocol:</span> {item.protocol || "-"}
      </div>
      <div className="mt-1">
        <span className="font-semibold">Address:</span> {item.address || "-"}
      </div>
      <div className="mt-1">
        <span className="font-semibold">PID:</span> {item.pid ?? "-"}
      </div>
    </td>
    <td className="border px-2 py-2 align-top break-all">
      <div>{item.command || "-"}</div>
      <div className="mt-1 text-xs text-slate-500">
        <span className="font-semibold">Executable:</span> {item.executable || "-"}
      </div>
    </td>
    <td className="border py-2 px-2 text-center align-top whitespace-nowrap min-w-[200px]">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span
            className={`inline-flex min-w-[42px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              item.port_status === true
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {item.port_status === true ? "ON" : "OFF"}
          </span>
          <button
            type="button"
            aria-label="Delete port"
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-full bg-rose-400 px-1.5 py-0.5 text-[10px] font-semibold text-white transition hover:bg-rose-500"
          >
            ×
          </button>
        </div>
        <div className="flex flex-nowrap items-center justify-center gap-1 whitespace-nowrap">
          <button
            type="button"
            aria-label="Edit port"
            onClick={onEdit}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 whitespace-nowrap"
          >
            <FaEdit className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            aria-label="Check port"
            onClick={onCheck}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 whitespace-nowrap"
          >
            Check
          </button>
        </div>
      </div>
    </td>
  </tr>
);

export default function NetPortsPage() {
  const [ports, setPorts] = useState<PortRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingAll, setUpdatingAll] = useState(false);
  const [showcheck, setshowcheck] = useState(false);
  const [selectedPort, setSelectedPort] = useState<PortRecord | null>(null);
  const [showedit, setshowedit] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const checkRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);

  const openCheck = (port: PortRecord) => {
    setSelectedPort(port);
    setshowedit(false);
    setIsCreate(false);
    setIsDelete(false);
    setshowcheck(true);
    requestAnimationFrame(() => {
      const target = checkRef.current;
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 100;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const openEdit = (port: PortRecord) => {
    setSelectedPort(port);
    setshowcheck(false);
    setIsCreate(false);
    setIsDelete(false);
    setshowedit(true);
    requestAnimationFrame(() => {
      const target = editRef.current;
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 100;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const openDelete = (port: PortRecord) => {
    setSelectedPort(port);
    setshowcheck(false);
    setIsCreate(false);
    setIsDelete(true);
    setshowedit(true);
    requestAnimationFrame(() => editRef.current && window.scrollTo({ top: window.scrollY + editRef.current.getBoundingClientRect().top - 100, behavior: "smooth" }));
  };

  const openCreate = () => {
    setSelectedPort(null);
    setIsCreate(true);
    setIsDelete(false);
    setshowedit(true);
    requestAnimationFrame(() => {
      const target = editRef.current;
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 100;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const deletePort = async () => {
    if (selectedPort?.id === undefined || selectedPort?.id === null) {
      alert_error("Port không có id để xoá");
      return;
    }
    try {
      const response = await fetch(PORT_DELETE_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ id_show: selectedPort.id, cron_delete: true }),
      });
      const body = await readApiBody(response);
      if (response.status !== 200 || hasApiError(body)) throw new Error(apiErrorMessage(response, body, "API xoá port lỗi"));
      setPorts((current) => current.filter((item) => item.id !== selectedPort.id));
      setshowedit(false);
      setIsDelete(false);
      alert_success("Đã xoá port");
      await refreshPortStatuses();
    } catch (error) {
      alert_error(error);
    }
  };

  const savePort = async (updatedPort: PortRecord) => {
    if (isCreate) {
      try {
        const response = await fetch(PORT_CREATE_API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(updatedPort),
        });
        const body = await readApiBody(response);
        if (![200, 201].includes(response.status) || hasApiError(body)) throw new Error(apiErrorMessage(response, body, "API tạo port lỗi"));
        setshowedit(false);
        setIsCreate(false);
        alert_success("Đã tạo port");
        await refreshPortStatuses();
      } catch (error) {
        alert_error(error);
      }
      return;
    }
    try {
      const response = await fetch(PORT_EDIT_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({
          id_show: updatedPort.id,
          port_name: updatedPort.port_name || "",
          port_code: updatedPort.port_code || "",
          port: updatedPort.port === "" || updatedPort.port == null ? "" : Number(updatedPort.port),
          port_status: Boolean(updatedPort.port_status),
        }),
      });
      const body = await readApiBody(response);
      if (response.status !== 200 || hasApiError(body)) throw new Error(apiErrorMessage(response, body, "API sửa port lỗi"));
      setshowedit(false);
      setIsDelete(false);
      alert_success("Đã cập nhật port");
      await fetchPorts();
    } catch (error) {
      alert_error(error);
    }
  };

  const updateAllPorts = async () => {
    setUpdatingAll(true);
    try {
      const response = await fetch(PORT_UPDATE_API, { cache: "no-store" });
      const body = await readApiBody(response);
      if (response.status !== 200 || hasApiError(body)) throw new Error(apiErrorMessage(response, body, "API cập nhật port lỗi"));
      await fetchPorts();
      alert_success("Đã cập nhật port sống mới");
    } catch (error) {
      alert_error(error);
    } finally {
      setUpdatingAll(false);
    }
  };

  const refreshPortStatuses = async () => {
    setUpdating(true);
    try {
      await fetchPorts();
      alert_success("Đã cập nhật status true false");
    } catch (error) {
      alert_error(error);
    } finally {
      setUpdating(false);
    }
  };

  const checkPortStatus = async (port: PortRecord) => {
    if (port.id === undefined || port.id === null) {
      alert_error("Port không có id để kiểm tra");
      return;
    }

    try {
      const response = await fetch(
        `${PORT_CHECK_API}&id_show=${encodeURIComponent(String(port.id))}`,
        { cache: "no-store" }
      );
      const data: unknown = await readApiBody(response);
      if (!response.ok || hasApiError(data)) throw new Error(apiErrorMessage(response, data, "API kiểm tra port lỗi"));
      const raw = data as { api_results?: unknown };
      const nested = raw?.api_results;
      const payload = Array.isArray(nested)
        ? nested[0]
        : nested && typeof nested === "object" && Array.isArray((nested as { mongo_results?: unknown }).mongo_results)
          ? (nested as { mongo_results: unknown[] }).mongo_results[0]
          : nested && typeof nested === "object"
            ? nested
            : data;
      if (payload && typeof payload === "object") {
        const updatedPort = { ...port, ...(payload as PortRecord) };
        setPorts((current) => current.map((item) => (item.id === port.id ? updatedPort : item)));
        setSelectedPort(updatedPort);
      }
      await fetchPorts();
      alert_success("Đã kiểm tra port");
    } catch (error) {
      alert_error(error);
    }
  };

  const fetchPorts = useCallback(async (manual = false) => {
    if (manual) setUpdating(true);
    else setLoading(true);

    try {
      const response = await fetch(PORTS_API, { cache: "no-store" });
      const data: unknown = await readApiBody(response);
      if (!response.ok || hasApiError(data)) throw new Error(apiErrorMessage(response, data, "API lấy danh sách port lỗi"));
      const nextPorts = Array.isArray(data)
        ? data
        : Array.isArray((data as { api_results?: { mongo_results?: unknown } })?.api_results?.mongo_results)
          ? (data as { api_results: { mongo_results: PortRecord[] } }).api_results.mongo_results
          : [];
      setPorts(nextPorts as PortRecord[]);
      if (manual) alert_success("Đã cập nhật danh sách port");
    } catch (error) {
      alert_error(error);
      setPorts([]);
    } finally {
      if (manual) setUpdating(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPorts();
  }, [fetchPorts]);

  const listenCount = useMemo(
    () => ports.filter((item) => item.port_status === true).length,
    [ports]
  );

  return (
    <div className="cron-server-page mx-2 my-2 space-y-3">
      <div className="card-body rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-rose-50 p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="m-0 text-2xl font-bold text-slate-800">Net Ports</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshPortStatuses}
              disabled={updating || updatingAll}
              className={`w-auto rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 sm:text-base ${
                updating || updatingAll ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {updating ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={updateAllPorts}
              disabled={updating || updatingAll}
              className={`w-auto rounded-lg bg-emerald-400 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 sm:text-base ${
                updating || updatingAll ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {updatingAll ? "Updating..." : "Update"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
            Total Ports: <b>{ports.length}</b>
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
            Listening: <b>{listenCount}</b>
          </span>
        </div>
      </div>

      <div ref={checkRef}>
        <PortCheck
          showcheck={showcheck}
          setshowcheck={setshowcheck}
          selectedPort={selectedPort}
          onCheck={checkPortStatus}
        />
      </div>

      <div ref={editRef}>
        <PortEdit
          showedit={showedit}
          setshowedit={setshowedit}
          selectedPort={selectedPort}
          onSave={savePort}
          isCreate={isCreate}
          isDelete={isDelete}
          onDelete={deletePort}
        />
      </div>

      <div className="card-body rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-rose-50 p-3 shadow-sm sm:p-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-16 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
          </div>
        ) : ports.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-500">
            No port data
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 py-2 pl-3 pr-1">
              <h3 className="m-0 text-base font-semibold text-slate-800 sm:text-lg">Port List</h3>
              <div className="ml-auto flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500 sm:text-sm">
                  Jobs: {ports.length}
                </span>
                <button
                  type="button"
                  onClick={openCreate}
                  className="rounded-lg bg-emerald-400 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500 sm:px-3 sm:text-sm"
                >
                  Create
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-slate-100 text-xs sm:text-sm">
                  <tr>
                    <th className="w-[10%] border px-2 py-2 text-center">Port</th>
                    <th className="w-[20%] border px-2 py-2 text-left">Info Name</th>
                    <th className="w-[25%] border px-2 py-2 text-left">Info Net</th>
                    <th className="w-[35%] border px-2 py-2 text-left">Command</th>
                  <th className="w-[10%] min-w-[200px] border px-2 py-2 text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ports.map((item, index) => (
                    <PortRow
                      item={item}
                      index={index}
                    key={`${item.port || "port"}-${index}`}
                    onCheck={() => openCheck(item)}
                    onEdit={() => openEdit(item)}
                    onDelete={() => openDelete(item)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
