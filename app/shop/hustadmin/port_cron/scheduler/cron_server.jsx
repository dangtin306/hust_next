"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  Folder,
  FolderOpen,
  Globe,
  Home,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Terminal,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Radio,
} from "lucide-react";
import { alert_error, alert_success } from "../../../../AppContext.js";
import CronEdit from "./cron_edit.jsx";
import CronRun from "./cron_run.jsx";

const CronServerAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [collapsedTopics, setCollapsedTopics] = useState({});

  // Modals state
  const [showedit, setshowedit] = useState(false);
  const [showcreate, setshowcreate] = useState(false);
  const [showrun, setshowrun] = useState(false);
  const [showdelete, setshowdelete] = useState(false);
  const [showduplicate, setshowduplicate] = useState(false);

  const [selectedCron, setSelectedCron] = useState(null);
  const [createCron, setCreateCron] = useState(null);

  const editRef = useRef(null);
  const createRef = useRef(null);
  const runRef = useRef(null);
  const deleteRef = useRef(null);
  const duplicateRef = useRef(null);
  const hasInitializedCollapse = useRef(false);

  const fetchSchedulerData = async ({ isManualUpdate = false } = {}) => {
    if (isManualUpdate) {
      setUpdating(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(
        "https://nginx.hust.media/go/servers/scheduler/get_data"
      );
      const nextCategories = Array.isArray(response?.data?.categories_cron)
        ? response.data.categories_cron
        : [];
      setCategories(nextCategories);
      if (!hasInitializedCollapse.current) {
        const initiallyCollapsed = {};
        nextCategories.forEach((category, index) => {
          const key = category?.category_key || category?.name_category || `cat-${index}`;
          initiallyCollapsed[key] = true;
        });
        setCollapsedCategories(initiallyCollapsed);
        setCollapsedTopics({});
        hasInitializedCollapse.current = true;
      }
      setLastRefreshed(new Date().toLocaleTimeString("vi-VN"));

      if (isManualUpdate) {
        alert_success("Đã đồng bộ dữ liệu mới nhất");
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

  const handleUpdate = () => {
    fetchSchedulerData({ isManualUpdate: true });
  };

  const toggleCategoryCollapse = (categoryKey) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const getTopicCollapseKey = (category, categoryIndex, topic, topicIndex) => {
    const categoryKey = category?.category_key || category?.name_category || `cat-${categoryIndex}`;
    const topicKey = topic?.topic_key || topic?.topic_name || `topic-${topicIndex}`;
    return `${categoryKey}::${topicKey}`;
  };

  const toggleTopicCollapse = (topicKey) => {
    setCollapsedTopics((prev) => ({
      ...prev,
      [topicKey]: !prev[topicKey],
    }));
  };

  const collapseAll = () => {
    const next = {};
    const nextTopics = {};
    categories.forEach((cat, idx) => {
      const key = cat?.category_key || cat?.name_category || `cat-${idx}`;
      next[key] = true;
      const topics = Array.isArray(cat?.topics_cron) ? cat.topics_cron : [];
      topics.forEach((topic, topicIndex) => {
        nextTopics[getTopicCollapseKey(cat, idx, topic, topicIndex)] = true;
      });
    });
    setCollapsedCategories(next);
    setCollapsedTopics(nextTopics);
  };

  const expandAll = () => {
    setCollapsedCategories({});
    setCollapsedTopics({});
  };

  const openCreate = (category, topic) => {
    const categoryKey = category?.category_key || category?.name_category || "";
    const categoryName = category?.name_category || category?.category_name || "";

    setshowedit(false);
    setshowrun(false);
    setshowdelete(false);
    setshowduplicate(false);
    setCreateCron({
      category_key: categoryKey,
      category_name: categoryName,
      topic_key: topic?.topic_key || "",
      topic_name: topic?.topic_name || "",
      name_cron: "",
      task_cron: "",
      interval_seconds: "",
      at_time_cron: "",
      url_cron: "",
      command_cron: "",
      cron_tyoe: "",
      cron_timeout_seconds: "",
      cron_status: true,
      cron_show: false,
      cron_single: false,
      run_on_start_cron: false,
    });
    setshowcreate(true);
  };

  const openEdit = (job, category, topic, categoryIndex, topicIndex, jobIndex) => {
    setshowrun(false);
    setshowdelete(false);
    setshowduplicate(false);
    setSelectedCron({
      ...job,
      category_key: category?.category_key || category?.name_category || "",
      category_name: category?.name_category || category?.category_name || "",
      topic_key: topic?.topic_key || "",
      topic_name: topic?.topic_name || "",
      __categoryIndex: categoryIndex,
      __topicIndex: topicIndex,
      __jobIndex: jobIndex,
    });
    setshowedit(true);
  };

  const openRun = (job, category, topic, categoryIndex, topicIndex, jobIndex) => {
    setshowedit(false);
    setshowdelete(false);
    setshowduplicate(false);
    setSelectedCron({
      ...job,
      category_key: category?.category_key || category?.name_category || "",
      category_name: category?.name_category || category?.category_name || "",
      topic_key: topic?.topic_key || "",
      topic_name: topic?.topic_name || "",
      __categoryIndex: categoryIndex,
      __topicIndex: topicIndex,
      __jobIndex: jobIndex,
    });
    setshowrun(true);
  };

  const openDelete = (job, category, topic, categoryIndex, topicIndex, jobIndex) => {
    setshowedit(false);
    setshowrun(false);
    setshowduplicate(false);
    setSelectedCron({
      ...job,
      category_key: category?.category_key || category?.name_category || "",
      category_name: category?.name_category || category?.category_name || "",
      topic_key: topic?.topic_key || "",
      topic_name: topic?.topic_name || "",
      __categoryIndex: categoryIndex,
      __topicIndex: topicIndex,
      __jobIndex: jobIndex,
    });
    setshowdelete(true);
  };

  const openDuplicate = (job, category, topic, categoryIndex, topicIndex, jobIndex) => {
    setshowedit(false);
    setshowrun(false);
    setshowdelete(false);
    setSelectedCron({
      ...job,
      category_key: category?.category_key || category?.name_category || "",
      category_name: category?.name_category || category?.category_name || "",
      topic_key: topic?.topic_key || "",
      topic_name: topic?.topic_name || "",
      __categoryIndex: categoryIndex,
      __topicIndex: topicIndex,
      __jobIndex: jobIndex,
    });
    setshowduplicate(true);
  };

  const handleSaveCron = async (nextCron, sourceCron = selectedCron) => {
    if (!sourceCron) return false;

    const payload = {
      categories_cron: [
        {
          category_key: sourceCron.category_key || sourceCron.category_name || "",
          category_name: sourceCron.category_name || sourceCron.category_key || "",
          topics_cron: [
            {
              topic_key: sourceCron.topic_key || "",
              topic_name: sourceCron.topic_name || "",
              services_cron: [{ ...nextCron, cron_delete: false }],
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
        setshowduplicate(false);
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
    delete service.topic_key;
    delete service.topic_name;
    delete service.__categoryIndex;
    delete service.__topicIndex;
    delete service.__jobIndex;

    const payload = {
      categories_cron: [
        {
          category_key: sourceCron.category_key || sourceCron.category_name || "",
          category_name: sourceCron.category_name || sourceCron.category_key || "",
          topics_cron: [
            {
              topic_key: sourceCron.topic_key || "",
              topic_name: sourceCron.topic_name || "",
              services_cron: [
                {
                  ...service,
                  interval_seconds:
                    intervalSeconds === "" ||
                    intervalSeconds === null ||
                    intervalSeconds === undefined
                      ? ""
                      : Number(intervalSeconds),
                  cron_timeout_seconds:
                    timeoutSeconds === "" ||
                    timeoutSeconds === null ||
                    timeoutSeconds === undefined
                      ? ""
                      : Number(timeoutSeconds),
                },
              ],
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
        setshowduplicate(false);
        setSelectedCron(null);
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
      topic_key: selectedCron.topic_key || "",
      topic_name: selectedCron.topic_name || "",
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

  const handleDuplicateCron = async () => {
    if (!selectedCron) return false;

    const payload = {
      category_key: selectedCron.category_key || selectedCron.category_name || "",
      category_name: selectedCron.category_name || selectedCron.category_key || "",
      topic_key: selectedCron.topic_key || "",
      topic_name: selectedCron.topic_name || "",
      task_cron: selectedCron.task_cron || "",
    };

    try {
      const response = await axios.post(
        "https://nginx.hust.media/go/servers/scheduler/cron_clone",
        payload
      );
      const info = response?.data || {};
      if (info?.status === 1 || info?.ok === true) {
        alert_success(info?.message || "Đã duplicate cron thành công");
        setshowduplicate(false);
        setSelectedCron(null);
        await fetchSchedulerData();
        return true;
      }

      alert_error(info?.message || "Duplicate cron failed");
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
          topics_cron: [
            {
              topic_key: selectedCron.topic_key || "",
              topic_name: selectedCron.topic_name || "",
              services_cron: [
                {
                  name_cron: selectedCron.name_cron || "",
                  task_cron: selectedCron.task_cron || "",
                  cron_delete: true,
                },
              ],
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

  // Filtered categories based on search query & status filter
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return categories
      .map((cat) => {
        const topics = Array.isArray(cat?.topics_cron) ? cat.topics_cron : [];
        const catName = (cat?.name_category || cat?.category_name || "").toLowerCase();
        const catKey = (cat?.category_key || "").toLowerCase();

        const filteredTopics = topics
          .map((topic) => {
            const services = Array.isArray(topic?.services_cron)
              ? topic.services_cron
              : [];
            const topicName = (topic?.topic_name || "").toLowerCase();
            const topicKey = (topic?.topic_key || "").toLowerCase();

            const filteredServices = services.filter((job) => {
              // Status filter
              if (statusFilter === "active" && !job?.cron_status) return false;
              if (statusFilter === "inactive" && job?.cron_status) return false;

              // Search filter
              if (!q) return true;

              const jobName = (job?.name_cron || "").toLowerCase();
              const taskName = (job?.task_cron || "").toLowerCase();
              const cmd = (job?.command_cron || "").toLowerCase();
              const url = (job?.url_cron || "").toLowerCase();
              const type = (job?.cron_tyoe || "").toLowerCase();

              return (
                jobName.includes(q) ||
                taskName.includes(q) ||
                cmd.includes(q) ||
                url.includes(q) ||
                type.includes(q) ||
                topicName.includes(q) ||
                topicKey.includes(q) ||
                catName.includes(q) ||
                catKey.includes(q)
              );
            });

            // Sắp xếp các tác vụ con (phần con của danh sách) theo thứ tự bảng chữ cái A-Z
            const sortedServices = [...filteredServices].sort((a, b) => {
              const nameA = String(a?.name_cron || a?.task_cron || "").trim();
              const nameB = String(b?.name_cron || b?.task_cron || "").trim();
              return nameA.localeCompare(nameB, "vi", { sensitivity: "base", numeric: true });
            });

            return { ...topic, services_cron: sortedServices };
          })
          .filter((topic) => topic.services_cron.length > 0 || !q);

        return { ...cat, topics_cron: filteredTopics };
      })
      .filter((cat) => cat.topics_cron.length > 0 || !q);
  }, [categories, searchQuery, statusFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const totalTopics = categories.reduce((sum, category) => {
      return (
        sum +
        (Array.isArray(category?.topics_cron) ? category.topics_cron.length : 0)
      );
    }, 0);
    const totalJobs = categories.reduce((sum, category) => {
      const topics = Array.isArray(category?.topics_cron)
        ? category.topics_cron
        : [];
      return (
        sum +
        topics.reduce((topicSum, topic) => {
          return (
            topicSum +
            (Array.isArray(topic?.services_cron) ? topic.services_cron.length : 0)
          );
        }, 0)
      );
    }, 0);
    const activeJobs = categories.reduce((sum, category) => {
      const topics = Array.isArray(category?.topics_cron)
        ? category.topics_cron
        : [];
      return (
        sum +
        topics.reduce((topicSum, topic) => {
          const items = Array.isArray(topic?.services_cron)
            ? topic.services_cron
            : [];
          return (
            topicSum +
            items.reduce((jobSum, job) => jobSum + (job?.cron_status ? 1 : 0), 0)
          );
        }, 0)
      );
    }, 0);
    const activeRate = totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0;
    return { totalCategories, totalTopics, totalJobs, activeJobs, activeRate };
  }, [categories]);

  // Format Interval Helper
  const formatInterval = (seconds) => {
    if (seconds === undefined || seconds === null || seconds === "") return "-";
    const s = Number(seconds);
    if (isNaN(s)) return `${seconds}`;
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${s}s (~${(s / 60).toFixed(1)}m)`;
    return `${s}s (~${(s / 3600).toFixed(1)}h)`;
  };

  const hasCollapsedSections =
    Object.values(collapsedCategories).some(Boolean) ||
    Object.values(collapsedTopics).some(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 space-y-5 antialiased selection:bg-purple-200">
      {/* 1. Header Banner */}
      <header className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-xs backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200/60">
                <Cpu className="h-3 w-3" />
                Scheduler Engine
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Cron Server Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Quản lý, phân loại và điều khiển tự động các tiến trình background định kỳ theo thể loại
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {lastRefreshed && (
              <span className="text-xs text-slate-400 hidden lg:inline">
                Đồng bộ: {lastRefreshed}
              </span>
            )}
            <Link
              href="/hustadmin/home"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 sm:text-sm"
            >
              <Home className="h-4 w-4" />
              <span>Admin Home</span>
            </Link>

            <button
              onClick={handleUpdate}
              type="button"
              disabled={updating}
              className={`inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-70 sm:text-sm ${
                updating ? "cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${updating ? "animate-spin" : ""}`} />
              <span>{updating ? "Đang đồng bộ..." : "Làm mới"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Categories */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Thể Loại Lớn
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Folder className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalCategories}
            </span>
            <span className="text-xs text-slate-400">Categories</span>
          </div>
        </div>

        {/* Topics */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Thể Loại Con
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalTopics}
            </span>
            <span className="text-xs text-slate-400">Topics</span>
          </div>
        </div>

        {/* Total Jobs */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng Cron Jobs
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalJobs}
            </span>
            <span className="text-xs text-slate-400">Services</span>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Đang Chạy (Active)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {stats.activeJobs}
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">
              ({stats.activeRate}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Quick Filters Toolbar */}
      <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tác vụ theo tên, mã task, lệnh chạy, thể loại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filters & Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  statusFilter === "all"
                    ? "bg-white text-slate-800 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tất cả ({stats.totalJobs})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  statusFilter === "active"
                    ? "bg-white text-emerald-700 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Bật ({stats.activeJobs})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("inactive")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  statusFilter === "inactive"
                    ? "bg-white text-rose-700 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tắt ({stats.totalJobs - stats.activeJobs})
              </button>
            </div>

            <button
              type="button"
              onClick={hasCollapsedSections ? expandAll : collapseAll}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              title="Thu gọn hoặc mở rộng toàn bộ"
            >
              {hasCollapsedSections ? "Mở rộng hết" : "Thu gọn"}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Modals */}
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

      <div ref={duplicateRef}>
        <CronRun
          showrun={showduplicate}
          setshowrun={setshowduplicate}
          selectedCron={selectedCron}
          onRun={handleDuplicateCron}
          isDuplicate
        />
      </div>

      {/* 5. Main Categories Content */}
      {loading ? (
        <div className="rounded-3xl border border-white/80 bg-white/90 p-16 text-center shadow-xs backdrop-blur-md">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Đang tải dữ liệu cấu hình Scheduler từ hệ thống...
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">
            Không tìm thấy cron job nào
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery
              ? `Không có kết quả phù hợp với từ khóa "${searchQuery}"`
              : "Hệ thống chưa có tác vụ cron nào được cấu hình."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredCategories.map((category, categoryIndex) => {
            const catKey = category?.category_key || category?.name_category || `cat-${categoryIndex}`;
            const categoryName = category?.name_category || category?.category_name || "Chưa đặt tên";
            const topics = Array.isArray(category?.topics_cron) ? category.topics_cron : [];
            const isCollapsed = Boolean(collapsedCategories[catKey]);

            // Total jobs in this category
            const categoryJobCount = topics.reduce(
              (sum, t) => sum + (Array.isArray(t?.services_cron) ? t.services_cron.length : 0),
              0
            );

            return (
              <section
                key={`${catKey}-${categoryIndex}`}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                {/* Category Header */}
                <div
                  onClick={() => toggleCategoryCollapse(catKey)}
                  className="flex cursor-pointer items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-slate-50/50 to-white px-4 py-3.5 sm:px-6 transition hover:bg-slate-100/60 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs">
                      {isCollapsed ? (
                        <Folder className="h-4 w-4" />
                      ) : (
                        <FolderOpen className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="m-0 text-base font-bold text-slate-900 sm:text-lg">
                          {categoryName}
                        </h2>
                        {category?.category_key && (
                          <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                            {category.category_key}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {topics.length} Thể loại con • {categoryJobCount} Tác vụ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {categoryJobCount} Jobs
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700">
                      {isCollapsed ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronUp className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Category Topics Body */}
                {!isCollapsed && (
                  <div className="p-3 sm:p-5 space-y-4 bg-slate-50/30">
                    {topics.map((topic, topicIndex) => {
                      const topicKey = topic?.topic_key || `topic-${topicIndex}`;
                      const topicName = topic?.topic_name || topicKey || "Không tên";
                      const topicCollapseKey = getTopicCollapseKey(
                        category,
                        categoryIndex,
                        topic,
                        topicIndex
                      );
                      const isTopicCollapsed = Boolean(collapsedTopics[topicCollapseKey]);
                      const services = Array.isArray(topic?.services_cron)
                        ? topic.services_cron
                        : [];

                      return (
                        <div
                          key={`${topicKey}-${topicIndex}`}
                          className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs"
                        >
                          {/* Topic Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-700 font-bold text-xs">
                                {topicIndex + 1}
                              </span>
                              <div>
                                <h3 className="m-0 text-sm font-bold text-slate-800 sm:text-base">
                                  {topicName}
                                </h3>
                                {topic?.topic_key && (
                                  <span className="font-mono text-[11px] text-slate-400">
                                    {topic.topic_key}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                {services.length} tác vụ
                              </span>
                              <button
                                type="button"
                                onClick={() => openCreate(category, topic)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Tạo Cron</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleTopicCollapse(topicCollapseKey)}
                                aria-expanded={!isTopicCollapsed}
                                aria-label={`${isTopicCollapsed ? "Mở rộng" : "Thu gọn"} ${topicName}`}
                                title={isTopicCollapsed ? "Mở rộng thể loại con" : "Thu gọn thể loại con"}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              >
                                {isTopicCollapsed ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronUp className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Services Table */}
                          {!isTopicCollapsed && (services.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                              Chưa có cron job nào trong nhóm này. Nhấn &quot;Tạo Cron&quot; để thêm.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    <th className="py-2.5 px-3 sm:px-4 w-[26%]">Tên Cron &amp; Task</th>
                                    <th className="py-2.5 px-3 sm:px-4 w-[16%]">Chu Kỳ / Lịch</th>
                                    <th className="py-2.5 px-3 sm:px-4 w-[28%]">Nguồn Thực Thi (Source)</th>
                                    <th className="py-2.5 px-3 sm:px-4 w-[12%] text-center">Cờ Cấu Hình</th>
                                    <th className="py-2.5 px-3 sm:px-4 w-[18%] text-center">Trạng Thái &amp; Thao Tác</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {services.map((job, jobIndex) => {
                                    const jobKey = `${job?.task_cron || "job"}-${jobIndex}`;
                                    const isJobActive = Boolean(job?.cron_status);

                                    // Type badge config
                                    const typeColor =
                                      job?.cron_tyoe === "powershell"
                                        ? "bg-sky-50 text-sky-700 border-sky-200"
                                        : job?.cron_tyoe === "url"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-purple-50 text-purple-700 border-purple-200";

                                    return (
                                      <tr
                                        key={jobKey}
                                        className="transition-colors hover:bg-slate-50/80"
                                      >
                                        {/* 1. Name & Task */}
                                        <td className="py-3 px-3 sm:px-4 align-top">
                                          <div className="flex flex-col items-start gap-2">
                                            <div className="flex flex-col gap-1">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span
                                                  className="font-bold text-slate-900 leading-snug line-clamp-2"
                                                  title={job?.name_cron}
                                                >
                                                  {job?.name_cron || "Chưa đặt tên"}
                                                </span>
                                                {job?.cron_tyoe && (
                                                  <span
                                                    className={`rounded-md border px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider ${typeColor}`}
                                                  >
                                                    {job.cron_tyoe}
                                                  </span>
                                                )}
                                              </div>

                                              <div className="flex items-center gap-1.5">
                                                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-purple-700 border border-slate-200">
                                                  {job?.task_cron || "-"}
                                                </code>
                                                {job?.cron_timeout_seconds && (
                                                  <span className="text-[10px] text-slate-400">
                                                    timeout: {job.cron_timeout_seconds}s
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </td>

                                        {/* 2. Schedule Timing */}
                                        <td className="py-3 px-3 sm:px-4 align-top">
                                          <div className="flex flex-col gap-1">
                                            {job?.interval_seconds ? (
                                              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                                <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                <span>{formatInterval(job.interval_seconds)}</span>
                                              </span>
                                            ) : null}

                                            {job?.at_time_cron ? (
                                              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                                                <span className="text-slate-400">At:</span>
                                                <span className="rounded bg-amber-50 text-amber-700 px-1.5 py-0.5 border border-amber-200/80 font-mono text-xs">
                                                  {job.at_time_cron}
                                                </span>
                                              </span>
                                            ) : null}

                                            {!job?.interval_seconds && !job?.at_time_cron && (
                                              <span className="text-slate-400">-</span>
                                            )}
                                          </div>
                                        </td>

                                        {/* 3. Source Execution */}
                                        <td className="py-3 px-3 sm:px-4 align-top">
                                          {job?.url_cron ? (
                                            <a
                                              href={job.url_cron}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="group inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 break-all font-mono text-xs"
                                              title={job.url_cron}
                                            >
                                              <Globe className="h-3 w-3 shrink-0 text-emerald-600" />
                                              <span className="underline group-hover:no-underline">
                                                {job.url_cron}
                                              </span>
                                              <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
                                            </a>
                                          ) : job?.command_cron ? (
                                            <div
                                              className="inline-flex items-start gap-1 rounded-md bg-slate-100 p-1.5 font-mono text-xs text-slate-700 border border-slate-200 break-all max-h-16 overflow-y-auto"
                                              title={job.command_cron}
                                            >
                                              <Terminal className="h-3 w-3 shrink-0 text-sky-600 mt-0.5" />
                                              <span>{job.command_cron}</span>
                                            </div>
                                          ) : (
                                            <span className="text-slate-400">-</span>
                                          )}
                                        </td>

                                        {/* 4. Flags / Tags */}
                                        <td className="py-3 px-3 sm:px-4 align-top text-center">
                                          <div className="flex flex-wrap items-center justify-center gap-1">
                                            {job?.cron_show ? (
                                              <span
                                                title="Service đang được hiển thị"
                                                aria-label="Hiển thị"
                                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100"
                                              >
                                                <Eye className="h-3 w-3" />
                                                <span>Hiện</span>
                                              </span>
                                            ) : (
                                              <span
                                                title="Service đang bị ẩn"
                                                aria-label="Đang ẩn"
                                                className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-300"
                                              >
                                                <EyeOff className="h-3 w-3 text-slate-400" />
                                                <span>Ẩn</span>
                                              </span>
                                            )}
                                            {job?.cron_single && (
                                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                                                single
                                              </span>
                                            )}
                                            {job?.run_on_start_cron && (
                                              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                                                on_start
                                              </span>
                                            )}
                                          </div>
                                        </td>

                                        {/* 5. Status & Actions */}
                                        <td className="py-3 px-3 sm:px-4 align-top text-center whitespace-nowrap">
                                          <div className="flex flex-col items-center gap-2">
                                            {/* Row 1: Run Button & Status Badge */}
                                            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                              {/* Run button */}
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  openRun(
                                                    job,
                                                    category,
                                                    topic,
                                                    categoryIndex,
                                                    topicIndex,
                                                    jobIndex
                                                  )
                                                }
                                                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                                                title="Chạy thử ngay"
                                              >
                                                <Play className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                                                <span>Run</span>
                                              </button>

                                              {/* Status Badge */}
                                              {isJobActive ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 shadow-2xs">
                                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                                  <span>Active</span>
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 shadow-2xs">
                                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                                  <span>Paused</span>
                                                </span>
                                              )}
                                            </div>

                                            {/* Row 2: Action Buttons Toolbar */}
                                            <div className="flex items-center justify-center gap-1 whitespace-nowrap">

                                              {/* Edit button */}
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  openEdit(
                                                    job,
                                                    category,
                                                    topic,
                                                    categoryIndex,
                                                    topicIndex,
                                                    jobIndex
                                                  )
                                                }
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                                title="Chỉnh sửa cấu hình"
                                              >
                                                <Edit3 className="h-3 w-3" />
                                                <span>Sửa</span>
                                              </button>

                                              {/* Clone button */}
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  openDuplicate(
                                                    job,
                                                    category,
                                                    topic,
                                                    categoryIndex,
                                                    topicIndex,
                                                    jobIndex
                                                  )
                                                }
                                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1 text-slate-600 shadow-2xs transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                                                title="Nhân bản (Duplicate)"
                                              >
                                                <Copy className="h-3 w-3" />
                                              </button>

                                              {/* Delete button */}
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  openDelete(
                                                    job,
                                                    category,
                                                    topic,
                                                    categoryIndex,
                                                    topicIndex,
                                                    jobIndex
                                                  )
                                                }
                                                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white p-1 text-rose-500 shadow-2xs transition hover:bg-rose-50 hover:text-rose-700"
                                                title="Xoá cron job này"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CronServerAdmin;
