"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BookOpen,
  Code2,
  Cpu,
  FileCode,
  FileText,
  FolderTree,
  Info,
  Radio,
  RefreshCw,
  Shield,
  Workflow,
  X,
  Zap,
  Maximize2,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

type MapsProject = "media_tech" | "hust";
type VaultNodeData = {
  label?: string;
  category?: string;
  badge?: string;
  math?: string;
  description?: string;
  files?: string[];
  path?: string;
  displayPath?: string;
};
type PipelineNodeData = {
  icon?: string;
  label?: string;
  badge?: string;
  description?: string;
  subtext?: string;
};
type SectionLabelData = { icon?: string; title?: string; subtitle?: string };

function mapsMainApiUrl(resource: "graph" | "file", project: MapsProject, filePath?: string): string {
  const query = new URLSearchParams({ project });
  if (filePath) query.set("path", filePath);
  return `/next/api/media_tech/n8n/maps_main/${resource}?${query.toString()}`;
}

function toDisplayText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (value == null || typeof value === "boolean") return "";

  try {
    return JSON.stringify(value) ?? "";
  } catch {
    return "";
  }
}

// ==========================================
// HÀM TỰ ĐỘNG CĂN CHỈNH ĐỒ THỊ THEO CHUẨN .MD (AUTO-LAYOUT ENGINE)
// Tự sửa, tự căn giữa, cân đối tuyệt đối cho bất kỳ số lượng workspace nào
// ==========================================
function autoLayoutHustTopology(rawNodes: Node[], rawEdges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const workspaceNodes = rawNodes
    .filter((node) => node.data?.category === "workspace")
    .sort((a, b) => String(a.data?.label || a.id).localeCompare(String(b.data?.label || b.id)));
  const workspaceIds = new Set(workspaceNodes.map((node) => node.id));
  const rootNode = rawNodes.find((node) => node.id === "vault-agents-md");
  const headerNode = rawNodes.find((node) => node.id === "header-tier1");
  const headerPipeline = rawNodes.find((node) => node.id === "header-tier2");
  const pipelineNodes = rawNodes.filter((node) => node.type === "pipelineNode" || node.id.startsWith("pipe-"));
  const fileNodes = rawNodes.filter((node) => node.data?.category === "file" || node.id.startsWith("vault-file-"));
  const parentByFile = new Map<string, string>();

  for (const edge of rawEdges) {
    if (workspaceIds.has(edge.source)) parentByFile.set(edge.target, edge.source);
  }

  const filesByWorkspace = new Map<string, Node[]>();
  workspaceNodes.forEach((node) => filesByWorkspace.set(node.id, []));
  const rootFiles: Node[] = [];
  for (const node of fileNodes) {
    const parentId = parentByFile.get(node.id);
    if (parentId && filesByWorkspace.has(parentId)) filesByWorkspace.get(parentId)!.push(node);
    else rootFiles.push(node);
  }

  const columnsFor = (count: number) => (count >= 12 ? 3 : count >= 4 ? 2 : 1);
  const cardWidth = 260;
  const fileGapX = 24;
  const groupGap = 60;
  const groupWidths = workspaceNodes.map((workspace) => {
    const columnCount = columnsFor(filesByWorkspace.get(workspace.id)?.length || 0);
    return columnCount * cardWidth + (columnCount - 1) * fileGapX;
  });
  const groupsPerRow = 3;
  const workspaceRows = Array.from({ length: Math.ceil(workspaceNodes.length / groupsPerRow) }, (_, rowIndex) =>
    workspaceNodes.slice(rowIndex * groupsPerRow, (rowIndex + 1) * groupsPerRow),
  );
  const rowWidths = workspaceRows.map((row) =>
    row.reduce((sum, workspace) => sum + groupWidths[workspaceNodes.indexOf(workspace)], 0) + Math.max(row.length - 1, 0) * groupGap,
  );
  const totalWidth = Math.max(...rowWidths, 0);
  const positionedNodes: Node[] = [];

  if (headerNode) positionedNodes.push({ ...headerNode, position: { x: -180, y: -70 } });
  if (rootNode) positionedNodes.push({ ...rootNode, position: { x: -cardWidth / 2, y: 45 } });

  const rootFileGap = 24;
  const rootFilesWidth = rootFiles.length * cardWidth + Math.max(rootFiles.length - 1, 0) * rootFileGap;
  const rootFilesStartX = -rootFilesWidth / 2;
  rootFiles.forEach((node, index) => {
    positionedNodes.push({
      ...node,
      data: {
        ...node.data,
        label: String(node.data?.label || node.id).split("/").pop(),
        displayPath: node.data?.path,
      },
      position: { x: rootFilesStartX + index * (cardWidth + rootFileGap), y: 230 },
    });
  });

  let workspaceY = 420;
  const fileRowGap = 96;

  workspaceRows.forEach((rowWorkspaces, rowIndex) => {
    const rowWidth = rowWidths[rowIndex];
    let groupX = -rowWidth / 2;
    let maxFileRows = 0;

    rowWorkspaces.forEach((workspace) => {
      const workspaceIndex = workspaceNodes.indexOf(workspace);
      const workspaceFiles = (filesByWorkspace.get(workspace.id) || []).sort((a, b) =>
        String(a.data?.path || a.data?.label || a.id).localeCompare(String(b.data?.path || b.data?.label || b.id)),
      );
      const columnCount = columnsFor(workspaceFiles.length);
      const groupWidth = groupWidths[workspaceIndex];
      const workspaceX = groupX + (groupWidth - cardWidth) / 2;
      const fileStartY = workspaceY + 180;
      maxFileRows = Math.max(maxFileRows, Math.ceil(workspaceFiles.length / columnCount));

      positionedNodes.push({ ...workspace, position: { x: workspaceX, y: workspaceY } });

      workspaceFiles.forEach((file, index) => {
        const column = index % columnCount;
        const fileRow = Math.floor(index / columnCount);
        const fullPath = String(file.data?.path || "");
        const workspaceName = String(workspace.data?.label || "");
        const normalizedPath = fullPath.replace(/^\/+/, "");
        const workspacePrefix = `${workspaceName}/`;
        const displayPath = normalizedPath.startsWith(workspacePrefix)
          ? normalizedPath.slice(workspacePrefix.length)
          : normalizedPath;
        positionedNodes.push({
          ...file,
          data: {
            ...file.data,
            label: String(file.data?.label || fullPath).split("/").pop(),
            displayPath: displayPath || fullPath,
          },
          position: {
            x: groupX + column * (cardWidth + fileGapX),
            y: fileStartY + fileRow * fileRowGap,
          },
        });
      });

      groupX += groupWidth + groupGap;
    });

    workspaceY += 300 + maxFileRows * fileRowGap;
  });

  const otherNodes = rawNodes.filter((node) =>
    node !== rootNode && node !== headerNode && node !== headerPipeline &&
    !workspaceIds.has(node.id) && !fileNodes.some((file) => file.id === node.id) &&
    !pipelineNodes.some((pipeline) => pipeline.id === node.id),
  );
  otherNodes.forEach((node, index) => {
    positionedNodes.push({ ...node, position: { x: -cardWidth / 2, y: workspaceY + index * fileRowGap } });
  });

  if (headerPipeline) positionedNodes.push({ ...headerPipeline, position: { x: totalWidth / 2 + 120, y: -70 } });
  pipelineNodes.forEach((node, index) => {
    positionedNodes.push({ ...node, position: { x: totalWidth / 2 + 120, y: 50 + index * 130 } });
  });

  const updatedEdges = rawEdges.map((edge) => {
    const isWorkspaceFileEdge = workspaceIds.has(edge.source);
    return {
      ...edge,
      animated: false,
      type: "smoothstep",
      sourceHandle: "source-bottom",
      targetHandle: "target-top",
      style: isWorkspaceFileEdge
        ? { stroke: "#10b981", strokeWidth: 1.5, opacity: 0.65 }
        : { stroke: "#a855f7", strokeWidth: 1.8, opacity: 0.75 },
    };
  });

  return { nodes: positionedNodes, edges: updatedEdges };
}

