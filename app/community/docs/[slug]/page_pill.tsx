import Link from "next/link";

type NavItem = {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  createdate: string;
  tips_hash_name: string;
};

type DocsRelatedInsightsPanelProps = {
  slug: string;
  nav: NavItem[];
};

type MetaPillProps = {
  label: string;
  Icon: ({ className }: { className?: string }) => React.JSX.Element;
  className?: string;
};

function CalendarIcon({ className = "" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7.5 2.75v2.5M16.5 2.75v2.5M3.75 8.75h16.5M6 4.75h12A2.25 2.25 0 0 1 20.25 7v11A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V7A2.25 2.25 0 0 1 6 4.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TagIcon({ className = "" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M10.25 4.75H6.75A2.25 2.25 0 0 0 4.5 7v4.043a2.25 2.25 0 0 0 .659 1.591l5.707 5.707a2.25 2.25 0 0 0 3.182 0l4.293-4.293a2.25 2.25 0 0 0 0-3.182l-5.909-5.909a2.25 2.25 0 0 0-1.591-.659Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.25" cy="8.25" r="1.1" fill="currentColor" />
    </svg>
  );
}

function MetaPill({ label, Icon, className = "" }: MetaPillProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div
        className={`inline-flex items-center rounded-full whitespace-nowrap px-1.5 py-2 text-slate-600 ${className}`.trim()}
        style={{
          lineHeight: 1
        }}
      >
        <div className="flex items-center gap-1 whitespace-nowrap leading-none"
          style={{
            lineHeight: 1,
            paddingTop: 0,
            paddingBottom: 0,
          }}>
          <Icon className="block shrink-0" />
          <div
            className="block whitespace-nowrap text-[11px] leading-none"
            style={{
              lineHeight: 1,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelatedPostDate(dateRaw: string) {
  const value = String(dateRaw || "").trim();
  if (!value) return "";

  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;

  return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
}

/**
 * @param {DocsRelatedInsightsPanelProps} props
 */
export function DocsRelatedInsightsPanel({
  slug,
  nav,
}: DocsRelatedInsightsPanelProps) {
  return (
    <section className="rounded-2xl border border-blue-100/80 bg-blue-50/90 px-3 py-3 text-left shadow-sm backdrop-blur-md">
      <h2 className="mt-2 text-center text-lg font-semibold text-slate-800">
        Related Insights
      </h2>
      <div className="mt-4 space-y-2">
        {nav.map((item) => {
          const uri = String(item?.slug || "").trim();
          if (!uri) return null;
          const title = String(item?.title || "").trim();
          const description = String(item?.description || "").trim();
          const image = String(item?.thumbnail || "").trim();
          const hashName =
            String(item?.tips_hash_name || "").trim() || "Hust Media";
          const dateRaw = String(item?.createdate || "").trim();
          const dateLabel = formatRelatedPostDate(dateRaw);
          const isActive = uri === slug;
          const href = `/community/docs/${uri}`;
          const key = String(item?.slug || uri);

          return (
            <Link
              key={key}
              href={href}
              className={`block no-underline rounded-xl border p-2.5 transition ${isActive
                ? "border-emerald-300/90 bg-emerald-100/55"
                : "border-blue-100/80 bg-blue-200/60 hover:border-blue-300/90 hover:bg-blue-200/80"
                }`}
            >
              <div className="flex items-start gap-2.5">
                {image ? (
                  <img
                    src={image}
                    alt={title || "related insight"}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="h-14 w-20 flex-none rounded-lg border border-blue-100/80 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-snug text-black">
                    {title}
                  </div>
                  <div
                    className="mt-1 text-xs leading-relaxed text-slate-500"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {description}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                {dateLabel ? (
                  <MetaPill
                    label={dateLabel}
                    Icon={CalendarIcon}
                    className="border border-slate-300/80 bg-slate-200/80"
                  />
                ) : null}
                <MetaPill
                  label={hashName}
                  Icon={TagIcon}
                  className="border border-slate-300/80 bg-slate-200/80"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
