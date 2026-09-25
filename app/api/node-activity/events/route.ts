import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_UPSTREAM_SSE_URL =
  process.env.NODE_ACTIVITY_SSE_URL ||
  "https://node_md.hust.media/openclaw/workflow/events";

/**
 * Route Handler proxy SSE cùng origin tới Node backend (node_md.hust.media)
 * - Browser kết nối theo basePath: /next/api/node-activity/events
 * - Giữ stream mở (streaming), không buffer toàn bộ response
 * - Chuyển tiếp header Last-Event-ID nếu có
 * - Đặt Cache-Control: no-cache, no-transform
 * - Hủy kết nối upstream khi client đóng kết nối
 * - Nếu upstream trả lỗi (404/5xx), trả đúng mã lỗi, KHÔNG bọc thành SSE 200 giả
 */
export async function GET(request: NextRequest) {
  const upstreamUrl =
    process.env.NODE_ACTIVITY_SSE_URL || DEFAULT_UPSTREAM_SSE_URL;

  const controller = new AbortController();

  // Hủy kết nối upstream khi browser ngắt kết nối
  request.signal.addEventListener("abort", () => {
    controller.abort();
  });

  const forwardHeaders: Record<string, string> = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  };

  const lastEventId = request.headers.get("last-event-id");
  if (lastEventId) {
    forwardHeaders["Last-Event-ID"] = lastEventId;
  }

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: "GET",
      headers: forwardHeaders,
      signal: controller.signal,
      cache: "no-store",
    });

    // Nếu upstream trả lỗi (ví dụ 404 Not Found), trả đúng HTTP status lỗi về browser
    if (!upstreamRes.ok || !upstreamRes.body) {
      const errorText = await upstreamRes.text().catch(() => "");
      return new Response(
        JSON.stringify({
          error: "upstream_unavailable",
          status: upstreamRes.status,
          upstream: upstreamUrl,
          message: `Upstream SSE trả HTTP ${upstreamRes.status}: ${upstreamRes.statusText || "Not Found"}`,
          detail: errorText,
        }),
        {
          status: upstreamRes.status,
          statusText: upstreamRes.statusText || "Not Found",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        }
      );
    }

    // Upstream trả 200 OK -> Stream trực tiếp body về client mà không buffer
    return new Response(upstreamRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    if (controller.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        error: "upstream_connection_failed",
        status: 502,
        upstream: upstreamUrl,
        message: `Không kết nối được Node backend SSE (${upstreamUrl}): ${errorMsg}`,
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      }
    );
  }
}
