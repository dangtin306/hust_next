import fs, { promises as fsp } from "fs";
import path from "path";

// Hai bản đồ tri thức và nguồn dữ liệu của chúng. Mỗi thư mục main/ có output.json, metro_data.json,
// maps_main.jsonl và textbook/ (sách do textbook/build_textbook.py sinh). Trang chỉ đọc các file này, không tính lại số liệu.

export type ProductKey = "mt" | "hust";

export type Product = {
  key: ProductKey;
  name: string;
  root: string;
  mapHref: string;
  filesHref: string;
  readHref: string;
};

export const PRODUCTS: Record<ProductKey, Product> = {
  mt: {
    key: "mt",
    name: "Media Tech",
    root: "D:/hustmedia/python/llms/media_tech_ai/ai/auto/maps_main/main",
    mapHref: "/next/api/mt/maps_main/map",
    filesHref: "/next/api/mt/maps_main/files",
    readHref: "/next/api/mt/maps_main/read",
  },
  hust: {
    key: "hust",
    name: "Hust Media",
    root: "C:/hustmedia6/nodejs/auto/maps_main/main",
    mapHref: "/next/api/hust/maps_main/map",
    filesHref: "/next/api/hust/maps_main/files",
    readHref: "/next/api/hust/maps_main/read",
  },
};

// Chỉ các tệp này được phép tải qua route; đường dẫn không đi từ người dùng.
export const FILES = {
  textbook: { rel: "textbook/textbook.md", name: "textbook.md", type: "text/plain; charset=utf-8", download: false },
  relations: { rel: "textbook/relations.md", name: "relations.md", type: "text/plain; charset=utf-8", download: false },
  jsonl: { rel: "maps_main.jsonl", name: "maps_main.jsonl", type: "application/x-ndjson; charset=utf-8", download: true },
} as const;

export type FileKey = keyof typeof FILES;

export function isFileKey(value: string): value is FileKey {
  return Object.prototype.hasOwnProperty.call(FILES, value);
}

export function productFile(product: Product, key: FileKey): string {
  return path.join(product.root, FILES[key].rel);
}

export async function fileResponse(product: Product, key: FileKey): Promise<Response> {
  const spec = FILES[key];
  try {
    const body = await fsp.readFile(productFile(product, key));
    const headers: Record<string, string> = { "Content-Type": spec.type, "Cache-Control": "no-store" };
    if (spec.download) headers["Content-Disposition"] = `attachment; filename="${spec.name}"`;
    return new Response(new Uint8Array(body), { headers });
  } catch {
    return new Response("Chưa có tệp này. Hãy sinh bản đồ và sách trước.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

export type Freshness = "fresh" | "stale" | "missing";

export type MapCounts = { districts: number; blocks: number; buildings: number; stations: number; lines: number };

export type KnowledgeStats = {
  product: Product;
  ready: boolean;
  mapCounts: MapCounts | null;
  relations: { verified: number; unverified: number } | null;
  yesLabel: string;
  noLabel: string;
  basisLine: string;
  bookTitle: string;
  charsPerToken: number;
  mapCreatedAt: string | null;
  bookUpdatedAt: Date | null;
  freshness: Freshness;
  bookTokens: number | null;
  tokenBudget: number | null;
  bookWarnings: string[];
  outputWarnings: string[];
};

// Chỉ khai báo các trường trang này dùng; file thiếu trường nào thì trường đó là undefined.
type ConfigFile = {
  book_title?: string;
  basis_line?: string;
  chars_per_token?: number;
  budget_tokens?: number;
  labels?: { yes?: string; no?: string };
};

type OutputFile = {
  meta?: {
    created_at?: string;
    warnings?: unknown[];
    counts?: { links_by_dependency_status?: { declared?: number; declared_unverified?: number } };
  };
};

type MetroFile = {
  meta?: { created_at?: string; counts?: MapCounts };
};

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

function readText(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function mtimeOf(file: string): Date | null {
  try {
    return fs.statSync(file).mtime;
  } catch {
    return null;
  }
}

export function loadKnowledge(product: Product): KnowledgeStats {
  const config: ConfigFile = readJson<ConfigFile>(path.join(product.root, "textbook", "config.json")) ?? {};
  const output = readJson<OutputFile>(path.join(product.root, "output.json"));
  const metro = readJson<MetroFile>(path.join(product.root, "metro_data.json"));
  const bookText = readText(productFile(product, "textbook"));
  const bookUpdatedAt = mtimeOf(productFile(product, "textbook"));
  const jsonlUpdatedAt = mtimeOf(productFile(product, "jsonl"));
  const charsPerToken: number = config.chars_per_token ?? 3;
  const counts = metro?.meta?.counts ?? null;
  const link = output?.meta?.counts?.links_by_dependency_status ?? null;

  // So theo thời gian sửa file: sách cũ hơn maps_main.jsonl thì cần sinh lại. Đây không phải kiểm tra nội dung.
  let freshness: Freshness = "missing";
  if (bookUpdatedAt) {
    freshness = jsonlUpdatedAt && jsonlUpdatedAt > bookUpdatedAt ? "stale" : "fresh";
  }

  return {
    product,
    ready: Boolean(counts && link),
    mapCounts: counts
      ? {
          districts: counts.districts,
          blocks: counts.blocks,
          buildings: counts.buildings,
          stations: counts.stations,
          lines: counts.lines,
        }
      : null,
    relations: link ? { verified: link.declared ?? 0, unverified: link.declared_unverified ?? 0 } : null,
    yesLabel: config.labels?.yes ?? "đã xác minh",
    noLabel: config.labels?.no ?? "chưa xác minh",
    basisLine: config.basis_line ?? "",
    bookTitle: config.book_title ?? "Sách giáo khoa",
    charsPerToken,
    mapCreatedAt: output?.meta?.created_at ?? metro?.meta?.created_at ?? null,
    bookUpdatedAt,
    freshness,
    bookTokens: bookText === null ? null : Math.round(bookText.length / charsPerToken),
    tokenBudget: config.budget_tokens ?? null,
    bookWarnings: bookText ? (bookText.match(/^Cảnh báo:.*$/gm) ?? []) : [],
    outputWarnings: ((output?.meta?.warnings ?? []) as unknown[]).map(String),
  };
}
