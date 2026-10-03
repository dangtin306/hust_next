import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LARAVEL_BASE =
  process.env.LARAVEL_WORKSPACE_API ||
  process.env.LARAVEL_API_BASE_URL ||
  "https://laravel_mt.hust.media/api";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const joinedPath = path.join("/");
  const search = request.nextUrl.search;
  const upstreamBase = LARAVEL_BASE.replace(/\/$/, "");
  const upstreamUrl = `${upstreamBase}/${joinedPath}${search}`;

  try {
    const requestHeaders: Record<string, string> = {
      accept: "application/json",
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
        message: `Không thể kết nối đến máy chủ Laravel (${upstreamUrl}): ${errorMsg}`,
        error: "proxy_error",
      },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
