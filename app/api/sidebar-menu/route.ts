import { NextResponse } from "next/server";
import { getSidebarMenuServer, type SidebarPayload } from "@/app/components/sidebar_menu_server";

export async function POST(request: Request) {
  let payload: SidebarPayload;
  try {
    const body = (await request.json()) as Partial<SidebarPayload>;
    payload = {
      apikey: String(body.apikey || ""),
      main_domain: String(body.main_domain || "hust"),
      national_market: body.national_market === "vi" || body.national_market === "en" ? body.national_market : "vi",
    };
  } catch {
    return NextResponse.json(
      {
        api_status: "api_error:invalid_payload",
        api_results: { latest_version: "", sidebar_menu: [] },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const data = await getSidebarMenuServer(payload);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
