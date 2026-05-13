import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import DocsHelpfulFeedback from "./DocsHelpfulFeedback";

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
const docThumbnailBySlug: Record<string, string> = {
  overview: "https://hust.media/img/hust_media_system_overview.jpg",
  architecture: "https://hust.media/img/architecture.jpg",
  gamification_logic: "https://hust.media/img/gamification_logic.jpg",
  algorithm: "https://hust.media/img/credit_verification_thumbnail.png",
  "api-reference": "https://hust.media/img/api_reference.jpg",
  "public-api-v3": "https://hust.media/img/api_reference.jpg",
  "security-threat-detection": "https://hust.media/img/community_signal_smaller_still.png",
  "validation-quality-workflow": "https://hust.media/img/text_speech_thumbnail.png",
};

function getDocThumbnail(slug: string) {
  return docThumbnailBySlug[slug] ?? defaultDocThumbnail;
}

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
  const filePath = path.join(docsDir, `${slug}.mdx`);

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
          const title = frontmatter.title?.trim() ||
            extractTitleFromContent(content, slug);
          const description =
            frontmatter.description?.trim() ||
            toPlainText(content).slice(0, 120).trim() ||
            "Technical note and implementation details.";
          const order = getDocOrder(frontmatter, slug);
          const thumbnail = getDocThumbnail(slug);
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
  const frontmatter = doc?.frontmatter ?? {};
  const content = doc?.content ?? "";
  const fallbackTitle = extractTitleFromContent(content, slug);
  const title = frontmatter.title?.trim() || fallbackTitle;
  let description = frontmatter.description?.trim() ?? "";

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

  const mdxComponents = {
    h2: ({ children, ...props }: { children?: ReactNode }) => {
      const title = getNodeText(children ?? "");
      const id = slugifyHeading(title);
      return (
        <h2 id={id} {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: { children?: ReactNode }) => {
      const title = getNodeText(children ?? "");
      const id = slugifyHeading(title);
      return (
        <h3 id={id} {...props}>
          {children}
        </h3>
      );
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-slate-700">
      <div
        className="mx-auto relative z-10 flex w-full max-w-[1320px] flex-col gap-3 px-2 py-8 lg:flex-row lg:gap-3 lg:px-8 xl:px-12"
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
                    <div className="max-lg:mt-3 lg:mt-5 space-y-1.5 sm:mt-4">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block w-full rounded-lg border border-blue-100/80 bg-blue-200/60 px-3 py-1.5 text-left text-sm font-medium text-black no-underline transition hover:border-blue-400/90 hover:bg-blue-300/65 sm:py-2"
                      >
                        {item.title}
                      </a>
                    ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="-mb-2 lg:mb-0 rounded-2xl border border-blue-100/80 bg-blue-50/90 px-3 py-3 text-left shadow-sm backdrop-blur-md">
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
            </div>
          </div>
        </aside>

        <main className="min-w-0 w-full flex-1">
          <article className="rounded-3xl border border-slate-200 bg-white py-6 px-3 shadow-sm sm:py-8 sm:px-8">
            <div className="prose max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700 prose-a:text-blue-700">
              <MDXRemote source={doc.content} components={mdxComponents} />
            </div>
          </article>
          <DocsHelpfulFeedback />
        </main>
      </div>
    </div>
  );
}
