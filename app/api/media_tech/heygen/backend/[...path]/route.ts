import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function proxyHeyGen(request: NextRequest, context: RouteContext) {
  const authorization = request.headers.get("authorization");
  if (!authorization || !/^Bearer\s+\S+/i.test(authorization)) {
    return jsonError("Authorization bearer token required", 401);
  }

  const { path } = await context.params;
  const segments = path || [];
  const isCatalogRoute = segments.length === 1 && ["avatars", "voices"].includes(segments[0]);
  const isCreateRoute = segments.length === 1 && segments[0] === "videos";
  const isVideoStatusRoute = segments.length === 2
    && segments[0] === "videos"
    && /^[A-Za-z0-9_-]+$/.test(segments[1]);
  const allowed = (request.method === "GET" && (isCatalogRoute || isVideoStatusRoute))
    || (request.method === "POST" && isCreateRoute);
  if (!allowed) return jsonError("HeyGen route or method not allowed", 404);

  const backendBase = (process.env.HEYGEN_NODE_API_URL || "http://127.0.0.1:8818").replace(/\/+$/, "");
  let target: URL;
  try {
    target = new URL(`${backendBase}/heygen/${segments.map(encodeURIComponent).join("/")}`);
  } catch {
    return jsonError("Invalid HEYGEN_NODE_API_URL configuration", 500);
  }
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));

  try {
    const response = await fetch(target, {
      method: request.method,
      headers: {
        Authorization: authorization,
        Accept: "application/json",
        ...(request.method === "POST" ? {
          "Content-Type": request.headers.get("content-type") || "application/json",
          ...(request.headers.get("idempotency-key")
            ? { "Idempotency-Key": request.headers.get("idempotency-key")! }
            : {}),
        } : {}),
      },
      ...(request.method === "POST" ? { body: await request.text() } : {}),
      cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return jsonError("Không kết nối được Node.js HeyGen backend.", 502);
  }
}

export const GET = proxyHeyGen;
export const POST = proxyHeyGen;
