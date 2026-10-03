"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  OPENCLAW_CHAT_COMPLETIONS_ENDPOINT,
  OPENCLAW_RESPONSES_ENDPOINT,
  OPENCLAW_IMAGE_GENERATIONS_ENDPOINT,
  getLaravelChatSession,
  rememberLaravelChatSession,
  apiEnsureLaravelRoom,
  apiPersistChatMessage,
  apiCreateConversation,
  apiCreateWorkspaceSession,
  apiResetOpenClawChat,
  apiSelectWorkspace,
  apiUpdateWorkspaceRouting,
  apiFetchWorkspaces,
  apiFetchUserWorkspaces,
  apiFetchRoomMessages,
  apiSendOpenClawRequest,
  type WorkspaceOption,
} from "../api/media_api";
import {
  fetchInitialChatMessages,
  fetchInitialChatRooms,
} from "../main/InitialChatLoader";

export * from "../api/media_api";

export type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  isError?: boolean;
  isHistoryErrorPrompt?: boolean;
  imageUrl?: string;
  serviceId?: string;
  serviceDescription?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    cacheReadTokens?: number;
    totalTokens?: number;
    contextPercentage?: number;
    model?: string;
  };
};

export type MediaTechService =
  | "media_text_to_image"
  | "media_text_to_text"
  | "media_content_smart"
  | "media_spell_check"
  | "media_script_writing"
  | "media_image_to_text"
  | "media_text_to_speech";

export type AttachedImage = {
  name: string;
  mediaType: string;
  dataUrl: string;
};

export type SpellCorrection = {
  word: string;
  suggestion: string;
};

export function getTokenUsage(data: unknown, modelFallback?: string): Message["usage"] {
  const response = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const usage = response.usage;
  if (!usage || typeof usage !== "object") return undefined;
  const tokenCounts = usage as Record<string, unknown>;
  const getCount = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;

  const totalInputTokens = getCount(tokenCounts.input_tokens) ?? getCount(tokenCounts.prompt_tokens);
  const outputTokens = getCount(tokenCounts.output_tokens) ?? getCount(tokenCounts.completion_tokens);
  const inputDetails = tokenCounts.input_tokens_details;
  const promptDetails = tokenCounts.prompt_tokens_details;
  const cacheReadTokens =
    getCount(tokenCounts.cached_tokens) ??
    getCount(tokenCounts.cache_read_tokens) ??
    getCount(
      inputDetails && typeof inputDetails === "object"
        ? (inputDetails as Record<string, unknown>).cached_tokens
        : undefined,
    ) ??
    getCount(
      promptDetails && typeof promptDetails === "object"
        ? (promptDetails as Record<string, unknown>).cached_tokens
        : undefined,
    );
  const inputTokens = totalInputTokens === undefined
    ? undefined
    : Math.max(0, totalInputTokens - (cacheReadTokens ?? 0));
  const calculatedTotal =
    totalInputTokens !== undefined && outputTokens !== undefined
      ? totalInputTokens + outputTokens
      : undefined;
  const totalTokens =
    getCount(tokenCounts.total_tokens) ??
    (calculatedTotal !== undefined && Number.isFinite(calculatedTotal)
      ? calculatedTotal
      : undefined);
  const contextPercentage =
    getCount(tokenCounts.context_percentage) ?? getCount(response.context_percentage);
  const model =
    (typeof response.model === "string" && response.model.trim() ? response.model : undefined) ??
    modelFallback;

  if (
    inputTokens === undefined &&
    outputTokens === undefined &&
    cacheReadTokens === undefined &&
    totalTokens === undefined &&
    contextPercentage === undefined
  ) {
    return undefined;
  }
  if (
    inputTokens === 0 &&
    outputTokens === 0 &&
    cacheReadTokens === undefined &&
    totalTokens === 0
  ) {
    return undefined;
  }

  return {
    inputTokens,
    outputTokens,
    cacheReadTokens: cacheReadTokens ?? 0,
    totalTokens,
    contextPercentage: contextPercentage !== undefined && contextPercentage <= 100
      ? contextPercentage
      : undefined,
    model,
  };
}

export const tokenNumberFormat = new Intl.NumberFormat("vi-VN");
export const compactTokenNumberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatCompactTokenCount(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0";
  if (value < 1_000) return String(Math.trunc(value));

  let unit = value >= 1_000_000 ? "m" : "k";
  let scaled = value / (unit === "m" ? 1_000_000 : 1_000);
  if (unit === "k" && Math.round(scaled * 10) / 10 >= 1_000) {
    unit = "m";
    scaled = value / 1_000_000;
  }
  return `${compactTokenNumberFormat.format(scaled).replace(/\.0$/, "")}${unit}`;
}

export function mapLaravelHistory(items: any[]): Message[] {
  let previousUpstream: Record<string, any> | null = null;

  return items.map((item, index) => {
    const isUser = item?.role === "user";
    if (isUser && item?.upstream && typeof item.upstream === "object") {
      previousUpstream = item.upstream;
    }
    const upstream = item?.upstream || (!isUser ? previousUpstream : null);
    const historyUsage = item?.usage ?? upstream?.usage ?? upstream;
    const timestamp = item?.created_at ? new Date(item.created_at) : null;
    const time = timestamp && !Number.isNaN(timestamp.getTime())
      ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

    return {
      id: String(item?.id ?? `history-${index}`),
      sender: isUser ? "user" : "bot",
      text: String(item?.content ?? ""),
      time,
      serviceId: isUser ? undefined : item?.service_id ?? upstream?.service_id,
      isError: !isUser && Number(upstream?.http_status) >= 400,
      usage: !isUser
        ? getTokenUsage(
            { usage: historyUsage, model: item?.model ?? upstream?.model },
            item?.model,
          )
        : undefined,
    };
  });
}

