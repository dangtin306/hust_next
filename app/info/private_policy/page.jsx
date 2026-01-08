const lastUpdated = new Date().toISOString().slice(0, 10);

const sections = [
  {
    id: "data-collection",
    title: "1. Data Collection",
    content: (
      <>
        <p>
          Chúng tôi thu thập Device ID, IP Address và Browser Fingerprint nhằm
          phục vụ cho Security Audit (Kiểm toán an ninh) và Fraud Prevention
          (Chống gian lận). Dữ liệu này không được sử dụng để theo dõi hành vi
          cá nhân trái phép hoặc mục đích ngoài phạm vi bảo mật.
        </p>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
          Purpose-limited: Security Audit + Fraud Prevention only.
        </div>
      </>
    ),
  },
  {
    id: "media-handling",
    title: "2. Media Handling",
    content: (
      <>
        <p>
          Hình ảnh và video minh chứng do người dùng tải lên được xử lý theo quy
          trình bảo mật nhiều lớp: Mã hóa dữ liệu → Phân tích AI (OCR) → Lưu trữ
          an toàn hoặc Xóa định kỳ theo Data Retention Policy.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>Encryption at rest và kiểm soát truy cập nghiêm ngặt.</li>
          <li>AI/OCR chỉ dùng để xác thực minh chứng hợp lệ.</li>
          <li>Chu kỳ xóa dữ liệu được áp dụng theo chính sách lưu trữ.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies-sessions",
    title: "3. Cookies & Sessions",
    content: (
      <>
        <p>
          Hust Media sử dụng Cookie để duy trì phiên đăng nhập và đồng bộ trạng
          thái giữa các module (Shared Session React-NextJS). Cookie chỉ phục vụ
          định danh phiên và không dùng cho hành vi tracking ngoài mục đích vận
          hành.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "4. Third-Party Disclosure",
    content: (
      <>
        <p>
          Chúng tôi cam kết không bán dữ liệu người dùng. Chỉ chia sẻ dữ liệu ẩn
          danh (Anonymized Data) với các đối tác phân tích khi thật sự cần thiết
          để cải thiện hiệu năng và bảo mật hệ thống.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-slate-200 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="rounded-3xl border border-white/80 bg-white/80 px-6 py-8 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.25)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Hust Media
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-sm text-slate-600">
            Chính sách này mô tả cách Hust Media thu thập, xử lý và bảo vệ dữ
            liệu nhằm đảm bảo an toàn hệ thống và chống gian lận.
          </p>
        </header>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <details
              key={section.id}
              className="group rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_22px_-20px_rgba(15,23,42,0.25)]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900">
                <span>{section.title}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-180">
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 8l5 5 5-5" />
                  </svg>
                </span>
              </summary>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                {section.content}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
