import { NextResponse } from "next/server";
import { clearSidebarMenuServerCache } from "@/app/components/sidebar_menu_server";

export async function POST() {
  await clearSidebarMenuServerCache();
  return NextResponse.json({ ok: true, message: "server sidebar cache cleared" });
}
