import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.GITEA_API_BASE_URL || "https://nginx.hust.media/laravel/gitea";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const upstreamUrl = `${API_BASE_URL.replace(/\/$/, "")}/${path.join("/")}${request.nextUrl.search}`;

  try {
    let upstream: Response | undefined;
    const requestHeaders: HeadersInit = { accept: "application/json" };
    const cookie = request.headers.get("cookie");
    const xsrfToken = request.headers.get("x-xsrf-token") || cookie?.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)?.[1];
    const contentType = request.headers.get("content-type");
    if (cookie) requestHeaders.cookie = cookie;
    if (xsrfToken) requestHeaders["x-xsrf-token"] = decodeURIComponent(xsrfToken);
    if (contentType) requestHeaders["content-type"] = contentType;
    const requestBody = request.method === "GET" ? undefined : await request.arrayBuffer();
    const maxAttempts = request.method === "GET" ? 3 : 1;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      upstream = await fetch(upstreamUrl, {
        cache: "no-store",
        method: request.method,
        headers: requestHeaders,
        body: requestBody,
      });
      if (![502, 503, 504].includes(upstream.status) || attempt === maxAttempts - 1) break;
    }
    if (!upstream) throw new Error("No upstream response");
    const responseBody = await upstream.text();
    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
    for (const setCookie of upstream.headers.getSetCookie?.() || []) response.headers.append("set-cookie", setCookie);
    return response;
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach Gitea API" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
