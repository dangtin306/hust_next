import { promises as fs } from "fs";
import path from "path";

const navConfigPath = path.join(process.cwd(), "app_structure", "tabs_nav", "navConfig.json");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  try {
    const jsonContent = await fs.readFile(navConfigPath, "utf-8");
    return new Response(jsonContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...corsHeaders,
      },
    });
  } catch {
    return Response.json(
      {
        status: "error",
        message: "Cannot read hust_next/app_structure/tabs_nav/navConfig.json",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
