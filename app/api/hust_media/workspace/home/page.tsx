import type { Metadata, Route } from "next";
import WorkspaceHomeGuide from "../WorkspaceHomeGuide";

export const metadata: Metadata = {
  title: "Hướng dẫn Workspace | Hust Media",
  description: "Hướng dẫn xem và quản lý workspace theo từng agent trong Hust Media.",
};

export default function WorkspaceHomePage() {
  return (
    <WorkspaceHomeGuide
      projectName="Hust Media"
      agentHomeHref={"/next/api/hust/agent/home" as Route}
      agentWorkspacePattern="/next/api/hust/agent/{agent_code}/workspace"
      workspaceMapHref={"/api/hust/workflow/maps_main" as Route}
    />
  );
}
