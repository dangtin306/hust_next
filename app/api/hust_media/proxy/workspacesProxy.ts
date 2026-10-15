import { NextRequest, NextResponse } from "next/server";
import { normalizeLaravelApiBaseUrl } from "./baseUrls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HUST_LARAVEL_BASE =
  process.env.HUST_LARAVEL_API_BASE_URL || "https://laravel.hust.media/api";

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const customTarget = request.headers.get("x-laravel-target");
  const upstreamBase = normalizeLaravelApiBaseUrl(customTarget || HUST_LARAVEL_BASE);
  const search = request.nextUrl.search;

  const subPath =
    !path.length || path[0].startsWith("workspace")
      ? path.join("/")
      : `workspaces/${path.join("/")}`;

  const upstreamUrl = `${upstreamBase}/${subPath}${search}`;

  try {
    const requestHeaders: Record<string, string> = {
      accept: request.headers.get("accept") || "application/json",
    };

    const auth = request.headers.get("authorization");
    if (auth) {
      requestHeaders.authorization = auth;
    }

    const contentType = request.headers.get("content-type");
    if (contentType) {
      requestHeaders["content-type"] = contentType;
    }

    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer();

    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: requestHeaders,
      body,
      cache: "no-store",
    });

    const responseBody = await upstream.text();
    const responseHeaders: Record<string, string> = {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "x-upstream-url": upstreamUrl,
    };

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        message: `Không thể kết nối đến máy chủ Laravel Hust (${upstreamUrl}): ${errorMsg}`,
        error: "proxy_error",
      },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
