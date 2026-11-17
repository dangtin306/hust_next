import type { Metadata, Route } from "next";
import WorkspaceHomeGuide from "@/app/api/hust_media/workspace/WorkspaceHomeGuide";

export const metadata: Metadata = {
  title: "Hướng dẫn Workspace | Media Tech",
  description: "Hướng dẫn xem và quản lý workspace theo từng agent trong Media Tech.",
};

export default function WorkspaceHomePage() {
  return (
    <WorkspaceHomeGuide
      projectName="Media Tech"
      agentHomeHref={"/next/api/mt/agent/home" as Route}
      agentWorkspacePattern="/next/api/mt/agent/{agent_code}/workspace"
      workspaceMapHref={"/api/mt/n8n/maps_main" as Route}
    />
  );
}