function autoLayoutMediaTechTopology(rawNodes: Node[], rawEdges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const preferredOrder = ["workspace_backend", "workspace_media", "workspace_tech", "workspace_openclaw"];
  const pipelineOrder = ["pipe-webhook", "pipe-resolver", "pipe-openclaw", "pipe-media-tools", "pipe-sse-broadcast"];
  const workspaceNodes = rawNodes
    .filter((node) => node.data?.category === "workspace" || node.id.startsWith("vault-ws-"))
    .sort((a, b) => {
      const nameA = String(a.data?.label || a.id);
      const nameB = String(b.data?.label || b.id);
      const indexA = preferredOrder.indexOf(nameA);
      const indexB = preferredOrder.indexOf(nameB);
      if (indexA !== -1 || indexB !== -1) {
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        if (indexA !== indexB) return indexA - indexB;
      }
      return nameA.localeCompare(nameB);
    });
  const workspaceIds = new Set(workspaceNodes.map((node) => node.id));
  const agentNode = rawNodes.find((node) => node.id === "vault-agents-md");
  const soulNode = rawNodes.find((node) => node.id === "vault-soul-md");
  const identityNode = rawNodes.find((node) => node.id === "vault-identity-md");
  const headerTier1 = rawNodes.find((node) => node.id === "header-tier1");
  const headerTier2 = rawNodes.find((node) => node.id === "header-tier2");
  const pipelineNodes = rawNodes
    .filter((node) => node.type === "pipelineNode" || node.id.startsWith("pipe-"))
    .sort((a, b) => {
      const indexA = pipelineOrder.indexOf(a.id);
      const indexB = pipelineOrder.indexOf(b.id);
      return (indexA === -1 ? pipelineOrder.length : indexA) - (indexB === -1 ? pipelineOrder.length : indexB) || a.id.localeCompare(b.id);
    });
  const childNodes = rawNodes.filter((node) =>
    node.data?.category === "session" || node.data?.category === "file" ||
    node.id.startsWith("vault-chat-") || node.id.startsWith("vault-file-"),
  );
  const parentByChild = new Map<string, string>();
  rawEdges.forEach((edge) => {
    if (workspaceIds.has(edge.source)) parentByChild.set(edge.target, edge.source);
  });

  const childrenByWorkspace = new Map<string, Node[]>();
  workspaceNodes.forEach((workspace) => childrenByWorkspace.set(workspace.id, []));
  const rootFiles: Node[] = [];
  childNodes.forEach((node) => {
    const parentId = parentByChild.get(node.id);
    if (parentId && childrenByWorkspace.has(parentId)) childrenByWorkspace.get(parentId)!.push(node);
    else rootFiles.push(node);
  });

  const cardWidth = 260;
  const childGapX = 24;
  const groupGap = 60;
  const childRowGap = 120;
  const columnsFor = (count: number) => (count >= 12 ? 3 : count >= 4 ? 2 : 1);
  const groupWidths = workspaceNodes.map((workspace) => {
    const columns = columnsFor(childrenByWorkspace.get(workspace.id)?.length || 0);
    return columns * cardWidth + (columns - 1) * childGapX;
  });
  const groupsPerRow = 4;
  const workspaceRows = Array.from({ length: Math.ceil(workspaceNodes.length / groupsPerRow) }, (_, index) =>
    workspaceNodes.slice(index * groupsPerRow, (index + 1) * groupsPerRow),
  );
  const rowWidths = workspaceRows.map((row) =>
    row.reduce((sum, workspace) => sum + groupWidths[workspaceNodes.indexOf(workspace)], 0) + Math.max(row.length - 1, 0) * groupGap,
  );
  const maxRowWidth = Math.max(...rowWidths, cardWidth);
  const positionedNodes: Node[] = [];

  if (headerTier1) positionedNodes.push({ ...headerTier1, position: { x: -180, y: -70 } });
  if (agentNode) positionedNodes.push({ ...agentNode, position: { x: -cardWidth / 2, y: 55 } });
  if (soulNode) positionedNodes.push({ ...soulNode, position: { x: -cardWidth * 1.5 - 50, y: 55 } });
  if (identityNode) positionedNodes.push({ ...identityNode, position: { x: cardWidth / 2 + 55, y: 55 } });

  const rootColumns = columnsFor(rootFiles.length);
  const rootRows = Math.ceil(rootFiles.length / rootColumns);
  const rootWidth = rootColumns * cardWidth + (rootColumns - 1) * childGapX;
  rootFiles.forEach((node, index) => {
    const fullPath = String(node.data?.path || "");
    positionedNodes.push({
      ...node,
      data: {
        ...node.data,
        label: node.data?.category === "file"
          ? String(node.data?.label || fullPath).split("/").pop()
          : node.data?.label,
        displayPath: fullPath,
      },
      position: {
        x: -rootWidth / 2 + (index % rootColumns) * (cardWidth + childGapX),
        y: 230 + Math.floor(index / rootColumns) * childRowGap,
      },
    });
  });

  let workspaceY = 350 + rootRows * childRowGap;
  workspaceRows.forEach((rowWorkspaces, rowIndex) => {
    const rowWidth = rowWidths[rowIndex];
    let groupX = -rowWidth / 2;
    let maxChildRows = 0;

    rowWorkspaces.forEach((workspace) => {
      const workspaceIndex = workspaceNodes.indexOf(workspace);
      const children = (childrenByWorkspace.get(workspace.id) || []).sort((a, b) =>
        String(a.data?.path || a.data?.label || a.id).localeCompare(String(b.data?.path || b.data?.label || b.id)),
      );
      const columns = columnsFor(children.length);
      const groupWidth = groupWidths[workspaceIndex];
      const childStartY = workspaceY + 185;
      maxChildRows = Math.max(maxChildRows, Math.ceil(children.length / columns));
      positionedNodes.push({
        ...workspace,
        position: { x: groupX + (groupWidth - cardWidth) / 2, y: workspaceY },
      });

      children.forEach((node, index) => {
        const fullPath = String(node.data?.path || "");
        const workspaceName = String(workspace.data?.label || "");
        const normalizedPath = fullPath.replace(/^\/+/, "");
        const workspacePrefix = `${workspaceName}/`;
        const displayPath = normalizedPath.startsWith(workspacePrefix)
          ? normalizedPath.slice(workspacePrefix.length)
          : normalizedPath;
        positionedNodes.push({
          ...node,
          data: {
            ...node.data,
            label: node.data?.category === "file"
              ? String(node.data?.label || fullPath).split("/").pop()
              : node.data?.label,
            displayPath: displayPath || fullPath,
          },
          position: {
            x: groupX + (index % columns) * (cardWidth + childGapX),
            y: childStartY + Math.floor(index / columns) * childRowGap,
          },
        });
      });

      groupX += groupWidth + groupGap;
    });

    workspaceY += 315 + maxChildRows * childRowGap;
  });

  const otherNodes = rawNodes.filter((node) =>
    node !== agentNode && node !== soulNode && node !== identityNode && node !== headerTier1 && node !== headerTier2 &&
    !workspaceIds.has(node.id) && !childNodes.some((child) => child.id === node.id) &&
    !pipelineNodes.some((pipeline) => pipeline.id === node.id),
  );
  otherNodes.forEach((node, index) => {
    positionedNodes.push({ ...node, position: { x: -cardWidth / 2, y: workspaceY + index * childRowGap } });
  });

  const pipelineX = maxRowWidth / 2 + 180;
  if (headerTier2) positionedNodes.push({ ...headerTier2, position: { x: pipelineX - 45, y: -70 } });
  pipelineNodes.forEach((node, index) => {
    positionedNodes.push({ ...node, position: { x: pipelineX, y: 55 + index * 130 } });
  });

  const updatedEdges = rawEdges.map((edge) => {
    const isBridge = edge.id.includes("bridge") || (edge.source.startsWith("pipe-") && edge.target.startsWith("vault-"));
    if (isBridge) {
      const color = edge.id.includes("sse") ? "#06b6d4" : "#f59e0b";
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-left",
        targetHandle: "target-right",
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color },
        style: { stroke: color, strokeDasharray: "5 5", strokeWidth: 2 },
      };
    }
    if (edge.source === "vault-agents-md" && (edge.target === "vault-soul-md" || edge.target === "vault-identity-md")) {
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: edge.target === "vault-soul-md" ? "source-left" : "source-right",
        targetHandle: edge.target === "vault-soul-md" ? "target-right" : "target-left",
        style: { stroke: "#a855f7", strokeDasharray: "4 4", strokeWidth: 2 },
      };
    }
    if (workspaceIds.has(edge.source)) {
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        style: { stroke: "#10b981", strokeWidth: 1.6, opacity: 0.7 },
      };
    }
    if (edge.source.startsWith("pipe-")) {
      return { ...edge, type: "smoothstep", sourceHandle: "source-bottom", targetHandle: "target-top", style: { stroke: "#6366f1", strokeWidth: 2 } };
    }
    return { ...edge, type: "smoothstep", sourceHandle: "source-bottom", targetHandle: "target-top", style: { stroke: "#a855f7", strokeWidth: 1.8 } };
  });

  return { nodes: positionedNodes, edges: updatedEdges };
}

