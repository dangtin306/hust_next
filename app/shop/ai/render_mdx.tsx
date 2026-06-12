import React, { Fragment } from "react";
import type { CSSProperties } from "react";
import DocsCodeBlock, { DocsSectionMdxPre } from "@/app/community/docs/[slug]/DocsCodeBlock";

type ActiveNotes = {
  title?: string;
  shortDescription: string;
  articleBody: string[];
  technicalSnapshot: string[];
} | null;

type MdxBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | {
      type: "image";
      src: string;
      alt: string;
      width?: string;
      caption?: string;
      figureClassName?: string;
      imgClassName?: string;
      captionClassName?: string;
      imgStyle?: CSSProperties;
      loading?: "lazy" | "eager";
      decoding?: "async" | "sync" | "auto";
    }
  | { type: "code"; language?: string; code: string };

type RenderMdxProps = {
  activeNotes: ActiveNotes;
  setupGuide: string;
  lang: string;
};

const parseStyleObject = (styleText: string | undefined): CSSProperties | undefined => {
  if (!styleText) return undefined;

  const entries = styleText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [rawKey, rawValue] = item.split(":");
      if (!rawKey || !rawValue) return null;
      const key = rawKey.trim();
      const value = rawValue.trim().replace(/^"|"$/g, "");
      return [key, value] as const;
    })
    .filter(Boolean) as Array<readonly [string, string]>;

  if (entries.length === 0) return undefined;

  return Object.fromEntries(entries) as CSSProperties;
};

const buildGuideBlocks = (text: string): MdxBlock[] => {
  const lines = text.split("\n");
  const blocks: MdxBlock[] = [];
  let currentList: string[] = [];
  let currentParagraph: string[] = [];
  let currentCode: string[] = [];
  let currentCodeLanguage = "";
  let currentHtml: string[] = [];
  let inCodeBlock = false;
  let inHtmlBlock = false;
  let inFigureBlock = false;

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "list", items: currentList });
      currentList = [];
    }
  };

  const flushParagraph = () => {
    const textValue = currentParagraph.join(" ").trim();
    if (textValue) {
      blocks.push({ type: "paragraph", text: textValue });
    }
    currentParagraph = [];
  };

  const flushCode = () => {
    blocks.push({
      type: "code",
      language: currentCodeLanguage || undefined,
      code: currentCode.join("\n").replace(/^\n+|\n+$/g, ""),
    });
    currentCode = [];
    currentCodeLanguage = "";
  };

  const flushHtml = () => {
    const html = currentHtml.join("\n");
    const srcMatch = html.match(/src="([^"]+)"/);
    const altMatch = html.match(/alt="([^"]*)"/);
    const widthMatch = html.match(/width:\s*"([^"]+)"/);
    const captionMatch = html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    const figureClassMatch = html.match(/<figure[^>]*className="([^"]+)"/i);
    const imgClassMatch = html.match(/<img[^>]*className="([^"]+)"/i);
    const captionClassMatch = html.match(/<figcaption[^>]*className="([^"]+)"/i);
    const imgStyleMatch = html.match(/<img[^>]*style=\{\{([\s\S]*?)\}\}/i);
    const loadingMatch = html.match(/<img[^>]*loading="([^"]+)"/i);
    const decodingMatch = html.match(/<img[^>]*decoding="([^"]+)"/i);

    if (srcMatch?.[1]) {
      blocks.push({
        type: "image",
        src: srcMatch[1],
        alt: altMatch?.[1] || "Setup image",
        width: widthMatch?.[1],
        caption: captionMatch?.[1]?.replace(/<[^>]+>/g, "").trim() || undefined,
        figureClassName: figureClassMatch?.[1],
        imgClassName: imgClassMatch?.[1],
        captionClassName: captionClassMatch?.[1],
        imgStyle: parseStyleObject(imgStyleMatch?.[1]),
        loading: loadingMatch?.[1] === "eager" ? "eager" : "lazy",
        decoding:
          decodingMatch?.[1] === "sync"
            ? "sync"
            : decodingMatch?.[1] === "auto"
              ? "auto"
              : "async",
      });
    }

    currentHtml = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushList();
      flushParagraph();

      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
        return;
      }

      inCodeBlock = true;
      currentCodeLanguage = trimmed.replace(/^```/, "").trim();
      return;
    }

    if (inCodeBlock) {
      currentCode.push(line);
      return;
    }

    if (inHtmlBlock) {
      currentHtml.push(line);
      if (
        trimmed === "</div>" ||
        trimmed.endsWith("</div>") ||
        trimmed === "</figure>" ||
        trimmed.endsWith("</figure>")
      ) {
        flushHtml();
        inHtmlBlock = false;
        inFigureBlock = false;
      }
      return;
    }

    if (trimmed.startsWith("<figure") || trimmed.startsWith("<div") || trimmed.startsWith("<img")) {
      flushList();
      flushParagraph();
      inHtmlBlock = true;
      inFigureBlock = trimmed.startsWith("<figure");
      currentHtml.push(line);

      if (!inFigureBlock && trimmed.startsWith("<img") && trimmed.endsWith("/>")) {
        flushHtml();
        inHtmlBlock = false;
      }
      return;
    }

    if (!trimmed) {
      flushList();
      flushParagraph();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      flushParagraph();
      blocks.push({ type: "heading", text: trimmed.replace(/^###\s+/, "") });
      return;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      currentList.push(trimmed.replace(/^-\s+/, ""));
      return;
    }

    flushList();
    currentParagraph.push(trimmed);
  });

  flushList();
  flushParagraph();

  if (inCodeBlock) {
    flushCode();
  }

  if (inHtmlBlock) {
    flushHtml();
  }

  return blocks;
};

const renderInlineText = (text: string) => {
  const tokenRegex = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex).filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      const codeText = part.slice(1, -1);
      return (
        <span
          key={`inline-code-${index}-${codeText}`}
          className="inline rounded bg-pink-50 text-pink-700 px-1.5 py-0.5 text-[14px]"
        >
          {codeText}
        </span>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={`inline-link-${index}-${href}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-pink-600 underline decoration-pink-400 underline-offset-2 transition hover:text-pink-700"
        >
          {label}
        </a>
      );
    }

    return <Fragment key={`inline-text-${index}`}>{part}</Fragment>;
  });
};

