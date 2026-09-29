import { NextRequest, NextResponse } from "next/server";

const LARAVEL_CHAT_BASE =
  process.env.LARAVEL_API_BASE_URL || "https://laravel.hust.media/api/chat";

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const search = request.nextUrl.search;
  const upstreamUrl = `${LARAVEL_CHAT_BASE.replace(/\/$/, "")}/${path.join("/")}${search}`;

  try {
    const requestHeaders: Record<string, string> = {
      accept: "application/json",
    };

    const contentType = request.headers.get("content-type");
    if (contentType) {
      requestHeaders["content-type"] = contentType;
    }

    const auth = request.headers.get("authorization");
    if (auth) {
      requestHeaders["authorization"] = auth;
    }

    // Forward and synthesize Cookie header
    let cookieHeader = request.headers.get("cookie") || "";

    const customSession =
      request.headers.get("x-chat-bot-session") ||
      request.headers.get("x-cookie-hash");

    if (customSession && !cookieHeader.includes("chat_bot_session=")) {
      cookieHeader = cookieHeader
        ? `${cookieHeader}; chat_bot_session=${customSession}`
        : `chat_bot_session=${customSession}`;
    }

    if (cookieHeader) {
      requestHeaders["cookie"] = cookieHeader;
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
    };

    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });

    // Forward Set-Cookie headers back to the browser
    const getSetCookie = upstream.headers.getSetCookie?.();
    if (Array.isArray(getSetCookie) && getSetCookie.length > 0) {
      for (const setCookie of getSetCookie) {
        response.headers.append("set-cookie", setCookie);
      }
    } else {
      const singleSetCookie = upstream.headers.get("set-cookie");
      if (singleSetCookie) {
        response.headers.set("set-cookie", singleSetCookie);
      }
    }

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: {
          message: `Không kết nối được Laravel Chat API (${upstreamUrl}): ${errorMsg}`,
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
export const PATCH = proxy;
export const DELETE = proxy;
