import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

const docsDir = path.join(process.cwd(), "src", "content", "docs");

const navItems = [
  { title: "Overview", slug: "overview" },
  { title: "Architecture", slug: "architecture" },
  { title: "Algorithm", slug: "algorithm" },
];

type DocData = {
  title: string;
  description: string;
  source: string;
};

function slugToTitle(slug: string) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractTitleAndDescription(source: string, slug: string) {
  const lines = source.split(/\r?\n/);
  let title = "";
  let index = 0;

  for (; index < lines.length; index++) {
    const line = lines[index].trim();
    const match = /^#\s+(.+)/.exec(line);
    if (match) {
      title = match[1].trim();
      index++;
      break;
    }
  }

  if (!title) {
    title = slugToTitle(slug);
  }

  const descriptionLines: string[] = [];
  for (; index < lines.length; index++) {
    const line = lines[index].trim();
    if (!line) {
      if (descriptionLines.length) break;
      continue;
    }
    descriptionLines.push(line);
  }

  let description = descriptionLines.join(" ");
  description = description
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!description) {
    description = `Documentation for ${title}.`;
  }

  if (description.length > 160) {
    description = `${description.slice(0, 157).trimEnd()}...`;
  }

  return { title, description };
}

async function getDocBySlug(slug: string): Promise<DocData | null> {
  const filePath = path.join(docsDir, `${slug}.mdx`);

  try {
    const source = await readFile(filePath, "utf8");
    const { title, description } = extractTitleAndDescription(source, slug);
    return { title, description, source };
  } catch {
    return null;
  }
}

function isDocAvailable(slug: string) {
  return existsSync(path.join(docsDir, `${slug}.mdx`));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  const title = doc?.title ?? slugToTitle(slug);
  const description = doc?.description ?? `Documentation for ${title}.`;

  return {
    title: `${title} | Hust Media`,
    description,
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

  const nav = navItems.map((item) => ({
    ...item,
    available: isDocAvailable(item.slug),
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-6 py-12">
        <aside className="w-60 shrink-0">
          <div className="sticky top-10">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-5 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Docs
              </p>
              <nav className="mt-4 space-y-1">
                {nav.map((item) => {
                  const isActive = item.slug === slug;
                  const baseClass =
                    "block rounded-lg px-3 py-2 text-sm transition";

                  if (!item.available) {
                    return (
                      <span
                        key={item.slug}
                        className={`${baseClass} cursor-not-allowed text-slate-500`}
                      >
                        {item.title}
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={item.slug}
                      href={`/docs/${item.slug}`}
                      className={`${baseClass} ${
                        isActive
                          ? "bg-slate-800 text-white"
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

        <main className="min-w-0 flex-1">
          <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="prose prose-invert max-w-none">
              <MDXRemote source={doc.source} />
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