export const SUGGESTIONS = [
  {
    icon: "💬",
    title: "Chatbot thuần",
    description: "Trò chuyện tự do với AI thông qua endpoint Responses.",
    endpoint: "POST /openclaw/v1/responses",
    apiService: "media_text_to_text" as const,
    prompt: "",
  },
  {
    icon: "🎨",
    title: "media_text_to_image",
    description: "Tạo hình ảnh thông qua image route của OpenClaw.",
    endpoint: "POST /openclaw/v1/images/generations",
    apiService: "media_text_to_image" as const,
    prompt: "Tạo một hình ảnh: ",
  },
  {
    icon: "✍️",
    title: "media_content_smart",
    description: "Viết nội dung thông minh theo title, description, length và tone.",
    endpoint: "POST /openclaw/v1/responses",
    apiService: "media_content_smart" as const,
    prompt: "/skill media_content_smart\nViết nội dung theo yêu cầu sau: ",
  },
  {
    icon: "📝",
    title: "media_spell_check",
    description: "Sửa lỗi chính tả thông qua endpoint Responses.",
    endpoint: "POST /openclaw/v1/responses",
    apiService: "media_spell_check" as const,
    prompt: "/skill media_spelling\nHãy sửa lỗi chính tả trong đoạn văn sau:\n",
  },
  {
    icon: "🎬",
    title: "media_script_writing",
    description: "Viết script thông qua endpoint Responses.",
    endpoint: "POST /openclaw/v1/responses",
    apiService: "media_script_writing" as const,
    prompt: "/skill media_script_writing\nViết kịch bản theo yêu cầu sau: ",
  },
  {
    icon: "🔎",
    title: "media_image_to_text",
    description: "OCR và phân tích hình ảnh thông qua endpoint Responses.",
    endpoint: "POST /openclaw/v1/responses",
    apiService: "media_image_to_text" as const,
    prompt: "media_image_to_text: Hãy OCR và phân tích hình ảnh này. ",
  },
  {
    icon: "🔊",
    title: "media_text_to_speech",
    description: "Tạo Text-to-speech thông qua service TTS đã cấu hình.",
    endpoint: "POST /openclaw/v1/responses",
    apiService: "media_text_to_speech" as const,
    prompt: "media_text_to_speech: Đọc đoạn văn bản sau bằng giọng tiếng Việt:\n",
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Xin chào bạn! 👋 Mình là **Media Tech AI Assistant** (kết nối trực tiếp **OpenClaw Production Gateway**).\n\nMình có thể hỗ trợ bạn tra cứu tài liệu học phần, lập trình, viết kịch bản, và hướng dẫn sử dụng các công cụ trong hệ thống Media Tech.\n\nBạn muốn tìm hiểu hoặc cần hỗ trợ gì hôm nay?",
    time: "Vừa xong",
  },
];

export function createCorrelationId(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === "function") {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

export function parseSpellCorrections(text: string): SpellCorrection[] | null {
  const normalized = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const candidates = [normalized];
  const embeddedArrayStart = normalized.indexOf("[");
  const embeddedArrayEnd = normalized.lastIndexOf("]");
  if (embeddedArrayStart >= 0 && embeddedArrayEnd > embeddedArrayStart) {
    candidates.push(normalized.slice(embeddedArrayStart, embeddedArrayEnd + 1));
  }

  let parsed: unknown;
  let didParse = false;
  for (const candidate of candidates) {
    try {
      parsed = JSON.parse(candidate);
      didParse = true;
      break;
    } catch {}
  }
  if (!didParse) return null;

  const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  const root = asRecord(parsed);
  const hasCorrectionList = Array.isArray(parsed) || ["corrections", "results", "items", "data"]
    .some((key) => Array.isArray(root?.[key]));
  const rows = Array.isArray(parsed)
    ? parsed
    : Array.isArray(root?.corrections)
    ? root.corrections
    : Array.isArray(root?.results)
    ? root.results
    : Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root?.data)
    ? root.data
    : root
    ? [root]
    : [];
  const getText = (...values: unknown[]) =>
    values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim();
  const corrections = rows.flatMap((row): SpellCorrection[] => {
    const entry = asRecord(row);
    if (!entry) return [];
    const word = getText(entry.word, entry.original, entry.incorrect, entry.incorrect_word, entry.source);
    const suggestion = getText(
      entry.suggestion,
      entry.corrected,
      entry.correction,
      entry.replacement,
      entry.correct_word,
    );
    return word && suggestion ? [{ word, suggestion }] : [];
  });

  return corrections.length || hasCorrectionList ? corrections : null;
}

export type MediaTechChatClientProps = {
  onClose?: () => void;
  className?: string;
  isDrawer?: boolean;
  targetUrl?: string; // e.g. "https://node_md.hust.media/openclaw"
  agent?: string; // e.g. "test"
  sessionKey?: string; // e.g. "agent:test:main"
  storageKey?: string;
  model?: string;
  title?: string;
  subtitle?: string;
  agentBadge?: string;
  useResponsesApi?: boolean;
  hideModel?: boolean;
  showWorkspaceUpdateButton?: boolean;
  defaultUserId?: number | string | null;
  createUserIfMissing?: boolean;
  showWelcomeMessage?: boolean;
  serviceDescriptions?: Record<string, string>;
};

function getDefaultWorkspaceCode(workspaceList: WorkspaceOption[]): string {
  const parent =
    workspaceList.find(
      (workspace) =>
        workspace.slug && workspace.parent_workspace_code === workspace.slug,
    ) ??
    workspaceList.find((workspace) =>
      workspaceList.some(
        (child) =>
          child.parent_workspace_code === workspace.slug ||
          child.parent_workspace_code === workspace.work_space_code,
      ),
    ) ??
    workspaceList[0];
  return parent?.work_space_code ?? "";
}

