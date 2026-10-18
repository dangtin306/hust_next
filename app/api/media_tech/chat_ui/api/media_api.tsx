"use client";

// API Endpoints & Configuration
export const LARAVEL_CHAT_API =
  process.env.NEXT_PUBLIC_CHAT_BOT_API_BASE || "/next/api/chat/bot";

export const LARAVEL_CHAT_MANAGE_API =
  process.env.NEXT_PUBLIC_CHAT_BOT_MANAGE_API_BASE || `${LARAVEL_CHAT_API}/manage`;

export const OPENCLAW_CONVERSATIONS_ENDPOINT = "/next/api/openclaw/v1/conversations";
export const OPENCLAW_WORKSPACE_NEW_ENDPOINT = "/next/api/openclaw/v2/workspace/new";
export const OPENCLAW_WORKSPACE_SELECT_ENDPOINT = "/next/api/openclaw/v2/workspace/select";
export const OPENCLAW_USER_WORKSPACES_ENDPOINT = "/next/api/openclaw/v2/workspace/user";
export const LARAVEL_WORKSPACE_ROUTING_UPDATE_ENDPOINT =
  "/next/api/workspaces/routing/update";
export const OPENCLAW_CHAT_COMPLETIONS_ENDPOINT = "/next/api/openclaw/v1/chat/completions";
export const OPENCLAW_RESPONSES_ENDPOINT = "/next/api/openclaw/v1/responses";
export const OPENCLAW_IMAGE_GENERATIONS_ENDPOINT = "/next/api/openclaw/v1/images/generations";
export const WORKSPACES_MAIN_DATA_ENDPOINT = "/next/api/workspaces/main/data";

export type WorkspaceOption = {
  id: number | string;
  workspace_name: string;
  work_space_code: string;
  agent_code?: string;
  parent_workspace_code?: string | null;
  slug?: string;
  description?: string;
  status?: string;
  is_selectable?: boolean;
  work_space_selected?: boolean;
  children?: WorkspaceOption[];
};

let workspacesRequestInFlight: Promise<WorkspaceOption[]> | null = null;

