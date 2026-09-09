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
  category: string;
  title: string;
  description: string;
  content: string;
  mdxSource: string;
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

type ContentIndexPayload = {
  status?: number;
  data?: Record<string, Array<Partial<TechnicalInsightRelatedPost>>> | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderInlineMarkdown = (value: string) => {
  let html = escapeHtml(value);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-pink-50 px-1.5 py-0.5 text-pink-700">$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return html;
};

const markdownToHtml = (source: string) => {
  const normalizedSource = String(source || "")
    .replace(/^\uFEFF/, "")
    .replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
  const lines = normalizedSource
    .split(/\r?\n/);
  const output: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] = [];
  let codeLanguage = "text";
  let inCode = false;
  let figure: string[] = [];
  let inFigure = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    output.push(`<p>${renderInlineMarkdown(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    output.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushCode = () => {
    if (code.length === 0) return;
    output.push(`<pre><code class="language-${escapeHtml(codeLanguage)}">${escapeHtml(code.join("\n"))}</code></pre>`);
    code = [];
  };
  const flushFigure = () => {
    if (figure.length === 0) return;
    output.push(figure.join("\n"));
    figure = [];
    inFigure = false;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (inFigure) {
      figure.push(line);
      if (trimmed.toLowerCase().startsWith("</figure>")) flushFigure();
      return;
    }
    if (trimmed.startsWith("<figure")) {
      flushParagraph();
      flushList();
      figure.push(line);
      inFigure = true;
      return;
    }
    if (trimmed.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        codeLanguage = trimmed.slice(3).trim() || "text";
        inCode = true;
      }
      return;
    }
    if (inCode) {
      code.push(line);
      return;
    }
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      // API articles use `##` for their top-level sections. Keep those sections
      // at the same visual level as the AI renderer's main article headings.
      const level = headingMatch[1].length >= 3 ? 3 : 2;
      output.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }
    const listMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      list.push(listMatch[1]);
      return;
    }
    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  if (inCode) flushCode();
  if (inFigure) flushFigure();
  return output.join("\n");
};

const stripFrontmatter = (source: string) =>
  String(source || "")
    .replace(/^\uFEFF/, "")
    .replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "")
    .trim();

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

const getCategoryPosts = async (
  category: string,
  activeUri: string,
  useCache: boolean,
) => {
  if (!category) return [] as TechnicalInsightRelatedPost[];

  try {
    const response = await fetch(
      "https://hust.media/api/content/get_content.php",
      useCache ? { next: { revalidate: 3600 } } : { cache: "no-store" },
    );
    if (!response.ok) return [];

    const payload = (await response.json()) as ContentIndexPayload;
    const categoryPosts = Array.isArray(payload?.data?.[category]) ? payload.data[category] : [];

    return categoryPosts
      .map(normalizeRelatedPost)
      .filter((item) => item.uri && item.uri !== activeUri);
  } catch {
    return [] as TechnicalInsightRelatedPost[];
  }
};

export async function getTechnicalInsight(
  uri: string,
  options: { useCache?: boolean } = {},
): Promise<TechnicalInsightPost | null> {
  const normalizedUri = String(uri || "").trim();
  if (!normalizedUri) return null;

  try {
    const response = await fetch(
      `https://hust.media/api/content/getdata_v2.php?uri=${encodeURIComponent(normalizedUri)}&mode=posts`,
      options.useCache === false
        ? { cache: "no-store" }
        : { next: { revalidate: 3600 } },
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as PostsApiPayload;
    const data = payload?.data;
    if (!data || typeof data !== "object") return null;

    const apiRelatedPosts = (Array.isArray(payload?.related_posts) ? payload.related_posts : [])
      .map(normalizeRelatedPost)
      .filter((item) => item.uri && item.uri !== normalizedUri);
    const category = typeof data.category === "string" ? data.category : "";
    const relatedPosts = apiRelatedPosts.length > 0
      ? apiRelatedPosts
      : await getCategoryPosts(category, normalizedUri, options.useCache !== false);

    const rawContent = typeof data.content === "string" ? data.content : "";
    return {
      uri: normalizedUri,
      category,
      title: typeof data.title === "string" ? data.title : normalizedUri,
      description: typeof data.description === "string" ? data.description : "",
      content: markdownToHtml(rawContent),
      mdxSource: stripFrontmatter(rawContent),
      createdate: typeof data.createdate === "string" ? data.createdate : "",
      tips_hash_name: typeof data.tips_hash_name === "string" ? data.tips_hash_name : "Hust Media",
      posts_type: typeof data.posts_type === "string" ? data.posts_type : "html",
      relatedPosts,
    };
  } catch {
    return null;
  }
}
