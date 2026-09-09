/* eslint-disable @typescript-eslint/no-explicit-any */
import { MDXRemote } from "next-mdx-remote/rsc";
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

export type TechClosingNotes = { readerValue: string; conclusion: string } | null;

export const splitClosingNotes = (source: string): { mainSource: string; closingNotes: TechClosingNotes } => {
  const readerValue = /^##\s+Reader Value\s*$/m;
  const conclusion = /^##\s+Conclusion\s*$/m;
  const readerMatch = readerValue.exec(source);
  const conclusionMatch = conclusion.exec(source);
  if (!readerMatch || !conclusionMatch || conclusionMatch.index <= readerMatch.index) {
    return { mainSource: source, closingNotes: null };
  }

  const readerStart = readerMatch.index + readerMatch[0].length;
  const readerValueText = source.slice(readerStart, conclusionMatch.index).replace(/^\s+|\s+$/g, "");
  const conclusionStart = conclusionMatch.index + conclusionMatch[0].length;
  const conclusionText = source.slice(conclusionStart).replace(/^\s+|\s+$/g, "");
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

export default function TechMdxArticle({ source }: { source: string }) {
  return (
    <div className="prose max-w-none prose-headings:text-slate-900 prose-p:text-[15px] prose-p:leading-[1.62] prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-[15px] prose-li:leading-[1.62] prose-li:text-slate-700 prose-a:text-blue-700 prose-h2:text-[1.28rem] prose-h3:text-[1.06rem] prose-h2:mt-5 prose-h2:mb-2 prose-h3:mt-5 prose-h3:mb-2 prose-hr:my-3 prose-pre:my-1.5 prose-pre:py-0.5 prose-pre:px-3 prose-img:my-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-code:text-[12px] [&>*:last-child]:!mb-0 [&>h2:first-of-type]:!mt-0 [&>h2]:lg:pl-2 [&>h2~p]:lg:pl-2 [&>h2~ul]:lg:pl-2 [&>h2~ol]:lg:pl-2 [&>h2~pre]:lg:pl-2 [&>h2~hr]:lg:pl-2 [&>h2~div]:lg:pl-2">
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}
