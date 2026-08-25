"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { alert_error, alert_success } from "../../../AppContext.js";
import CronEdit from "./cron_edit.jsx";
import CronRun from "./cron_run.jsx";

const CronServerAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showedit, setshowedit] = useState(false);
  const [showcreate, setshowcreate] = useState(false);
  const [showrun, setshowrun] = useState(false);
  const [showdelete, setshowdelete] = useState(false);
  const [selectedCron, setSelectedCron] = useState(null);
  const [createCron, setCreateCron] = useState(null);
  const editRef = useRef(null);
  const createRef = useRef(null);
  const runRef = useRef(null);
  const deleteRef = useRef(null);

  const scrollToSection = (ref) => {
    const target = ref.current;
    if (!target) return;

    const top = window.scrollY + target.getBoundingClientRect().top - 100;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const fetchSchedulerData = async ({ isManualUpdate = false } = {}) => {
    if (isManualUpdate) {
      setUpdating(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get("https://nginx.hust.media/go/servers/scheduler/get_data");
      const nextCategories = Array.isArray(response?.data?.categories_cron)
        ? response.data.categories_cron
        : [];
      setCategories(nextCategories);

      if (isManualUpdate) {
        alert_success("Đã cập nhật dữ liệu");
      }
    } catch (error) {
      alert_error(error);
      setCategories([]);
    } finally {
      if (isManualUpdate) {
        setUpdating(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSchedulerData();
  }, []);

  useEffect(() => {
    if (!showedit || !selectedCron) return;

    requestAnimationFrame(() => {
      scrollToSection(editRef);
    });
  }, [showedit, selectedCron]);

  useEffect(() => {
    if (!showcreate || !createCron) return;

    requestAnimationFrame(() => {
      scrollToSection(createRef);
    });
  }, [showcreate, createCron]);

  useEffect(() => {
    if (!showrun || !selectedCron) return;

    requestAnimationFrame(() => {
      scrollToSection(runRef);
    });
  }, [showrun, selectedCron]);

  useEffect(() => {
    if (!showdelete || !selectedCron) return;

    requestAnimationFrame(() => {
      scrollToSection(deleteRef);
    });
  }, [showdelete, selectedCron]);

  const handleUpdate = () => {
    fetchSchedulerData({ isManualUpdate: true });
  };

  const openCreate = (category) => {
    const categoryKey = category?.category_key || category?.name_category || "";
    const categoryName = category?.name_category || category?.category_name || "";

    setshowedit(false);
    setshowrun(false);
    setshowdelete(false);
    setCreateCron({
      category_key: categoryKey,
      category_name: categoryName,
      name_cron: "",
      task_cron: "",
      interval_seconds: "",
      at_time_cron: "",
      url_cron: "",
      command_cron: "",
      cron_tyoe: "",
      cron_timeout_seconds: "",
      status_cron: false,
      cron_show: false,
      cron_single: false,
      run_on_start_cron: false,
    });
    setshowcreate(true);
  };

  const openEdit = (job, category, categoryIndex, jobIndex) => {
    setshowrun(false);
    setshowdelete(false);
    setSelectedCron({
      ...job,
      category_key: category?.category_key || category?.name_category || "",
      category_name: category?.name_category || category?.category_name || "",
      __categoryIndex: categoryIndex,
      __jobIndex: jobIndex,
    });
    setshowedit(true);
  };

  const openRun = (job, category, categoryIndex, jobIndex) => {
    setshowedit(false);
    setshowdelete(false);
    setSelectedCron({
      ...job,
      category_key: category?.category_key || category?.name_category || "",
      category_name: category?.name_category || category?.category_name || "",
      __categoryIndex: categoryIndex,
      __jobIndex: jobIndex,
    });
    setshowrun(true);
  };

  const openDelete = (job, category, categoryIndex, jobIndex) => {
    setshowedit(false);
    setshowrun(false);
    setSelectedCron({
      ...job,
      category_key: category?.category_key || category?.name_category || "",
      category_name: category?.name_category || category?.category_name || "",
      __categoryIndex: categoryIndex,
      __jobIndex: jobIndex,
    });
    setshowdelete(true);
  };

  const handleSaveCron = async (nextCron, sourceCron = selectedCron) => {
    if (!sourceCron) return false;

    const payload = {
      categories_cron: [
        {
          category_key: sourceCron.category_key || sourceCron.category_name || "",
          category_name: sourceCron.category_name || sourceCron.category_key || "",
          services_cron: [
            {
              ...nextCron,
              cron_delete: false,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(
        "https://nginx.hust.media/go/servers/scheduler/cron_edit",
        payload
      );
      const info = response?.data || {};
      if (info?.status === 1) {
        alert_success(info?.message || "Đã cập nhật dữ liệu cron");
        setshowedit(false);
        setSelectedCron(null);
        setshowcreate(false);
        setCreateCron(null);
        await fetchSchedulerData();
        return true;
      }

      alert_error(info?.message || "Cron update failed");
      return false;
    } catch (error) {
      alert_error(error);
      return false;
    }
  };

  const handleCreateCron = async (nextCron, sourceCron = createCron) => {
    if (!sourceCron) return false;

    const service = { ...nextCron };
    const intervalSeconds = service.interval_seconds;
    const timeoutSeconds = service.cron_timeout_seconds;
    delete service.category_key;
    delete service.category_name;
    delete service.__categoryIndex;
    delete service.__jobIndex;

    const payload = {
      categories_cron: [
        {
          category_key: sourceCron.category_key || sourceCron.category_name || "",
          category_name: sourceCron.category_name || sourceCron.category_key || "",
          services_cron: [
            {
              ...service,
              interval_seconds:
                intervalSeconds === "" || intervalSeconds === null || intervalSeconds === undefined
                  ? ""
                  : Number(intervalSeconds),
              cron_timeout_seconds:
                timeoutSeconds === "" || timeoutSeconds === null || timeoutSeconds === undefined
                  ? ""
                  : Number(timeoutSeconds),
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(
        "https://nginx.hust.media/go/servers/scheduler/cron_create",
        payload
      );
      const info = response?.data || {};
      if (info?.status === 1 || info?.ok === true) {
        alert_success(info?.message || "Đã tạo cron mới");
        setshowcreate(false);
        setCreateCron(null);
        await fetchSchedulerData();
        return true;
      }

      alert_error(info?.message || "Create cron failed");
      return false;
    } catch (error) {
      alert_error(error);
      return false;
    }
  };

  const handleRunCron = async () => {
    if (!selectedCron) return false;

    const payload = {
      category_key: selectedCron.category_key || selectedCron.category_name || "",
      category_name: selectedCron.category_name || selectedCron.category_key || "",
      task_cron: selectedCron.task_cron || "",
      name_cron: selectedCron.name_cron || "",
      cron_delete: false,
    };

    try {
      const response = await axios.post(
        "https://nginx.hust.media/go/servers/scheduler/cron_run",
        payload
      );
      const info = response?.data || {};
      if (info?.status === 1 || info?.ok === true) {
        alert_success(info?.message || "Đã gửi lệnh chạy thử");
        setshowrun(false);
        setSelectedCron(null);
        await fetchSchedulerData();
        return true;
      }

      alert_error(info?.message || "Run cron failed");
      return false;
    } catch (error) {
      alert_error(error);
      return false;
    }
  };

  const handleDeleteCron = async () => {
    if (!selectedCron) return false;

    const payload = {
      categories_cron: [
        {
          category_key: selectedCron.category_key || selectedCron.category_name || "",
          category_name: selectedCron.category_name || selectedCron.category_key || "",
          services_cron: [
            {
              name_cron: selectedCron.name_cron || "",
              task_cron: selectedCron.task_cron || "",
              cron_delete: true,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(
        "https://nginx.hust.media/go/servers/scheduler/cron_delete",
        payload
      );
      const info = response?.data || {};
      if (info?.status === 1 || info?.ok === true) {
        alert_success(info?.message || "Đã xoá cron");
        setshowdelete(false);
        setSelectedCron(null);
        await fetchSchedulerData();
        return true;
      }

      alert_error(info?.message || "Delete cron failed");
      return false;
    } catch (error) {
      alert_error(error);
      return false;
    }
  };

  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const totalJobs = categories.reduce((sum, category) => {
      const items = Array.isArray(category?.services_cron) ? category.services_cron : [];
      return sum + items.length;
    }, 0);
    const activeJobs = categories.reduce((sum, category) => {
      const items = Array.isArray(category?.services_cron) ? category.services_cron : [];
      return (
        sum +
        items.reduce((jobSum, job) => {
          return jobSum + (job?.status_cron ? 1 : 0);
        }, 0)
      );
    }, 0);
    return { totalCategories, totalJobs, activeJobs };
  }, [categories]);

  return (
    <div className="mx-2 my-2 space-y-3">
      <div className="card-body p-3 sm:p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-rose-50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-2xl font-bold m-0 text-slate-800">Cron Server</h2>
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={handleUpdate}
              type="button"
              disabled={updating}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg w-auto transition-colors text-sm sm:text-base ${
                updating ? "opacity-70 cursor-not-allowed hover:bg-blue-500" : ""
              }`}
            >
              {updating ? "Đang cập nhật..." : "Update"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            Categories: <b>{stats.totalCategories}</b>
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            Total Jobs: <b>{stats.totalJobs}</b>
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            Active: <b>{stats.activeJobs}</b>
          </span>
        </div>
      </div>

      <div ref={createRef}>
        <CronEdit
          showedit={showcreate}
          setshowedit={setshowcreate}
          selectedCron={createCron}
          onSave={(nextCron) => handleCreateCron(nextCron, createCron)}
          isCreate
        />
      </div>

      <div ref={editRef}>
        <CronEdit
          showedit={showedit}
          setshowedit={setshowedit}
          selectedCron={selectedCron}
          onSave={handleSaveCron}
        />
      </div>

      <div ref={runRef}>
        <CronRun
          showrun={showrun}
          setshowrun={setshowrun}
          selectedCron={selectedCron}
          onRun={handleRunCron}
        />
      </div>

      <div ref={deleteRef}>
        <CronEdit
          showdelete={showdelete}
          showedit={showdelete}
          setshowedit={setshowdelete}
          selectedCron={selectedCron}
          onDelete={handleDeleteCron}
          isDelete
        />
      </div>

      <div className="card-body p-3 sm:p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-rose-50 shadow-sm">
        {categories.map((category, categoryIndex) => {
          const services = Array.isArray(category?.services_cron) ? category.services_cron : [];
          const categoryName = category?.name_category || category?.category_name || "No category";
          return (
            <div key={`${category?.name_category || "category"}-${categoryIndex}`} className="rounded-lg border border-slate-200 bg-white">
              <div className="pl-3 pr-1 py-2 border-b border-slate-200 flex items-center justify-between">
                <h3 className="m-0 text-base sm:text-lg font-semibold text-slate-800">
                  {categoryName}
                </h3>
                <div className="ml-auto flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500 sm:text-sm">
                    Jobs: {services.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => openCreate(category)}
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
                      <th className="border text-left py-2 px-2 w-[24%]">Cron Name</th>
                      <th className="border text-left py-2 px-2 w-[18%]">Task</th>
                      <th className="border text-center py-2 px-2 w-[18%]">At time / Interval</th>
                      <th className="border text-left py-2 px-2 w-[21%]">Source</th>
                      <th className="border text-center py-2 px-2 w-[10%] min-w-[82px] whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((job, jobIndex) => (
                      <tr key={`${job?.task_cron || "task"}-${jobIndex}`} className="odd:bg-white even:bg-slate-50 hover:bg-sky-50">
                        <td className="border py-2 px-2 align-top">
                          <span
                            className="block leading-tight"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              wordBreak: "break-word",
                            }}
                            title={job?.name_cron || ""}
                          >
                            {job?.name_cron || "-"}
                          </span>
                        </td>
                        <td className="border py-2 px-2 align-top break-all">
                          <div className="flex flex-col gap-0.5">
                            <span>{job?.task_cron || "-"}</span>
                            <span
                              className={`inline-block text-[11px] font-semibold ${
                                job?.cron_show ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              cron_show: {String(Boolean(job?.cron_show))}
                            </span>
                          </div>
                        </td>
                        <td className="border py-2 px-2 align-top text-center">
                          <div className="flex flex-col items-center gap-0.5 leading-tight">
                            <span className="text-slate-700 text-sm">{job?.at_time_cron || "-"}</span>
                            <span className="text-slate-700 text-sm">
                              {job?.interval_seconds ?? "-"} s
                            </span>
                          </div>
                        </td>
                        <td className="border py-2 px-2 align-top">
                          {job?.url_cron ? (
                            <a
                              href={job.url_cron}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline break-all"
                              title={job.url_cron}
                            >
                              {job.url_cron}
                            </a>
                          ) : job?.command_cron ? (
                            <span className="break-all" title={job.command_cron}>
                              {job.command_cron}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="border py-2 px-2 text-center align-top whitespace-nowrap min-w-[82px]">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                              {job?.status_cron ? (
                                <span className="inline-flex items-center justify-center min-w-[42px] rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                                  ON
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center min-w-[42px] rounded-full px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 whitespace-nowrap">
                                  OFF
                                </span>
                              )}

                              <button
                                type="button"
                                aria-label="Delete"
                                onClick={() => openDelete(job, category, categoryIndex, jobIndex)}
                                className="inline-flex items-center justify-center rounded-full bg-rose-400 px-1.5 py-0.5 text-[10px] font-semibold text-white transition hover:bg-rose-500"
                              >
                                ×
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-1 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openEdit(job, category, categoryIndex, jobIndex)}
                                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 whitespace-nowrap"
                              >
                                <FaEdit className="h-3 w-3" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => openRun(job, category, categoryIndex, jobIndex)}
                                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 whitespace-nowrap"
                              >
                                Run
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!loading && services.length === 0 && (
                      <tr>
                        <td className="border text-center py-3 text-slate-500" colSpan={6}>
                          No jobs
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {!loading && categories.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-500">
            No scheduler data
          </div>
        )}
      </div>
    </div>
  );
};

export default CronServerAdmin;
