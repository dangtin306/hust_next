import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { normalizeLaravelChatBaseUrl } from "./baseUrls";

const LARAVEL_CHAT_BASE =
  process.env.HUST_LARAVEL_API_BASE_URL || "https://laravel.hust.media/api/chat";

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
  const customTarget = request.headers.get("x-laravel-target");
  let upstreamBase = normalizeLaravelChatBaseUrl(LARAVEL_CHAT_BASE);

  const cookieVal =
    request.cookies.get("url_api_chat_bot_hust")?.value ||
    request.cookies.get("url_api_chat_bot")?.value;
  if (cookieVal) {
    try {
      const decoded = cookieVal.startsWith("%") ? decodeURIComponent(cookieVal) : cookieVal;
      const parsed = JSON.parse(decoded);
      if (parsed?.backend_laravel && typeof parsed.backend_laravel === "string") {
        upstreamBase = normalizeLaravelChatBaseUrl(parsed.backend_laravel);
      }
    } catch {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieVal));
        if (parsed?.backend_laravel && typeof parsed.backend_laravel === "string") {
          upstreamBase = normalizeLaravelChatBaseUrl(parsed.backend_laravel);
        }
      } catch {}
    }
  }

  if (customTarget) {
    upstreamBase = normalizeLaravelChatBaseUrl(customTarget);
  }
  const search = request.nextUrl.search;
  const upstreamUrl = `${upstreamBase}/${path.join("/")}${search}`;

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
    const joinedPath = path.join("/");
    const isPostRooms = request.method === "POST" && (joinedPath === "rooms" || joinedPath === "bot/rooms");

    const customSession =
      request.headers.get("x-hust-chat-bot-session") ||
      request.headers.get("x-chat-bot-session") ||
      request.headers.get("x-cookie-hash");

    let resolvedSession: string | null = null;
    if (customSession) {
      resolvedSession = resolveSessionValue(customSession);
    } else {
      const match =
        cookieHeader.match(/(?:^|;\s*)hust_chat_bot_session=([^;]+)/i) ||
        cookieHeader.match(/(?:^|;\s*)chat_bot_session=([^;]+)/i);
      if (match) {
        resolvedSession = resolveSessionValue(match[1]);
      }
    }

    if (isPostRooms) {
      cookieHeader = cookieHeader
        .replace(/(?:^|;\s*)(?:hust_chat_bot_session|hust_cookie_hash|chat_bot_session|cookie_hash)=[^;]*/gi, "")
        .replace(/^;\s*/, "")
        .trim();
    } else if (resolvedSession) {
      if (/(?<![a-zA-Z0-9_])chat_bot_session=/.test(cookieHeader)) {
        cookieHeader = cookieHeader.replace(/(?<![a-zA-Z0-9_])chat_bot_session=[^;]+/gi, `chat_bot_session=${resolvedSession}`);
      } else {
        cookieHeader = cookieHeader
          ? `${cookieHeader}; chat_bot_session=${resolvedSession}`
          : `chat_bot_session=${resolvedSession}`;
      }
    }

    if (cookieHeader) {
      requestHeaders["cookie"] = cookieHeader;
    }

    let requestBody: BodyInit | undefined = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      if (contentType?.includes("application/json")) {
        try {
          const rawText = await request.text();
          const parsed = JSON.parse(rawText);
          if (parsed && typeof parsed === "object") {
            if (isPostRooms) {
              delete parsed.chat_bot_session;
              delete parsed.cookie_hash;
              requestBody = JSON.stringify(parsed);
            } else if (resolvedSession && !parsed.chat_bot_session) {
              parsed.chat_bot_session = resolvedSession;
              requestBody = JSON.stringify(parsed);
            } else {
              requestBody = rawText;
            }
          } else {
            requestBody = rawText;
          }
        } catch {
          requestBody = await request.arrayBuffer();
        }
      } else {
        requestBody = await request.arrayBuffer();
      }
    }

    let upstream: Response;
    let didFallback = false;
    try {
      upstream = await fetch(upstreamUrl, {
        method: request.method,
        headers: requestHeaders,
        body: requestBody,
        cache: "no-store",
        signal: AbortSignal.timeout(customTarget ? 3000 : 15000),
      });
    } catch (fetchErr) {
      const defaultBase = normalizeLaravelChatBaseUrl(LARAVEL_CHAT_BASE);
      if (customTarget && upstreamBase !== defaultBase) {
        const fallbackUrl = `${defaultBase}/${path.join("/")}${search}`;
        try {
          upstream = await fetch(fallbackUrl, {
            method: request.method,
            headers: requestHeaders,
            body: requestBody,
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
    };
    if (didFallback) {
      responseHeaders["x-laravel-fallback"] = "true";
    }

    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });

    // Forward Set-Cookie headers back to the browser (rewriting chat_bot_session to hust_chat_bot_session)
    const getSetCookie = upstream.headers.getSetCookie?.();
    const setCookieList: string[] =
      Array.isArray(getSetCookie) && getSetCookie.length > 0
        ? getSetCookie
        : ([upstream.headers.get("set-cookie")].filter(Boolean) as string[]);

    for (const setCookie of setCookieList) {
      const match = setCookie.match(/(?<![a-zA-Z0-9_])chat_bot_session=([^;]+)/i);
      if (match) {
        const token = decodeURIComponent(match[1]);
        registerPlainSession(token);
        const hustSetCookie = setCookie.replace(/(?<![a-zA-Z0-9_])chat_bot_session=/gi, "hust_chat_bot_session=");
        response.headers.append("set-cookie", hustSetCookie);
        const hustHashCookie = setCookie.replace(/(?<![a-zA-Z0-9_])chat_bot_session=/gi, "hust_cookie_hash=");
        response.headers.append("set-cookie", hustHashCookie);
      } else {
        response.headers.append("set-cookie", setCookie);
      }
    }

    // Also extract chat_bot_session from response body and set hust_ cookies
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
          `hust_chat_bot_session=${encodeURIComponent(sessionToken)}; Path=/; Max-Age=31536000; SameSite=Lax`
        );
        response.headers.append(
          "set-cookie",
          `hust_cookie_hash=${encodeURIComponent(sessionToken)}; Path=/; Max-Age=31536000; SameSite=Lax`
        );
      }
    } catch {}

    if (upstream.status === 401) {
      try {
        const parsedErr = JSON.parse(responseBody);
        if (
          parsedErr?.error?.code === "CHAT_SESSION_INVALID" ||
          String(parsedErr?.error?.message || parsedErr?.message || "").toLowerCase().includes("session")
        ) {
          response.headers.append(
            "set-cookie",
            "hust_chat_bot_session=; Path=/; Max-Age=0; SameSite=Lax"
          );
          response.headers.append(
            "set-cookie",
            "hust_cookie_hash=; Path=/; Max-Age=0; SameSite=Lax"
          );
          response.headers.append(
            "set-cookie",
            "chat_bot_session=; Path=/; Max-Age=0; SameSite=Lax"
          );
          response.headers.append(
            "set-cookie",
            "cookie_hash=; Path=/; Max-Age=0; SameSite=Lax"
          );
        }
      } catch {}
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
