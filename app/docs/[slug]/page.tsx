import { readFile, readdir } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

const docsDir = path.join(process.cwd(), "src", "content", "docs");
const defaultOrderMap: Record<string, number> = {
  overview: 1,
  architecture: 2,
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
  order: number;
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
          const order = getDocOrder(frontmatter, slug);
          return { slug, title, order };
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

  const canonicalUrl = `https://docs.hust.media/next/docs/${slug}`;

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

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_12%_10%,rgba(236,72,153,0.26),transparent_60%),radial-gradient(900px_circle_at_88%_12%,rgba(59,130,246,0.26),transparent_60%),radial-gradient(700px_circle_at_50%_90%,rgba(56,189,248,0.16),transparent_65%),linear-gradient(135deg,rgba(236,72,153,0.08),rgba(59,130,246,0.08))]" />
      <div className="mx-auto relative z-10 flex w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-8 lg:px-6 lg:py-12">
        <aside className="w-full lg:w-60 lg:shrink-0">
          <div className="lg:sticky lg:top-10">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-slate-900/70 to-blue-500/10 px-4 py-5 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Docs
              </p>
              <nav className="mt-4 space-y-1">
                {nav.map((item) => {
                  const isActive = item.slug === slug;
                  const baseClass =
                    "block rounded-lg px-3 py-2 text-sm transition";

                  return (
                    <Link
                      key={item.slug}
                      href={`/docs/${item.slug}`}
                      className={`${baseClass} ${
                        isActive
                          ? "bg-gradient-to-r from-pink-500/20 to-blue-500/20 text-white"
                          : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                      }`}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        <main className="min-w-0 w-full flex-1">
          <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/10 via-slate-900/80 to-blue-500/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="prose prose-invert max-w-none">
              <MDXRemote source={doc.content} />
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
