export type PostsApiItem = {
  title?: string;
  description?: string;
  createdate?: string;
};

type PostsApiPayload = {
  status?: number;
  data?: PostsApiItem | null;
};

const POSTS_CACHE_TTL_SECONDS = 60 * 60;

type GetOrdersPostMetaOptions = {
  useCache?: boolean;
};

export async function getOrdersPostMeta(
  uri: string,
  options: GetOrdersPostMetaOptions = {}
): Promise<PostsApiItem | null> {
  const normalizedUri = String(uri || "").trim();
  if (!normalizedUri) return null;
  const useCache = options.useCache !== false;

  try {
    const response = await fetch(
      `https://hust.media/api/content/getdata.php?uri=${encodeURIComponent(normalizedUri)}&mode=posts`,
      useCache
        ? { next: { revalidate: POSTS_CACHE_TTL_SECONDS } }
        : { cache: "no-store" }
    );

    if (!response.ok) return null;
    const payload = (await response.json()) as PostsApiPayload;
    const data = payload?.data;
    if (!data || typeof data !== "object") return null;

    return {
      title: typeof data.title === "string" ? data.title : "",
      description: typeof data.description === "string" ? data.description : "",
      createdate: typeof data.createdate === "string" ? data.createdate : "",
    };
  } catch {
    return null;
  }
}
