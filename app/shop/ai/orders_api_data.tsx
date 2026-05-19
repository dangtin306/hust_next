export type PostsApiItem = {
  title?: string;
  description?: string;
  createdate?: string;
};

export type RelatedPostItem = {
  id?: string | number;
  uri?: string;
  title?: string;
  description?: string;
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
};

const POSTS_CACHE_TTL_SECONDS = 60 * 60;
const SHOULD_CACHE_BY_DEFAULT = process.env.NODE_ENV !== "development";

type GetOrdersPostMetaOptions = {
  useCache?: boolean;
};

export async function getOrdersPostMeta(
  uri: string,
  options: GetOrdersPostMetaOptions = {}
): Promise<OrdersPostMetaResponse> {
  const normalizedUri = String(uri || "").trim();
  if (!normalizedUri) return { post: null, relatedPosts: [] };
  const useCache = options.useCache ?? SHOULD_CACHE_BY_DEFAULT;

  try {
    const response = await fetch(
      `https://hust.media/api/content/getdata.php?uri=${encodeURIComponent(normalizedUri)}&mode=posts`,
      useCache
        ? { next: { revalidate: POSTS_CACHE_TTL_SECONDS } }
        : { cache: "no-store" }
    );

    if (!response.ok) return { post: null, relatedPosts: [] };
    const payload = (await response.json()) as PostsApiPayload;
    const data = payload?.data;
    const relatedPostsRaw = Array.isArray(payload?.related_posts) ? payload.related_posts : [];
    const relatedPosts = relatedPostsRaw
      .map((item) => ({
        id: item?.id,
        uri: typeof item?.uri === "string" ? item.uri : "",
        title: typeof item?.title === "string" ? item.title : "",
        description: typeof item?.description === "string" ? item.description : "",
        thumbnail_image: typeof item?.thumbnail_image === "string" ? item.thumbnail_image : "",
        image: typeof item?.image === "string" ? item.image : "",
      }))
      .filter((item) => item.uri);

    if (!data || typeof data !== "object") {
      return { post: null, relatedPosts };
    }

    return {
      post: {
        title: typeof data.title === "string" ? data.title : "",
        description: typeof data.description === "string" ? data.description : "",
        createdate: typeof data.createdate === "string" ? data.createdate : "",
      },
      relatedPosts,
    };
  } catch {
    return { post: null, relatedPosts: [] };
  }
}
