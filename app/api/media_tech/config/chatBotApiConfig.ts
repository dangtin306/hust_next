export const CHAT_BOT_API_COOKIE_NAME_MT = "url_api_chat_bot_mt";
export const CHAT_BOT_API_COOKIE_NAME_HUST = "url_api_chat_bot_hust";
export const CHAT_BOT_API_COOKIE_NAME = "url_api_chat_bot"; // legacy / fallback
export const CHAT_BOT_API_CHANGE_EVENT = "url-api-chat-bot-change";

export type ChatBotApiConfig = {
  backend_laravel: string;
  backend_node: string;
};

export function getChatBotApiCookieName(isHust = false): string {
  return isHust ? CHAT_BOT_API_COOKIE_NAME_HUST : CHAT_BOT_API_COOKIE_NAME_MT;
}

export const DEFAULT_PRESETS = {
  mt: {
    production: {
      id: "production",
      label: "Production Cloud (Media Tech)",
      description: "Hệ thống máy chủ chính thức MT trên cloud",
      config: {
        backend_laravel: "https://laravel_mt.hust.media",
        backend_node: "https://node_md.hust.media",
      },
    },
    localhost: {
      id: "localhost",
      label: "Localhost Dev",
      description: "Môi trường lập trình nội bộ máy cá nhân",
      config: {
        backend_laravel: "http://127.0.0.1:8000",
        backend_node: "http://localhost:2999",
      },
    },
  },
  hust: {
    production: {
      id: "production",
      label: "Production Cloud (Hust Media)",
      description: "Hệ thống máy chủ chính thức Hust trên cloud",
      config: {
        backend_laravel: "https://laravel.hust.media",
        backend_node: "https://node_md.hust.media",
      },
    },
    localhost: {
      id: "localhost",
      label: "Localhost Dev",
      description: "Môi trường lập trình nội bộ máy cá nhân",
      config: {
        backend_laravel: "http://127.0.0.1:8000",
        backend_node: "http://localhost:2999",
      },
    },
  },
} as const;

/**
 * Phân tích chuỗi cookie (JSON hoặc URI-encoded JSON) thành cấu hình hợp lệ.
 */
export function parseChatBotApiConfigString(
  raw: string | null | undefined
): ChatBotApiConfig | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const decoded = trimmed.startsWith("%")
      ? decodeURIComponent(trimmed)
      : trimmed;
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === "object") {
      const laravel =
        typeof parsed.backend_laravel === "string"
          ? parsed.backend_laravel.trim()
          : "";
      const node =
        typeof parsed.backend_node === "string"
          ? parsed.backend_node.trim()
          : "";
      if (laravel || node) {
        return { backend_laravel: laravel, backend_node: node };
      }
    }
  } catch {
    try {
      const parsed = JSON.parse(decodeURIComponent(trimmed));
      if (parsed && typeof parsed === "object") {
        const laravel =
          typeof parsed.backend_laravel === "string"
            ? parsed.backend_laravel.trim()
            : "";
        const node =
          typeof parsed.backend_node === "string"
            ? parsed.backend_node.trim()
            : "";
        if (laravel || node) {
          return { backend_laravel: laravel, backend_node: node };
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Kiểm tra xem người dùng đã thiết lập cookie URL API hay chưa (url_api_chat_bot_mt hoặc url_api_chat_bot_hust).
 */
export function hasChatBotApiConfigCookie(isHust = false): boolean {
  if (typeof document === "undefined") return false;
  const targetCookieName = getChatBotApiCookieName(isHust);
  const match =
    document.cookie.match(new RegExp(`(?:^|;\\s*)${targetCookieName}=([^;]+)`)) ||
    document.cookie.match(new RegExp(`(?:^|;\\s*)${CHAT_BOT_API_COOKIE_NAME}=([^;]+)`));

  if (!match) return false;
  return Boolean(parseChatBotApiConfigString(match[1]));
}

/**
 * Đọc cấu hình hiện tại từ cookie, hoặc trả về cấu hình mặc định (Production).
 */
export function getChatBotApiConfig(isHust = false): ChatBotApiConfig {
  const fallback = isHust
    ? DEFAULT_PRESETS.hust.production.config
    : DEFAULT_PRESETS.mt.production.config;

  if (typeof document === "undefined") return fallback;

  const targetCookieName = getChatBotApiCookieName(isHust);
  const match =
    document.cookie.match(new RegExp(`(?:^|;\\s*)${targetCookieName}=([^;]+)`)) ||
    document.cookie.match(new RegExp(`(?:^|;\\s*)${CHAT_BOT_API_COOKIE_NAME}=([^;]+)`));

  if (match) {
    const parsed = parseChatBotApiConfigString(match[1]);
    if (parsed) {
      return {
        backend_laravel: parsed.backend_laravel || fallback.backend_laravel,
        backend_node: parsed.backend_node || fallback.backend_node,
      };
    }
  }
  return fallback;
}

/**
 * Lưu cấu hình vào cookie (url_api_chat_bot_mt hoặc url_api_chat_bot_hust) và phát event đồng bộ.
 */
export function saveChatBotApiConfig(config: ChatBotApiConfig, isHust = false): void {
  if (typeof document === "undefined") return;
  const targetCookieName = getChatBotApiCookieName(isHust);
  const cleanConfig: ChatBotApiConfig = {
    backend_laravel: config.backend_laravel.trim().replace(/\/+$/, ""),
    backend_node: config.backend_node.trim().replace(/\/+$/, ""),
  };
  const jsonStr = JSON.stringify(cleanConfig);
  document.cookie = `${targetCookieName}=${encodeURIComponent(
    jsonStr
  )}; path=/; max-age=31536000; SameSite=Lax`;

  window.dispatchEvent(
    new CustomEvent(CHAT_BOT_API_CHANGE_EVENT, { detail: { ...cleanConfig, isHust } })
  );
}

/**
 * Xóa cookie để người dùng có thể cấu hình lại từ đầu.
 */
export function clearChatBotApiConfig(isHust = false): void {
  if (typeof document === "undefined") return;
  const targetCookieName = getChatBotApiCookieName(isHust);
  document.cookie = `${targetCookieName}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${CHAT_BOT_API_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(
    new CustomEvent(CHAT_BOT_API_CHANGE_EVENT, { detail: null })
  );
}
