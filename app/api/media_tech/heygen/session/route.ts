import { NextResponse } from "next/server";

const LIVEAVATAR_API_URL =
  process.env.LIVEAVATAR_API_URL || "https://api.liveavatar.com";

export async function POST() {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  const avatarId = process.env.LIVEAVATAR_AVATAR_ID;

  if (!apiKey || !avatarId) {
    return NextResponse.json(
      {
        error:
          "Thiếu LIVEAVATAR_API_KEY hoặc LIVEAVATAR_AVATAR_ID trong .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${LIVEAVATAR_API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "LITE",
        avatar_id: avatarId,
        is_sandbox: process.env.LIVEAVATAR_IS_SANDBOX !== "false",
      }),
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      data?: { session_token?: string; session_id?: string };
      error?: string;
      message?: string;
    };

    if (!response.ok || !payload.data?.session_token) {
      return NextResponse.json(
        {
          error:
            payload.message ||
            payload.error ||
            "HeyGen không cấp được session token. Kiểm tra API key và Avatar ID.",
        },
        { status: response.ok ? 502 : response.status },
      );
    }

    return NextResponse.json({
      sessionToken: payload.data.session_token,
      sessionId: payload.data.session_id,
    });
  } catch {
    return NextResponse.json(
      { error: "Không kết nối được LiveAvatar API." },
      { status: 502 },
    );
  }
}
