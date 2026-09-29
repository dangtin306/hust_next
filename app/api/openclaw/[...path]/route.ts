import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_UPSTREAM =
  process.env.OPENCLAW_API_BASE_URL || "https://node_js.hust.media/openclaw";
const LARAVEL_CHAT_BASE =
  process.env.LARAVEL_API_BASE_URL || "https://laravel.hust.media/api/chat/bot";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  try {
    fs.appendFileSync("/tmp/debug_proxy.log", JSON.stringify({ time: new Date().toISOString(), path, headers: Object.fromEntries(request.headers.entries()) }) + "\n");
  } catch {}
  let joinedPath = path.join("/");

  const isChatBot =
    joinedPath.startsWith("chat/bot") ||
    joinedPath.startsWith("chat_bot") ||
    Boolean(request.headers.get("x-chat-bot-session")) ||
    request.headers.get("x-openclaw-target")?.includes("laravel.hust.media");

  let upstreamBase =
    request.headers.get("x-openclaw-target") ||
    (isChatBot ? LARAVEL_CHAT_BASE : DEFAULT_UPSTREAM);
  upstreamBase = upstreamBase.replace(/\/$/, "");

  if (isChatBot) {
    if (joinedPath.startsWith("chat/bot/")) {
      joinedPath = joinedPath.replace(/^chat\/bot\//, "");
    } else if (joinedPath === "chat/bot") {
      joinedPath = "";
    } else if (joinedPath.startsWith("chat_bot/")) {
      joinedPath = joinedPath.replace(/^chat_bot\//, "");
    } else if (joinedPath === "chat_bot") {
      joinedPath = "";
    }
  } else {
    // Normalize path if upstream already includes /openclaw
    if (upstreamBase.endsWith("/openclaw") && joinedPath.startsWith("openclaw/")) {
      joinedPath = joinedPath.replace(/^openclaw\//, "");
    }
  }

  const search = request.nextUrl.search;
  const upstreamUrl = joinedPath
    ? `${upstreamBase}/${joinedPath}${search}`
    : `${upstreamBase}${search}`;

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

    const correlationId = request.headers.get("x-openclaw-correlation-id");
    if (correlationId) {
      requestHeaders["x-openclaw-correlation-id"] = correlationId;
    }

    const serviceId = request.headers.get("x-openclaw-service-id");
    if (serviceId) {
      requestHeaders["x-openclaw-service-id"] = serviceId;
    }

    const contentType = request.headers.get("content-type");
    if (contentType) {
      requestHeaders["content-type"] = contentType;
    }

    // Forward or synthesize Cookie header
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
      requestHeaders.cookie = cookieHeader;
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
      "x-debug-upstream": upstreamUrl,
      "x-debug-ischatbot": String(isChatBot),
      "x-debug-joinedpath": joinedPath,
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
          message: `Không kết nối được Gateway (${upstreamUrl}): ${errorMsg}`,
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