export function autoLayoutTopology(rawNodes: Node[], rawEdges: Edge[], project?: MapsProject): { nodes: Node[]; edges: Edge[] } {
  if (!rawNodes || rawNodes.length === 0) return { nodes: [], edges: [] };
  if (project === "hust" || rawNodes.some((node) => String(node.data?.label || node.id).startsWith("workspace_hust_"))) {
    return autoLayoutHustTopology(rawNodes, rawEdges);
  }
  if (project === "media_tech") return autoLayoutMediaTechTopology(rawNodes, rawEdges);

  // 1. Phân loại các node
  const workspaceNodes: Node[] = [];
  const sessionAndFileNodes: Node[] = [];
  const pipelineNodes: Node[] = [];
  let agentNode: Node | null = null;
  let soulNode: Node | null = null;
  let identityNode: Node | null = null;
  let headerTier1: Node | null = null;
  let headerTier2: Node | null = null;

  for (const node of rawNodes) {
    if (node.id === "header-tier1") {
      headerTier1 = node;
    } else if (node.id === "header-tier2") {
      headerTier2 = node;
    } else if (node.id === "vault-agents-md") {
      agentNode = node;
    } else if (node.id === "vault-soul-md") {
      soulNode = node;
    } else if (node.id === "vault-identity-md") {
      identityNode = node;
    } else if (
      node.data?.category === "workspace" ||
      node.id.startsWith("vault-ws-")
    ) {
      workspaceNodes.push(node);
    } else if (
      node.data?.category === "session" ||
      node.id.startsWith("vault-chat-") ||
      node.id.startsWith("vault-file-")
    ) {
      sessionAndFileNodes.push(node);
    } else if (
      node.type === "pipelineNode" ||
      node.id.startsWith("pipe-")
    ) {
      pipelineNodes.push(node);
    } else {
      workspaceNodes.push(node);
    }
  }

  // Thứ tự ưu tiên sắp xếp workspace nếu có
  const preferredOrder = ["workspace_backend", "workspace_media", "workspace_tech", "workspace_openclaw"];
  workspaceNodes.sort((a, b) => {
    const nameA = (a.data?.label || a.id) as string;
    const nameB = (b.data?.label || b.id) as string;
    const ia = preferredOrder.indexOf(nameA);
    const ib = preferredOrder.indexOf(nameB);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return nameA.localeCompare(nameB);
  });

  // 2. Tính toán lưới tọa độ tự động chuẩn xác tuyệt đối cho Tầng 1
  const nWs = Math.max(workspaceNodes.length, 1);
  const startX = 60;
  const colSpacingX = 310; // Card width 260 + gap 50 = 310
  const cardWidth = 260;

  // Tổng chiều rộng của toàn bộ dải workspace (từ mép trái cột 0 đến mép phải cột cuối)
  const totalVaultSpan = (nWs - 1) * colSpacingX + cardWidth;
  // Tâm đối xứng hình học chính xác = startX + totalVaultSpan / 2
  // Với 4 cột: 60 + ((3 * 310 + 260) / 2) = 60 + 595 = 655
  const vaultCenterX = startX + totalVaultSpan / 2;

  // Tầng 2 (Pipeline Engine) luôn đặt bên phải Tầng 1 với khoảng cách an toàn 160px
  const tier2X = Math.max(startX + totalVaultSpan + 160, 1400);

  const positionedNodes: Node[] = [];

  // A. Header Tầng 1 (Căn giữa toàn bộ cụm Knowledge Vault)
  if (headerTier1) {
    positionedNodes.push({
      ...headerTier1,
      position: { x: Math.round(vaultCenterX - 180), y: -60 },
    });
  }

  // B. Agent Node chính (AGENTS.md - Đặt tại chính tâm đối xứng hàng 1)
  const agentsX = Math.round(vaultCenterX - cardWidth / 2); // 655 - 130 = 525
  if (agentNode) {
    positionedNodes.push({
      ...agentNode,
      position: { x: agentsX, y: 60 },
    });
  }

  // C. SOUL.md (Căn bên trái AGENTS.md với khoảng cách 50px)
  if (soulNode) {
    const soulX = agentsX - cardWidth - 50; // 525 - 260 - 50 = 215
    positionedNodes.push({
      ...soulNode,
      position: { x: soulX, y: 60 },
    });
  }

  // D. IDENTITY.md (Căn bên phải AGENTS.md với khoảng cách 50px)
  if (identityNode) {
    const identityX = agentsX + cardWidth + 50; // 525 + 260 + 50 = 835
    positionedNodes.push({
      ...identityNode,
      position: { x: identityX, y: 60 },
    });
  }

  // E. Workspaces (Hàng 2: Y = 230, các cột tại startX + idx * colSpacingX)
  const wsIndexMap = new Map<string, number>();
  workspaceNodes.forEach((ws, idx) => {
    const posX = startX + idx * colSpacingX; // 60, 370, 680, 990
    wsIndexMap.set(ws.id, idx);
    positionedNodes.push({
      ...ws,
      position: { x: posX, y: 230 },
    });
  });

  // F. Session Chats & Files (Hàng 3: Xếp thẳng hàng dọc dưới từng workspace, Y = 470 hoàn toàn tách biệt khỏi đáy thẻ Workspace!)
  const wsChildCountMap = new Map<number, number>();
  sessionAndFileNodes.forEach((child) => {
    const parentEdge = rawEdges.find((e) => e.target === child.id);
    let colIdx = 0;
    if (parentEdge && wsIndexMap.has(parentEdge.source)) {
      colIdx = wsIndexMap.get(parentEdge.source)!;
    } else {
      for (const [wsId, idx] of wsIndexMap.entries()) {
        const rawName = wsId.replace("vault-ws-", "");
        if (child.id.includes(rawName)) {
          colIdx = idx;
          break;
        }
      }
    }

    const currentCount = wsChildCountMap.get(colIdx) || 0;
    wsChildCountMap.set(colIdx, currentCount + 1);

    const childX = startX + colIdx * colSpacingX;
    // Node đầu tiên (currentCount = 0): Y = 470 (cách đáy workspace 230+185=415 một khoảng 55px hoàn toàn thông thoáng)
    // Node tiếp theo (currentCount = 1): Y = 470 + 1 * 140 = 610
    const childY = 470 + currentCount * 140;

    positionedNodes.push({
      ...child,
      position: { x: childX, y: childY },
    });
  });

  // G. Header Tầng 2
  if (headerTier2) {
    positionedNodes.push({
      ...headerTier2,
      position: { x: tier2X - 45, y: -60 },
    });
  }

  // H. Pipeline Nodes Tầng 2 (Thẳng hàng X = tier2X, Y = 60, 190, 320, 450, 580)
  const pipelineOrder = [
    "pipe-webhook",
    "pipe-resolver",
    "pipe-openclaw",
    "pipe-media-tools",
    "pipe-sse-broadcast",
  ];

  pipelineNodes.sort((a, b) => {
    const ia = pipelineOrder.indexOf(a.id);
    const ib = pipelineOrder.indexOf(b.id);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.id.localeCompare(b.id);
  });

  pipelineNodes.forEach((p, idx) => {
    positionedNodes.push({
      ...p,
      position: { x: tier2X, y: 60 + idx * 130 },
    });
  });

  // 3. Chuẩn hóa Edges: mượt mà, định tuyến chính xác giữa các handle
  const updatedEdges: Edge[] = rawEdges.map((edge) => {
    const isBridge = edge.id.includes("bridge") || (edge.source.startsWith("pipe-") && edge.target.startsWith("vault-"));

    if (isBridge) {
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-left",
        targetHandle: "target-right",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: edge.id.includes("sse") ? "#06b6d4" : "#f59e0b",
        },
        style: {
          stroke: edge.id.includes("sse") ? "#06b6d4" : "#f59e0b",
          strokeDasharray: "5 5",
          strokeWidth: 2,
        },
      };
    }

    if (edge.source === "vault-agents-md") {
      if (edge.target === "vault-soul-md") {
        return {
          ...edge,
          type: "smoothstep",
          sourceHandle: "source-left",
          targetHandle: "target-right",
          style: { stroke: "#a855f7", strokeDasharray: "4 4", strokeWidth: 2 },
        };
      }
      if (edge.target === "vault-identity-md") {
        return {
          ...edge,
          type: "smoothstep",
          sourceHandle: "source-right",
          targetHandle: "target-left",
          style: { stroke: "#a855f7", strokeDasharray: "4 4", strokeWidth: 2 },
        };
      }
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        style: { stroke: "#a855f7", strokeWidth: 2 },
      };
    }

    if (edge.source.startsWith("vault-ws-")) {
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        style: { stroke: "#10b981", strokeWidth: 2 },
      };
    }

    if (edge.source.startsWith("pipe-")) {
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        style: { stroke: "#6366f1", strokeWidth: 2.5 },
      };
    }

    return {
      ...edge,
      type: "smoothstep",
    };
  });

  return { nodes: positionedNodes, edges: updatedEdges };
}

