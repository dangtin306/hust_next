"use client";

import React, { useEffect, useState } from "react";

const PortCheck = ({ showcheck, setshowcheck, selectedPort, onCheck }) => {
  const [checking, setChecking] = useState(0);
  const [buttonText, setButtonText] = useState("Check thử");

  useEffect(() => {
    if (!selectedPort) return;
  }, [selectedPort]);

  const closeCheck = () => setshowcheck(false);

  const handleCheck = async (event) => {
    event.preventDefault();
    setChecking(1);
    setButtonText("Vui lòng chờ một lát 😊");
    try {
      await onCheck?.(selectedPort);
    } finally {
      setChecking(0);
      setButtonText("Check thử");
    }
  };

  if (!showcheck || !selectedPort) return null;

  return (
    <div className="mx-2 mb-0 add-form">
      <div className="mx-2 mb-0 add-form">
        <div className="form-control">
          <div className="flex items-center justify-between flex-1 mb-0.5">
            <label className="mb-0 text-sm sm:text-base leading-tight">
              Check thử port: {selectedPort?.port_name || selectedPort?.port_code || selectedPort?.port}
            </label>
            <label onClick={closeCheck} className="mb-0 px-2 py-0.5 cursor-pointer text-xs sm:text-sm leading-tight">
              Đóng
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <div className="flex flex-col gap-0 leading-tight">
              <div className="mb-0.5"><span className="font-semibold">Name:</span> {selectedPort?.port_name || "-"}</div>
              <div className="mb-0.5"><span className="font-semibold">Code:</span> {selectedPort?.port_code || "-"}</div>
              <div className="mb-0.5"><span className="font-semibold">Port:</span> {selectedPort?.port ?? "-"}</div>
              <div className="mb-0.5 break-all"><span className="font-semibold">Value update:</span> port_status, pid, process, executable, command, parent_process, parent_command</div>
            </div>
          </div>

          <button
            type="button"
            disabled={checking === 1}
            onClick={handleCheck}
            className="mt-2 flex break-inside bg-emerald-500 hover:bg-emerald-400 rounded-3xl px-8 py-1.5 mb-0 w-full dark:bg-slate-800 dark:text-white"
          >
            <div className="flex items-center justify-between flex-1">
              {checking === 1 && <div className="spinner-border spinner-border-sm" role="status" />}
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

export default PortCheck;
