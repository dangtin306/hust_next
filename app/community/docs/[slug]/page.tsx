import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import DocsHelpfulFeedback from "./DocsHelpfulFeedback";
import DocsArticleActions from "./DocsArticleActions";
import TocNavClient from "./TocNavClient";
import { getDocPostMeta } from "./docs_api_data";

const resolveDocsDir = () => {
  const candidates = [
    path.join(process.cwd(), "src", "content", "docs"),
    path.join(process.cwd(), "hust_next", "src", "content", "docs"),
    path.join(process.cwd(), "..", "hust_next", "src", "content", "docs"),
    path.join(process.cwd(), "..", "src", "content", "docs"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  return candidates[0];
};

const docsDir = resolveDocsDir();
const defaultOrderMap: Record<string, number> = {
  overview: 1,
  architecture: 2,
  gamification_logic: 3,
  algorithm: 3,
};

type Frontmatter = {
  title?: string;
  description?: string;
  order?: string;
  chapter?: string;
  [key: string]: string | undefined;
};

type DocData = {
  frontmatter: Frontmatter;
  content: string;
};

type DocSummary = {
  slug: string;
  title: string;
  description: string;
  order: number;
  thumbnail: string;
};

type TocItem = {
  id: string;
  title: string;
  depth: 2 | 3;
};

const defaultDocThumbnail = "https://hust.media/img/credit_verification_thumbnail.png";

const docSlugAlias: Record<string, string> = {
  gamification: "validation-workflow",
};

function slugToTitle(slug: string) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function splitFrontmatter(source: string): {
  frontmatter: Frontmatter;
  content: string;
} {
  const lines = source.split(/\r?\n/);
  if (lines.length < 3 || lines[0].trim() !== "---") {
    return { frontmatter: {}, content: source };
  }

  const frontmatterLines: string[] = [];
  let endIndex = -1;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIndex = i;
      break;
    }
    frontmatterLines.push(lines[i]);
  }

  if (endIndex === -1) {
    return { frontmatter: {}, content: source };
  }

  const frontmatter: Frontmatter = {};
  for (const line of frontmatterLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    frontmatter[key] = value;
  }

  return {
    frontmatter,
    content: lines.slice(endIndex + 1).join("\n"),
  };
}

function extractTitleFromContent(content: string, slug: string) {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const match = /^#\s+(.+)/.exec(line.trim());
    if (match) {
      return match[1].trim();
    }
  }

  return slugToTitle(slug);
}

function toPlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/["'`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatUsDateTime(value: string) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, yyyy, mm, dd, hh, mi, ss] = match;
    return `${mm}/${dd}/${yyyy} ${hh}:${mi}:${ss}`;
  }
  return raw;
}

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    const withProps = node as { props?: { children?: ReactNode } };
    return getNodeText(withProps.props?.children ?? "");
  }

  return "";
}

function extractToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line.trim());
    if (h2) {
      const title = h2[1].trim();
      items.push({ id: slugifyHeading(title), title, depth: 2 });
      continue;
    }

    const h3 = /^###\s+(.+)$/.exec(line.trim());
    if (h3) {
      const title = h3[1].trim();
      items.push({ id: slugifyHeading(title), title, depth: 3 });
    }
  }

  const hasClosingAnchor = /\bid=["']reader-value-conclusion["']/.test(content);
  const hasClosingTocItem = items.some((item) => item.id === "reader-value-conclusion");
  if (hasClosingAnchor && !hasClosingTocItem) {
    items.push({
      id: "reader-value-conclusion",
      title: "Reader Value & Conclusion",
      depth: 2,
    });
  }

  return items;
}

