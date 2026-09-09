import type { ToolNoteContent } from "./orders_data";

export type PostsApiItem = {
  category?: string;
  title?: string;
  description?: string;
  createdate?: string;
  content?: string;
};

export type RelatedPostItem = {
  id?: string | number;
  uri?: string;
  title?: string;
  description?: string;
  createdate?: string;
  tips_hash_name?: string;
  thumbnail_image?: string;
  image?: string;
};

type PostsApiPayload = {
  status?: number;
  data?: PostsApiItem | null;
  related_posts?: RelatedPostItem[] | null;
};

export type OrdersPostMetaResponse = {
  post: PostsApiItem | null;
  relatedPosts: RelatedPostItem[];
  toolNote: ToolNoteContent | null;
};

const POSTS_CACHE_TTL_SECONDS = 60 * 60;
const SHOULD_CACHE_BY_DEFAULT = process.env.NODE_ENV !== "development";

type GetOrdersPostMetaOptions = {
  useCache?: boolean;
};

const splitToolFrontmatter = (source: string) => {
  const lines = source.split(/\r?\n/);
  if (lines.length < 3 || lines[0].trim() !== "---") {
    return { frontmatter: {}, body: source.trim() };
  }

  const frontmatter: Record<string, string> = {};
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === "---") {
      return { frontmatter, body: lines.slice(index + 1).join("\n").trim() };
    }
    const separatorIndex = lines[index].indexOf(":");
    if (separatorIndex === -1) continue;
    const key = lines[index].slice(0, separatorIndex).trim();
    const value = lines[index].slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    frontmatter[key] = value;
  }

  return { frontmatter: {}, body: source.trim() };
};

const parseToolNoteFromApi = (source: string): ToolNoteContent | null => {
  if (!String(source || "").trim()) return null;
  const { frontmatter, body } = splitToolFrontmatter(source);
  const sections = body.split(/^##\s+/m).map((section) => section.trim()).filter(Boolean);
  const byTitle = new Map<string, string>();

  sections.forEach((section) => {
    const [titleLine = "", ...rest] = section.split(/\r?\n/);
    byTitle.set(titleLine.trim().toLowerCase(), rest.join("\n").trim());
  });

  const articleBody = (byTitle.get("article body") || "")
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const technicalSnapshot = (byTitle.get("technical configuration snapshot") || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^-\s+/, "").trim())
    .filter(Boolean);
  const setupGuide = (byTitle.get("module setup guide") || byTitle.get("setup guide") || "").trim();
  const note: ToolNoteContent = {
    title: String(frontmatter.title || "").trim(),
    shortDescription: (byTitle.get("short description for the article card") || "").trim(),
    articleBody,
    technicalSnapshot,
    setupGuide,
  };

  return note.title || note.shortDescription || note.articleBody.length > 0 || note.technicalSnapshot.length > 0 || note.setupGuide
    ? note
    : null;
};

export async function getOrdersPostMeta(
  uri: string,
  options: GetOrdersPostMetaOptions = {}
): Promise<OrdersPostMetaResponse> {
  const normalizedUri = String(uri || "").trim();
  if (!normalizedUri) return { post: null, relatedPosts: [], toolNote: null };
  const useCache = options.useCache ?? SHOULD_CACHE_BY_DEFAULT;

  try {
    const response = await fetch(
      `https://hust.media/api/content/getdata_v2.php?uri=${encodeURIComponent(normalizedUri)}&mode=posts`,
      useCache
        ? { next: { revalidate: POSTS_CACHE_TTL_SECONDS } }
        : { cache: "no-store" }
    );

    if (!response.ok) return { post: null, relatedPosts: [], toolNote: null };
    const payload = (await response.json()) as PostsApiPayload;
    const data = payload?.data;
    const relatedPostsRaw = Array.isArray(payload?.related_posts) ? payload.related_posts : [];
    const relatedPosts = relatedPostsRaw
      .map((item) => ({
        id: item?.id,
        uri: typeof item?.uri === "string" ? item.uri : "",
        title: typeof item?.title === "string" ? item.title : "",
        description: typeof item?.description === "string" ? item.description : "",
        createdate: typeof item?.createdate === "string" ? item.createdate : "",
        tips_hash_name:
          typeof item?.tips_hash_name === "string" ? item.tips_hash_name : "",
        thumbnail_image: typeof item?.thumbnail_image === "string" ? item.thumbnail_image : "",
        image: typeof item?.image === "string" ? item.image : "",
      }))
      .filter((item) => item.uri);

    if (!data || typeof data !== "object") {
      return { post: null, relatedPosts, toolNote: null };
    }

    return {
      post: {
        category: typeof data.category === "string" ? data.category : "",
        title: typeof data.title === "string" ? data.title : "",
        description: typeof data.description === "string" ? data.description : "",
        createdate: typeof data.createdate === "string" ? data.createdate : "",
        content: typeof data.content === "string" ? data.content : "",
      },
      relatedPosts,
      toolNote: parseToolNoteFromApi(typeof data.content === "string" ? data.content : ""),
    };
  } catch {
    return { post: null, relatedPosts: [], toolNote: null };
  }
}