/** Load the available workspaces for the chat-mode selector. */
export function apiFetchWorkspaces(customBaseUrl?: string): Promise<WorkspaceOption[]> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (customBaseUrl) headers["x-laravel-target"] = customBaseUrl;

  const request = fetch(WORKSPACES_MAIN_DATA_ENDPOINT, {
    method: "GET",
    cache: "no-store",
    headers,
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Workspace API trả về HTTP ${response.status}`);
    const body = await response.json();
    if (!Array.isArray(body?.data)) return [];

    const rows: WorkspaceOption[] = (body.data as unknown[]).filter(
      (item: unknown): item is WorkspaceOption => Boolean(item) && typeof item === "object",
    );
    const hasTreeShape = rows.some((item) => Array.isArray(item.children));
    const parentCodes = new Set(
      rows
        .map((item: WorkspaceOption) => item.parent_workspace_code)
        .filter((code: unknown): code is string => typeof code === "string"),
    );
    const selectableRows = hasTreeShape
      ? rows.flatMap((item: WorkspaceOption) => (Array.isArray(item.children) ? item.children : []))
      : rows.filter(
          (item: WorkspaceOption) =>
            item.is_selectable !== false &&
            typeof item.work_space_code === "string" &&
            !parentCodes.has(item.work_space_code),
        );

    return selectableRows.filter(
      (item) =>
        Boolean(item) &&
        typeof item.workspace_name === "string" &&
        typeof item.work_space_code === "string" &&
        item.is_selectable !== false &&
        (item.status == null || item.status === "active"),
    );
  });

  workspacesRequestInFlight = request;
  void request.finally(() => {
    if (workspacesRequestInFlight === request) workspacesRequestInFlight = null;
  }).catch(() => undefined);
  return request;
}

/** Read a user's workspace list and selected-workspace flag from OpenClaw. */
export async function apiFetchUserWorkspaces(
  userId: number | string,
  targetUrl?: string,
): Promise<WorkspaceOption[]> {
  const numericUserId = Number(userId);
  if (!Number.isInteger(numericUserId) || numericUserId <= 0) return [];

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: "Bearer media_tech",
  };
  if (targetUrl) headers["x-openclaw-target"] = targetUrl;

  const response = await fetch(
    `${OPENCLAW_USER_WORKSPACES_ENDPOINT}?user_id=${encodeURIComponent(String(numericUserId))}`,
    { method: "GET", cache: "no-store", headers },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`OpenClaw user workspace trả về HTTP ${response.status}`);
  const responseData = body?.data && typeof body.data === "object" ? body.data : body;
  const userWorkspaces: unknown[] = Array.isArray(responseData?.workspaces)
    ? responseData.workspaces
    : Array.isArray(body?.data)
    ? body.data
    : typeof responseData?.work_space_code === "string"
    ? [responseData]
    : [];

  return userWorkspaces.flatMap((item): WorkspaceOption[] => {
    if (!item || typeof item !== "object") return [];
    const workspace = item as Partial<WorkspaceOption> & { workspace_id?: number | string };
    if (
      typeof workspace.work_space_code !== "string" ||
      (workspace.status != null && workspace.status !== "active")
    ) {
      return [];
    }

    return [{
      ...workspace,
      id: workspace.id ?? workspace.workspace_id ?? workspace.work_space_code,
      workspace_name: workspace.workspace_name ?? workspace.work_space_code,
      work_space_code: workspace.work_space_code,
    }];
  });
}

/** Ask Laravel to sync workspace routing from OpenClaw before refreshing the list. */
export async function apiUpdateWorkspaceRouting(customBaseUrl?: string): Promise<void> {
  const reqHeaders: Record<string, string> = { Accept: "application/json" };
  if (customBaseUrl) {
    reqHeaders["x-laravel-target"] = customBaseUrl;
  }
  const response = await fetch(LARAVEL_WORKSPACE_ROUTING_UPDATE_ENDPOINT, {
    method: "GET",
    headers: reqHeaders,
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success !== true) {
    throw new Error(`Laravel không cập nhật được routing workspace (HTTP ${response.status}).`);
  }
}

export const MEDIA_SESSION_STORAGE_KEY = "media_chat_bot_session";
export const MEDIA_COOKIE_HASH_KEY = "media_cookie_hash";

/** Read and persist the Laravel bearer session from localStorage and document.cookie */
export function getLaravelChatSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const local = window.localStorage.getItem(MEDIA_SESSION_STORAGE_KEY);
    if (local) return local;
    const match = document.cookie.match(/(?:^|;\s*)media_chat_bot_session=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return null;
  } catch {
    return null;
  }
}

export function rememberLaravelChatSession(token: string): void {
  if (!token || typeof window === "undefined") return;
  try {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    const isHttps = window.location.protocol === "https:";
    const secureFlag = isHttps ? "; Secure" : "";
    const host = window.location.hostname;
    const domainPart = host.endsWith("hust.media") ? "; domain=.hust.media" : "";

    // 1. Set media_chat_bot_session and media_cookie_hash cookies on current path
    document.cookie = `${MEDIA_SESSION_STORAGE_KEY}=${encodeURIComponent(cleanToken)}; max-age=31536000; path=/; SameSite=Lax${secureFlag}`;
    document.cookie = `${MEDIA_COOKIE_HASH_KEY}=${encodeURIComponent(cleanToken)}; max-age=31536000; path=/; SameSite=Lax${secureFlag}`;

    // 2. Set for .hust.media domain if applicable
    if (domainPart) {
      document.cookie = `${MEDIA_SESSION_STORAGE_KEY}=${encodeURIComponent(cleanToken)}; max-age=31536000; path=/; domain=.hust.media; SameSite=Lax${secureFlag}`;
      document.cookie = `${MEDIA_COOKIE_HASH_KEY}=${encodeURIComponent(cleanToken)}; max-age=31536000; path=/; domain=.hust.media; SameSite=Lax${secureFlag}`;
    }

    // 3. Set SameSite=None; Secure for cross-site fetch credentials inclusion
    if (isHttps) {
      document.cookie = `${MEDIA_SESSION_STORAGE_KEY}=${encodeURIComponent(cleanToken)}; max-age=31536000; path=/; SameSite=None; Secure`;
      document.cookie = `${MEDIA_COOKIE_HASH_KEY}=${encodeURIComponent(cleanToken)}; max-age=31536000; path=/; SameSite=None; Secure`;
      if (domainPart) {
        document.cookie = `${MEDIA_SESSION_STORAGE_KEY}=${encodeURIComponent(cleanToken)}; max-age=31536000; path=/; domain=.hust.media; SameSite=None; Secure`;
        document.cookie = `${MEDIA_COOKIE_HASH_KEY}=${encodeURIComponent(cleanToken)}; max-age=31536000; path=/; domain=.hust.media; SameSite=None; Secure`;
      }
    }

    window.localStorage.setItem(MEDIA_SESSION_STORAGE_KEY, cleanToken);
    window.localStorage.setItem(MEDIA_COOKIE_HASH_KEY, cleanToken);
  } catch (e) {
    console.warn("Không thể ghi cookie/localStorage:", e);
  }
}

export function clearLaravelChatSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(MEDIA_SESSION_STORAGE_KEY);
    window.localStorage.removeItem(MEDIA_COOKIE_HASH_KEY);
    window.localStorage.removeItem("chat_bot_session");
    window.localStorage.removeItem("cookie_hash");
    const domainPart = window.location.hostname.endsWith("hust.media") ? "; domain=.hust.media" : "";
    document.cookie = `${MEDIA_SESSION_STORAGE_KEY}=; max-age=0; path=/${domainPart}`;
    document.cookie = `${MEDIA_COOKIE_HASH_KEY}=; max-age=0; path=/${domainPart}`;
    document.cookie = `${MEDIA_SESSION_STORAGE_KEY}=; max-age=0; path=/`;
    document.cookie = `${MEDIA_COOKIE_HASH_KEY}=; max-age=0; path=/`;
  } catch (e) {
    console.warn("Không thể xóa cookie/localStorage media_chat_bot_session:", e);
  }
}

export function extractAndRememberSession(body: any): string | null {
  if (!body || typeof body !== "object") return null;
  const token =
    body?.data?.chat_bot_session ||
    body?.chat_bot_session ||
    body?.error?.chat_bot_session ||
    body?.error?.cookie_hash ||
    body?.cookie_hash;
  if (typeof token === "string" && token.trim()) {
    rememberLaravelChatSession(token.trim());
    return token.trim();
  }
  return null;
}

function withLaravelChatSession(payload: Record<string, unknown>): Record<string, unknown> {
  const token = getLaravelChatSession();
  return token ? { ...payload, chat_bot_session: token } : payload;
}

export const laravelJsonOptions = {
  credentials: "include" as RequestCredentials,
  cache: "no-store" as RequestCache,
  headers: { "Content-Type": "application/json" },
};

export type EnsureLaravelRoomParams = {
  upstreamConversationId: string;
  title: string;
  model: string;
  userId?: number | string | null;
  agent?: string;
  customBaseUrl?: string;
};

export type PersistChatTurnParams = {
  roomId: string;
  userId?: number | string | null;
  userMessage: string;
  assistantMessage: string | null;
  serviceId: string;
  model: string;
  upstreamResponseId?: string | null;
  usage?: {
    input_tokens?: number;
    cached_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  httpStatus: number;
  errorMessage: string | null;
  customBaseUrl?: string;
};

export type CreateConversationParams = {
  sessionKey: string;
  userId?: number | string | null;
  targetUrl?: string;
};

export type CreateConversationResult = {
  conversationId: string | null;
  userId: number | string | null;
  raw: any;
};

export type FetchRoomsResult = {
  ok: boolean;
  status: number;
  rooms: any[];
};

/** Link an upstream conversation to a Laravel room and persist a newly issued JSON token in cookie & localStorage. */
export async function apiEnsureLaravelRoom({
  upstreamConversationId,
  title,
  model,
  userId,
  agent,
  customBaseUrl,
}: EnsureLaravelRoomParams): Promise<string> {
  const normalizedUserId =
    userId === null || userId === undefined || userId === ""
      ? undefined
      : Number.isInteger(Number(userId))
      ? Number(userId)
      : userId;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (customBaseUrl) {
    headers["x-laravel-target"] = customBaseUrl;
  }

  const response = await fetch(`${LARAVEL_CHAT_API.replace(/\/$/, "")}/rooms`, {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    headers,
    body: JSON.stringify(
      withLaravelChatSession({
        upstream_conversation_id: upstreamConversationId,
        title: title.slice(0, 255),
        model,
        ...(normalizedUserId !== undefined ? { user_id: normalizedUserId } : {}),
        agent,
      })
    ),
  });

  const body = await response.json().catch(() => null);

  // ALWAYS extract and persist session token to cookie & localStorage (even on failure/CONVERSATION_ALREADY_LINKED)
  const sessionToken = extractAndRememberSession(body);

  if (!response.ok || body?.success === false) {
    const errorCode = body?.error?.code || body?.code;
    const errorMessage = String(body?.error?.message || body?.message || "");

    if (
      response.status === 401 ||
      errorCode === "CHAT_SESSION_INVALID" ||
      errorMessage.toLowerCase().includes("session")
    ) {
      clearLaravelChatSession();
      // Retry without chat_bot_session in payload so Laravel issues a fresh room & session
      const retryResponse = await fetch(`${LARAVEL_CHAT_API.replace(/\/$/, "")}/rooms`, {
        method: "POST",
        credentials: "omit",
        cache: "no-store",
        headers,
        body: JSON.stringify({
          upstream_conversation_id: upstreamConversationId,
          title: title.slice(0, 255),
          model,
          ...(normalizedUserId !== undefined ? { user_id: normalizedUserId } : {}),
          agent,
        }),
      });

      const retryBody = await retryResponse.json().catch(() => null);
      extractAndRememberSession(retryBody);

      if (!retryResponse.ok || retryBody?.success === false) {
        throw new Error(
          retryBody?.error?.message ||
            retryBody?.message ||
            `Laravel room sync failed on retry (${retryResponse.status})`
        );
      }

      const retryRoomId = retryBody?.data?.room_id ?? retryBody?.room_id;
      if (retryRoomId === undefined || retryRoomId === null) {
        throw new Error("Laravel room response did not include data.room_id");
      }
      return String(retryRoomId);
    }

    if (errorCode === "CONVERSATION_ALREADY_LINKED") {
      const err = new Error(
        errorMessage ||
          "This conversation is already linked to another chat user.",
      );
      (err as any).code = "CONVERSATION_ALREADY_LINKED";
      (err as any).chat_bot_session = sessionToken;
      throw err;
    }
    throw new Error(
      errorMessage ||
        `Laravel room sync failed (${response.status})`
    );
  }

  const roomId = body?.data?.room_id ?? body?.room_id;
  if (roomId === undefined || roomId === null) {
    throw new Error("Laravel room response did not include data.room_id");
  }
  return String(roomId);
}

/**
 * Persist a user + assistant chat turn into a Laravel room.
 */
export async function apiPersistChatMessage({
  roomId,
  userId,
  userMessage,
  assistantMessage,
  serviceId,
  model,
  upstreamResponseId,
  usage,
  httpStatus,
  errorMessage,
  customBaseUrl,
}: PersistChatTurnParams): Promise<void> {
  const normalizedUserId =
    userId === null || userId === undefined || userId === ""
      ? undefined
      : Number.isInteger(Number(userId))
      ? Number(userId)
      : userId;
  const sessionToken = getLaravelChatSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (sessionToken) {
    headers["x-chat-bot-session"] = sessionToken;
    headers["x-media-chat-bot-session"] = sessionToken;
  }
  if (customBaseUrl) {
    headers["x-laravel-target"] = customBaseUrl;
  }
  const response = await fetch(
    `${LARAVEL_CHAT_API.replace(/\/$/, "")}/rooms/${encodeURIComponent(roomId)}/messages`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers,
      body: JSON.stringify(withLaravelChatSession({
        ...(normalizedUserId !== undefined ? { user_id: normalizedUserId } : {}),
        user_message: userMessage,
        ...(assistantMessage !== null ? { assistant_message: assistantMessage } : {}),
        service_id: serviceId,
        model,
        upstream_response_id: upstreamResponseId ?? null,
        usage: {
          input_tokens: usage?.input_tokens ?? 0,
          cached_tokens: usage?.cached_tokens ?? 0,
          output_tokens: usage?.output_tokens ?? 0,
          total_tokens: usage?.total_tokens ?? 0,
        },
        http_status: httpStatus,
        error_message: errorMessage,
      })),
    },
  );

  const body = await response.json().catch(() => null);
  extractAndRememberSession(body);
  if (!response.ok) {
    if (
      response.status === 401 &&
      (body?.error?.code === "CHAT_SESSION_INVALID" ||
        String(body?.error?.message || body?.message || "").toLowerCase().includes("session"))
    ) {
      clearLaravelChatSession();
    }
    throw new Error(`Laravel message sync failed (${response.status})`);
  }
}

/**
 * Creates a new OpenClaw conversation session.
 */
export async function apiCreateConversation({
  sessionKey,
  userId,
  targetUrl,
}: CreateConversationParams): Promise<CreateConversationResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-openclaw-session-key": sessionKey,
  };
  if (targetUrl) {
    headers["x-openclaw-target"] = targetUrl;
  }

  const bodyPayload: Record<string, unknown> = {
    user_id: null,
    metadata: { source: "frontend" },
  };
  if (userId !== null && userId !== undefined && userId !== "") {
    const num = Number(userId);
    bodyPayload.user_id = Number.isInteger(num) ? num : userId;
  }

  const res = await fetch(OPENCLAW_CONVERSATIONS_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    throw new Error(`OpenClaw create conversation failed (${res.status})`);
  }

  const data = await res.json();
  const conversation =
    data.conversation && typeof data.conversation === "object"
      ? data.conversation
      : data;
  const convKey =
    data.conversation_id ||
    conversation.conversation_id ||
    (typeof conversation.id === "string"
      ? conversation.id
      : (conversation.id ? String(conversation.id) : null));
  const returnedUserId = conversation.user_id ?? data.user_id ?? null;

  return {
    conversationId: convKey,
    userId: returnedUserId,
    raw: data,
  };
}

/** Create the default workspace session for a newly assigned OpenClaw user. */
export async function apiCreateWorkspaceSession({
  userId,
  sessionKey,
  targetUrl,
}: CreateConversationParams & { userId: number | string }): Promise<void> {
  const numericUserId = Number(userId);
  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    throw new Error("Workspace session cần user_id là số nguyên dương.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-openclaw-session-key": sessionKey,
  };
  if (targetUrl) headers["x-openclaw-target"] = targetUrl;

  const response = await fetch(OPENCLAW_WORKSPACE_NEW_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: numericUserId }),
  });

  // This API creates one workspace session per user; an existing one is valid.
  if (response.status === 409) return;
  if (!response.ok) {
    throw new Error(`OpenClaw create workspace session failed (${response.status})`);
  }
}

export type SelectWorkspaceResult = {
  user_id: number;
  work_space_code: string;
  skill_code: string;
  agent_code: string;
  command: string;
  status: string;
  response_text: string;
  chat_result: Record<string, unknown>;
};

/** Send the selected workspace skill command through OpenClaw for this user. */
export async function apiSelectWorkspace({
  userId,
  workSpaceCode,
  targetUrl,
}: {
  userId: number | string;
  workSpaceCode: string;
  targetUrl?: string;
}): Promise<SelectWorkspaceResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (targetUrl) headers["x-openclaw-target"] = targetUrl;

  const response = await fetch(OPENCLAW_WORKSPACE_SELECT_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: Number(userId), work_space_code: workSpaceCode }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.ok !== true || !body?.data) {
    const errorCode = typeof body?.error === "string" ? body.error : `HTTP ${response.status}`;
    throw new Error(`Không chuyển được workspace (${errorCode}).`);
  }

  return body.data as SelectWorkspaceResult;
}

/**
 * Fetches rooms list from Laravel chat backend.
 */
export async function apiFetchLaravelRooms(page = 1, perPage = 30, customBaseUrl?: string): Promise<FetchRoomsResult> {
  const sessionToken = getLaravelChatSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (sessionToken) {
    headers["x-chat-bot-session"] = sessionToken;
    headers["x-media-chat-bot-session"] = sessionToken;
  }
  if (customBaseUrl) {
    headers["x-laravel-target"] = customBaseUrl;
  }
  const response = await fetch(`${LARAVEL_CHAT_API.replace(/\/$/, "")}/rooms/list`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers,
    body: JSON.stringify(withLaravelChatSession({ page, per_page: perPage })),
  });

  const body = await response.json().catch(() => null);
  extractAndRememberSession(body);

  if (!response.ok) {
    if (
      response.status === 401 &&
      (body?.error?.code === "CHAT_SESSION_INVALID" ||
        String(body?.error?.message || body?.message || "").toLowerCase().includes("session"))
    ) {
      clearLaravelChatSession();
    }
    return { ok: false, status: response.status, rooms: [] };
  }

  const rooms = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body?.data?.data)
    ? body.data.data
    : [];

  return { ok: true, status: response.status, rooms };
}

/**
 * Fetches message history for a specific room.
 */
export async function apiFetchRoomMessages(
  roomId: number | string,
  perPage = 50,
  beforeId?: number,
  customBaseUrl?: string,
): Promise<any[]> {
  const sessionToken = getLaravelChatSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (sessionToken) {
    headers["x-chat-bot-session"] = sessionToken;
    headers["x-media-chat-bot-session"] = sessionToken;
  }
  if (customBaseUrl) {
    headers["x-laravel-target"] = customBaseUrl;
  }
  const response = await fetch(
    `${LARAVEL_CHAT_API.replace(/\/$/, "")}/rooms/${encodeURIComponent(String(roomId))}/messages/list`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers,
      body: JSON.stringify(withLaravelChatSession({
        per_page: perPage,
        ...(beforeId !== undefined ? { before_id: beforeId } : {}),
      })),
    },
  );

  const body = await response.json().catch(() => null);
  extractAndRememberSession(body);

  if (!response.ok) {
    if (
      response.status === 401 &&
      (body?.error?.code === "CHAT_SESSION_INVALID" ||
        String(body?.error?.message || body?.message || "").toLowerCase().includes("session"))
    ) {
      clearLaravelChatSession();
    }
    const detail =
      body?.error?.message ||
      body?.message ||
      body?.error ||
      `HTTP ${response.status}`;
    const err = new Error(`HTTP ${response.status}: ${String(detail)}`);
    (err as any).status = response.status;
    (err as any).code = body?.error?.code;
    throw err;
  }

  return Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body?.data?.data)
    ? body.data.data
    : [];
}

/**
 * Sends a chat or generation request to OpenClaw / proxy endpoint.
 */
export async function apiSendOpenClawRequest(
  endpoint: string,
  headers: Record<string, string>,
  payload: any,
): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

/** Reset the active OpenClaw chat session using the /reset chat command. */
export async function apiResetOpenClawChat({
  sessionKey,
  model,
  conversationId,
  targetUrl,
}: {
  sessionKey: string;
  model: string;
  conversationId?: string | null;
  targetUrl?: string;
}): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-openclaw-session-key": sessionKey,
  };
  if (targetUrl) headers["x-openclaw-target"] = targetUrl;

  const response = await fetch(OPENCLAW_RESPONSES_ENDPOINT, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      model,
      ...(conversationId ? { conversation_id: conversationId } : {}),
      input: [{ role: "user", content: "/reset" }],
    }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.error) {
    const message =
      body?.error?.message || body?.message || `OpenClaw trả về HTTP ${response.status}`;
    throw new Error(`Không reset được phiên chat: ${message}`);
  }
}

/**
 * Chat Bot Manage APIs (Các API quản trị, không yêu cầu Bearer token)
 */

export interface ChatBotManageOverviewResponse {
  success: boolean;
  data: {
    users: {
      total: number;
      active: number;
      disabled: number;
      mixed_status: number;
    };
    sessions: number;
    rooms: {
      total: number;
      active: number;
    };
  };
}

export interface ChatBotManageUser {
  user_id: string;
  upstream_user_id?: number | null;
  session_count: number;
  active_session_count: number;
  disabled_session_count: number;
  room_count: number;
  last_activity_at?: string | null;
  created_at: string;
  status: "active" | "disabled" | "mixed";
}

export interface ChatBotManageUsersResponse {
  success: boolean;
  data: ChatBotManageUser[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export async function apiFetchChatBotManageOverview(
  customBaseUrl?: string,
): Promise<ChatBotManageOverviewResponse> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (customBaseUrl) headers["x-laravel-target"] = customBaseUrl;
  const res = await fetch(`${LARAVEL_CHAT_MANAGE_API}/overview`, {
    headers,
    cache: "no-store",
  });
  return res.json();
}

export async function apiFetchChatBotManageUsers(
  options?: { q?: string; status?: string; per_page?: number; page?: number },
  customBaseUrl?: string,
): Promise<ChatBotManageUsersResponse> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (customBaseUrl) headers["x-laravel-target"] = customBaseUrl;

  const params = new URLSearchParams();
  if (options?.q) params.set("q", options.q);
  if (options?.status && options.status !== "all") params.set("status", options.status);
  if (options?.per_page) params.set("per_page", String(options.per_page));
  if (options?.page) params.set("page", String(options.page));

  const url = `${LARAVEL_CHAT_MANAGE_API}/users${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  return res.json();
}

export async function apiFetchChatBotManageUserDetails(
  userId: string,
  customBaseUrl?: string,
) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (customBaseUrl) headers["x-laravel-target"] = customBaseUrl;
  const res = await fetch(`${LARAVEL_CHAT_MANAGE_API}/users/${userId}`, {
    headers,
    cache: "no-store",
  });
  return res.json();
}

export async function apiUpdateChatBotManageUserStatus(
  userId: string,
  status: 0 | 1,
  customBaseUrl?: string,
) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (customBaseUrl) headers["x-laravel-target"] = customBaseUrl;
  const res = await fetch(`${LARAVEL_CHAT_MANAGE_API}/users/${userId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function apiFetchChatBotManageUserRooms(
  userId: string,
  options?: { per_page?: number; page?: number },
  customBaseUrl?: string,
) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (customBaseUrl) headers["x-laravel-target"] = customBaseUrl;

  const params = new URLSearchParams();
  if (options?.per_page) params.set("per_page", String(options.per_page));
  if (options?.page) params.set("page", String(options.page));

  const url = `${LARAVEL_CHAT_MANAGE_API}/users/${userId}/rooms${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  return res.json();
}

