import { notFound } from "next/navigation";
import WorkspaceManagement from "../../../../workspace/WorkspaceManagement";

type PageProps = {
  params: { agentCode: string; section: string } | Promise<{ agentCode: string; section: string }>;
};

const sections = ["workspaces", "markdown", "sessions", "user-workspaces"] as const;

export default async function AgentWorkspaceSectionPage({ params }: PageProps) {
  const { agentCode, section } = await params;
  if (!sections.includes(section as (typeof sections)[number])) notFound();

  return (
    <WorkspaceManagement
      initialTab={section as (typeof sections)[number]}
      initialAgentCode={agentCode}
    />
  );
}