const renderGuideBlocks = (text: string) => {
  const blocks = buildGuideBlocks(text);

  return blocks.map((block, index) => {
    if (block.type === "heading") {
      return (
        <div
          key={`guide-heading-${index}`}
          className="mt-2 text-[15px] font-bold uppercase tracking-[0.08em] text-slate-600"
        >
          {renderInlineText(block.text)}
        </div>
      );
    }

    if (block.type === "list") {
      return (
        <div
          key={`guide-list-${index}`}
          className="mx-1.5 mt-1 space-y-1 text-[15px] leading-6 text-slate-700"
        >
          {block.items.map((item, itemIndex) => (
            <div key={`guide-list-item-${index}-${itemIndex}`} className="flex items-start">
              <span className="pr-1">-</span>
              <div className="min-w-0 flex-1">{renderInlineText(item)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (block.type === "code") {
      return (
        <div key={`guide-code-wrap-${index}`} className="mt-2">
          <DocsSectionMdxPre>
            <code className={block.language ? `language-${block.language}` : undefined}>
              {block.code}
            </code>
          </DocsSectionMdxPre>
        </div>
      );
    }

    if (block.type === "image") {
      return (
        <figure
          key={`guide-image-${index}`}
          className={block.figureClassName || "my-3 text-center"}
        >
          <img
            src={block.src}
            alt={block.alt}
            style={block.imgStyle || { width: block.width || "92%" }}
            className={block.imgClassName || "mx-auto block rounded-xl"}
            loading={block.loading || "lazy"}
            decoding={block.decoding || "async"}
          />
          {block.caption ? (
            <figcaption className={block.captionClassName || "mt-1 text-xs text-slate-500"}>
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    return (
      <div
        key={`guide-paragraph-${index}`}
        className="mt-2 px-1.5 text-[15px] leading-6 text-slate-700"
      >
        {renderInlineText(block.text)}
      </div>
    );
  });
};

const renderMdxText = (text: string, keyPrefix: string) => {
  const blocks = buildGuideBlocks(text);

  return blocks.map((block, index) => {
    if (block.type === "heading") {
      return (
        <div
          key={`${keyPrefix}-heading-${index}`}
          className="mt-2 text-[15px] font-bold uppercase tracking-[0.08em] text-slate-600"
        >
          {renderInlineText(block.text)}
        </div>
      );
    }

    if (block.type === "list") {
      return (
        <div
          key={`${keyPrefix}-list-${index}`}
          className="mx-1.5 mt-1 space-y-1 text-[15px] leading-6 text-slate-700"
        >
          {block.items.map((item, itemIndex) => (
            <div key={`${keyPrefix}-list-item-${index}-${itemIndex}`} className="flex items-start">
              <span className="pr-1">-</span>
              <div className="min-w-0 flex-1">{renderInlineText(item)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (block.type === "code") {
      return (
        <div key={`${keyPrefix}-code-wrap-${index}`} className="mt-2">
          <DocsSectionMdxPre>
            <code className={block.language ? `language-${block.language}` : undefined}>
              {block.code}
            </code>
          </DocsSectionMdxPre>
        </div>
      );
    }

    if (block.type === "image") {
      return (
        <figure key={`${keyPrefix}-image-${index}`} className={block.figureClassName || "my-3 text-center"}>
          <img
            src={block.src}
            alt={block.alt}
            style={block.imgStyle || { width: block.width || "92%" }}
            className={block.imgClassName || "mx-auto block rounded-xl"}
            loading={block.loading || "lazy"}
            decoding={block.decoding || "async"}
          />
          {block.caption ? (
            <figcaption className={block.captionClassName || "mt-1 text-xs text-slate-500"}>
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    return (
      <div key={`${keyPrefix}-paragraph-${index}`} className="mt-2 px-1.5 text-[15px] leading-6 text-slate-700">
        {renderInlineText(block.text)}
      </div>
    );
  });
};

const renderMdxTextWithFigures = (text: string, keyPrefix: string) => {
  const figureRegex = /<figure[\s\S]*?<\/figure>/gi;
  const chunks: Array<{ type: "text"; value: string } | { type: "figure"; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = figureRegex.exec(text))) {
    if (match.index > lastIndex) {
      chunks.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    chunks.push({ type: "figure", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    chunks.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (chunks.length === 0) {
    return renderMdxText(text, keyPrefix);
  }

  return chunks.flatMap((chunk, chunkIndex) => {
    if (chunk.type === "figure") {
      const srcMatch = chunk.value.match(/src="([^"]+)"/i);
      const altMatch = chunk.value.match(/alt="([^"]*)"/i);
      const widthMatch = chunk.value.match(/width:\s*"([^"]+)"/i);
      const captionMatch = chunk.value.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      const figureClassMatch = chunk.value.match(/<figure[^>]*className="([^"]+)"/i);
      const imgClassMatch = chunk.value.match(/<img[^>]*className="([^"]+)"/i);
      const captionClassMatch = chunk.value.match(/<figcaption[^>]*className="([^"]+)"/i);
      const imgStyleMatch = chunk.value.match(/<img[^>]*style=\{\{([\s\S]*?)\}\}/i);
      const loadingMatch = chunk.value.match(/<img[^>]*loading="([^"]+)"/i);
      const decodingMatch = chunk.value.match(/<img[^>]*decoding="([^"]+)"/i);
      const imgStyle = parseStyleObject(imgStyleMatch?.[1]);

      if (!srcMatch?.[1]) return [];

      return [
        <figure
          key={`${keyPrefix}-figure-${chunkIndex}`}
          className={figureClassMatch?.[1] || "my-4 text-center"}
        >
          <img
            src={srcMatch[1]}
            alt={altMatch?.[1] || "Setup image"}
            style={imgStyle || { width: widthMatch?.[1] || "92%" }}
            className={imgClassMatch?.[1] || "mx-auto block rounded-xl"}
            loading={loadingMatch?.[1] === "eager" ? "eager" : "lazy"}
            decoding={
              decodingMatch?.[1] === "sync"
                ? "sync"
                : decodingMatch?.[1] === "auto"
                  ? "auto"
                  : "async"
            }
          />
          {captionMatch?.[1]?.trim() ? (
            <figcaption className={captionClassMatch?.[1] || "mt-1 text-xs text-slate-500"}>
              {captionMatch[1].replace(/<[^>]+>/g, "").trim()}
            </figcaption>
          ) : null}
        </figure>,
      ];
    }

    return renderMdxText(chunk.value, `${keyPrefix}-text-${chunkIndex}`);
  });
};

export function RenderMdx({ activeNotes, setupGuide, lang }: RenderMdxProps) {
  const showSetupGuide = setupGuide.trim().length > 0;

  if (!activeNotes && !showSetupGuide) {
    return null;
  }

  return (
    <>
      {showSetupGuide ? (
        <div id="section-setup-guide" className="mt-4 border-t border-slate-200/80 pt-3">
          <h2 className="text-lg font-bold text-slate-900">Module Setup Guide</h2>
          <div className="mt-2 pl-0.5 sm:pl-1 break-words text-[15px] leading-6 text-slate-700 [overflow-wrap:anywhere]">
            {renderGuideBlocks(setupGuide)}
          </div>
        </div>
      ) : null}

      {activeNotes ? (
        <div id="section-notes" className="mt-4 border-t border-slate-200/80 pt-3">
          <h2 className="text-lg font-bold text-slate-900">
            {activeNotes.title || (lang === "vi" ? "Bài viết liên quan" : "Related Articles")}
          </h2>
          <div className="mt-2 pl-0.5 sm:pl-1 space-y-3 break-words text-[15px] leading-6 text-slate-700 [overflow-wrap:anywhere]">
            <div className="mt-1">
              <div className="text-[15px] font-bold uppercase tracking-[0.08em] text-slate-600">
                Short description for the article card
              </div>
              <div className="mx-1.5 mt-1">{renderMdxTextWithFigures(activeNotes.shortDescription, "note-short")}</div>
            </div>

            <div className="mt-1">
              <div className="text-[15px] font-bold uppercase tracking-[0.08em] text-slate-600">
                Article body
              </div>
              <div className="mx-1.5 mt-1 space-y-1">
                {activeNotes.articleBody.map((paragraph: string, idx: number) => (
                  <div key={`note-body-${idx}`}>{renderMdxTextWithFigures(paragraph, `note-body-${idx}`)}</div>
                ))}
              </div>
            </div>

            <div className="mt-1">
              <div className="text-[15px] font-bold uppercase tracking-[0.08em] text-slate-600">
                Technical configuration snapshot
              </div>
              <DocsCodeBlock
                className="mt-2"
                code={activeNotes.technicalSnapshot.join("\n")}
                language="config"
                isSingleLine={false}
                ver="digital_sutie"
              >
                <code className="language-config">{activeNotes.technicalSnapshot.join("\n")}</code>
              </DocsCodeBlock>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
