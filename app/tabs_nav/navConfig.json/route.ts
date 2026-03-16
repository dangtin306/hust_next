import { promises as fs } from "fs";
import path from "path";

const navConfigPath = path.join(process.cwd(), "app_structure", "tabs_nav", "navConfig.json");

export async function GET() {
  try {
    const jsonContent = await fs.readFile(navConfigPath, "utf-8");
    return new Response(jsonContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        status: "error",
        message: "Cannot read hust_next/app_structure/tabs_nav/navConfig.json",
      },
      { status: 500 }
    );
  }
}
