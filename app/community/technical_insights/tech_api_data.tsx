export type TechnicalInsightRelatedPost = {
  id?: string | number;
  uri: string;
  title: string;
  description: string;
  createdate: string;
  tips_hash_name: string;
  thumbnail_image: string;
  image: string;
};

export type TechnicalInsightPost = {
  uri: string;
  title: string;
  description: string;
  content: string;
  createdate: string;
  tips_hash_name: string;
  posts_type: string;
  relatedPosts: TechnicalInsightRelatedPost[];
};

type PostsApiPayload = {
  status?: number;
  data?: Partial<TechnicalInsightPost> | null;
  related_posts?: Array<Partial<TechnicalInsightRelatedPost>> | null;
};

const normalizeRelatedPost = (
  item: Partial<TechnicalInsightRelatedPost> | undefined,
): TechnicalInsightRelatedPost => ({
  id: item?.id,
  uri: typeof item?.uri === "string" ? item.uri : "",
  title: typeof item?.title === "string" ? item.title : "",
  description: typeof item?.description === "string" ? item.description : "",
  createdate: typeof item?.createdate === "string" ? item.createdate : "",
  tips_hash_name: typeof item?.tips_hash_name === "string" ? item.tips_hash_name : "",
  thumbnail_image: typeof item?.thumbnail_image === "string" ? item.thumbnail_image : "",
  image: typeof item?.image === "string" ? item.image : "",
});

export async function getTechnicalInsight(
  uri: string,
  options: { useCache?: boolean } = {},
): Promise<TechnicalInsightPost | null> {
  const normalizedUri = String(uri || "").trim();
  if (!normalizedUri) return null;

  try {
    const response = await fetch(
      `https://hust.media/api/content/getdata.php?uri=${encodeURIComponent(normalizedUri)}&mode=posts`,
      options.useCache === false
        ? { cache: "no-store" }
        : { next: { revalidate: 3600 } },
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as PostsApiPayload;
    const data = payload?.data;
    if (!data || typeof data !== "object") return null;

    return {
      uri: normalizedUri,
      title: typeof data.title === "string" ? data.title : normalizedUri,
      description: typeof data.description === "string" ? data.description : "",
      content: typeof data.content === "string" ? data.content : "",
      createdate: typeof data.createdate === "string" ? data.createdate : "",
      tips_hash_name: typeof data.tips_hash_name === "string" ? data.tips_hash_name : "Hust Media",
      posts_type: typeof data.posts_type === "string" ? data.posts_type : "html",
      relatedPosts: (Array.isArray(payload?.related_posts) ? payload.related_posts : [])
        .map(normalizeRelatedPost)
        .filter((item) => item.uri),
    };
  } catch {
    return null;
  }
}