export function useMediaChatProcess({
  isDrawer = false,
  targetUrl,
  agent,
  sessionKey: propSessionKey,
  storageKey: propStorageKey,
  model: propModel = "gpt-5.6-luna",
  useResponsesApi = false,
  defaultUserId = 502,
  createUserIfMissing = false,
  showWelcomeMessage = true,
  serviceDescriptions = {},
}: MediaTechChatClientProps = {}) {
  const initialMessages = showWelcomeMessage ? INITIAL_MESSAGES : [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [selectedWorkspaceCode, setSelectedWorkspaceCode] = useState("");
  const [isWorkspaceSelectionRequired, setIsWorkspaceSelectionRequired] = useState(false);
  const [workspaceSelectionError, setWorkspaceSelectionError] = useState("");
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isUpdatingWorkspaces, setIsUpdatingWorkspaces] = useState(false);
  const [isSelectingWorkspace, setIsSelectingWorkspace] = useState(false);
  const [workspaceSwitchProgress, setWorkspaceSwitchProgress] = useState(0);
  const [workspaceSwitchStatus, setWorkspaceSwitchStatus] = useState("");
  const [workspaceSwitchName, setWorkspaceSwitchName] = useState("");
  const [selectedService, setSelectedService] = useState<MediaTechService | null>(null);
  const [isServiceMenuExpanded, setIsServiceMenuExpanded] = useState(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRestoringChat, setIsRestoringChat] = useState(true);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoreStatus, setRestoreStatus] = useState("Đang khởi tạo phiên chat…");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | string>(defaultUserId ?? "");
  const [isUserIdPromptOpen, setIsUserIdPromptOpen] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [historyFetchError, setHistoryFetchError] = useState<{
    failedRoomId: string | number;
    upstreamConversationId?: string;
    errorStatus?: number | string;
  } | null>(null);
  const [isRetryingHistory, setIsRetryingHistory] = useState(false);
  const isChatLocked = Boolean(historyFetchError || isWorkspaceSelectionRequired);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomSyncPromisesRef = useRef(new Map<string, Promise<string | null>>());
  const initialPublicConversationRef = useRef<{
    storageKey: string;
    promise: ReturnType<typeof apiCreateConversation>;
  } | null>(null);
  const serviceMenuRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const justSentRef = useRef(false);
  const lastResponseIdRef = useRef<string | null>(null);
  const workspaceSwitchLockRef = useRef(false);
  const workspaceUpdateLockRef = useRef(false);

  const activeStorageKey =
    propStorageKey ||
    (agent
      ? `media_tech_conv_id_${agent}`
      : isDrawer
      ? "hust_chat_conv_id_real"
      : "hust_chat_conv_id_demo");

  const baseSession =
    propSessionKey ||
    (agent
      ? `agent:${agent}:user_${userId}`
      : isDrawer
      ? `agent:chat_bot:user_${userId}`
      : `agent:test:user_${userId}`);

  // Dynamic session key ensuring user_id is incorporated
  const effectiveSessionKey = baseSession.includes(":user_")
    ? baseSession.replace(/:user_[^:]*$/, `:user_${userId}`)
    : `${baseSession}:user_${userId}`;

  const activeSessionKey = effectiveSessionKey;

  const targetAgent = agent || (effectiveSessionKey.includes("chat_bot") ? "chat_bot" : "test");
  const openClawUrl = `https://oc.hust.media/md_1/chat/${targetAgent}/user_${encodeURIComponent(String(userId || ""))}`;
  const activeModel = propModel;

  const ensureLaravelRoom = (
    upstreamConversationId: string,
    title: string,
    model: string,
    roomUserId: number | string | null = userId,
  ): Promise<string | null> => {
    const existing = roomSyncPromisesRef.current.get(upstreamConversationId);
    if (existing) return existing;

    const pending = apiEnsureLaravelRoom({
      upstreamConversationId,
      title,
      model,
      userId: roomUserId,
      agent: targetAgent,
    }).catch((error) => {
      roomSyncPromisesRef.current.delete(upstreamConversationId);
      if (error?.code === "CONVERSATION_ALREADY_LINKED") {
        throw error;
      }
      console.warn("Không đồng bộ được phòng chat với Laravel:", error);
      return null;
    });

    roomSyncPromisesRef.current.set(upstreamConversationId, pending);
    return pending;
  };

  const persistChatTurn = async ({
    conversationId: upstreamConversationId,
    title,
    userMessage,
    assistantMessage,
    serviceId,
    model,
    responseData,
    httpStatus,
    errorMessage,
  }: {
    conversationId: string | null;
    title: string;
    userMessage: string;
    assistantMessage: string | null;
    serviceId: string;
    model: string;
    responseData?: Record<string, any>;
    httpStatus: number;
    errorMessage: string | null;
  }) => {
    if (!upstreamConversationId) return;

    try {
      const roomId = await ensureLaravelRoom(upstreamConversationId, title, model);
      if (!roomId) return;

      const usage = responseData?.usage && typeof responseData.usage === "object"
        ? responseData.usage
        : {};
      const inputTokenDetails = usage.input_tokens_details;
      const promptTokenDetails = usage.prompt_tokens_details;
      const cachedTokens =
        usage.cached_tokens ??
        usage.cache_read_tokens ??
        (inputTokenDetails && typeof inputTokenDetails === "object"
          ? (inputTokenDetails as Record<string, unknown>).cached_tokens
          : undefined) ??
        (promptTokenDetails && typeof promptTokenDetails === "object"
          ? (promptTokenDetails as Record<string, unknown>).cached_tokens
          : undefined) ??
        0;

      await apiPersistChatMessage({
        roomId,
        userId,
        userMessage,
        assistantMessage,
        serviceId,
        model,
        upstreamResponseId: responseData?.id ?? null,
        usage: {
          input_tokens: usage.input_tokens ?? usage.prompt_tokens ?? 0,
          cached_tokens: cachedTokens,
          output_tokens: usage.output_tokens ?? usage.completion_tokens ?? 0,
          total_tokens: usage.total_tokens ?? 0,
        },
        httpStatus,
        errorMessage,
      });
    } catch (error) {
      console.warn("Không lưu được lượt chat vào Laravel; phản hồi Node.js vẫn được giữ:", error);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedService]);

  // Create or load conversation session
  const createConversation = async (
    overrideUserId?: number | string | null,
    onRoomLinkStart?: () => void,
  ): Promise<string | null> => {
    try {
      const activeUid = overrideUserId !== undefined && overrideUserId !== null ? overrideUserId : userId;
      const conversationSessionKey = baseSession.includes(":user_")
        ? baseSession.replace(/:user_[^:]*$/, `:user_${activeUid}`)
        : `${baseSession}:user_${activeUid}`;

      const { conversationId: convKey, userId: returnedUserId } = await apiCreateConversation({
        sessionKey: conversationSessionKey,
        userId: activeUid,
        targetUrl,
      });

      const workspaceUserId = returnedUserId ?? activeUid;
      if (workspaceUserId !== null && workspaceUserId !== undefined && workspaceUserId !== "") {
        try {
          await apiCreateWorkspaceSession({
            userId: workspaceUserId,
            sessionKey: conversationSessionKey,
            targetUrl,
          });
        } catch (workspaceSessionError) {
          console.warn("Không khởi tạo được workspace session:", workspaceSessionError);
        }
      }

      if (returnedUserId !== null && returnedUserId !== undefined) {
        setUserId(returnedUserId);
        try {
          window.localStorage.setItem(`${activeStorageKey}_user_id`, String(returnedUserId));
        } catch {}
      }
      if (convKey) {
        setConversationId(convKey);
        try {
          window.localStorage.setItem(activeStorageKey, convKey);
        } catch {}
        onRoomLinkStart?.();
        void ensureLaravelRoom(convKey, "Cuộc trò chuyện mới", activeModel, activeUid).catch((err) => {
          if (err?.code !== "CONVERSATION_ALREADY_LINKED") {
            console.warn("Không đồng bộ được phòng chat với Laravel:", err);
          }
        });
        return convKey;
      }
    } catch (err) {
      console.warn("Lỗi khởi tạo phòng trò chuyện:", err);
    }
    return null;
  };

  useEffect(() => {
    let cancelled = false;
    const initializeChat = async () => {
      let retryCount = 0;
      const maxRetries = 2;
      let workspacesLoaded = false;
      setIsWorkspaceSelectionRequired(false);
      setWorkspaceSelectionError("");

      while (!cancelled && retryCount <= maxRetries) {
        let savedConv: string | null = null;
        let savedUid: string | null = null;
        let effectiveUserId: number | string | null = null;
        const updateProgress = (progress: number, status: string) => {
          setRestoreProgress(progress);
          setRestoreStatus(status);
        };
      const loadWorkspaces = async (
          workspaceUserId?: number | string | null,
          progressRange: { start: number; listDone: number; userStart: number; done: number } = {
            start: 3,
            listDone: 10,
            userStart: 12,
            done: 20,
          },
        ) => {
          if (workspacesLoaded) return;
          setIsLoadingWorkspaces(true);
          try {
            updateProgress(progressRange.start, "Đang tải danh sách workspace từ Laravel…");
            const workspaceList = await apiFetchWorkspaces();
            if (cancelled) return;
            updateProgress(progressRange.listDone, "Đã tải danh sách; đang kiểm tra workspace active của user…");
            let userWorkspaces: WorkspaceOption[] = [];
            let userWorkspaceLookupAttempted = false;
            let userWorkspaceLookupSucceeded = false;
            if (workspaceUserId !== null && workspaceUserId !== undefined && workspaceUserId !== "") {
              userWorkspaceLookupAttempted = true;
              try {
                updateProgress(progressRange.userStart, "Đang kiểm tra workspace user đã chọn trên OpenClaw…");
                userWorkspaces = await apiFetchUserWorkspaces(workspaceUserId, targetUrl);
                userWorkspaceLookupSucceeded = true;
              } catch (userWorkspaceError) {
                console.warn("Không lấy được workspace đang active của user:", userWorkspaceError);
              }
            }
            if (cancelled) return;
            setWorkspaces(workspaceList);
            const activeWorkspaceCode = userWorkspaces.find((userWorkspace) =>
              userWorkspace.work_space_selected === true &&
              workspaceList.some(
                (workspace) => workspace.work_space_code === userWorkspace.work_space_code,
              ),
            )?.work_space_code;
            setIsWorkspaceSelectionRequired(
              userWorkspaceLookupAttempted && (!userWorkspaceLookupSucceeded || !activeWorkspaceCode),
            );
            setWorkspaceSelectionError(
              userWorkspaceLookupAttempted && !userWorkspaceLookupSucceeded
                ? "Không kiểm tra được workspace đang chọn; hãy chọn workspace để tiếp tục."
                : "",
            );
            setSelectedWorkspaceCode((current) => {
              if (userWorkspaceLookupAttempted) return activeWorkspaceCode || "";
              return workspaceList.some((workspace) => workspace.work_space_code === current)
                ? current
                : getDefaultWorkspaceCode(workspaceList);
            });
            updateProgress(progressRange.done, "Đã khôi phục workspace; đang kiểm tra phòng chat…");
          } catch (workspaceError) {
            console.warn("Không tải được danh sách workspace:", workspaceError);
            if (cancelled) return;
            setWorkspaces([]);
            updateProgress(progressRange.done, "Không tải được workspace; đang tiếp tục khôi phục chat…");
          } finally {
            if (!cancelled) setIsLoadingWorkspaces(false);
            workspacesLoaded = true;
          }
        };

        const restoreFromRoom = async (
          targetRoomId: number | string,
          upstreamConvId: string,
          turnResponseId?: string | null,
          historyProgress = 60,
        ): Promise<boolean> => {
          let historyItems: any[] = [];
          try {
            historyItems = await fetchInitialChatMessages(
              targetRoomId,
              updateProgress,
              historyProgress,
            );
          } catch (historyErr: any) {
            console.error("Lỗi khi tải lịch sử tin nhắn (POST /messages/list):", historyErr);
            if (cancelled) return true;
            const conversationIdValue = String(upstreamConvId);
            setConversationId(conversationIdValue);
            roomSyncPromisesRef.current.set(conversationIdValue, Promise.resolve(String(targetRoomId)));
            setHistoryFetchError({
              failedRoomId: String(targetRoomId),
              upstreamConversationId: conversationIdValue,
              errorStatus: historyErr?.message || "Lỗi tải dữ liệu",
            });
            setMessages([
              {
                id: "error-history-prompt",
                sender: "bot",
                text: `⚠️ **Không thể tải danh sách tin nhắn cũ** từ máy chủ (\`POST api/chat/bot/rooms/${targetRoomId}/messages/list\`).\n\nBạn có muốn thử **Tải lại** danh sách tin nhắn hay **Tạo mới** cuộc trò chuyện để bắt đầu lại?`,
                time: "Hệ thống",
                isError: true,
                isHistoryErrorPrompt: true,
              },
            ]);
            updateProgress(100, "Lỗi tải lịch sử tin nhắn");
            return true;
          }

          if (cancelled) return true;
          const conversationIdValue = String(upstreamConvId);
          setConversationId(conversationIdValue);
          roomSyncPromisesRef.current.set(conversationIdValue, Promise.resolve(String(targetRoomId)));
          const lastUpstreamTurn = [...historyItems].reverse().find(
            (item: any) => item?.upstream?.response_id,
          );
          lastResponseIdRef.current =
            turnResponseId ?? lastUpstreamTurn?.upstream?.response_id ?? null;
          try {
            window.localStorage.setItem(activeStorageKey, conversationIdValue);
          } catch {}
          setMessages(historyItems.length ? mapLaravelHistory(historyItems) : initialMessages);
          updateProgress(96, "Đã khôi phục lịch sử, sắp sẵn sàng…");
          return true;
        };

        const createAndLinkConversation = async () => {
          updateProgress(45, "Chưa có phòng chat — đang khởi tạo cuộc trò chuyện…");
          const newConversation = await createConversation(effectiveUserId, () => {
            updateProgress(75, "Đang liên kết phòng chat với Laravel…");
          });
          if (!newConversation) return null;

          updateProgress(82, "Đang hoàn tất đồng bộ phòng chat…");
          const roomId = await ensureLaravelRoom(
            newConversation,
            "Cuộc trò chuyện mới",
            activeModel,
            effectiveUserId,
          );
          if (roomId) {
            await restoreFromRoom(roomId, newConversation, null);
          }
          return newConversation;
        };

        setIsRestoringChat(true);
        if (retryCount === 0) {
          updateProgress(0, createUserIfMissing
            ? "Đang kiểm tra danh tính chat…"
            : "Đang tải danh sách workspace…");
        }
        let savedSessionToken: string | null = null;
        try {
          savedConv = window.localStorage.getItem(activeStorageKey);
          savedUid = window.localStorage.getItem(`${activeStorageKey}_user_id`);
          savedSessionToken = getLaravelChatSession();
        } catch {}

        // Chat Test keeps its existing fixed-user flow. Public creates its
        // first Node identity before loading workspaces or contacting Laravel.
        if (retryCount === 0 && !(createUserIfMissing && !savedUid)) {
          const workspaceUserId = savedUid || defaultUserId || userId;
          await loadWorkspaces(workspaceUserId);
          if (cancelled) return;
        }

        if (savedSessionToken) {
          rememberLaravelChatSession(savedSessionToken);
        }

        if (savedUid) {
          const parsed = Number(savedUid);
          effectiveUserId = Number.isInteger(parsed) ? parsed : savedUid;
          setUserId(effectiveUserId);
          setIsFirstTimeUser(false);
        } else {
          // Chat Public allocates a Node user before making any Laravel lookup.
          setIsFirstTimeUser(true);
          if (!createUserIfMissing) {
            setIsUserIdPromptOpen(true);
            setIsRestoringChat(false);
            return;
          }

          try {
            updateProgress(24, "Đang tạo danh tính chat mới trên OpenClaw…");
            if (
              !initialPublicConversationRef.current ||
              initialPublicConversationRef.current.storageKey !== activeStorageKey
            ) {
              initialPublicConversationRef.current = {
                storageKey: activeStorageKey,
                promise: apiCreateConversation({
                  sessionKey: baseSession,
                  userId: null,
                  targetUrl,
                }),
              };
            }
            const created = await initialPublicConversationRef.current.promise;
            if (cancelled) return;
            if (!created.conversationId || created.userId === null || created.userId === undefined) {
              throw new Error("OpenClaw chưa trả conversation_id hoặc user_id mới.");
            }

            try {
              updateProgress(34, "Đang khởi tạo workspace session cho user mới…");
              await apiCreateWorkspaceSession({
                userId: created.userId,
                sessionKey: baseSession,
                targetUrl,
              });
              updateProgress(40, "Đã khởi tạo session; đang chuẩn bị tải workspace…");
            } catch (workspaceSessionError) {
              console.warn("Không khởi tạo được workspace session:", workspaceSessionError);
              updateProgress(40, "Tiếp tục tải workspace dù chưa tạo được session…");
            }

            updateProgress(42, "Đã nhận User ID mới; đang chuẩn bị lưu phiên chat…");
            effectiveUserId = created.userId;
            setUserId(created.userId);
            setIsFirstTimeUser(false);
            setConversationId(created.conversationId);
            try {
              window.localStorage.setItem(`${activeStorageKey}_user_id`, String(created.userId));
              window.localStorage.setItem(activeStorageKey, created.conversationId);
            } catch {}

            await loadWorkspaces(created.userId, {
              start: 43,
              listDone: 48,
              userStart: 51,
              done: 57,
            });
            if (cancelled) return;

            updateProgress(62, "Đang tạo room Laravel cho conversation mới…");
            const roomId = await ensureLaravelRoom(
              created.conversationId,
              "Cuộc trò chuyện mới",
              activeModel,
              created.userId,
            );
            if (roomId) {
              updateProgress(78, "Đã liên kết room; chuẩn bị tải lịch sử…");
              await restoreFromRoom(roomId, created.conversationId, null, 82);
            } else {
              setMessages(initialMessages);
              updateProgress(94, "Chat đã tạo; Laravel sẽ được đồng bộ lại sau…");
            }
            break;
          } catch (error) {
            if (cancelled) return;
            console.error("Không thể khởi tạo người dùng chat mới:", error);
            setMessages([
              {
                id: "error-create-public-user",
                sender: "bot",
                text: "Xin lỗi, hiện chưa thể khởi tạo phiên chat mới. Vui lòng thử tải lại trang.",
                time: "Hệ thống",
                isError: true,
              },
            ]);
            updateProgress(100, "Không thể khởi tạo phiên chat mới");
            break;
          }
        }

        try {
          const { ok, status: roomsStatus, rooms: roomItems } =
            await fetchInitialChatRooms(updateProgress);

          if (ok) {
            const activeRoom =
              (savedConv
                ? roomItems.find((r: any) => r?.upstream_conversation_id === savedConv)
                : null) ||
              roomItems.find((room: any) => Number(room?.status ?? 1) === 1) ||
              roomItems[0];
            const roomId = activeRoom?.room_id ?? activeRoom?.id;
            const upstreamConversationId = activeRoom?.upstream_conversation_id;

            if (roomId !== undefined && roomId !== null && upstreamConversationId) {
              const restored = await restoreFromRoom(
                roomId,
                upstreamConversationId,
                activeRoom?.last_response_id,
              );
              if (restored) break;
            }
          }

          if (roomsStatus === 401 && retryCount === 0 && !savedConv) {
            await createAndLinkConversation();
            break;
          }

          if (savedConv) {
            if (cancelled) return;
            updateProgress(70, "Đang liên kết cuộc trò chuyện đã lưu với Laravel…");
            setConversationId(savedConv);
            const roomId = await ensureLaravelRoom(savedConv, "Cuộc trò chuyện", activeModel, effectiveUserId);
            if (roomId) {
              const restored = await restoreFromRoom(roomId, savedConv, null);
              if (restored) break;
            }
            updateProgress(
              96,
              roomId
                ? "Phòng chat đã được đồng bộ, sắp sẵn sàng…"
                : "Chat đã sẵn sàng; lịch sử Laravel chưa đồng bộ được…",
            );
            break;
          }

          if (!cancelled) {
            await createAndLinkConversation();
          }
          break;
        } catch (error: any) {
          if (cancelled) return;

          if (error?.code === "CONVERSATION_ALREADY_LINKED" && retryCount < maxRetries) {
            const sessionToken = error.chat_bot_session || error.cookie_hash;
            console.warn("Phát hiện CONVERSATION_ALREADY_LINKED từ Laravel, sessionToken:", sessionToken);
            if (sessionToken) {
              rememberLaravelChatSession(sessionToken);
            }
            roomSyncPromisesRef.current.clear();
            setIsRestoringChat(true);
            updateProgress(0, "Phát hiện phiên đã liên kết — đang làm lại thao tác đầu…");
            await new Promise((r) => setTimeout(r, 200));
            retryCount++;
            continue;
          }

          console.warn("Không khôi phục được lịch sử từ Laravel:", error);
          try {
            if (savedConv) {
              updateProgress(70, "Đang nối lại cuộc trò chuyện đã lưu…");
              setConversationId(savedConv);
              const roomId = await ensureLaravelRoom(savedConv, "Cuộc trò chuyện", activeModel, effectiveUserId);
              if (roomId) {
                await restoreFromRoom(roomId, savedConv, null);
              }
            } else {
              await createAndLinkConversation();
            }
          } catch (innerErr: any) {
            if (innerErr?.code === "CONVERSATION_ALREADY_LINKED" && retryCount < maxRetries) {
              const sessionToken = innerErr.chat_bot_session || innerErr.cookie_hash;
              console.warn("Phát hiện CONVERSATION_ALREADY_LINKED ở bước phụ, sessionToken:", sessionToken);
              if (sessionToken) {
                rememberLaravelChatSession(sessionToken);
              }
              roomSyncPromisesRef.current.clear();
              setIsRestoringChat(true);
              updateProgress(0, "Phát hiện phiên đã liên kết — đang làm lại thao tác đầu…");
              await new Promise((r) => setTimeout(r, 200));
              retryCount++;
              continue;
            }
            console.warn("Không thể nối lại room Laravel:", innerErr);
          }
          break;
        }
      }

      if (!cancelled) {
        setRestoreProgress(100);
        setRestoreStatus("Sẵn sàng");
        window.setTimeout(() => {
          if (!cancelled) setIsRestoringChat(false);
        }, 300);
      }
    };

    void initializeChat();
    return () => {
      cancelled = true;
    };
  }, [activeStorageKey]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetryHistory = async () => {
    if (!historyFetchError?.failedRoomId) return;
    setIsRetryingHistory(true);
    try {
      const roomId = historyFetchError.failedRoomId;
      const historyItems = await apiFetchRoomMessages(roomId, 50);

      const conversationIdValue = historyFetchError.upstreamConversationId || conversationId || "";
      if (conversationIdValue) {
        setConversationId(conversationIdValue);
        roomSyncPromisesRef.current.set(conversationIdValue, Promise.resolve(String(roomId)));
        try {
          window.localStorage.setItem(activeStorageKey, conversationIdValue);
        } catch {}
      }
      const lastUpstreamTurn = [...historyItems].reverse().find(
        (item: any) => item?.upstream?.response_id,
      );
      lastResponseIdRef.current = lastUpstreamTurn?.upstream?.response_id ?? null;

      setMessages(historyItems.length ? mapLaravelHistory(historyItems) : initialMessages);
      setHistoryFetchError(null);
    } catch (err: any) {
      console.error("Lỗi khi tải lại lịch sử tin nhắn:", err);
      setMessages([
        {
          id: "error-history-prompt",
          sender: "bot",
          text: `⚠️ **Tải lại thất bại:** Vẫn không thể lấy danh sách tin nhắn (${err?.message || "Lỗi kết nối"}).\n\nBạn có muốn thử **Tải lại** lần nữa hay **Tạo mới** cuộc trò chuyện?`,
          time: "Hệ thống",
          isError: true,
          isHistoryErrorPrompt: true,
        },
      ]);
    } finally {
      setIsRetryingHistory(false);
    }
  };

  const handleCreateNewRoomFromError = async () => {
    setIsRetryingHistory(true);
    try {
      await handleReset();
    } finally {
      setIsRetryingHistory(false);
    }
  };

  const handleReset = async (newUserId?: number | string) => {
    const shouldResetOpenClaw = newUserId === undefined;
    if (shouldResetOpenClaw) {
      setIsRestoringChat(true);
      setRestoreProgress(12);
      setRestoreStatus("Đang gửi lệnh /reset lên OpenClaw…");
      try {
        await apiResetOpenClawChat({
          sessionKey: activeSessionKey,
          model: activeModel,
          conversationId,
          targetUrl,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi không xác định.";
        setMessages((previous) => [
          ...previous,
          {
            id: `reset-error-${Date.now()}`,
            sender: "bot",
            text: `Không thể reset phiên chat trên OpenClaw: ${message}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isError: true,
          },
        ]);
        setIsRestoringChat(false);
        setRestoreProgress(0);
        setRestoreStatus("Sẵn sàng");
        return;
      }
      setRestoreProgress(62);
      setRestoreStatus("Đã reset OpenClaw; đang tạo cuộc trò chuyện mới…");
    }

    setHistoryFetchError(null);
    try {
      window.localStorage.removeItem(activeStorageKey);
      if (newUserId !== undefined) {
        window.localStorage.setItem(`${activeStorageKey}_user_id`, String(newUserId));
      }
    } catch {}
    lastResponseIdRef.current = null;
    setConversationId(null);
    if (newUserId !== undefined) {
      setUserId(newUserId);
    }
    setMessages(initialMessages);
    setInput("");
    setSelectedService(null);
    setIsServiceMenuExpanded(false);
    setAttachedImage(null);
    setIsTyping(false);
    await createConversation(newUserId !== undefined ? newUserId : userId);
    if (shouldResetOpenClaw) {
      setRestoreProgress(96);
      setRestoreStatus("Cuộc trò chuyện mới đã sẵn sàng…");
      window.setTimeout(() => {
        setIsRestoringChat(false);
        setRestoreProgress(100);
        setRestoreStatus("Sẵn sàng");
      }, 300);
    }
  };

  const handleSaveUserId = async (newUserId: number | string) => {
    const trimmed = String(newUserId).trim();
    if (!trimmed) return;
    const parsed = Number(trimmed);
    const finalId = Number.isInteger(parsed) ? parsed : trimmed;
    try {
      window.localStorage.setItem(`${activeStorageKey}_user_id`, String(finalId));
    } catch {}
    setUserId(finalId);
    setIsUserIdPromptOpen(false);
    setIsFirstTimeUser(false);
    setIsRestoringChat(true);
    setRestoreProgress(30);
    setRestoreStatus(`Đang khởi tạo phiên chat với User #${finalId}…`);
    await handleReset(finalId);
    setRestoreProgress(100);
    setRestoreStatus("Sẵn sàng");
    window.setTimeout(() => {
      setIsRestoringChat(false);
    }, 300);
  };

  const handleSelectWorkspace = async (workspace: WorkspaceOption) => {
    if (workspaceSwitchLockRef.current || isRestoringChat || isUpdatingWorkspaces || isTyping) return;

    const numericUserId = Number(userId);
    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
      setMessages((previous) => [
        ...previous,
        {
          id: `workspace-error-${Date.now()}`,
          sender: "bot",
          text: "Chưa có User ID hợp lệ để chuyển workspace. Vui lòng tải lại phiên chat rồi thử lại.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
      return;
    }

    workspaceSwitchLockRef.current = true;
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setIsSelectingWorkspace(true);
    setWorkspaceSwitchName(workspace.workspace_name);
    setWorkspaceSwitchProgress(12);
    setWorkspaceSwitchStatus(`Đang yêu cầu chuyển sang “${workspace.workspace_name}”…`);
    const progressTimer = window.setInterval(() => {
      setWorkspaceSwitchProgress((progress) => Math.min(90, progress + 4));
      setWorkspaceSwitchStatus(`Đang đợi OpenClaw chuyển sang “${workspace.workspace_name}”…`);
    }, 450);

    try {
      setWorkspaceSelectionError("");
      const result = await apiSelectWorkspace({
        userId: numericUserId,
        workSpaceCode: workspace.work_space_code,
        targetUrl,
      });
      setSelectedWorkspaceCode(workspace.work_space_code);
      setIsWorkspaceSelectionRequired(false);
      setWorkspaceSwitchProgress(100);
      setWorkspaceSwitchStatus(`Đã chuyển sang “${workspace.workspace_name}”.`);

      const responseText = result.response_text?.trim();
      if (responseText) {
        setMessages((previous) => [
          ...previous,
          {
            id: `workspace-${Date.now()}`,
            sender: "bot",
            text: responseText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định.";
      setWorkspaceSelectionError(message);
      setWorkspaceSwitchProgress(100);
      setWorkspaceSwitchStatus(`Chưa chuyển được “${workspace.workspace_name}”.`);
      setMessages((previous) => [
        ...previous,
        {
          id: `workspace-error-${Date.now()}`,
          sender: "bot",
          text: `Không thể chuyển sang “${workspace.workspace_name}”: ${message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => {
        setIsSelectingWorkspace(false);
        setWorkspaceSwitchProgress(0);
        setWorkspaceSwitchStatus("");
        setWorkspaceSwitchName("");
        workspaceSwitchLockRef.current = false;
      }, 500);
    }
  };

  const handleUpdateWorkspaces = async () => {
    if (workspaceUpdateLockRef.current || isUpdatingWorkspaces || isSelectingWorkspace) return;

    workspaceUpdateLockRef.current = true;
    setIsUpdatingWorkspaces(true);
    setIsLoadingWorkspaces(true);
    try {
      await apiUpdateWorkspaceRouting();
      const refreshedWorkspaces = await apiFetchWorkspaces();
      let userWorkspaces: WorkspaceOption[] = [];
      let userWorkspaceLookupAttempted = false;
      let userWorkspaceLookupSucceeded = false;
      userWorkspaceLookupAttempted = userId !== null && userId !== undefined && userId !== "";
      try {
        userWorkspaces = await apiFetchUserWorkspaces(userId, targetUrl);
        userWorkspaceLookupSucceeded = true;
      } catch (userWorkspaceError) {
        console.warn("Không lấy được workspace đang active của user:", userWorkspaceError);
      }
      setWorkspaces(refreshedWorkspaces);
      const activeWorkspaceCode = userWorkspaces.find((userWorkspace) =>
        userWorkspace.work_space_selected === true &&
        refreshedWorkspaces.some(
          (workspace) => workspace.work_space_code === userWorkspace.work_space_code,
        ),
      )?.work_space_code;
      setIsWorkspaceSelectionRequired(
        userWorkspaceLookupAttempted && (!userWorkspaceLookupSucceeded || !activeWorkspaceCode),
      );
      setWorkspaceSelectionError(
        userWorkspaceLookupAttempted && !userWorkspaceLookupSucceeded
          ? "Không kiểm tra được workspace đang chọn; hãy chọn workspace để tiếp tục."
          : "",
      );
      setSelectedWorkspaceCode((current) => {
        if (userWorkspaceLookupAttempted) return activeWorkspaceCode || "";
        return refreshedWorkspaces.some((workspace) => workspace.work_space_code === current)
          ? current
          : getDefaultWorkspaceCode(refreshedWorkspaces);
      });
      setMessages((previous) => [
        ...previous,
        {
          id: `workspace-update-${Date.now()}`,
          sender: "bot",
          text: "Đã đồng bộ routing và tải lại danh sách workspace.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định.";
      setMessages((previous) => [
        ...previous,
        {
          id: `workspace-update-error-${Date.now()}`,
          sender: "bot",
          text: `Không thể cập nhật danh sách workspace: ${message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoadingWorkspaces(false);
      setIsUpdatingWorkspaces(false);
      workspaceUpdateLockRef.current = false;
    }
  };

  const handleSend = async (
    textToSend?: string,
    apiService: MediaTechService = "media_text_to_text",
    displayService?: MediaTechService,
  ) => {
    const text = (textToSend ?? input).trim() || (attachedImage ? "media_image_to_text: OCR và phân tích hình ảnh." : "");
    if (!text || isTyping || isRestoringChat || isSelectingWorkspace || isChatLocked || isRetryingHistory || isUserIdPromptOpen) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: timeStr,
      imageUrl: attachedImage?.dataUrl,
      serviceDescription: displayService
        ? serviceDescriptions[displayService] || SUGGESTIONS.find((service) => service.apiService === displayService)?.description
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    let activeConversationForPersistence = conversationId;
    const serviceForPersistence = attachedImage ? "media_image_to_text" : apiService;
    let modelForPersistence = activeModel;

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      let activeConvId = conversationId;
      if (!activeConvId) {
        activeConvId = await createConversation();
      }
      activeConversationForPersistence = activeConvId;

      const activeService = attachedImage ? "media_image_to_text" : apiService;
      const selectedServiceId = attachedImage ? "media_image_to_text" : displayService;
      const correlationId = createCorrelationId();
      const reqHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "x-openclaw-session-key": activeSessionKey,
        "x-openclaw-correlation-id": correlationId,
      };
      if (selectedServiceId) {
        reqHeaders["x-openclaw-service-id"] = selectedServiceId;
      }
      if (targetUrl) {
        reqHeaders["x-openclaw-target"] = targetUrl;
      }

      const isImageGeneration = activeService === "media_text_to_image";
      const endpoint = isImageGeneration
        ? OPENCLAW_IMAGE_GENERATIONS_ENDPOINT
        : useResponsesApi
        ? OPENCLAW_RESPONSES_ENDPOINT
        : OPENCLAW_CHAT_COMPLETIONS_ENDPOINT;

      const payload: any = {
        model: isImageGeneration ? "openai/gpt-image-2" : activeModel,
      };
      if (selectedServiceId) {
        payload.category = selectedServiceId;
      }
      modelForPersistence = String(payload.model || activeModel);
      if (!isImageGeneration && activeConvId) {
        payload.conversation_id = activeConvId;
      }
      if (userId !== null && userId !== undefined && userId !== "") {
        const num = Number(userId);
        payload.user_id = Number.isInteger(num) ? num : userId;
      }
      if (isImageGeneration) {
        payload.prompt = text;
        payload.n = 1;
        payload.size = "1024x1024";
        payload.aspectRatio = "1:1";
        payload.quality = "medium";
        payload.user_id = userId;
      } else if (useResponsesApi) {
        payload.user = activeSessionKey;
        if (activeService === "media_content_smart") {
          const [titleLine, ...descriptionLines] = text.split("\n");
          const title = titleLine.trim();
          const description = descriptionLines.join("\n").trim() || text;
          payload.input = [{
            role: "user",
            title,
            desc: description,
            len: 500,
            tone: "Tự nhiên",
          }];
        } else if (activeService === "media_text_to_speech") {
          payload.model = "F5_vie";
          payload.input = [{
            role: "user",
            text,
            tool: "media_text_to_speech",
            services: "v3",
            servicecode: "F5_vie",
          }];
        } else if (activeService === "media_image_to_text") {
          const imageBase64 = attachedImage?.dataUrl.split(",")[1] || "";
          payload.input = [{
            role: "user",
            content: [
              { type: "input_text", text: text || "media_image_to_text: OCR và phân tích hình ảnh." },
              ...(imageBase64 ? [{
                type: "input_image",
                source: {
                  type: "base64",
                  media_type: attachedImage?.mediaType,
                  data: imageBase64,
                },
              }] : []),
            ],
          }];
        } else {
          const serviceInstruction = activeService === "media_spell_check"
            ? "/skill media_spelling\nHãy sửa lỗi chính tả trong đoạn văn sau:\n"
            : activeService === "media_script_writing"
            ? "/skill media_script_writing\nViết kịch bản theo yêu cầu sau:\n"
            : "";
          payload.input = [{ role: "user", content: `${serviceInstruction}${text}` }];
        }
        if (!payload.conversation_id && lastResponseIdRef.current) {
          payload.previous_response_id = lastResponseIdRef.current;
        }
      } else {
        payload.messages = [{ role: "user", content: text }];
        payload.stream = false;
        if (lastResponseIdRef.current) {
          payload.previous_completion_id = lastResponseIdRef.current;
        }
      }
      modelForPersistence = String(payload.model || activeModel);

      let res = await apiSendOpenClawRequest(endpoint, reqHeaders, payload);

      // If room expired or 404, recreate and retry once
      if (!isImageGeneration && res.status === 404 && activeConvId) {
        activeConvId = await createConversation();
        activeConversationForPersistence = activeConvId;
        payload.conversation_id = activeConvId || undefined;
        res = await apiSendOpenClawRequest(endpoint, reqHeaders, payload);
      }

      const resNow = new Date();
      const resTime = `${String(resNow.getHours()).padStart(2, "0")}:${String(resNow.getMinutes()).padStart(2, "0")}`;

      if (res.ok) {
        const data = await res.json();
        setAttachedImage(null);
        if (typeof data?.id === "string" && data.id) {
          lastResponseIdRef.current = data.id;
        }
        let botReply = "";
        let imageUrl: string | undefined;
        if (isImageGeneration) {
          const outputImage = data?.output
            ?.flatMap((item: any) => item?.content || [])
            ?.find((item: any) => item?.type === "output_image" && item?.source?.data);
          if (outputImage) {
            imageUrl = `data:${outputImage.source.media_type || "image/png"};base64,${outputImage.source.data}`;
            botReply = "Mình đã tạo ảnh cho bạn đây.";
          } else if (typeof data?.output_text === "string" && data.output_text.trim()) {
            botReply = data.output_text;
          } else {
            botReply = "Mình chưa nhận được ảnh từ dịch vụ. Bạn thử lại nhé.";
          }
        } else {
          if (typeof data?.output_text === "string" && data.output_text) {
            botReply = data.output_text;
          } else if (Array.isArray(data?.output) && data.output.length > 0) {
            const firstOut = data.output[0];
            if (Array.isArray(firstOut?.content)) {
              botReply = firstOut.content.map((c: any) => c.text || c.output_text || "").join("\n");
            } else if (typeof firstOut?.content === "string") {
              botReply = firstOut.content;
            }
          } else if (Array.isArray(data?.choices) && data.choices.length > 0) {
            const first = data.choices[0];
            botReply = first?.message?.content || first?.text || "";
          } else if (typeof data === "string") {
            botReply = data;
          } else {
            botReply = JSON.stringify(data);
          }
        }

        const responseConversationId = data.conversation_id || activeConvId;
        if (responseConversationId && responseConversationId !== activeConvId) {
          setConversationId(responseConversationId);
          try {
            window.localStorage.setItem(activeStorageKey, responseConversationId);
          } catch {}
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: botReply,
            imageUrl,
            serviceId: activeService,
            time: resTime,
            usage: getTokenUsage(data, String(data?.model || payload.model || activeModel)),
          },
        ]);
        void persistChatTurn({
          conversationId: responseConversationId,
          title: userMessage.text,
          userMessage: userMessage.text,
          assistantMessage: botReply,
          serviceId: activeService,
          model: String(payload.model || activeModel),
          responseData: data,
          httpStatus: res.status,
          errorMessage: null,
        });
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error || errJson?.error?.message || `Máy chủ trả về mã lỗi HTTP ${res.status}`;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: "bot",
            text: `⚠️ **Lỗi phản hồi (${res.status}):**\n${typeof errMsg === "object" ? JSON.stringify(errMsg) : errMsg}`,
            time: resTime,
            isError: true,
          },
        ]);
        void persistChatTurn({
          conversationId: activeConvId,
          title: userMessage.text,
          userMessage: userMessage.text,
          assistantMessage: null,
          serviceId: activeService,
          model: String(payload.model || activeModel),
          httpStatus: res.status,
          errorMessage: typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg),
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const resNow = new Date();
      const resTime = `${String(resNow.getHours()).padStart(2, "0")}:${String(resNow.getMinutes()).padStart(2, "0")}`;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: `⚠️ **Không thể kết nối đến Media Tech AI Gateway:**\n${errMsg}`,
          time: resTime,
          isError: true,
        },
      ]);
      void persistChatTurn({
        conversationId: activeConversationForPersistence,
        title: userMessage.text,
        userMessage: userMessage.text,
        assistantMessage: null,
        serviceId: serviceForPersistence,
        model: modelForPersistence,
        httpStatus: 502,
        errorMessage: errMsg,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const onSendSubmit = (
    textToSend?: string,
    apiService: MediaTechService = selectedService ?? "media_text_to_text",
  ) => {
    if (isChatLocked || isRestoringChat || isTyping || isRetryingHistory) return;
    const rawText = textToSend ?? textareaRef.current?.value ?? input;
    const text = rawText.trim();
    if (!text && !attachedImage) return;

    justSentRef.current = true;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }

    const displayService = attachedImage
      ? "media_image_to_text"
      : selectedService || undefined;
    handleSend(text, apiService, displayService);

    setTimeout(() => {
      justSentRef.current = false;
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
      }
      setInput("");
    }, 150);
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessages((prev) => [...prev, {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "⚠️ Hãy chọn ảnh PNG, JPEG, GIF hoặc WebP để dùng dịch vụ OCR.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      }]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachedImage({ name: file.name, mediaType: file.type, dataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isChatLocked || isRestoringChat || isTyping || isRetryingHistory || isUserIdPromptOpen) return;
    if (e.key === "Enter" && !e.shiftKey) {
      if (isComposingRef.current || e.nativeEvent.isComposing) {
        return;
      }
      e.preventDefault();
      onSendSubmit();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (justSentRef.current) {
      e.target.value = "";
      setInput("");
      return;
    }
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    if (justSentRef.current) {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
      }
      setInput("");
    }
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    workspaces,
    selectedWorkspaceCode,
    isWorkspaceSelectionRequired,
    workspaceSelectionError,
    setSelectedWorkspaceCode,
    handleSelectWorkspace,
    isLoadingWorkspaces,
    isUpdatingWorkspaces,
    handleUpdateWorkspaces,
    isSelectingWorkspace,
    workspaceSwitchProgress,
    workspaceSwitchStatus,
    workspaceSwitchName,
    selectedService,
    setSelectedService,
    isServiceMenuExpanded,
    setIsServiceMenuExpanded,
    attachedImage,
    setAttachedImage,
    isTyping,
    isRestoringChat,
    restoreProgress,
    restoreStatus,
    conversationId,
    copiedId,
    userId,
    isUserIdPromptOpen,
    setIsUserIdPromptOpen,
    isFirstTimeUser,
    setIsFirstTimeUser,
    handleSaveUserId,
    isChatLocked,
    isRetryingHistory,
    effectiveSessionKey,
    openClawUrl,
    activeModel,
    messagesContainerRef,
    messagesEndRef,
    serviceMenuRef,
    textareaRef,
    imageInputRef,
    handleCopy,
    handleReset,
    handleRetryHistory,
    handleCreateNewRoomFromError,
    onSendSubmit,
    handleImageSelection,
    handleKeyDown,
    handleInputResize,
    handleCompositionStart,
    handleCompositionEnd,
  };
}
