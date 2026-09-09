"use client";

import React, { useEffect, useState } from "react";

const Port_edit = ({ showedit, setshowedit, selectedPort, onSave, onDelete, isCreate = false, isDelete = false }) => {
  const [nutxuly, setNutxuly] = useState(0);
  const [nutorder, setNutorder] = useState("Lưu thay đổi");
  const [itemPortEdit, setItemPortEdit] = useState({});

  useEffect(() => {
    setItemPortEdit(selectedPort ? { ...selectedPort } : {});
  }, [selectedPort, isCreate]);

  const handleChange = (key, value) => setItemPortEdit((current) => ({ ...current, [key]: value }));
  const handleToggle = (key) => setItemPortEdit((current) => ({ ...current, [key]: !Boolean(current?.[key]) }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setNutxuly(1);
    setNutorder("Vui lòng chờ một lát 😊");
    const payload = isCreate
      ? {
          port_name: itemPortEdit?.port_name || "",
          port_note: itemPortEdit?.port_note || "",
          port: itemPortEdit?.port === "" || itemPortEdit?.port == null ? "" : Number(itemPortEdit.port),
          port_status: Boolean(itemPortEdit?.port_status),
        }
      : itemPortEdit;
    try {
      if (isDelete) await onDelete?.();
      else await onSave?.(payload);
    } finally {
      setNutxuly(0);
      setNutorder(isDelete ? "Xác nhận xoá" : "Lưu thay đổi");
    }
  };
  if (!showedit || (!selectedPort && !isCreate)) return null;
  const currentPort = selectedPort || {};

  const fields = [
    ["port_name", "name", "Sửa tên port"], ["port_note", "note", "Sửa note"],
    ...(!isDelete ? [["port", "port", "Sửa port"]] : []),
  ];

  return (
    <>
      <div className="mx-2 mb-0 add-form">
        <form onSubmit={(event) => event.preventDefault()} className="mx-2 mb-0 add-form">
          <div className="form-control">
            <div className="mb-0.5 flex flex-1 items-center justify-between">
              <label className="mb-0 text-sm leading-tight sm:text-base">
                {isDelete ? `Xoá port: ${currentPort?.port_name || currentPort?.port_note || currentPort?.port}` : isCreate ? "Tạo port mới" : `Chỉnh sửa port: ${currentPort?.port_name || currentPort?.port_note || currentPort?.port}`}
              </label>
              <label onClick={() => setshowedit(false)} className="mb-0 cursor-pointer px-2 py-0.5 text-xs leading-tight sm:text-sm">Đóng</label>
            </div>
            {fields.map(([key, addon, label]) => (
              <React.Fragment key={key}>
                <label className="mb-0 text-xs leading-tight sm:text-sm">{label}</label>
                <div className="input-group flex-nowrap">
                  <span className="input-group-text" id={`addon-${key}`}>{addon}</span>
                  <input type="text" className="form-control" placeholder="Có thể bỏ trống" aria-label={key} value={itemPortEdit?.[key] ?? ""} onChange={(event) => handleChange(key, event.target.value)} aria-describedby={`addon-${key}`} disabled={isDelete} />
                </div>
              </React.Fragment>
            ))}
            {!isDelete && <label className="mt-0 mb-0 text-xs leading-tight sm:text-sm">Trang thái port</label>}
            {!isDelete && <div className="mb-0.5">
              <button type="button" onClick={() => handleToggle("port_status")} className={`flex w-full items-center justify-between rounded border px-2 py-1 text-xs transition sm:text-sm ${itemPortEdit?.port_status ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"}`}>
                <span>port_status</span><span className="text-[11px]">Nhấn để {itemPortEdit?.port_status ? "tắt" : "bật"}</span>
              </button>
            </div>}
            <button type="button" disabled={nutxuly === 1} onClick={handleSubmit} className={`mt-3 mb-0 flex w-full break-inside rounded-3xl px-8 py-1.5 dark:bg-slate-800 dark:text-white ${isDelete ? "bg-rose-500 hover:bg-rose-400" : "bg-purple-400 hover:bg-purple-300"}`}>
              <div className="flex flex-1 items-center justify-between">{nutxuly === 1 && <div className="spinner-border spinner-border-sm" role="status" />}<span className="text-sm font-medium text-white sm:text-base">{isDelete && nutxuly !== 1 ? "Xác nhận xoá" : nutorder}</span><div className="text-lg">➤</div></div>
            </button>
            <div className="h-2" />
          </div>
        </form>
      </div>
    </>
  );
};

export default Port_edit;
