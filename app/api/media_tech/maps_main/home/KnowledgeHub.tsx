import { BookOpen, Download, FileCode2, FileText, Network, TriangleAlert } from "lucide-react";
import CopyPromptButton from "./CopyPromptButton";
import { NavigationToastAnchor } from "@/app/api/hust_media/media_tech/HomeNavigationToast";
import { PRODUCTS, loadKnowledge, productFile, type KnowledgeStats, type ProductKey } from "./knowledge";

const numberFormat = new Intl.NumberFormat("vi-VN");
const timeFormat = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

// Một kiểu thẻ duy nhất cho cả trang: nền trắng, viền nhạt, dải accent tím phía trên.
const CARD = "flex flex-col overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-violet-600 bg-white shadow-sm";
const CARD_HEADER = "px-5 pt-5";
const CARD_BODY = "flex flex-1 flex-col gap-4 p-5";
const CARD_FOOTER = "flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4";
const ICON_TILE = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700";
const BTN_PRIMARY =
  "inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700";
const BTN_SECONDARY =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100";
const SECTION_TITLE = "text-lg font-bold tracking-tight text-slate-900";

// Chú giải mức tin cậy theo từng sản phẩm: Media Tech là "đã xác minh", Hust Media là "đã khai báo" (đồ án).
const LEGEND_BY_PRODUCT: Record<ProductKey, { label: string; text: string }> = {
  mt: {
    label: "Đã xác minh",
    text: "Quan hệ có căn cứ, sách coi là dữ kiện của sản phẩm. Đã đối chiếu tệp căn cứ khi nhập dữ liệu.",
  },
  hust: {
    label: "Đã khai báo",
    text: "Quan hệ đồ án nêu, sách coi là dữ kiện của sản phẩm. Chưa đối chiếu với repo nên không phải kiểm chứng.",
  },
};

function formatNumber(value: number | null | undefined) {
  return value === null || value === undefined ? "–" : numberFormat.format(value);
}

function formatTime(value: string | Date | null) {
  if (!value) return "chưa có";
  return timeFormat.format(typeof value === "string" ? new Date(value) : value);
}

function freshnessText(stats: KnowledgeStats) {
  switch (stats.freshness) {
    case "missing":
      return "Chưa có sách. Sinh bằng build_textbook.py.";
    case "stale":
      return "Sách cũ hơn maps_main.jsonl: cần sinh lại sách.";
    default:
      return "Sách không cũ hơn maps_main.jsonl (so theo thời gian sửa file).";
  }
}

