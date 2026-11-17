import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const upstreamByProject: Record<string, string> = {
  media_tech:
    process.env.MAPS_MAIN_MEDIA_TECH_API_BASE_URL || "http://127.0.0.1:8818",
  hust: process.env.MAPS_MAIN_HUST_API_BASE_URL || "http://127.0.0.1:2999",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const { resource } = await context.params;
  if (!new Set(["graph", "file", "health"]).has(resource)) {
    return NextResponse.json({ ok: false, error: "Unknown maps resource" }, { status: 404 });
  }

  const project = request.nextUrl.searchParams.get("project") === "hust" ? "hust" : "media_tech";
  const upstreamBase = upstreamByProject[project].replace(/\/+$/, "");
  const upstreamUrl = new URL(
    `/openclaw/workflow/maps_main/${resource}`,
    `${upstreamBase}/`,
  );
  if (resource === "file") {
    const filePath = request.nextUrl.searchParams.get("path");
    if (filePath) upstreamUrl.searchParams.set("path", filePath);
  }

  try {
    const upstream = await fetch(upstreamUrl, { cache: "no-store" });
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upstream request failed";
    return NextResponse.json(
      { ok: false, error: `Maps API unavailable for ${project}: ${message}` },
      { status: 502 },
    );
  }
}
