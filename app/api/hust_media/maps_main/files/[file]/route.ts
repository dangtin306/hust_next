import { PRODUCTS, fileResponse, isFileKey } from "../../../../media_tech/maps_main/home/knowledge";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  if (!isFileKey(file)) {
    return new Response("Không có tệp này.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return fileResponse(PRODUCTS.hust, file);
}
