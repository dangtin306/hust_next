import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const LARAVEL_CHAT_BASE =
  process.env.LARAVEL_API_BASE_URL || "https://laravel.hust.media/api/chat";

const HASH_TO_PLAIN = new Map<string, string>([
  [
    "cfc3be62368bade9062edfebaf4bdc78861d860a0a82d4b8ba7834fb6304ec70",
    "aee23177811e8acd935a29e15a28bdc876c108260a6a65f9514b31eff3bcd4e2",
  ],
]);

function registerPlainSession(plain: string) {
  if (!plain || typeof plain !== "string") return;
  const trimmed = plain.trim();
  const hash = crypto.createHash("sha256").update(trimmed).digest("hex");
  HASH_TO_PLAIN.set(hash, trimmed);
}

function resolveSessionValue(val?: string | null): string | null {
  if (!val) return null;
  const clean = decodeURIComponent(val).trim();
  return HASH_TO_PLAIN.get(clean) || clean;
}

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

    // Forward and synthesize Cookie header (DO NOT send session cookie on POST /rooms)
    let cookieHeader = request.headers.get("cookie") || "";
    const isPostRooms = request.method === "POST" && path.length === 1 && path[0] === "rooms";

    if (isPostRooms) {
      cookieHeader = cookieHeader
        .replace(/(?:^|;\s*)(?:chat_bot_session|cookie_hash)=[^;]*/gi, "")
        .replace(/^;\s*/, "")
        .trim();
    } else {
      const customSession =
        request.headers.get("x-chat-bot-session") ||
        request.headers.get("x-cookie-hash");

      if (cookieHeader.includes("chat_bot_session=")) {
        cookieHeader = cookieHeader.replace(/chat_bot_session=([^;]+)/gi, (_match, raw) => {
          const resolved = resolveSessionValue(raw);
          return `chat_bot_session=${resolved}`;
        });
      }

      if (customSession) {
        const resolved = resolveSessionValue(customSession);
        if (resolved && !cookieHeader.includes("chat_bot_session=")) {
          cookieHeader = cookieHeader
            ? `${cookieHeader}; chat_bot_session=${resolved}`
            : `chat_bot_session=${resolved}`;
        }
      }
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
    const setCookieList: string[] =
      Array.isArray(getSetCookie) && getSetCookie.length > 0
        ? getSetCookie
        : ([upstream.headers.get("set-cookie")].filter(Boolean) as string[]);

    for (const setCookie of setCookieList) {
      const match = setCookie.match(/chat_bot_session=([^;]+)/i);
      if (match) {
        registerPlainSession(decodeURIComponent(match[1]));
      }
      response.headers.append("set-cookie", setCookie);
    }

    // Also extract chat_bot_session from response body (new and old format) and set cookie
    try {
      const parsed = JSON.parse(responseBody);
      const sessionToken =
        parsed?.data?.chat_bot_session ||
        parsed?.chat_bot_session ||
        parsed?.error?.chat_bot_session ||
        parsed?.error?.cookie_hash ||
        parsed?.cookie_hash;

      if (sessionToken && typeof sessionToken === "string") {
        registerPlainSession(sessionToken);
        response.headers.append(
          "set-cookie",
          `chat_bot_session=${encodeURIComponent(sessionToken)}; Path=/; Max-Age=31536000; SameSite=Lax`
        );
        response.headers.append(
          "set-cookie",
          `cookie_hash=${encodeURIComponent(sessionToken)}; Path=/; Max-Age=31536000; SameSite=Lax`
        );
      }
    } catch {}

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
