import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Node.js main server của Hust (Multi Agent API). Route này chỉ đọc: GET /multi/agents/agents.
const configuredNodeBase = process.env.HUST_NODE_MULTI_AGENTS_URL?.trim();
const NODE_BASE = (
  configuredNodeBase ||
  (process.env.NODE_ENV === "production"
    ? "https://node-js.hust.media"
    : "http://127.0.0.1:2999")
).replace(/\/+$/, "");

export async function GET() {
  try {
    // Lần đầu upstream có thể mất khoảng 20 giây (sau đó được cache 60 giây).
    const response = await fetch(`${NODE_BASE}/multi/agents/agents`, {
      cache: "no-store",
      signal: AbortSignal.timeout(45000),
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "agents_unavailable",
        message: error instanceof Error ? error.message : "Không gọi được Multi Agent API.",
      },
      { status: 502 },
    );
  }
}
