import React from "react";
import { copy_native } from "../../AppContext";
import Profile_images from "./profile_images";

// --- Helper: Hàm che thông tin (Masking) ---
const maskData = (text: any) => {
  if (!text || text.length < 6) return text;
  const start = text.slice(0, 3);
  const end = text.slice(-3);
  return `${start}***${end}`;
};

// --- Icons Bộ Cyber Security (Size nhỏ w-4 h-4) ---
const IconShield = () => (
  <svg
    className="w-4 h-4 text-indigo-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);
const IconAlert = () => (
  <svg
    className="w-4 h-4 text-amber-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);
const IconBank = () => (
  <svg
    className="w-3.5 h-3.5 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);
const IconLink = () => (
  <svg
    className="w-3.5 h-3.5 text-indigo-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

const Completed = ({ profile_info, currentUrl, onCopy, navigate }) => {
  // --- KỸ THUẬT ALIASING ---
  const {
    description_scam: dataContent,
    links_scam: dataLinks,
    ...otherInfo
  } = profile_info;

  return (
    <div className="w-full mt-2 mb-2 px-2">
      {/* Container Chính */}
      <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-xl shadow-sm rounded-xl overflow-hidden border border-white relative">
        {/* Thanh màu định danh (Mỏng hơn) */}
        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="flex flex-col md:flex-row">
          {/* --- CỘT TRÁI: ĐỊNH DANH (Thu hẹp padding) --- */}
          <div className="w-full md:w-1/3 bg-slate-50/50 border-r border-slate-100 p-4 flex flex-col items-center justify-start">
            {/* Avatar nhỏ gọn (w-16) */}
            <div className="relative mb-2">
              <div className="absolute inset-0 border border-indigo-100 rounded-full animate-ping opacity-75"></div>
              <img
                src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg"
                alt="Profile"
                className="w-16 h-16 rounded-full shadow border-2 border-white relative z-10 object-cover"
              />
              <span className="absolute bottom-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white z-20">
                RECORDED
              </span>
            </div>

            {/* Tên đối tượng */}
            {otherInfo.account_name && (
              <h2 className="text-base font-bold text-slate-800 text-center mb-0.5 leading-tight">
                {otherInfo.account_name}
              </h2>
            )}
            <div className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mb-3 tracking-wide">
              ĐỐI TƯỢNG ĐỊNH DANH
            </div>

            {/* Thông tin tài khoản (Box nhỏ, padding nhỏ) */}
            <div className="w-full space-y-2">
              {otherInfo.account_number && (
                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-indigo-500"></div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                    <IconBank /> <span>Tài khoản giao dịch</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-700 tracking-wider pl-2">
                    {maskData(otherInfo.account_number)}
                  </div>
                  {otherInfo.bank_name && (
                    <div className="text-[9px] font-bold text-indigo-500 mt-0.5 pl-2 uppercase">
                      {otherInfo.bank_name}
                    </div>
                  )}
                </div>
              )}

              {otherInfo.phone_number && (
                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-slate-300"></div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>Liên hệ</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-700 pl-2">
                    {maskData(otherInfo.phone_number)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- CỘT PHẢI: DỮ LIỆU BÁO CÁO (Thu hẹp padding) --- */}
          <div className="w-full md:w-2/3 p-4">
            {/* Header Box (Gọn hơn & Fix khoảng cách mb-1) */}
            <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 p-1 rounded text-amber-500">
                  <IconAlert />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none">
                    Cảnh báo rủi ro
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Hệ thống ghi nhận dấu hiệu bất thường
                  </p>
                </div>
              </div>
              <div className="text-[9px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-mono">
                {otherInfo.updatedate}
              </div>
            </div>

            {/* Nội dung báo cáo (Padding nhỏ hơn) */}
            <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-lg mb-3 relative">
              <div className="absolute top-2 right-2 opacity-10">
                <IconShield />
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed text-justify">
                {dataContent}
              </p>
            </div>

            {/* Grid Thông số (Gap nhỏ hơn) */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                  Giá trị giao dịch
                </div>
                <div className="text-sm font-bold text-rose-600 font-mono">
                  {otherInfo.amount && otherInfo.amount !== "0"
                    ? otherInfo.amount
                    : "N/A"}
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                  Số lượt tra cứu
                </div>
                <div className="text-sm font-bold text-indigo-600 font-mono">
                  130+{" "}
                  <span className="text-[9px] text-slate-400 font-normal">
                    hits
                  </span>
                </div>
              </div>
            </div>

            {/* Box Khuyến nghị & Liên kết (Gộp nhóm) */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-indigo-50/40 p-2 rounded-lg border border-indigo-50">
                <div className="mt-0.5">
                  <IconShield />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-indigo-700 uppercase leading-none mb-0.5">
                    Khuyến nghị an toàn
                  </div>
                  <p className="text-[10px] text-slate-600 leading-snug">
                    Vui lòng xác minh kỹ thông tin trên{" "}
                    <span className="text-indigo-600 font-bold">
                      hust.media
                    </span>{" "}
                    trước khi giao dịch.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <div className="mt-0.5">
                  <IconLink />
                </div>
                <div className="w-full">
                  <div className="text-[10px] font-bold text-slate-700 uppercase leading-none mb-0.5">
                    Nguồn dữ liệu / Liên kết
                  </div>
                  <div className="text-[10px] text-slate-500 break-all font-mono leading-tight">
                    {(() => {
                      try {
                        const parsed = JSON.parse(dataLinks);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          return parsed.map((item, idx) => {
                            const key = Object.keys(item)[0];
                            return (
                              <div key={idx}>
                                <span className="font-bold text-slate-600">
                                  {key}:
                                </span>{" "}
                                {item[key]}
                              </div>
                            );
                          });
                        }
                      } catch (e) {}
                      return (
                        <span
                          className="text-indigo-500 underline cursor-pointer"
                          onClick={() => copy_native(dataLinks)}
                        >
                          {dataLinks}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Nút điều hướng (Nhỏ gọn) */}
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => navigate("/shop/check/lists/exchange")}
                className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded transition-all shadow-sm active:scale-95 flex items-center gap-1"
              >
                Tra cứu dữ liệu khác
                <svg
                  className="w-2.5 h-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* --- KHU VỰC BẰNG CHỨNG (Padding siêu nhỏ) --- */}
        <div className="border-t border-slate-100 bg-slate-50/30 p-2">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-2 text-center tracking-[0.2em]">
            Dữ liệu hình ảnh / Bằng chứng
          </div>
          <Profile_images profile_info={profile_info} />
        </div>

        {/* --- FOOTER --- */}
        <div className="bg-white border-t border-slate-100 p-1.5 text-center">
          <button
            onClick={() => onCopy(currentUrl)}
            className="text-[9px] font-medium text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <svg
              className="w-2.5 h-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Sao chép liên kết báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Completed;
