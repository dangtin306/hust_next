"use client";

import React, { useEffect, useState } from "react";

const Cron_edit = ({ showedit, setshowedit, selectedCron, onSave, onDelete, isCreate = false, isDelete = false }) => {
  const [nutxuly, setNutxuly] = useState(0);
  const [nutorder, setNutorder] = useState("Lưu thay đổi");
  const [itemCronEdit, setItemCronEdit] = useState({});

  useEffect(() => {
    if (!selectedCron) return;

    const { __categoryIndex, __jobIndex, ...initialCron } = selectedCron;
    setItemCronEdit(initialCron);
  }, [selectedCron]);

  const exitedit = () => {
    setshowedit(false);
  };

  const hamcancode = (key, value) => {
    setItemCronEdit((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggle = (key) => {
    setItemCronEdit((prev) => ({
      ...prev,
      [key]: !Boolean(prev?.[key]),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNutxuly(1);
    setNutorder(isDelete ? "Đang xoá..." : "Vui lòng chờ một lát 😊");

    try {
      if (isDelete) {
        await onDelete?.();
      } else {
        await onSave?.(itemCronEdit);
      }
    } finally {
      setNutxuly(0);
      setNutorder(isDelete ? "Xác nhận xoá" : "Lưu thay đổi");
    }
  };

  if (!showedit || !selectedCron) return null;

  const booleanRows = [
    { key: "cron_status", label: "Trang thai cron" },
    { key: "cron_show", label: "Cron show" },
    { key: "cron_single", label: "Cron single" },
    { key: "run_on_start_cron", label: "Run on start" },
  ];

  return (
    <>
      <div className="mx-2 mb-0 add-form">
        <form onSubmit={(e) => e.preventDefault()} className="mx-2 mb-0 add-form">
          <div className="form-control">
            <div className="flex items-center justify-between flex-1 mb-0.5">
              <label className="mb-0 text-sm sm:text-base leading-tight">
                  {isDelete
                  ? `Xoá cron: ${selectedCron?.name_cron || selectedCron?.task_cron}`
                  : isCreate
                  ? "Tạo cron mới"
                  : `Chỉnh sửa cron: ${selectedCron?.name_cron || selectedCron?.task_cron}`}
              </label>
              <label onClick={exitedit} className="mb-0 px-2 py-0.5 cursor-pointer text-xs sm:text-sm leading-tight">
                Đóng
              </label>
            </div>

            <label className="mb-0 text-xs sm:text-sm leading-tight">
              {isCreate ? "Tên cron" : "Sửa tên cron"}
            </label>
            <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">
                name
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Có thể bỏ trống"
                aria-label="name"
                value={itemCronEdit?.name_cron || ""}
                name="name"
                aria-describedby="addon-wrapping"
                onChange={(e) => hamcancode("name_cron", e.target.value)}
                disabled={isDelete}
              />
            </div>

            <label className="mb-0 text-xs sm:text-sm leading-tight">
              {isCreate ? "Task" : "Sửa task"}
            </label>
            <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">
                task
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Có thể bỏ trống"
                aria-label="task"
                value={itemCronEdit?.task_cron || ""}
                name="task"
                aria-describedby="addon-wrapping"
                onChange={(e) => hamcancode("task_cron", e.target.value)}
                disabled={isDelete}
              />
            </div>

            {!isDelete && (
              <>
                <label className="mb-0 text-xs sm:text-sm leading-tight">
                  {isCreate ? "Interval" : "Sửa interval"}
                </label>
                <div className="input-group flex-nowrap">
                  <span className="input-group-text" id="addon-wrapping">
                    interval
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Có thể bỏ trống"
                    aria-label="interval"
                    value={itemCronEdit?.interval_seconds ?? ""}
                    name="interval"
                    aria-describedby="addon-wrapping"
                    onChange={(e) => hamcancode("interval_seconds", e.target.value)}
                  />
                </div>

                <label className="mb-0 text-xs sm:text-sm leading-tight">
                  {isCreate ? "At time" : "Sửa at time"}
                </label>
                <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">
                time
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Có thể bỏ trống"
                aria-label="time"
                value={itemCronEdit?.at_time_cron || ""}
                name="time"
                aria-describedby="addon-wrapping"
                onChange={(e) => hamcancode("at_time_cron", e.target.value)}
                disabled={isDelete}
              />
                </div>

                <label className="mb-0 text-xs sm:text-sm leading-tight">
                  {isCreate ? "URL" : "Sửa URL"}
                </label>
                <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">
                url
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Có thể bỏ trống"
                aria-label="url"
                value={itemCronEdit?.url_cron || ""}
                name="url"
                aria-describedby="addon-wrapping"
                onChange={(e) => hamcancode("url_cron", e.target.value)}
                disabled={isDelete}
              />
                </div>

                <label className="mb-0 text-xs sm:text-sm leading-tight">
                  {isCreate ? "Command" : "Sửa command"}
                </label>
                <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">
                cmd
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Có thể bỏ trống"
                aria-label="command"
                value={itemCronEdit?.command_cron || ""}
                name="command"
                aria-describedby="addon-wrapping"
                onChange={(e) => hamcancode("command_cron", e.target.value)}
                disabled={isDelete}
              />
                </div>

                <label className="mb-0 text-xs sm:text-sm leading-tight">
                  {isCreate ? "Cron type" : "Sửa cron type"}
                </label>
                <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">
                type
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Có thể bỏ trống"
                aria-label="type"
                value={itemCronEdit?.cron_tyoe || ""}
                name="type"
                aria-describedby="addon-wrapping"
                onChange={(e) => hamcancode("cron_tyoe", e.target.value)}
                disabled={isDelete}
              />
                </div>

                <label className="mb-0 text-xs sm:text-sm leading-tight">
                  {isCreate ? "Timeout" : "Sửa timeout"}
                </label>
                <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">
                timeout
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Có thể bỏ trống"
                aria-label="timeout"
                value={itemCronEdit?.cron_timeout_seconds ?? ""}
                name="timeout"
                aria-describedby="addon-wrapping"
                onChange={(e) => hamcancode("cron_timeout_seconds", e.target.value)}
                disabled={isDelete}
              />
                </div>

                {booleanRows.map((field) => (
                  <React.Fragment key={field.key}>
                    <label className="mt-0 mb-0 text-xs sm:text-sm leading-tight">{field.label}</label>
                    <div className="mb-0.5">
                      <button
                        type="button"
                        onClick={() => handleToggle(field.key)}
                        className={`w-full flex items-center justify-between px-2 py-1 border rounded transition text-xs sm:text-sm ${
                          itemCronEdit?.[field.key]
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-red-500 bg-red-50 text-red-700"
                        }`}
                      >
                        <span>{field.key}</span>
                        <span className="text-[11px]">
                          Nhấn để {itemCronEdit?.[field.key] ? "tắt" : "bật"}
                        </span>
                      </button>
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}

            <button
              type="button"
              disabled={nutxuly === 1}
              onClick={handleSubmit}
              className={`mt-3 flex break-inside rounded-3xl px-8 py-1.5 mb-0 w-full dark:bg-slate-800 dark:text-white ${
                isDelete ? "bg-rose-500 hover:bg-rose-400" : "bg-purple-400 hover:bg-purple-300"
              }`}
            >
              <div className="flex items-center justify-between flex-1">
                {nutxuly === 1 && <div className="spinner-border spinner-border-sm" role="status" />}
                <span className="text-sm sm:text-base font-medium text-white">
                  {isDelete && nutxuly !== 1 ? "Xác nhận xoá" : nutorder}
                </span>
                <div className="text-lg">{"\u27A4"}</div>
              </div>
            </button>

            <div className="h-2" />
          </div>
        </form>
      </div>
    </>
  );
};

export default Cron_edit;
