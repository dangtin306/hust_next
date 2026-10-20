/* eslint-disable @typescript-eslint/no-explicit-any */
import { compileMDX } from "next-mdx-remote/rsc";
import { type CSSProperties, type ReactNode } from "react";
import { DocsMdxPre } from "@/app/community/docs/[slug]/DocsCodeBlock";

const buildDocImageStyle = (style: CSSProperties | undefined): CSSProperties => ({
  width: "92%",
  maxWidth: "92%",
  height: "auto",
  aspectRatio: "auto 16 / 9",
  ...style,
});

const getNodeText = (node: unknown): string => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return getNodeText((node as { props?: { children?: ReactNode } }).props?.children ?? "");
  }
  return "";
};

const slugifyHeading = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/["'`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const escapeMdxPlaceholders = (source: string) =>
  source.replace(/<([A-Z][A-Z0-9_]+)>/g, "&lt;$1&gt;");

const cssPropertyToReact = (property: string) =>
  property.startsWith("--")
    ? property
    : property.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());

const voidMdxElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "param",
  "source",
  "track",
  "wbr",
]);

const normalizeMdxFragment = (source: string) =>
  source
    .replace(/<!doctype\b[^>]*>/gi, "")
    .replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<\/?meta\b[^>]*\/?>/gi, "")
    .replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi, "")
    .replace(/<\/?(?:html|body|article)\b[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "<br />")
    .replace(/<\/(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\s*>/gi, "")
    .replace(/<([A-Za-z][\w:-]*)(\s[^<>]*?)?\/?>/g, (tag, tagName: string) => {
      const normalizedTag = tag.replace(/\sstyle=(["'])([\s\S]*?)\1/i, (_match, _quote: string, css: string) => {
        const declarations = css
          .split(";")
          .map((declaration) => {
            const separator = declaration.indexOf(":");
            if (separator < 1) return null;
            const property = cssPropertyToReact(declaration.slice(0, separator).trim());
            const value = declaration.slice(separator + 1).trim();
            return property && value ? `${JSON.stringify(property)}:${JSON.stringify(value)}` : null;
          })
          .filter((declaration): declaration is string => declaration !== null);

        return declarations.length > 0 ? ` style={{${declarations.join(",")}}}` : "";
      });

      if (voidMdxElements.has(tagName.toLowerCase()) && !normalizedTag.endsWith("/>")) {
        return `${normalizedTag.slice(0, -1).trimEnd()} />`;
      }

      return normalizedTag;
    });

const normalizeMdxSource = (source: string) =>
  source
    .split(/(```[\s\S]*?(?:```|$))/g)
    .map((part) => (part.startsWith("```") ? part : normalizeMdxFragment(part)))
    .join("");

const plainTextFallback = (source: string) =>
  source
    .replace(/```[^\n]*\n([\s\S]*?)```/g, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6]|section|article)\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s?/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export type TechClosingNotes = { readerValue: string; conclusion: string } | null;

const stripSectionDividers = (value: string) =>
  value
    .replace(/(^|\n)\s*---\s*(?=\n|$)/g, "$1")
    .replace(/\s*---\s*$/, "")
    .trim();

export const splitClosingNotes = (source: string): { mainSource: string; closingNotes: TechClosingNotes } => {
  const readerValue = /^##\s+Reader Value\s*$/m;
  const conclusion = /^##\s+Conclusion\s*$/m;
  const readerMatch = readerValue.exec(source);
  const conclusionMatch = conclusion.exec(source);
  if (!readerMatch || !conclusionMatch || conclusionMatch.index <= readerMatch.index) {
    return { mainSource: source, closingNotes: null };
  }

  const readerStart = readerMatch.index + readerMatch[0].length;
  const readerValueText = stripSectionDividers(source.slice(readerStart, conclusionMatch.index));
  const conclusionStart = conclusionMatch.index + conclusionMatch[0].length;
  const conclusionText = stripSectionDividers(source.slice(conclusionStart));
  if (!readerValueText || !conclusionText) {
    return { mainSource: source, closingNotes: null };
  }
  return {
    mainSource: source.slice(0, readerMatch.index).replace(/\s+$/, ""),
    closingNotes: { readerValue: readerValueText, conclusion: conclusionText },
  };
};

const mdxComponents: Record<string, any> = {
  h1: ({ children, ...props }: any) => (
    <h1 {...props} className={[props.className, "text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl !mt-0 !mb-0"].filter(Boolean).join(" ")}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => {
    const id = slugifyHeading(getNodeText(children));
    return <h2 id={id} {...props} className={[props.className, "!text-[1.2175rem] !font-semibold"].filter(Boolean).join(" ")}>{children}</h2>;
  },
  h3: ({ children, ...props }: any) => {
    const id = slugifyHeading(getNodeText(children));
    return <h3 id={id} {...props} className={[props.className].filter(Boolean).join(" ")}>{children}</h3>;
  },
  ul: ({ children, className, ...props }: any) => (
    <div {...props} className={[className, "my-2 space-y-2"].filter(Boolean).join(" ")}>{children}</div>
  ),
  li: ({ children, className, ...props }: any) => (
    <div {...props} className={[className, "relative pl-5 sm:pl-6 leading-[1.62] text-slate-700"].filter(Boolean).join(" ")}>
      <span aria-hidden="true" className="absolute left-1.5 top-[11px] h-[5px] w-[5px] rounded-full bg-emerald-500/90" />
      {children}
    </div>
  ),
  pre: ({ children, ...props }: any) => <DocsMdxPre {...props}>{children}</DocsMdxPre>,
  img: ({ alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt ?? ""} style={buildDocImageStyle(props.style)} className={[props.className, "mx-auto my-2"].filter(Boolean).join(" ")} loading="eager" decoding="sync" fetchPriority="high" />
  ),
};

export default async function TechMdxArticle({ source, uri }: { source: string; uri: string }) {
  const normalizedSource = normalizeMdxSource(source);
  let content: ReactNode;

  try {
    ({ content } = await compileMDX({
      source: escapeMdxPlaceholders(normalizedSource),
      components: mdxComponents,
    }));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[technical_insights] MDX compilation failed for "${uri}"; showing plain text fallback. ${reason}`);
    content = (
      <div className="whitespace-pre-wrap break-words text-slate-700">
        {plainTextFallback(normalizedSource)}
      </div>
    );
  }

  return (
    <div className="prose max-w-none prose-headings:text-slate-900 prose-p:text-[15px] prose-p:leading-[1.62] prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-[15px] prose-li:leading-[1.62] prose-li:text-slate-700 prose-a:text-blue-700 prose-h2:text-[1.28rem] prose-h3:text-[1.06rem] prose-h2:mt-5 prose-h2:mb-2 prose-h3:mt-5 prose-h3:mb-2 prose-hr:my-2 prose-pre:my-1.5 prose-pre:py-0.5 prose-pre:px-3 prose-img:my-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-code:text-[12px] prose-code:text-pink-700 prose-code:bg-pink-50 prose-code:px-1 prose-code:py-0 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none [&>*:last-child]:!mb-0 [&>h2:first-of-type]:!mt-0 [&>h2]:lg:pl-2 [&>h2~p]:lg:pl-2 [&>h2~ul]:lg:pl-2 [&>h2~ol]:lg:pl-2 [&>h2~pre]:lg:pl-2 [&>h2~hr]:lg:pl-2 [&>h2~div]:lg:pl-2">
      {content}
    </div>
  );
}