function buildPrompt(stats: KnowledgeStats) {
  const { product, yesLabel, noLabel, basisLine } = stats;
  return [
    `Đọc sách giáo khoa sản phẩm ${product.name} tại ${productFile(product, "textbook")}.`,
    basisLine,
    `Quan hệ ghi "${yesLabel}" có căn cứ; quan hệ ghi "${noLabel}" chỉ là giả định, phải nói rõ khi dùng.`,
    `Bảng quan hệ đầy đủ ở ${productFile(product, "relations")}. Trả lời bằng tiếng Việt và nêu căn cứ cho từng ý.`,
  ].join(" ");
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function ProductCard({ stats }: { stats: KnowledgeStats }) {
  const { product, mapCounts, relations, yesLabel, noLabel } = stats;
  return (
    <article className={CARD}>
      <div className={CARD_HEADER}>
        <div className="flex items-start gap-3">
          <div className={ICON_TILE}>
            <Network className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
            <p className="text-sm text-slate-600">{stats.bookTitle}</p>
          </div>
        </div>
      </div>

      <div className={CARD_BODY}>
        {mapCounts ? (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Công trình" value={formatNumber(mapCounts.buildings)} />
            <Stat label="Ga" value={formatNumber(mapCounts.stations)} />
            <Stat label="Tuyến" value={formatNumber(mapCounts.lines)} />
            <Stat label="Quận" value={formatNumber(mapCounts.districts)} />
          </dl>
        ) : (
          <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            Chưa có dữ liệu bản đồ. Chạy main.py để sinh metro_data.json.
          </p>
        )}
        {relations && (
          <p className="text-sm text-slate-700">
            <span className="font-bold text-slate-900">{formatNumber(relations.verified)}</span> quan hệ {yesLabel}
            <span className="mx-2 text-slate-300">|</span>
            <span className="font-bold text-slate-900">{formatNumber(relations.unverified)}</span> {noLabel}
          </p>
        )}
        <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
          <p>{stats.basisLine}</p>
          <p>Bản đồ sinh lúc {formatTime(stats.mapCreatedAt)}.</p>
        </div>
      </div>

      <div className={CARD_FOOTER}>
        <NavigationToastAnchor href={product.mapHref} label={`Bản đồ ${product.name}`} className={BTN_PRIMARY}>
          <Network className="h-4 w-4" /> Mở bản đồ
        </NavigationToastAnchor>
        <NavigationToastAnchor href={`${product.readHref}/textbook`} label="Đọc sách" className={BTN_SECONDARY}>
          <BookOpen className="h-4 w-4" /> Đọc sách
        </NavigationToastAnchor>
        <NavigationToastAnchor href={`${product.readHref}/relations`} label="Quan hệ và căn cứ" className={BTN_SECONDARY}>
          <FileText className="h-4 w-4" /> Quan hệ và căn cứ
        </NavigationToastAnchor>
        <NavigationToastAnchor href={`${product.filesHref}/jsonl`} label="Tải maps_main.jsonl" className={BTN_SECONDARY}>
          <Download className="h-4 w-4" /> Tải maps_main.jsonl
        </NavigationToastAnchor>
      </div>
    </article>
  );
}

function AiCard({ stats }: { stats: KnowledgeStats }) {
  const { product } = stats;
  const files: [string, string][] = [
    ["Sách", productFile(product, "textbook")],
    ["Bảng quan hệ", productFile(product, "relations")],
    ["Tri thức cho AI", productFile(product, "jsonl")],
  ];
  return (
    <article className={CARD}>
      <div className={CARD_HEADER}>
        <div className="flex items-start gap-3">
          <div className={ICON_TILE}>
            <FileCode2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
            <p className="text-sm text-slate-600">Tệp để agent đọc trực tiếp</p>
          </div>
        </div>
      </div>

      <div className={CARD_BODY}>
        <ul className="space-y-3">
          {files.map(([label, file]) => (
            <li key={label}>
              <p className="text-sm font-semibold text-slate-700">{label}</p>
              <code className="mt-1 block break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">
                {file}
              </code>
            </li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed text-slate-600">
          Sách khoảng {formatNumber(stats.bookTokens)} token (ước tính: ký tự chia {stats.charsPerToken}, chưa đo bằng
          Qwen). Ngân sách trong cấu hình: {formatNumber(stats.tokenBudget)}.
        </p>
      </div>

      <div className={CARD_FOOTER}>
        <CopyPromptButton text={buildPrompt(stats)} />
      </div>
    </article>
  );
}

function StatusCard({ stats }: { stats: KnowledgeStats }) {
  return (
    <article className={CARD}>
      <div className={CARD_HEADER}>
        <h3 className="text-lg font-bold text-slate-900">{stats.product.name}</h3>
      </div>
      <div className="space-y-2.5 p-5 text-sm leading-relaxed text-slate-700">
        <p>Bản đồ sinh lúc {formatTime(stats.mapCreatedAt)}.</p>
        <p>
          Sách cập nhật lúc {formatTime(stats.bookUpdatedAt)}. {freshnessText(stats)}
        </p>
        {stats.bookWarnings.length === 0 ? (
          <p className="text-slate-500">Không có cảnh báo trong sách.</p>
        ) : (
          stats.bookWarnings.map((warning) => (
            <p key={warning} className="flex gap-2 text-amber-700">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {warning}
            </p>
          ))
        )}
        {stats.outputWarnings.map((warning) => (
          <p key={warning} className="flex gap-2 text-amber-700">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Khi sinh bản đồ: {warning}
          </p>
        ))}
      </div>
    </article>
  );
}

function LegendRow({ tone, label, children }: { tone: "ok" | "warn" | "muted"; label: string; children: React.ReactNode }) {
  const toneClass = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-700",
    muted: "border-slate-200 bg-slate-100 text-slate-600",
  }[tone];
  return (
    <li className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
      <span className={`inline-flex w-fit shrink-0 rounded-md border px-2.5 py-0.5 text-xs font-bold ${toneClass}`}>
        {label}
      </span>
      <span className="text-sm leading-relaxed text-slate-700">{children}</span>
    </li>
  );
}

export default function KnowledgeHub({ product }: { product: ProductKey }) {
  const all = [loadKnowledge(PRODUCTS[product])];
  const legend = LEGEND_BY_PRODUCT[product];

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent px-4 pb-6 pt-1 sm:px-6 sm:pb-8 sm:pt-2">
      <div className="mx-auto w-full max-w-6xl space-y-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <div className={ICON_TILE}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900">Knowledge · Semantic City Map</h1>
                <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700">
                  {PRODUCTS[product].name}
                </span>
              </div>
              <p className="hidden text-sm leading-relaxed text-slate-600 sm:block">
                Cùng một bộ dữ liệu sinh ra hai đầu ra: một bản đồ cho người xem và một cuốn sách cho AI đọc.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <section className="space-y-3 lg:col-span-3">
            <h2 className={SECTION_TITLE}>Sản phẩm</h2>
            {all.map((stats) => (
              <ProductCard key={stats.product.key} stats={stats} />
            ))}
          </section>

          <section className="space-y-3 lg:col-span-2">
            <h2 className={SECTION_TITLE}>Cho AI</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Sách là tài liệu chính; maps_main.jsonl là dữ liệu gốc, cùng id với bản đồ.
            </p>
            {all.map((stats) => (
              <AiCard key={stats.product.key} stats={stats} />
            ))}
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className={SECTION_TITLE}>Mức tin cậy</h2>
            <article className={CARD}>
              <div className="space-y-4 p-5">
                <ul className="space-y-3">
                  <LegendRow tone="ok" label={legend.label}>
                    {legend.text}
                  </LegendRow>
                  <LegendRow tone="warn" label="Chưa xác minh">
                    Có tín hiệu nhưng chưa đủ căn cứ. Sách liệt kê riêng ở mục 8.
                  </LegendRow>
                  <LegendRow tone="muted" label="Không đưa vào sách">
                    Quan hệ chỉ được nhắc đến hoặc suy đoán. Chúng không có trong sách.
                  </LegendRow>
                </ul>
                <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                  Quận và khu phố trên bản đồ chỉ là cách trình bày cho dễ nhìn, không phải cấu trúc thật của hệ thống.
                  Sách không dùng hai từ này.
                </p>
              </div>
            </article>
          </section>

          <section className="space-y-3">
            <h2 className={SECTION_TITLE}>Tình trạng</h2>
            {all.map((stats) => (
              <StatusCard key={stats.product.key} stats={stats} />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
