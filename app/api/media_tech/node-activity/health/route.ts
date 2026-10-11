import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_UPSTREAM_HEALTH_URL =
  process.env.NODE_ACTIVITY_HEALTH_URL ||
  "https://node_md.hust.media/openclaw/workflow/health";

export async function GET() {
  const healthUrl =
    process.env.NODE_ACTIVITY_HEALTH_URL || DEFAULT_UPSTREAM_HEALTH_URL;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(healthUrl, {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = { raw: await res.text() };
    }

    return NextResponse.json(
      {
        ok: res.ok,
        status: res.status,
        upstream: healthUrl,
        data,
      },
      { status: res.status }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        upstream: healthUrl,
        error: errorMsg,
      },
      { status: 502 }
    );
  }
}
