import WorkspaceManagement from "../../../workspace/WorkspaceManagement";

type PageProps = {
  params: { agentCode: string } | Promise<{ agentCode: string }>;
};

export default async function AgentWorkspacePage({ params }: PageProps) {
  const { agentCode } = await params;
  return <WorkspaceManagement initialTab="workspaces" initialAgentCode={agentCode} />;
}
