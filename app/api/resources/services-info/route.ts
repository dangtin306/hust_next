type ServiceInfoResponse = {
  status?: number;
  services?: Record<string, unknown>;
  [key: string]: unknown;
};

const API_ENDPOINT =
  "https://hust.media/api/orders/account/sellers/services/services_info.php";

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") || "").trim();

  if (!id || !/^\d{3,}$/.test(id)) {
    return jsonResponse({ status: 0, error: "Invalid or missing id." }, 400);
  }

  try {
    const upstream = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });

    if (!upstream.ok) {
      return jsonResponse(
        { status: 0, error: `Upstream HTTP ${upstream.status}.` },
        upstream.status
      );
    }

    const payload = (await upstream.json()) as ServiceInfoResponse;
    return jsonResponse(payload);
  } catch (error) {
    return jsonResponse(
      {
        status: 0,
        error: error instanceof Error ? error.message : "Failed to fetch service info.",
      },
      502
    );
  }
}