// ==========================================
// CUSTOM NODE COMPONENTS
// ==========================================

function VaultNode({ data, selected }: { data: VaultNodeData; selected?: boolean }) {
  const isSelected = selected;
  const isMarkdownFile = data.category === "file";
  const bgClass =
    data.category === "agent"
      ? "border-purple-500/80 bg-purple-950/40 text-purple-200"
      : data.category === "workspace"
      ? "border-emerald-500/80 bg-emerald-950/40 text-emerald-200"
      : data.category === "session"
      ? "border-cyan-500/80 bg-cyan-950/40 text-cyan-200"
      : "border-slate-600 bg-slate-900/60 text-slate-300";

  const badgeColor =
    data.category === "agent"
      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
      : data.category === "workspace"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : data.category === "session"
      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
      : "bg-slate-700/50 text-slate-300 border-slate-600";

  return (
    <div
      className={`w-[260px] rounded-xl border ${isMarkdownFile ? "p-2.5" : "p-3.5"} shadow-xl backdrop-blur-md transition-all duration-200 relative ${bgClass} ${
        isSelected ? "ring-2 ring-purple-400 shadow-purple-500/30 shadow-2xl scale-[1.02]" : "hover:border-slate-400"
      }`}
    >
      {/* Ẩn các chấm kết nối thô kệch, chỉ giữ neo kết nối vô hình để dây nối bắt điểm chuẩn xác và viền thẻ sạch bóng */}
      <Handle type="target" position={Position.Top} id="target-top" className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="target" position={Position.Left} id="target-left" style={{ top: "35%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Left} id="source-left" style={{ top: "65%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="target" position={Position.Right} id="target-right" style={{ top: "35%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Right} id="source-right" style={{ top: "65%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {data.category === "agent" ? (
            <Shield className="h-4 w-4 shrink-0 text-purple-400" />
          ) : data.category === "workspace" ? (
            <FolderTree className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : data.category === "session" ? (
            <FileText className="h-4 w-4 shrink-0 text-cyan-400" />
          ) : (
            <FileCode className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <span className="font-semibold text-xs tracking-wide text-white truncate max-w-[140px]">
            {data.label}
          </span>
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}>
          {data.badge || data.math}
        </span>
      </div>

      {data.description && !isMarkdownFile && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300 line-clamp-2">
          {data.description}
        </p>
      )}

      {/* Hiển thị danh sách các tệp .md mà workspace đang chứa */}
      {data.category === "workspace" && data.files && Array.isArray(data.files) && data.files.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="text-[10px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
            <FileCode className="h-3 w-3" />
            <span>Tài liệu .md ({data.files.length}):</span>
          </div>
          {data.files.length <= 3 ? (
            <div className="flex flex-wrap gap-1">
              {data.files.map((fileName: string) => (
                <span
                  key={fileName}
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-emerald-300 border border-emerald-500/30"
                >
                  📄 {fileName}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] leading-4 text-emerald-200/80">
              {data.files.length} tệp Markdown được liệt kê thành các thẻ bên dưới.
            </p>
          )}
        </div>
      )}

      {isMarkdownFile && data.path && (
        <div title={data.path} className="mt-1.5 text-[10px] font-mono text-slate-400 truncate bg-black/40 px-2 py-1 rounded border border-white/5">
          {data.displayPath || data.path}
        </div>
      )}

      {data.path && !isMarkdownFile && (
        <div className="mt-2 text-[10px] font-mono text-slate-400 truncate bg-black/40 px-2 py-1 rounded border border-white/5">
          {data.path}
        </div>
      )}
    </div>
  );
}

function PipelineNode({ data, selected }: { data: PipelineNodeData; selected?: boolean }) {
  const isSelected = selected;
  return (
    <div
      className={`w-[270px] rounded-xl border border-indigo-500/80 bg-indigo-950/40 p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 relative ${
        isSelected ? "ring-2 ring-indigo-400 shadow-indigo-500/30 shadow-2xl scale-[1.02]" : "hover:border-indigo-400"
      }`}
    >
      <Handle type="target" position={Position.Top} id="target-top" className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="target" position={Position.Left} id="target-left" style={{ top: "35%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Left} id="source-left" style={{ top: "65%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="target" position={Position.Right} id="target-right" style={{ top: "35%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Right} id="source-right" style={{ top: "65%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {data.icon === "webhook" ? (
            <Radio className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
          ) : data.icon === "code" ? (
            <Code2 className="h-4 w-4 shrink-0 text-sky-400" />
          ) : data.icon === "ai" ? (
            <Cpu className="h-4 w-4 shrink-0 text-pink-400" />
          ) : (
            <Workflow className="h-4 w-4 shrink-0 text-indigo-400" />
          )}
          <span className="font-semibold text-xs tracking-wide text-white truncate max-w-[150px]">
            {data.label}
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
          {data.badge}
        </span>
      </div>

      {data.description && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-200 line-clamp-2">
          {data.description}
        </p>
      )}

      {data.subtext && (
        <div className="mt-2 text-[10px] font-mono text-indigo-300 truncate bg-black/40 px-2 py-1 rounded border border-white/5">
          {data.subtext}
        </div>
      )}
    </div>
  );
}

function SectionLabelNode({ data }: { data: SectionLabelData }) {
  return (
    <div className="w-[360px] rounded-2xl border border-white/10 bg-black/60 p-3.5 shadow-2xl backdrop-blur-xl text-center">
      <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase text-white">
        {data.icon === "vault" ? (
          <BookOpen className="h-4 w-4 text-purple-400 shrink-0" />
        ) : (
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
        )}
        <span>{data.title}</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400 leading-snug">{data.subtitle}</p>
    </div>
  );
}

const nodeTypes = {
  vaultNode: VaultNode,
  pipelineNode: PipelineNode,
  sectionLabelNode: SectionLabelNode,
};

// ==========================================
// FLOW INNER COMPONENT (HỖ TRỢ FITVIEW & CONTROLS)
// ==========================================
function MapsMainCanvasInner({ project }: { project: MapsProject }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "vault" | "pipeline">("all");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const { fitView } = useReactFlow();

  // Load dữ liệu từ domain mẹ và tự động căn chỉnh
  const loadGraphFromDomain = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(mapsMainApiUrl("graph", project), { cache: "no-store" });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.ok === false) throw new Error(json.error || "Graph API returned an error");

      const rawNodes: Node[] = json.data?.nodes || json.graph?.nodes || json.nodes || [];
      const rawEdges: Edge[] = json.data?.edges || json.graph?.edges || json.edges || [];
      const workspaceCount = rawNodes.filter((node) => node.data?.category === "workspace").length;
      if (workspaceCount === 0) throw new Error("Graph API chưa trả workspace nào.");

      const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutTopology(rawNodes, rawEdges, project);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      setTimeout(() => {
        fitView({ padding: 0.18, duration: 400 });
      }, 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không xác định được lỗi tải sơ đồ.";
      console.error("Could not load Maps Main graph:", err);
      setNodes([]);
      setEdges([]);
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [project, setNodes, setEdges, fitView]);

  useEffect(() => {
    loadGraphFromDomain();
  }, [loadGraphFromDomain]);

  // Nút người dùng click để tự động căn giữa lại toàn bộ sơ đồ
  const handleReAlign = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutTopology(nodes, edges, project);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => {
      fitView({ padding: 0.18, duration: 400 });
    }, 50);
  }, [nodes, edges, project, setNodes, setEdges, fitView]);

  // Khi click vào node, load nội dung file .md trực tiếp từ API domain mẹ
  const onNodeClick = useCallback(async (_: React.MouseEvent, node: Node) => {
    if (node.type === "sectionLabelNode") return;
    setSelectedNode(node);
    setFileContent(null);
    setCopied(false);

    const relativePath = node.data?.path as string | undefined;
    if (relativePath) {
      try {
        const url = mapsMainApiUrl("file", project, relativePath);
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const content = json.content || json.data?.content;
          if (content) {
            setFileContent(content);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch file content:", err);
      }
    }
    setFileContent((node.data?.content as string) || null);
  }, [project]);

  const handleCopyContent = useCallback(() => {
    if (!fileContent) return;
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fileContent]);

  const filteredNodes = useMemo(() => {
    if (activeFilter === "vault") {
      return nodes.filter(
        (n) => n.id.startsWith("vault-") || n.id === "header-tier1"
      );
    }
    if (activeFilter === "pipeline") {
      return nodes.filter(
        (n) => n.id.startsWith("pipe-") || n.id === "header-tier2"
      );
    }
    return nodes;
  }, [nodes, activeFilter]);

  const filteredEdges = useMemo(() => {
    const visibleIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );
  }, [edges, filteredNodes]);

  const stats = useMemo(() => {
    const wsCount = nodes.filter((n) => n.data?.category === "workspace").length;
    const sessionCount = nodes.filter((n) => n.data?.category === "session").length;
    const pipeCount = nodes.filter((n) => n.type === "pipelineNode").length;
    return { wsCount, sessionCount, pipeCount };
  }, [nodes]);

  return (
    <div className="relative h-[88vh] w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-sans">
      {/* HEADER BAR */}
      <div className="absolute top-0 left-0 right-0 z-10 flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-400">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Bản đồ Workspace n8n
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                Auto-Align Live
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>Backend: <strong className="text-indigo-400">{project === "hust" ? "Hust · Node.js 2999" : "Media Tech · Node.js 8818"}</strong></span>
              <span>&bull;</span>
              <span>{stats.wsCount} Workspaces</span>
              <span>&bull;</span>
              <span>{stats.sessionCount} Sessions</span>
              <span>&bull;</span>
              <span>{stats.pipeCount} Pipeline Nodes</span>
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Toàn cảnh
            </button>
            <button
              onClick={() => setActiveFilter("vault")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                activeFilter === "vault"
                  ? "bg-purple-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tri thức (.md)
            </button>
            {stats.pipeCount > 0 && <button
              onClick={() => setActiveFilter("pipeline")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                activeFilter === "pipeline"
                  ? "bg-amber-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pipeline n8n
            </button>}
          </div>

          {/* NÚT TỰ CĂN CHỈNH */}
          <button
            onClick={handleReAlign}
            title="Tự động tính toán và căn chỉnh đều toàn bộ các node"
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-2.5 py-1 text-xs text-indigo-300 hover:text-white hover:bg-indigo-900/80 transition-colors shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Tự căn chỉnh
          </button>

          <button
            onClick={loadGraphFromDomain}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            Sync
          </button>

          <button
            onClick={() => fitView({ padding: 0.18, duration: 300 })}
            title="Căn giữa toàn màn hình"
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 p-1 text-slate-300 hover:text-white transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* REACT FLOW CANVAS */}
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedNode(null)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={1.8}
        className="pt-14"
      >
        <Background color="#334155" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-white [&>button]:!border-slate-800 [&>button]:!fill-white" />
        <MiniMap
          nodeColor={(node) => {
            if (node.id.startsWith("vault-")) return "#a855f7";
            if (node.id.startsWith("pipe-")) return "#6366f1";
            return "#64748b";
          }}
          className="!bg-slate-900/90 !border-slate-800 rounded-lg overflow-hidden"
          maskColor="rgba(15, 23, 42, 0.7)"
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-6 pt-16">
          <div className="max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-xl">
            {isLoading ? (
              <>
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-indigo-400" />
                <h2 className="mt-3 text-base font-semibold text-white">Đang tải sơ đồ workspace</h2>
              </>
            ) : (
              <>
                <Info className="mx-auto h-6 w-6 text-amber-400" />
                <h2 className="mt-3 text-base font-semibold text-white">Chưa tải được sơ đồ</h2>
                <p className="mt-2 break-words text-sm text-slate-300">{loadError || "API chưa trả dữ liệu workspace."}</p>
                <button
                  onClick={loadGraphFromDomain}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Thử tải lại
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* INSPECTOR DRAWER ĐỌC NỘI DUNG FILE .MD */}
      {selectedNode && (
        <div className="absolute right-4 top-16 bottom-4 z-20 w-80 md:w-96 rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Chi tiết Thực thể Tri thức (.md)
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3 overflow-y-auto max-h-[55vh] pr-1">
              <div>
                <div className="text-[11px] font-medium text-slate-400">Tên Node</div>
                <div className="text-sm font-semibold text-white">{toDisplayText(selectedNode.data.label)}</div>
              </div>

              {toDisplayText(selectedNode.data.math) && (
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Toán học ánh xạ</div>
                  <div className="inline-block mt-0.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/30">
                    {toDisplayText(selectedNode.data.math)}
                  </div>
                </div>
              )}

              {toDisplayText(selectedNode.data.description) && (
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Mô tả</div>
                  <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                    {toDisplayText(selectedNode.data.description)}
                  </p>
                </div>
              )}

              {toDisplayText(selectedNode.data.path) && (
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Tệp tin .md liên kết</div>
                  <div className="mt-0.5 text-xs font-mono text-emerald-400 bg-black/50 px-2 py-1.5 rounded border border-emerald-500/20 break-all">
                    {toDisplayText(selectedNode.data.path)}
                  </div>
                </div>
              )}

              {/* KHỐI NỘI DUNG MARKDOWN THỰC TẾ CỦA FILE */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Nội dung tệp (.md preview)</span>
                  {fileContent && (
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  )}
                </div>
                {fileContent ? (
                  <pre className="text-[11px] font-mono text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {fileContent}
                  </pre>
                ) : (
                  <div className="text-[11px] italic text-slate-500 bg-slate-950/50 p-2 rounded border border-slate-800">
                    Đang nạp nội dung file từ backend...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <button
              onClick={() => setSelectedNode(null)}
              className="w-full rounded-lg bg-slate-800 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Đóng bảng chi tiết
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MapsMainCanvas({ project = "media_tech" }: { project?: MapsProject }) {
  return (
    <ReactFlowProvider>
      <MapsMainCanvasInner project={project} />
    </ReactFlowProvider>
  );
}
