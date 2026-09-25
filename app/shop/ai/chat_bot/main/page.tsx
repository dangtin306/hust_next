import type { Metadata } from "next";
import { readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import MediaTechChatClient from "../media_tech";

export const metadata: Metadata = {
  title: "Media Tech AI Assistant | Chat Test",
  description: "Trợ lý AI thông minh hỗ trợ sinh viên - Media Tech",
};

export default async function RealChatPage() {
  let serviceDescriptions: Record<string, string> = {};
  try {
    const specPath = path.join(
      process.cwd(),
      "app",
      "api",
      "maps",
      "openclaw",
      "openclaw.yaml",
    );
    const spec = parse(await readFile(specPath, "utf8")) as {
      tags?: Array<{ name?: string; description?: string }>;
    };
    serviceDescriptions = Object.fromEntries(
      (spec.tags || [])
        .filter((tag) => tag.name && tag.description)
        .map((tag) => [tag.name!, tag.description!]),
    );
  } catch (error) {
    console.error("Could not load OpenClaw service descriptions from Swagger:", error);
  }

  return (
    <div className="w-full min-w-0">
      <MediaTechChatClient
        targetUrl="https://node_md.hust.media/openclaw"
        sessionKey="agent:test:user_502"
        storageKey="hust_chat_conv_id_real"
        model="gpt-5.6-luna"
        useResponsesApi={true}
        title="Media Tech AI Assistant"
        subtitle="Công cụ chat bot hỗ trợ bằng AI • Trực tuyến"
        agentBadge="Live AI"
        defaultUserId={502}
        serviceDescriptions={serviceDescriptions}
      />
    </div>
  );
}
