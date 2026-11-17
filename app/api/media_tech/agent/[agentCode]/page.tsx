import { redirect } from "next/navigation";

type PageProps = {
  params: { agentCode: string } | Promise<{ agentCode: string }>;
};

export default async function AgentPage({ params }: PageProps) {
  const { agentCode } = await params;
  redirect(`/api/mt/agent/${encodeURIComponent(agentCode)}/workspace`);
}