function getDocOrder(frontmatter: Frontmatter, slug: string) {
  const orderValue = frontmatter.order ?? frontmatter.chapter;
  if (orderValue) {
    const numeric = Number(orderValue);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  const slugMatch = /^(\d+)[-_]/.exec(slug);
  if (slugMatch) {
    return Number(slugMatch[1]);
  }

  return defaultOrderMap[slug] ?? Number.POSITIVE_INFINITY;
}

async function getDocBySlug(slug: string): Promise<DocData | null> {
  const normalizedSlug = docSlugAlias[slug] ?? slug;
  const filePath = path.join(docsDir, `${normalizedSlug}.mdx`);

  try {
    const source = await readFile(filePath, "utf8");
    const { frontmatter, content } = splitFrontmatter(source);
    return { frontmatter, content };
  } catch {
    return null;
  }
}

async function getDocList(): Promise<DocSummary[]> {
  try {
    const entries = await readdir(docsDir, { withFileTypes: true });
    const docs = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
        .map(async (entry) => {
          const slug = entry.name.replace(/\.mdx$/, "");
          const source = await readFile(path.join(docsDir, entry.name), "utf8");
          const { frontmatter, content } = splitFrontmatter(source);
          const apiMeta = await getDocPostMeta(slug);
          const title =
            String(apiMeta?.title || "").trim() ||
            frontmatter.title?.trim() ||
            extractTitleFromContent(content, slug);
          const description =
            String(apiMeta?.description || "").trim() ||
            frontmatter.description?.trim() ||
            toPlainText(content).slice(0, 120).trim() ||
            "Technical note and implementation details.";
          const order = getDocOrder(frontmatter, slug);
          const thumbnail =
            String(apiMeta?.thumbnail_image || apiMeta?.image || "").trim() ||
            defaultDocThumbnail;
          return { slug, title, description, order, thumbnail };
        })
    );

    return docs.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  const postMeta = await getDocPostMeta(slug);
  const frontmatter = doc?.frontmatter ?? {};
  const content = doc?.content ?? "";
  const fallbackTitle = extractTitleFromContent(content, slug);
  const title = String(postMeta?.title || "").trim() || frontmatter.title?.trim() || fallbackTitle;
  let description = String(postMeta?.description || "").trim() || frontmatter.description?.trim() || "";

  if (!description) {
    const plainText = toPlainText(content);
    description = plainText
      ? plainText.slice(0, 160).trim()
      : `Documentation for ${title}.`;
  }

  if (description.length > 160) {
    description = `${description.slice(0, 157).trimEnd()}...`;
  }

  const canonicalUrl = `https://docs.hust.media/next/community/docs/${slug}`;

  return {
    title: `${title} | Hust Media`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Hust Media`,
      description,
      url: canonicalUrl,
      siteName: "Hust Media",
      type: "article",
    },
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  if (!doc) {
    notFound();
  }

  const nav = await getDocList();
  const tocItems = extractToc(doc.content);
  const postMeta = await getDocPostMeta(slug);
  const apiTitle = String(postMeta?.title || "").trim();
  const docDescription =
    String(postMeta?.description || "").trim() || doc.frontmatter.description?.trim() || "";
  const docTitle =
    apiTitle || doc.frontmatter.title?.trim() || "";
  const writtenDateLabel = "Written date:";
  const writtenDateValue = formatUsDateTime(String(postMeta?.createdate || "").trim());
  const categoryLabel = String(postMeta?.tips_hash_name || "").trim() || "Hust Media";

  const mdxComponents = {
    h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => {
      const headingText = getNodeText(children ?? "").trim();
      const shouldShowDescription =
        Boolean(docDescription) && (!docTitle || headingText === docTitle || Boolean(apiTitle));
      const headingClass = [
        props.className,
        "min-w-0 flex-1 text-balance text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl !mt-0 !mb-0",
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <>
          <div className="flex items-start justify-between gap-3">
            <h1 {...props} className={headingClass}>
              {children}
            </h1>
            <a
              href="/ai/utility/home_notes"
              className="not-prose inline-flex shrink-0 items-center rounded-2xl border border-pink-200 bg-pink-50 !px-3 !py-1.5 !text-[14.5px] !leading-5 font-semibold !text-slate-900 no-underline shadow-sm transition hover:bg-pink-100 hover:!text-slate-900 hover:no-underline active:scale-[0.98]"
            >
              Back to Notes
            </a>
          </div>
          {shouldShowDescription ? (
            <div className="mt-3 w-full text-sm leading-relaxed text-slate-600 sm:text-base">
              {docDescription}
            </div>
          ) : null}
          {(writtenDateValue || categoryLabel) ? (
            <div className="mb-9 mt-3.5 flex min-w-0 flex-row flex-nowrap items-center gap-2 text-xs text-slate-500 sm:flex-wrap sm:gap-x-3 sm:gap-y-2 sm:text-sm">
              {writtenDateValue ? (
                <span className="inline-flex min-w-0 flex-1 items-start gap-2 rounded-full bg-slate-100 px-3 py-1 sm:flex-none sm:w-auto">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-slate-500"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 3v2M17 3v2M4 8h16M6 12h4m-4 4h6m9-8v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="min-w-0 whitespace-normal break-words leading-tight">
                    {writtenDateLabel}{" "}
                    <span className="font-medium text-slate-700">{writtenDateValue}</span>
                  </span>
                </span>
              ) : null}
              {categoryLabel ? (
                <span className="inline-flex max-w-[44%] shrink-0 items-center whitespace-nowrap rounded-full border border-[#D8E0E8] bg-[#EEF2F6] px-2.5 py-1 font-semibold text-[#5E6B7A] sm:max-w-none">
                  {categoryLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      );
    },
    h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => {
      const title = getNodeText(children ?? "");
      const id = slugifyHeading(title);
      const headingClass = [props.className, "!text-[1.2175rem] !font-semibold"]
        .filter(Boolean)
        .join(" ");
      return (
        <h2 id={id} {...props} className={headingClass}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => {
      const title = getNodeText(children ?? "");
      const id = slugifyHeading(title);
      return (
        <h3 id={id} {...props}>
          {children}
        </h3>
      );
    },
    pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => (
      (() => {
        const rawCode = getNodeText(children ?? "").trim();
        const isSingleLine = rawCode.length > 0 && !rawCode.includes("\n");
        const preClass = [
          props.className,
          "max-h-[280px] overflow-y-auto text-[12px] leading-5",
          isSingleLine ? "py-1.5" : "py-2.5",
        ]
          .filter(Boolean)
          .join(" ");
        return (
      <pre
        {...props}
        className={preClass}
      >
        {children}
      </pre>
        );
      })()
    ),
    img: ({ alt, ...props }: ComponentPropsWithoutRef<"img">) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        alt={alt ?? ""}
        className={[props.className, "mx-auto my-2 w-[92%] max-w-[92%]"].filter(Boolean).join(" ")}
      />
    ),
  };

  const docsPanel = (
    <section className="rounded-2xl border border-blue-100/80 bg-blue-50/90 px-3 py-3 text-left shadow-sm backdrop-blur-md">
      <h2 className="mt-2 text-center text-lg font-semibold text-slate-800">
        Docs
      </h2>
      <nav className="mt-4 space-y-2">
        {nav.map((item) => {
          const isActive = item.slug === slug;
          const baseClass =
            "block rounded-xl border p-2.5 no-underline transition";

          return (
            <Link
              key={item.slug}
              href={`/community/docs/${item.slug}`}
              className={`${baseClass} ${
                isActive
                  ? "border-emerald-300/90 bg-emerald-100/55"
                  : "border-blue-100/80 bg-blue-200/60 hover:border-blue-300/90 hover:bg-blue-200/80"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  loading="lazy"
                  className="h-14 w-20 flex-none rounded-lg border border-blue-100/80 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-snug text-black">
                    {item.title}
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
                    {item.description}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </section>
  );

  return (
    <div className="relative min-h-screen bg-transparent text-slate-700">
      <div
        className="mx-auto relative z-10 mt-4 flex w-full max-w-[1320px] flex-col gap-3 overflow-x-hidden px-2 pb-8 pt-3 lg:mt-4 lg:flex-row lg:gap-3 lg:px-8 xl:px-12"
        style={{ ["--tool-col" as string]: "clamp(215px, 21.5vw, 280px)" }}
      >
        <aside className="w-full lg:w-[var(--tool-col)] lg:flex-none">
          <div className="">
            <div className="space-y-3">
              {tocItems.length > 0 && (
                <section className="rounded-2xl border border-blue-100/80 bg-blue-50/90 px-4 pb-4 pt-3 text-slate-700 shadow-sm backdrop-blur-md">
                  <div className="max-lg:pt-1 lg:pt-4">
                    <div className="text-center text-lg font-semibold whitespace-nowrap text-slate-800">
                      Table of Contents
                    </div>
                    <TocNavClient items={tocItems} />
                  </div>
                </section>
              )}

              <div className="hidden lg:block">
                {docsPanel}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 w-full flex-1">
          <article className="rounded-3xl border border-slate-200/70 bg-white/85 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
            <div className="max-lg:px-1 lg:px-7 pb-4 pt-0 sm:pb-4 max-lg:pt-7 lg:pt-12">
              <div className="prose max-w-none prose-headings:text-slate-900 prose-p:text-[15px] prose-p:leading-[1.62] prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-[15px] prose-li:leading-[1.62] prose-li:text-slate-700 prose-a:text-blue-700 prose-h2:text-[1.28rem] prose-h3:text-[1.06rem] prose-h2:mt-5 prose-h2:mb-2 prose-h3:mt-5 prose-h3:mb-2 prose-hr:my-3 prose-pre:my-2.5 prose-pre:py-2.5 prose-pre:px-3 prose-img:my-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-code:text-[12px] [&>*:last-child]:!mb-0 [&>h2:first-of-type]:!mt-0 [&>h2]:lg:pl-2 [&>h2~p]:lg:pl-2 [&>h2~ul]:lg:pl-2 [&>h2~ol]:lg:pl-2 [&>h2~pre]:lg:pl-2 [&>h2~hr]:lg:pl-2 [&>h2~div]:lg:pl-2">
                <MDXRemote source={doc.content} components={mdxComponents} />
              </div>
              <DocsArticleActions
                writtenDateLabel={writtenDateLabel}
                writtenDateValue={writtenDateValue}
                title={docTitle || apiTitle || "Hust Media"}
                description={docDescription}
              />
            </div>
          </article>
          <div className="mt-2 lg:hidden">
            {docsPanel}
          </div>
          <DocsHelpfulFeedback />
        </main>
      </div>
    </div>
  );
}
