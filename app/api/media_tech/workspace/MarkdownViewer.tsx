"use client";

import React, { useState, useEffect, useRef, useId, useMemo } from "react";
import { marked } from "marked";
import {
  Eye,
  Code,
  Copy,
  Check,
  Layers,
  Table as TableIcon,
  AlertTriangle,
} from "lucide-react";

export type MarkdownViewerProps = {
  content: string;
  filePath?: string;
  maxHeight?: string;
  onSwitchToEdit?: () => void;
};

/**
 * Kiểm tra xem chuỗi có phải là sơ đồ Mermaid hay không
 */
function isMermaidCode(text: string, lang?: string): boolean {
  if (lang === "mermaid") return true;
  if (lang && /^(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph)\b/i.test(lang)) {
    return true;
  }
  const trimmed = (text || "").trim();
  return /^(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|xychart-beta|block-beta)\b/i.test(trimmed);
}

/**
 * Component render 1 sơ đồ Mermaid đơn lẻ
 */
function MermaidDiagramItem({ code, index }: { code: string; index: number }) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const renderSvg = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "default",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        });

        const safeId = `mermaid-box-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}-${index}`;
        const result = await mermaid.render(safeId, code.trim());
        if (!cancelled) {
          setSvgContent(result.svg);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
          setLoading(false);
        }
      }
    };

    void renderSvg();

    return () => {
      cancelled = true;
    };
  }, [code, index, reactId]);

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Layers className="h-3.5 w-3.5 text-emerald-600" />
          <span>Sơ đồ cấu trúc (Mermaid)</span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
          title="Sao chép mã Mermaid"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-500" />
              <span>Chép mã sơ đồ</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3 overflow-x-auto flex items-center justify-center min-h-[120px]">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-4">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <span>Đang vẽ sơ đồ đồ họa...</span>
          </div>
        )}

        {!loading && error && (
          <div className="w-full text-left p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Không thể dựng sơ đồ Mermaid: {error}</span>
            </div>
            <pre className="mt-1 font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-amber-100 overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        )}

        {!loading && !error && svgContent && (
          <div
            ref={containerRef}
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Component hiển thị Markdown Rendered (hỗ trợ Bảng, Sơ đồ, Code block, List, Headings...)
 */
export default function MarkdownViewer({
  content,
  filePath,
  maxHeight = "max-h-[500px]",
  onSwitchToEdit,
}: MarkdownViewerProps) {
  const [viewSubMode, setViewSubMode] = useState<"rendered" | "raw">("rendered");
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);

  // Tách nội dung thành các phần: Markdown thông thường vs Khối Mermaid
  const parsedSections = useMemo(() => {
    if (!content || !content.trim()) return [];

    // Nếu toàn bộ file là 1 sơ đồ Mermaid thuần (bắt đầu bằng graph/flowchart...)
    if (isMermaidCode(content)) {
      return [{ type: "mermaid" as const, code: content.trim(), index: 0 }];
    }

    // Tách các khối ```mermaid ... ```
    const regex = /```(?:mermaid|flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram)?\s*\n([\s\S]*?)```/gi;
    const sections: Array<
      | { type: "html"; html: string }
      | { type: "mermaid"; code: string; index: number }
    > = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let mermaidCounter = 0;

    const renderer = new marked.Renderer();

    // Custom link: mở tab mới
    renderer.link = ({ href, title, text }) => {
      const safeTitle = title ? ` title="${title}"` : "";
      return `<a href="${href}" target="_blank" rel="noopener noreferrer"${safeTitle} class="text-blue-600 hover:text-blue-800 underline underline-offset-2">${text}</a>`;
    };

    while ((match = regex.exec(content)) !== null) {
      const fullMatch = match[0];
      const codeInside = match[1];
      const matchStart = match.index;

      // Phần Markdown trước khối code
      if (matchStart > lastIndex) {
        const textBefore = content.slice(lastIndex, matchStart);
        if (textBefore.trim()) {
          const html = marked.parse(textBefore, {
            renderer,
            gfm: true,
            breaks: true,
          }) as string;
          sections.push({ type: "html", html });
        }
      }

      // Kiểm tra xem khối code này có phải là Mermaid không
      const firstLine = fullMatch.split("\n")[0].toLowerCase();
      const isMermaid =
        firstLine.includes("mermaid") || isMermaidCode(codeInside);

      if (isMermaid) {
        sections.push({
          type: "mermaid",
          code: codeInside,
          index: mermaidCounter++,
        });
      } else {
        // Code block thông thường
        const html = marked.parse(fullMatch, {
          renderer,
          gfm: true,
          breaks: true,
        }) as string;
        sections.push({ type: "html", html });
      }

      lastIndex = matchStart + fullMatch.length;
    }

    // Phần Markdown còn lại sau khối code cuối
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      if (remainingText.trim()) {
        const html = marked.parse(remainingText, {
          renderer,
          gfm: true,
          breaks: true,
        }) as string;
        sections.push({ type: "html", html });
      }
    }

    return sections;
  }, [content]);

  const handleCopyRaw = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(content);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Sub-toolbar chuyển đổi: Xem định dạng vs Mã nguồn thô */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 bg-slate-50 border-b border-slate-200/80 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewSubMode("rendered")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition cursor-pointer ${
                viewSubMode === "rendered"
                  ? "bg-emerald-600 text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Xem văn bản đã định dạng, bảng biểu và sơ đồ đồ họa"
            >
              <Eye className="h-3 w-3" />
              <span>Định dạng (Render)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewSubMode("raw")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition cursor-pointer ${
                viewSubMode === "raw"
                  ? "bg-slate-800 text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Xem mã nguồn Markdown thô (.md)"
            >
              <Code className="h-3 w-3" />
              <span>Mã nguồn .md</span>
            </button>
          </div>

          {viewSubMode === "rendered" && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
              <TableIcon className="h-3 w-3 text-emerald-600" />
              <span>Bảng &amp; Sơ đồ trực quan</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {filePath && (
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px] hidden md:inline mr-1" title={filePath}>
              {filePath}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopyRaw}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
            title="Sao chép toàn bộ nội dung file Markdown"
          >
            {copiedRaw ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-slate-500" />
                <span>Sao chép .md</span>
              </>
            )}
          </button>

          {onSwitchToEdit && (
            <button
              type="button"
              onClick={onSwitchToEdit}
              className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50/80 hover:bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 shadow-2xs transition cursor-pointer"
              title="Chuyển sang chế độ chỉnh sửa"
            >
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {/* View Content Area */}
      {viewSubMode === "rendered" ? (
        <div
          className={`markdown-rendered-view p-4 overflow-y-auto ${maxHeight} text-slate-850 select-text leading-relaxed`}
        >
          {parsedSections.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              (File Markdown rỗng - 0 bytes)
            </div>
          ) : (
            parsedSections.map((sec, idx) => {
              if (sec.type === "mermaid") {
                return (
                  <MermaidDiagramItem
                    key={`mermaid-${idx}`}
                    code={sec.code}
                    index={sec.index}
                  />
                );
              }
              return (
                <div
                  key={`html-${idx}`}
                  className="markdown-html-chunk mb-3"
                  dangerouslySetInnerHTML={{ __html: sec.html }}
                />
              );
            })
          )}

          {/* Embedded Styles Scoped to .markdown-rendered-view */}
          <style jsx global>{`
            .markdown-rendered-view h1 {
              font-size: 1.15rem;
              font-weight: 800;
              color: #0f172a;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 0.35rem;
              margin-top: 1rem;
              margin-bottom: 0.6rem;
            }
            .markdown-rendered-view h2 {
              font-size: 1.02rem;
              font-weight: 700;
              color: #0f172a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 0.3rem;
              margin-top: 1rem;
              margin-bottom: 0.5rem;
            }
            .markdown-rendered-view h3 {
              font-size: 0.9rem;
              font-weight: 700;
              color: #1e293b;
              margin-top: 0.85rem;
              margin-bottom: 0.4rem;
            }
            .markdown-rendered-view h4 {
              font-size: 0.82rem;
              font-weight: 700;
              color: #334155;
              margin-top: 0.75rem;
              margin-bottom: 0.3rem;
            }
            .markdown-rendered-view p {
              margin: 0.5rem 0;
              line-height: 1.62;
              color: #334155;
              font-size: 0.82rem;
            }
            .markdown-rendered-view strong {
              font-weight: 700;
              color: #0f172a;
            }
            .markdown-rendered-view ul {
              list-style-type: disc;
              padding-left: 1.25rem;
              margin: 0.5rem 0;
              color: #334155;
              font-size: 0.82rem;
            }
            .markdown-rendered-view ol {
              list-style-type: decimal;
              padding-left: 1.25rem;
              margin: 0.5rem 0;
              color: #334155;
              font-size: 0.82rem;
            }
            .markdown-rendered-view li {
              margin: 0.25rem 0;
              line-height: 1.55;
            }
            /* Table Styling - Beautiful, responsive with borders & headers */
            .markdown-rendered-view table {
              width: 100%;
              border-collapse: collapse;
              margin: 0.85rem 0;
              font-size: 0.78rem;
              border-radius: 0.5rem;
              overflow: hidden;
              border: 1px solid #cbd5e1;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
            }
            .markdown-rendered-view th {
              background-color: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 0.55rem 0.75rem;
              font-weight: 700;
              text-align: left;
              color: #0f172a;
              white-space: nowrap;
            }
            .markdown-rendered-view td {
              border: 1px solid #e2e8f0;
              padding: 0.5rem 0.75rem;
              color: #334155;
              vertical-align: top;
              background-color: #ffffff;
            }
            .markdown-rendered-view tr:nth-child(even) td {
              background-color: #f8fafc;
            }
            .markdown-rendered-view tr:hover td {
              background-color: #f1f5f9;
            }
            /* Blockquotes */
            .markdown-rendered-view blockquote {
              border-left: 3.5px solid #10b981;
              background-color: #f0fdf4;
              padding: 0.45rem 0.75rem;
              margin: 0.65rem 0;
              border-radius: 0 0.375rem 0.375rem 0;
              color: #065f46;
              font-style: italic;
              font-size: 0.8rem;
            }
            /* Inline code */
            .markdown-rendered-view code:not(pre code) {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              background-color: #f1f5f9;
              color: #be185d;
              padding: 0.1rem 0.35rem;
              border-radius: 0.25rem;
              font-size: 0.76rem;
              border: 1px solid #e2e8f0;
            }
            /* Code block */
            .markdown-rendered-view pre {
              background-color: #0d1117;
              color: #e6edf3;
              padding: 0.75rem 1rem;
              border-radius: 0.65rem;
              overflow-x: auto;
              margin: 0.65rem 0;
              border: 1px solid #30363d;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 0.75rem;
              line-height: 1.5;
            }
            .markdown-rendered-view hr {
              border: 0;
              border-top: 1px solid #e2e8f0;
              margin: 1rem 0;
            }
          `}</style>
        </div>
      ) : (
        /* Raw Markdown View */
        <div className="relative group bg-slate-50/50">
          <pre
            className={`font-mono text-xs leading-relaxed whitespace-pre-wrap select-text text-slate-800 p-4 ${maxHeight} overflow-y-auto`}
          >
            {content ? (
              content.trimEnd()
            ) : (
              <span className="text-slate-400 italic font-sans">(File rỗng - 0 bytes)</span>
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
