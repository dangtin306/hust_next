"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Bot, LoaderCircle, TriangleAlert } from "lucide-react";
import MediaTechChatClient, { type MediaTechChatClientProps } from "./media_main";

type AgentRecord = { agent_code?: string | null };
type AgentsResponse = { agents?: AgentRecord[]; message?: string };
type WorkspaceRecord = {
  agent_code?: string | null;
  is_selectable?: boolean;
  children?: WorkspaceRecord[];
};
type WorkspaceResponse = { data?: WorkspaceRecord[] };

type Props = Omit<MediaTechChatClientProps, "agent" | "sessionKey" | "storageKey"> & {
  storageKey: string;
};

export default function ChatTestAgentPicker({ storageKey, ...chatProps }: Props) {
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("automation");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/next/api/hust/agent/data", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as AgentsResponse | null;
      if (!response.ok || !Array.isArray(payload?.agents)) {
        throw new Error(payload?.message || `HTTP ${response.status} từ API danh sách agent.`);
      }
      const codes = [...new Set(payload.agents
        .map((item) => item.agent_code?.trim())
        .filter((code): code is string => Boolean(code)))].sort();
      const agentCodes = codes;

      let workspaceAgentCodes: string[] = [];
      try {
        const workspaceResponse = await fetch(
          "/next/api/hust/workspaces/main/data?per_page=50&page=1",
          { cache: "no-store" },
        );
        const workspacePayload = (await workspaceResponse.json().catch(() => null)) as WorkspaceResponse | null;
        if (workspaceResponse.ok && Array.isArray(workspacePayload?.data)) {
          const availableCodes = new Set<string>();
          const collect = (records: WorkspaceRecord[]) => {
            for (const record of records) {
              const code = record.agent_code?.trim();
              if (code && record.is_selectable !== false) availableCodes.add(code);
              if (record.children?.length) collect(record.children);
            }
          };
          collect(workspacePayload.data);
          workspaceAgentCodes = [...availableCodes];
        }
      } catch (workspaceError) {
        console.warn("Could not resolve the default Chat Test agent from workspace data:", workspaceError);
      }

      setAgents(agentCodes);
      setSelectedAgent((current) => {
        if (agentCodes.includes(current) && workspaceAgentCodes.includes(current)) return current;
        const preferredWorkspaceAgent = ["automation", "chat_bot", "test"].find(
          (code) => agentCodes.includes(code) && workspaceAgentCodes.includes(code),
        );
        if (preferredWorkspaceAgent) return preferredWorkspaceAgent;
        const listedWorkspaceAgent = workspaceAgentCodes.find((code) => agentCodes.includes(code));
        if (listedWorkspaceAgent) return listedWorkspaceAgent;
        if (agentCodes.includes(current)) return current;
        return agentCodes.includes("automation") ? "automation" : agentCodes.includes("test") ? "test" : agentCodes[0] || "automation";
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không tải được danh sách agent.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const storageKeyForAgent = `${storageKey}_agent_${encodeURIComponent(selectedAgent)}`;
  const agentControl = (
    <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1 shadow-sm">
      <Bot className="h-3.5 w-3.5 text-indigo-600" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Agent</span>
      <label className="flex items-center">
        <span className="sr-only">Chọn agent cho Chat Test</span>
        <select
          value={selectedAgent}
          onChange={(event) => setSelectedAgent(event.target.value)}
          disabled={loading || agents.length === 0}
          className="max-w-40 cursor-pointer bg-transparent py-0.5 font-mono text-[11px] font-semibold text-indigo-800 outline-none disabled:cursor-wait disabled:opacity-60"
        >
          {(agents.length ? agents : [selectedAgent]).map((code) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
      </label>
      {loading && <LoaderCircle className="h-3.5 w-3.5 animate-spin text-slate-400" aria-label="Đang tải agent" />}
      {error && (
        <button
          type="button"
          onClick={() => void loadAgents()}
          title={`Không tải được danh sách agent: ${error}. Bấm để thử lại.`}
          aria-label="Tải lại danh sách agent"
          className="inline-flex items-center text-amber-600 hover:text-amber-700"
        >
          <TriangleAlert className="h-3.5 w-3.5" />
        </button>
      )}
      {!loading && !error && agents.length === 0 && (
        <TriangleAlert className="h-3.5 w-3.5 text-amber-600" aria-label="Chưa có agent" />
      )}
    </div>
  );

  return (
    <div className={`flex h-full max-h-full min-h-0 w-full min-w-0 flex-col overflow-hidden ${chatProps.className ?? ""}`}>
      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Đang tải agent và workspace khả dụng…
          </div>
        ) : (
          <MediaTechChatClient
            {...chatProps}
            key={selectedAgent}
            agent={selectedAgent}
            sessionKey={`agent:${selectedAgent}:user_${chatProps.defaultUserId ?? 502}`}
            storageKey={storageKeyForAgent}
            agentControl={agentControl}
            className="h-full max-h-full min-h-0"
          />
        )}
      </div>
    </div>
  );
}
