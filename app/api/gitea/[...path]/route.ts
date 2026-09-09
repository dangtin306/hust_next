import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.GITEA_API_BASE_URL || "https://nginx.hust.media/laravel/gitea";

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const upstreamUrl = `${API_BASE_URL.replace(/\/$/, "")}/${path.join("/")}${request.nextUrl.search}`;

  try {
    let upstream: Response | undefined;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      upstream = await fetch(upstreamUrl, {
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      if (![502, 503, 504].includes(upstream.status) || attempt === 2) break;
    }
    if (!upstream) throw new Error("No upstream response");
    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Unable to reach Gitea API" }, { status: 502 });
  }
}
