export type DocPostMeta = {
  title?: string;
  description?: string;
  thumbnail_image?: string;
  image?: string;
  createdate?: string;
  tips_hash_name?: string;
};

type DocPostMetaPayload = {
  status?: number;
  data?: DocPostMeta | null;
};

const POSTS_CACHE_TTL_SECONDS = 60 * 60;
const SHOULD_CACHE_BY_DEFAULT = process.env.NODE_ENV !== "development";

type GetDocPostMetaOptions = {
  useCache?: boolean;
};

export async function getDocPostMeta(
  uri: string,
  options: GetDocPostMetaOptions = {}
): Promise<DocPostMeta | null> {
  const normalizedUri = String(uri || "").trim();
  if (!normalizedUri) return null;
  const useCache = options.useCache ?? SHOULD_CACHE_BY_DEFAULT;

  try {
    const response = await fetch(
      `https://hust.media/api/content/getdata.php?uri=${encodeURIComponent(normalizedUri)}&mode=posts`,
      useCache
        ? { next: { revalidate: POSTS_CACHE_TTL_SECONDS } }
        : { cache: "no-store" }
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as DocPostMetaPayload;
    if (payload?.status !== 1 || !payload?.data) return null;
    return {
      title: typeof payload.data.title === "string" ? payload.data.title : "",
      description:
        typeof payload.data.description === "string" ? payload.data.description : "",
      thumbnail_image:
        typeof payload.data.thumbnail_image === "string"
          ? payload.data.thumbnail_image
          : "",
      image: typeof payload.data.image === "string" ? payload.data.image : "",
      createdate:
        typeof payload.data.createdate === "string" ? payload.data.createdate : "",
      tips_hash_name:
        typeof payload.data.tips_hash_name === "string" ? payload.data.tips_hash_name : "",
    };
  } catch {
    return null;
  }
}
