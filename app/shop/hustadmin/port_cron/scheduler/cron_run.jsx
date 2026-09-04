"use client";

import React, { useEffect, useState } from "react";

const Cron_run = ({ showrun, setshowrun, selectedCron, onRun }) => {
  const [running, setRunning] = useState(0);
  const [buttonText, setButtonText] = useState("Chạy thử");

  useEffect(() => {
    if (!selectedCron) return;
  }, [selectedCron]);

  const closeRun = () => {
    setshowrun(false);
  };

  const handleRun = async (event) => {
    event.preventDefault();
    setRunning(1);
    setButtonText("Vui lòng chờ một lát 😊");

    try {
      await onRun?.();
    } finally {
      setRunning(0);
      setButtonText("Chạy thử");
    }
  };

  if (!showrun || !selectedCron) return null;

  return (
    <div className="mx-2 mb-0 add-form">
      <div className="mx-2 mb-0 add-form">
        <div className="form-control">
          <div className="flex items-center justify-between flex-1 mb-0.5">
            <label className="mb-0 text-sm sm:text-base leading-tight">
              Chạy thử cron: {selectedCron?.name_cron || selectedCron?.task_cron}
            </label>
            <label onClick={closeRun} className="mb-0 px-2 py-0.5 cursor-pointer text-xs sm:text-sm leading-tight">
              Đóng
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <div className="flex flex-col gap-0 leading-tight">
              <div className="mb-0.5">
                <span className="font-semibold">Cron Name:</span> {selectedCron?.name_cron || "-"}
              </div>
              <div className="mb-0.5">
                <span className="font-semibold">Task:</span> {selectedCron?.task_cron || "-"}
              </div>
              <div className="mb-0.5">
                <span className="font-semibold block">Source:</span>
                <span className="block break-all mt-0.5">
                  {selectedCron?.url_cron || selectedCron?.command_cron || "-"}
                </span>
              </div>
              <div className="mb-0.5">
                <span className="font-semibold">At time:</span> {selectedCron?.at_time_cron || "-"}
              </div>
              <div className="mb-0.5">
                <span className="font-semibold">Interval:</span>{" "}
                {selectedCron?.interval_seconds ?? "-"} s
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={running === 1}
            onClick={handleRun}
            className="mt-2 flex break-inside bg-emerald-500 hover:bg-emerald-400 rounded-3xl px-8 py-1.5 mb-0 w-full dark:bg-slate-800 dark:text-white"
          >
            <div className="flex items-center justify-between flex-1">
              {running === 1 && <div className="spinner-border spinner-border-sm" role="status" />}
              <span className="text-sm sm:text-base font-medium text-white">{buttonText}</span>
              <div className="text-lg">{"\u27A4"}</div>
            </div>
          </button>

          <div className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default Cron_run;
