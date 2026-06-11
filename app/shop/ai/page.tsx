import type { Metadata } from "next";
import OrdersHome from "@/app/shop/ai/orders_home";
import { getOrdersPostMeta } from "@/app/shop/ai/orders_api_data";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { seoByTool, type ToolNoteContent } from "@/app/shop/ai/orders_data";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

type PageProps = {
  searchParams: Promise<{ slug_2?: string | string[] }>;
};

const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text", "translate_vi_en", "text_workflow"]);

const normalizeSlug2 = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

const normalizeLang = (value: string) =>
  String(value || "").toLowerCase() === "vi" ? "vi" : "en";
const isLocalHost = (host: string) => {
  const value = String(host || "").toLowerCase();
  return value.includes("localhost") || value.includes("127.0.0.1") || value.includes("::1");
};

const resolveToolNotePath = (slug: string) => {
  const fileName = `${slug}_note.mdx`;
  const candidates = [
    path.join(process.cwd(), "app", "shop", "ai", "text", fileName),
    path.join(process.cwd(), "app", "shop", "ai", fileName),
    path.join(process.cwd(), "hust_next", "app", "shop", "ai", "text", fileName),
    path.join(process.cwd(), "hust_next", "app", "shop", "ai", fileName),
    path.join(process.cwd(), "..", "hust_next", "app", "shop", "ai", "text", fileName),
    path.join(process.cwd(), "..", "hust_next", "app", "shop", "ai", fileName),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  return candidates[0];
};

const splitFrontmatter = (source: string) => {
  const lines = source.split(/\r?\n/);
  if (lines.length < 3 || lines[0].trim() !== "---") {
    return { frontmatter: {}, body: source.trim() };
  }

  const frontmatter: Record<string, string> = {};

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      return { frontmatter, body: lines.slice(i + 1).join("\n").trim() };
    }
    const line = lines[i].trim();
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    frontmatter[key] = value;
  }

  return { frontmatter: {}, body: source.trim() };
};

const parseToolNote = (source: string): ToolNoteContent | null => {
  const { frontmatter, body } = splitFrontmatter(source);
  const sections = body.split(/^##\s+/m).map((section) => section.trim()).filter(Boolean);
  const byTitle = new Map<string, string>();

  sections.forEach((section) => {
    const [titleLine = "", ...rest] = section.split(/\r?\n/);
    byTitle.set(titleLine.trim().toLowerCase(), rest.join("\n").trim());
  });

  const shortDescriptionRaw = byTitle.get("short description for the article card") || "";
  const articleBodyRaw = byTitle.get("article body") || "";
  const technicalSnapshotRaw = byTitle.get("technical configuration snapshot") || "";
  const setupGuideRaw =
    byTitle.get("module setup guide") ||
    byTitle.get("setup guide") ||
    "";

  const shortDescription = shortDescriptionRaw.trim();
  const articleBody = articleBodyRaw
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const technicalSnapshot = technicalSnapshotRaw
    .split(/\r?\n/)
    .map((line) => line.replace(/^-\s+/, "").trim())
    .filter(Boolean);
  const setupGuide = setupGuideRaw.trim();
  const title = String(frontmatter.title || "").trim();

  if (!title && !shortDescription && articleBody.length === 0 && technicalSnapshot.length === 0 && !setupGuide) {
    return null;
  }

  return {
    title,
    shortDescription,
    articleBody,
    technicalSnapshot,
    setupGuide,
  };
};

const getToolNote = async (slug: string): Promise<ToolNoteContent | null> => {
  try {
    const source = await readFile(resolveToolNotePath(slug), "utf8");
    return parseToolNote(source);
  } catch {
    return null;
  }
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const slug_2 = normalizeSlug2(query.slug_2);

  if (!ALLOWED_TOOLS.has(slug_2)) return {};

  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("national_market")?.value || "en");
  const seo = seoByTool[slug_2 as keyof typeof seoByTool][lang];

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: "https://hust.media",
      images: ["https://hust.media/reactapp/hustmedia.ico"],
    },
  };
}

export default async function ShopAiPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const slug_2 = normalizeSlug2(query.slug_2);

  if (!ALLOWED_TOOLS.has(slug_2)) {
    notFound();
  }
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "";
  const cookieStore = await cookies();
  const initialLang = normalizeLang(cookieStore.get("national_market")?.value || "en");
  const initialPostsApiData = await getOrdersPostMeta(slug_2, { useCache: !isLocalHost(host) });
  const initialToolNote = await getToolNote(slug_2);

  return (
    <OrdersHome
      slug_1="orders_once"
      slug_2={slug_2}
      initialPostsApiData={initialPostsApiData}
      initialLang={initialLang}
      initialToolNote={initialToolNote}
    />
  );
}
