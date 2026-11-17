import fs from "fs";
import { ArrowLeft, BookOpen, TriangleAlert } from "lucide-react";
import MarkdownViewer from "@/app/api/media_tech/workspace/MarkdownViewer";
import { PRODUCTS, productFile, type ProductKey } from "../home/knowledge";

// Trang đọc sách và bảng quan hệ: đọc file .md đã sinh rồi hiển thị bằng MarkdownViewer của Workspace.
export type ReadableFile = "textbook" | "relations";

const TITLES: Record<ReadableFile, string> = {
  textbook: "Sách giáo khoa",
  relations: "Quan hệ và căn cứ",
};

export default function KnowledgeReadPage({ product, file }: { product: ProductKey; file: ReadableFile }) {
  const info = PRODUCTS[product];
  const homeHref = info.mapHref.replace(/\/map$/, "/home");
  const filePath = productFile(info, file);

  let content: string | null = null;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    content = null;
  }

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent px-4 pb-6 pt-1 sm:px-6 sm:pb-8 sm:pt-2">
      <div className="mx-auto w-full max-w-4xl space-y-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">
                {TITLES[file]} · {info.name}
              </h1>
              <p className="truncate font-mono text-xs text-slate-500">{filePath}</p>
            </div>
          </div>
          <a
            href={homeHref}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" /> Knowledge
          </a>
        </div>

        {content === null ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Chưa có tệp này. Sinh sách bằng build_textbook.py rồi tải lại trang.</p>
          </div>
        ) : (
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <MarkdownViewer content={content} maxHeight="max-h-none" />
          </article>
        )}
      </div>
    </main>
  );
}
