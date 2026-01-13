import fs from "fs/promises";
import path from "path";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
};

const toPosixPath = (value: string) => value.replace(/\\/g, "/");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string[] }> }
) {
  const resolvedParams = await params;
  const asset = Array.isArray(resolvedParams.asset)
    ? resolvedParams.asset.join("/")
    : "";
  const normalized = path.posix.normalize(toPosixPath(asset)).replace(/^\/+/, "");

  if (!normalized || normalized.includes("\0")) {
    return new Response("Not found", { status: 404 });
  }

  if (!normalized.startsWith("images/features/")) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(normalized).toLowerCase();
  const contentType = MIME_BY_EXT[ext];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(publicRoot, ...normalized.split("/"));

  if (!filePath.startsWith(publicRoot + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await fs.readFile(filePath);
    return new Response(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
