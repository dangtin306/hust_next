import { NextRequest, NextResponse } from "next/server";
import { normalizeLaravelApiBaseUrl } from "./baseUrls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LARAVEL_BASE =
  process.env.LARAVEL_WORKSPACE_API ||
  process.env.LARAVEL_API_BASE_URL ||
  "https://laravel_mt.hust.media/api";

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const customTarget = request.headers.get("x-laravel-target");

  let cookieLaravel: string | undefined;
  const cookieVal =
    request.cookies.get("url_api_chat_bot_mt")?.value ||
    request.cookies.get("url_api_chat_bot")?.value;
  if (cookieVal) {
    try {
      const decoded = cookieVal.startsWith("%") ? decodeURIComponent(cookieVal) : cookieVal;
      const parsed = JSON.parse(decoded);
      if (parsed?.backend_laravel && typeof parsed.backend_laravel === "string") {
        cookieLaravel = parsed.backend_laravel;
      }
    } catch {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieVal));
        if (parsed?.backend_laravel && typeof parsed.backend_laravel === "string") {
          cookieLaravel = parsed.backend_laravel;
        }
      } catch {}
    }
  }

  const upstreamBase = normalizeLaravelApiBaseUrl(
    customTarget || cookieLaravel || LARAVEL_BASE
  );
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

    let upstream: Response;
    let didFallback = false;
    try {
      upstream = await fetch(upstreamUrl, {
        method: request.method,
        headers: requestHeaders,
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(customTarget ? 3000 : 15000),
      });
    } catch (fetchErr) {
      const defaultBase = normalizeLaravelApiBaseUrl(LARAVEL_BASE);
      if (customTarget && upstreamBase !== defaultBase) {
        const fallbackUrl = `${defaultBase}/${subPath}${search}`;
        try {
          upstream = await fetch(fallbackUrl, {
            method: request.method,
            headers: requestHeaders,
            body,
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
          });
          didFallback = true;
        } catch {
          throw fetchErr;
        }
      } else {
        throw fetchErr;
      }
    }

    const responseBody = await upstream.text();
    const responseHeaders: Record<string, string> = {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "x-upstream-url": upstreamUrl,
    };
    if (didFallback) {
      responseHeaders["x-laravel-fallback"] = "true";
    }

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
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
