import { NextRequest, NextResponse } from "next/server";

const DEFAULT_UPSTREAM =
  process.env.OPENCLAW_API_BASE_URL || "https://node_js.hust.media/openclaw";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  let upstreamBase =
    request.headers.get("x-openclaw-target") || DEFAULT_UPSTREAM;
  upstreamBase = upstreamBase.replace(/\/$/, "");

  // Normalize path if upstream already includes /openclaw
  let joinedPath = path.join("/");
  if (upstreamBase.endsWith("/openclaw") && joinedPath.startsWith("openclaw/")) {
    joinedPath = joinedPath.replace(/^openclaw\//, "");
  }

  const search = request.nextUrl.search;
  const upstreamUrl = `${upstreamBase}/${joinedPath}${search}`;

  try {
    const requestHeaders: Record<string, string> = {
      accept: "application/json",
    };

    const auth = request.headers.get("authorization");
    if (auth) {
      requestHeaders.authorization = auth;
    }

    const sessionKey = request.headers.get("x-openclaw-session-key");
    if (sessionKey) {
      requestHeaders["x-openclaw-session-key"] = sessionKey;
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
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: {
          message: `Không kết nối được OpenClaw Gateway (${upstreamUrl}): ${errorMsg}`,
          type: "proxy_connection_error",
        },
      },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
