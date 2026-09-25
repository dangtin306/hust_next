"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  CornerDownLeft,
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Cpu,
  Layers,
  ChevronDown,
  X,
  History,
  Terminal,
  Zap,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  isError?: boolean;
  modelUsed?: string;
  responseId?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
};

type ConnectionStatus = "online" | "offline" | "checking";

const STORAGE_KEYS = {
  BASE_URL: "openclaw_new_base_url",
  API_KEY: "openclaw_new_api_key",
  SESSION_KEY: "openclaw_new_session_key",
  MODEL: "openclaw_new_model",
  USE_PROXY: "openclaw_new_use_proxy",
  CONV_ID: "openclaw_new_conversation_id",
};

const DEFAULT_BASE_URL = "https://node_js.hust.media/openclaw";
const DEFAULT_LOCAL_URL = "http://localhost:2999/openclaw";
const DEFAULT_SESSION_KEY = "agent:chat_bot:real";
const DEFAULT_MODEL = "gpt-5.6-luna";

const SUGGESTIONS = [
  {
    icon: "🏛️",
    title: "Giới thiệu về Hà Nội",
    prompt: "Xin chào, hãy giới thiệu về lịch sử, văn hóa và các địa điểm nổi tiếng tại Hà Nội.",
  },
  {
    icon: "📝",
    title: "Sửa lỗi chính tả (/skill)",
    prompt: "/skill media_spelling\nHãy sửa lỗi chính tả trong đoạn văn sau:\nTôi dang hoc lap trinh tai Media Tech va muon kiem tra lai van ban nay.",
  },
  {
    icon: "🎬",
    title: "Viết kịch bản video (/skill)",
    prompt: "/skill media_script_writing\nHãy viết kịch bản video ngắn 60 giây giới thiệu ngày hội Chào tân sinh viên Hust Media.",
  },
  {
    icon: "🎓",
    title: "Đăng ký tín chỉ",
    prompt: "Chia sẻ cho mình các mẹo xếp lịch học và đăng ký tín chỉ học phần hiệu quả nhất.",
  },
];

// Helper to format markdown-like text with bold and code blocks
function FormattedBubbleContent({ text }: { text: string }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (codeStr: string, idx: number) => {
    navigator.clipboard?.writeText(codeStr);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Split by markdown code fences
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed sm:text-[15px]">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let language = "text";
          let codeContent = part.slice(3, -3).trim();

          if (lines.length > 0 && lines[0].trim().match(/^[a-zA-Z0-9_-]+$/)) {
            language = lines[0].trim();
            codeContent = lines.slice(1).join("\n");
          }

          return (
            <div
              key={index}
              className="my-2.5 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <Terminal className="h-3.5 w-3.5 text-purple-400" />
                  {language}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeContent, index)}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  {copiedCodeIndex === index ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="h-3 w-3" /> Đã chép
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="h-3 w-3" /> Sao chép
                    </span>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3 text-xs font-mono leading-relaxed text-slate-200">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Normal paragraph formatting with bold support
        return (
          <div key={index} className="whitespace-pre-wrap break-words">
            {part.split("\n").map((line, lIdx) => {
              // Simple bold parse
              const boldParts = line.split(/(\*\*.*?\*\*)/g);
              return (
                <span key={lIdx} className="block min-h-[1.2em]">
                  {boldParts.map((sub, sIdx) => {
                    if (sub.startsWith("**") && sub.endsWith("**")) {
                      return (
                        <strong key={sIdx} className="font-semibold text-slate-900">
                          {sub.slice(2, -2)}
                        </strong>
                      );
                    }
                    if (sub.startsWith("`") && sub.endsWith("`") && sub.length > 2) {
                      return (
                        <code
                          key={sIdx}
                          className="mx-0.5 rounded bg-purple-100/80 px-1.5 py-0.5 font-mono text-[13px] text-purple-800"
                        >
                          {sub.slice(1, -1)}
                        </code>
                      );
                    }
                    return sub;
                  })}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ChatBotApiClient() {
  // Config state
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useState<string>("");
  const [sessionKey, setSessionKey] = useState<string>(DEFAULT_SESSION_KEY);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [useProxy, setUseProxy] = useState<boolean>(true); // Default proxy for optimal cross-network support

  // Conversation & chat state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status & modal state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("checking");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [serverHistoryItems, setServerHistoryItems] = useState<unknown[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Settings inputs in modal
  const [settingsUrlInput, setSettingsUrlInput] = useState("");
  const [settingsKeyInput, setSettingsKeyInput] = useState("");
  const [settingsSessionKeyInput, setSettingsSessionKeyInput] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);
  const justSentRef = useRef(false);

  // Helper to build request URL (Direct vs Proxy)
  const buildUrl = useCallback(
    (endpointPath: string) => {
      const cleanPath = endpointPath.startsWith("/") ? endpointPath.slice(1) : endpointPath;
      if (useProxy) {
        return `/next/api/openclaw/${cleanPath}`;
      }
      return `${baseUrl.replace(/\/$/, "")}/${cleanPath}`;
    },
    [baseUrl, useProxy]
  );

  // Helper to construct request headers
  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (apiKey.trim()) {
      headers["Authorization"] = `Bearer ${apiKey.trim()}`;
    }
    if (sessionKey.trim()) {
      headers["x-openclaw-session-key"] = sessionKey.trim();
    }
    if (useProxy) {
      headers["x-openclaw-target"] = baseUrl;
    }
    return headers;
  }, [apiKey, sessionKey, useProxy, baseUrl]);

  // Step 1: Create a new conversation: POST /v1/conversations
  const createConversation = useCallback(
    async (
      targetBase: string,
      model: string,
      token: string,
      sKey: string,
      proxy: boolean
    ) => {
      try {
        const cleanBase = targetBase.replace(/\/$/, "");
        const url = proxy
          ? "/next/api/openclaw/v1/conversations"
          : `${cleanBase}/v1/conversations`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (token.trim()) headers["Authorization"] = `Bearer ${token.trim()}`;
        if (sKey.trim()) headers["x-openclaw-session-key"] = sKey.trim();
        if (proxy) headers["x-openclaw-target"] = cleanBase;

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            metadata: {
              source: "hust_next_assistant",
              created_at: new Date().toISOString(),
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const newId = data.conversation_id || (typeof data.id === "string" ? data.id : (data.id ? String(data.id) : null));
          if (newId) {
            setConversationId(newId);
            try {
              window.localStorage.setItem(STORAGE_KEYS.CONV_ID, newId);
            } catch {
              // Ignore
            }
            return newId;
          }
        }
      } catch (err) {
        console.error("Lỗi khi tạo conversation:", err);
      }

      // Fallback local ID if backend is initializing
      const fallback = `conv_${Date.now().toString(36)}`;
      setConversationId(fallback);
      return fallback;
    },
    []
  );

  // Step 5: Fetch conversation items: GET /v1/conversations/{id}/items
  const fetchConversationItems = useCallback(
    async (convId: string) => {
      if (!convId) return;
      setIsLoadingHistory(true);
      try {
        const url = buildUrl(`v1/conversations/${convId}/items`);
        const headers = getHeaders();
        const res = await fetch(url, { method: "GET", headers });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            setServerHistoryItems(data.data);
            return data.data;
          }
        }
      } catch (err) {
        console.error("Lỗi fetch items:", err);
      } finally {
        setIsLoadingHistory(false);
      }
      return null;
    },
    [buildUrl, getHeaders]
  );

  // Health check on startup or config change
  const testConnection = useCallback(
    async (targetBase: string, token: string, sKey: string, proxy: boolean) => {
      setConnectionStatus("checking");
      setStatusMessage("Đang kiểm tra kết nối API...");

      try {
        const cleanBase = targetBase.replace(/\/$/, "");
        // Test by creating or getting a lightweight conversation ping
        const testUrl = proxy
          ? "/next/api/openclaw/v1/conversations"
          : `${cleanBase}/v1/conversations`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (token.trim()) headers["Authorization"] = `Bearer ${token.trim()}`;
        if (sKey.trim()) headers["x-openclaw-session-key"] = sKey.trim();
        if (proxy) headers["x-openclaw-target"] = cleanBase;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const res = await fetch(testUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: "gpt-5.6-luna",
            metadata: { ping: true },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setConnectionStatus("online");
          setStatusMessage(`Kết nối tốt tới ${cleanBase}`);
          const convKey = data.conversation_id || (typeof data.id === "string" ? data.id : (data.id ? String(data.id) : null));
          if (convKey) {
            setConversationId(convKey);
            try {
              window.localStorage.setItem(STORAGE_KEYS.CONV_ID, convKey);
            } catch {
              // Ignore
            }
          }
          return true;
        } else {
          setConnectionStatus("offline");
          setStatusMessage(`Gateway trả về mã HTTP ${res.status}`);
          return false;
        }
      } catch (err: unknown) {
        setConnectionStatus("offline");
        const errMsg = err instanceof Error ? err.message : String(err);
        setStatusMessage(`Không thể kết nối tới Gateway: ${errMsg}`);
        return false;
      }
    },
    []
  );

  // Initialize configs on mount
  useEffect(() => {
    let savedBase = DEFAULT_BASE_URL;
    let savedKey = "";
    let savedSession = DEFAULT_SESSION_KEY;
    let savedModel = DEFAULT_MODEL;
    let savedProxy = true;
    let savedConvId: string | null = null;

    try {
      const b = window.localStorage.getItem(STORAGE_KEYS.BASE_URL);
      if (b) savedBase = b;

      const k = window.localStorage.getItem(STORAGE_KEYS.API_KEY);
      if (k) savedKey = k;

      const s = window.localStorage.getItem(STORAGE_KEYS.SESSION_KEY);
      if (s) savedSession = s;

      const m = window.localStorage.getItem(STORAGE_KEYS.MODEL);
      if (m) savedModel = m;

      const p = window.localStorage.getItem(STORAGE_KEYS.USE_PROXY);
      if (p !== null) savedProxy = p === "true";

      const c = window.localStorage.getItem(STORAGE_KEYS.CONV_ID);
      if (c) savedConvId = c;
    } catch {
      // Ignore localStorage access errors
    }

    setBaseUrl(savedBase);
    setSettingsUrlInput(savedBase);
    setApiKey(savedKey);
    setSettingsKeyInput(savedKey);
    setSessionKey(savedSession);
    setSettingsSessionKeyInput(savedSession);
    setSelectedModel(savedModel);
    setUseProxy(savedProxy);

    // Initial conversation & health check
    if (savedConvId) {
      setConversationId(savedConvId);
      testConnection(savedBase, savedKey, savedSession, savedProxy);
    } else {
      createConversation(savedBase, savedModel, savedKey, savedSession, savedProxy).then(
        (newId) => {
          setConnectionStatus("online");
          setStatusMessage(`Đã kết nối tới ${savedBase}`);
        }
      );
    }

    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: `Xin chào! 👋 Mình là **Hust AI Assistant** (chạy trên **OpenClaw Production Gateway**).\n\n- 🌐 **Base URL:** \`${savedBase}\`\n- 🤖 **Model:** \`${savedModel}\`\n- 💬 **Endpoint:** \`/v1/chat/completions\`\n\nBạn có thể hỏi bất kỳ chủ đề nào, dùng các kỹ năng như sửa lỗi chính tả (\`/skill media_spelling\`), viết kịch bản video (\`/skill media_script_writing\`) hoặc chọn gợi ý bên dưới để thử nghiệm ngay!`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: savedModel,
      },
    ]);
  }, [createConversation, testConnection]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset conversation: Create a new room via POST /v1/conversations
  const handleResetChat = async () => {
    setIsTyping(false);
    setInput("");
    const newRoomId = await createConversation(
      baseUrl,
      selectedModel,
      apiKey,
      sessionKey,
      useProxy
    );
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: `Đã bắt đầu phòng hội thoại mới: \`${newRoomId}\`.\nModel: **${selectedModel}**. Mời bạn đặt câu hỏi!`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: selectedModel,
      },
    ]);
  };

  // Step 3: Send message to POST /v1/chat/completions
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMessageTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      time: userMessageTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsTyping(true);

    try {
      // Ensure we have a valid conversation ID
      let activeRoomId = conversationId;
      if (!activeRoomId) {
        activeRoomId = await createConversation(
          baseUrl,
          selectedModel,
          apiKey,
          sessionKey,
          useProxy
        );
      }

      const endpoint = buildUrl("v1/chat/completions");
      const headers = getHeaders();

      // Construct messages payload
      const payload = {
        model: selectedModel,
        conversation_id: activeRoomId,
        messages: [
          {
            role: "user",
            content: query,
          },
        ],
        stream: false,
      };

      let res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      // Auto-recover if 404: Conversation expired/not found -> Recreate and retry once
      if (res.status === 404) {
        const errorData = await res.json().catch(() => null);
        if (errorData?.error?.message?.includes("conversation") || res.status === 404) {
          activeRoomId = await createConversation(
            baseUrl,
            selectedModel,
            apiKey,
            sessionKey,
            useProxy
          );
          payload.conversation_id = activeRoomId;
          res = await fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });
        }
      }

      const resTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMsg =
          errorData?.error?.message ||
          errorData?.message ||
          `Máy chủ trả về mã lỗi HTTP ${res.status}`;

        setConnectionStatus("offline");
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: "bot",
            text: `⚠️ **Lỗi Chat Completion (HTTP ${res.status}):**\n${errorMsg}\n\n*Gợi ý: Kiểm tra kết nối tới \`${baseUrl}\` hoặc mở Cài đặt API để thử lại.*`,
            time: resTime,
            isError: true,
            modelUsed: selectedModel,
          },
        ]);
      } else {
        const data = await res.json();
        setConnectionStatus("online");

        if (data.conversation_id && data.conversation_id !== activeRoomId) {
          setConversationId(data.conversation_id);
          try {
            window.localStorage.setItem(STORAGE_KEYS.CONV_ID, data.conversation_id);
          } catch {
            // Ignore
          }
        }

        // Parse response from OpenClaw chat.completion format:
        // data.choices[0].message.content
        let botText = "";
        if (Array.isArray(data?.choices) && data.choices.length > 0) {
          const firstChoice = data.choices[0];
          botText =
            firstChoice?.message?.content ||
            firstChoice?.text ||
            "";
        } else if (typeof data?.output_text === "string") {
          botText = data.output_text;
        } else if (typeof data === "string") {
          botText = data;
        } else {
          botText = JSON.stringify(data, null, 2);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: botText,
            time: resTime,
            modelUsed: data.model || selectedModel,
            responseId: data.id,
            usage: data.usage,
          },
        ]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setConnectionStatus("offline");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: `⚠️ **Không thể kết nối đến OpenClaw API:**\n${errMsg}\n\n*Nếu chạy từ xa hoặc mạng LAN, hãy đảm bảo tính năng Next.js Backend Proxy đang được Bật trong phần Cài đặt.*`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const onSendSubmit = (textToSend?: string) => {
    const rawText = textToSend ?? textareaRef.current?.value ?? input;
    const text = rawText.trim();
    if (!text || isTyping) return;

    justSentRef.current = true;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }

    handleSendMessage(text);
    setSelectedSuggestion(null);

    setTimeout(() => {
      justSentRef.current = false;
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
      }
      setInput("");
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
    e.target.style.height = `${Math.min(e.target.scrollHeight, 280)}px`;
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

  // Save Settings Modal
  const handleSaveSettings = async () => {
    const trimmedUrl = settingsUrlInput.trim().replace(/\/$/, "");
    const trimmedKey = settingsKeyInput.trim();
    const trimmedSession = settingsSessionKeyInput.trim() || DEFAULT_SESSION_KEY;

    setBaseUrl(trimmedUrl);
    setApiKey(trimmedKey);
    setSessionKey(trimmedSession);

    try {
      window.localStorage.setItem(STORAGE_KEYS.BASE_URL, trimmedUrl);
      window.localStorage.setItem(STORAGE_KEYS.API_KEY, trimmedKey);
      window.localStorage.setItem(STORAGE_KEYS.SESSION_KEY, trimmedSession);
      window.localStorage.setItem(STORAGE_KEYS.USE_PROXY, String(useProxy));
      window.localStorage.setItem(STORAGE_KEYS.MODEL, selectedModel);
    } catch {
      // Ignore
    }

    setIsSettingsOpen(false);
    await testConnection(trimmedUrl, trimmedKey, trimmedSession, useProxy);
  };

  // Test connection button
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    await testConnection(
      settingsUrlInput,
      settingsKeyInput,
      settingsSessionKeyInput,
      useProxy
    );
    setIsTestingConnection(false);
  };

  // Open History Drawer
  const handleOpenHistoryDrawer = async () => {
    setIsHistoryDrawerOpen(true);
    if (conversationId) {
      await fetchConversationItems(conversationId);
    }
  };

  return (
    <div className="flex w-full flex-col bg-transparent text-slate-800 antialiased selection:bg-purple-200">

      {/* Main Container */}
      <div className={`relative mx-auto flex h-full w-full ${selectedSuggestion ? "max-w-6xl" : "max-w-5xl"} flex-col px-2 py-2 sm:px-4 sm:py-3`}>
        {/* Top Header Card */}
        <header className="z-10 mb-2 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
          {/* Identity & Status */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md shadow-purple-500/25">
              <Bot className="h-5 w-5" />
              {/* Online pulse dot */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                  connectionStatus === "online"
                    ? "bg-emerald-500"
                    : connectionStatus === "checking"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-rose-500"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-800 sm:text-lg">
                  Hust AI Assistant
                </h1>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-purple-800 border border-purple-200/60">
                  OpenClaw v1
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                {connectionStatus === "online" ? (
                  <span className="text-emerald-700 font-medium">Gateway Sẵn sàng</span>
                ) : connectionStatus === "checking" ? (
                  <span className="text-amber-700">Đang kiểm tra...</span>
                ) : (
                  <span className="text-rose-600 font-medium">Chưa kết nối Gateway</span>
                )}
                {conversationId && (
                  <span className="hidden text-slate-400 sm:inline">
                    • Room: <code className="text-purple-600 font-semibold">{conversationId.slice(0, 18)}...</code>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative hidden items-center sm:flex">
              <Cpu className="absolute left-2.5 h-3.5 w-3.5 text-purple-500" />
              <select
                aria-label="Chọn AI Model"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  try {
                    window.localStorage.setItem(STORAGE_KEYS.MODEL, e.target.value);
                  } catch {
                    // Ignore
                  }
                }}
                className="appearance-none rounded-xl border border-purple-200/80 bg-white/95 py-1.5 pl-8 pr-7 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
              >
                <option value="gpt-5.6-luna">gpt-5.6-luna</option>
                <option value="gemini-3.7-flash">gemini-3.7-flash</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Conversation History / Items Viewer */}
            <button
              type="button"
              onClick={handleOpenHistoryDrawer}
              title="Xem danh sách Items trong Conversation từ Server"
              className="flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
            >
              <History className="h-3.5 w-3.5 text-purple-600" />
              <span className="hidden md:inline">Server Items</span>
            </button>

            {/* New Conversation Button */}
            <button
              type="button"
              onClick={handleResetChat}
              title="Tạo phòng hội thoại mới (POST /v1/conversations)"
              className="flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
            >
              <PlusCircle className="h-3.5 w-3.5 text-purple-600" />
              <span className="hidden md:inline">Đoạn chat mới</span>
            </button>

            {/* API Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              title="Cài đặt Gateway & Headers"
              className="relative flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
            >
              <Settings className="h-3.5 w-3.5 text-purple-600" />
              <span className="hidden sm:inline">Cài đặt API</span>
              {connectionStatus === "offline" && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Offline Warning Banner */}
        {connectionStatus === "offline" && (
          <div className="z-10 mb-2 flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/95 px-3.5 py-2 text-xs text-rose-800 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>
                <strong>Không kết nối được Gateway ({baseUrl}):</strong> {statusMessage || "Vui lòng kiểm tra địa chỉ Gateway hoặc bật Next.js Proxy."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-1 font-semibold text-white shadow-xs hover:bg-rose-700"
            >
              Cấu hình lại
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/60 bg-white/65 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-md sm:p-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`group flex items-start gap-3 ${
                    isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  {/* Bot Avatar */}
                  {isBot && (
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
                        msg.isError
                          ? "bg-rose-500 shadow-rose-500/20"
                          : "bg-gradient-to-tr from-purple-600 to-pink-500 shadow-purple-500/20"
                      }`}
                    >
                      {msg.isError ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                  )}

                  {/* Message Bubble Content */}
                  <div
                    className={`relative flex max-w-[88%] flex-col sm:max-w-[80%] ${
                      isBot ? "items-start" : "items-end"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        isBot
                          ? msg.isError
                            ? "rounded-tl-xs border border-rose-200 bg-rose-50 text-rose-900"
                            : "rounded-tl-xs border border-purple-100/90 bg-white/95 text-slate-800 backdrop-blur-sm"
                          : "rounded-tr-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-purple-500/20"
                      }`}
                    >
                      <FormattedBubbleContent text={msg.text} />
                    </div>

                    {/* Metadata bar: Timestamp, Model, Tokens, Copy */}
                    <div
                      className={`mt-1 flex flex-wrap items-center gap-2 px-1 text-[11px] text-slate-500 ${
                        isBot ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {msg.modelUsed && (
                        <span className="rounded bg-purple-100/90 px-1.5 py-0.2 text-[10px] font-medium text-purple-700">
                          {msg.modelUsed}
                        </span>
                      )}
                      {msg.usage && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded px-1.5 py-0.2">
                          <Zap className="h-2.5 w-2.5 text-amber-500" />
                          {msg.usage.total_tokens || 0} tokens
                        </span>
                      )}
                      {msg.responseId && (
                        <span className="hidden font-mono text-[10px] text-slate-400 lg:inline">
                          #{msg.responseId}
                        </span>
                      )}
                      {isBot && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="opacity-0 transition-opacity hover:text-purple-600 group-hover:opacity-100"
                          title="Sao chép toàn bộ tin nhắn"
                        >
                          {copiedId === msg.id ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Check className="h-3 w-3" /> Đã chép
                            </span>
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {!isBot && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-sm">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 justify-start">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-sm shadow-purple-500/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-purple-100/90 bg-white/95 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-pink-500 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="my-2 flex shrink-0 flex-wrap gap-2 px-1">
            {SUGGESTIONS.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedSuggestion(item.title);
                  setInput("");
                  textareaRef.current?.focus();
                }}
                className="group flex items-center gap-1.5 rounded-xl border border-purple-200/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm transition-all hover:border-purple-300 hover:bg-purple-50/80 hover:text-purple-700 hover:shadow-sm"
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </button>
            ))}
        </div>

        {/* Input Bar & Footer */}
        <footer className="mt-2 shrink-0 rounded-2xl border border-white/70 bg-white/80 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md sm:p-3">
          <div className="relative flex items-end gap-2 rounded-xl border border-purple-200/80 bg-white/95 p-1.5 shadow-inner transition-all focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/30">
            {/* Input Textarea */}
            <div className="min-w-0 flex-1">
            {selectedSuggestion && (
              <div className="mb-1 px-1 text-[11px] text-purple-700">
                Đã chọn <strong>{selectedSuggestion}</strong> — hãy bổ sung/chỉnh sửa nội dung đầu vào bên dưới rồi nhấn gửi.
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={selectedSuggestion === "Giới thiệu về Hà Nội" ? "Nhập địa điểm, giai đoạn hoặc khía cạnh muốn tìm hiểu..." : selectedSuggestion === "Sửa lỗi chính tả (/skill)" ? "Dán toàn bộ đoạn văn cần kiểm tra chính tả..." : selectedSuggestion === "Viết kịch bản video (/skill)" ? "Nhập chủ đề, thời lượng, đối tượng và phong cách video..." : selectedSuggestion === "Đăng ký tín chỉ" ? "Nhập học kỳ, ngành/năm học và điều bạn cần tư vấn..." : "Nhập tin nhắn hoặc /skill media_spelling, /skill media_script_writing..."}
              rows={1}
              className="max-h-[280px] min-h-[42px] w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => onSendSubmit()}
              disabled={(!input.trim() && !textareaRef.current?.value.trim()) || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              title="Gửi câu hỏi"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Micro Footer Legend */}
          <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              Tương thích <strong>POST /openclaw/v1/chat/completions</strong>
            </span>
            <div className="flex items-center gap-2">
              <span>Shift + Enter để xuống dòng</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-white/80 bg-white p-5 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Cài đặt OpenClaw API
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cấu hình endpoint, token và session key
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Base URL Field */}
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                BASE_URL
              </label>
              <input
                type="text"
                value={settingsUrlInput}
                onChange={(e) => setSettingsUrlInput(e.target.value)}
                placeholder="https://node_js.hust.media/openclaw"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setSettingsUrlInput(DEFAULT_BASE_URL)}
                  className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-100"
                >
                  node_js.hust.media (Chuẩn)
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsUrlInput(DEFAULT_LOCAL_URL)}
                  className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200"
                >
                  localhost:2999
                </button>
              </div>
            </div>

            {/* Session Key Field */}
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                x-openclaw-session-key
              </label>
              <input
                type="text"
                value={settingsSessionKeyInput}
                onChange={(e) => setSettingsSessionKeyInput(e.target.value)}
                placeholder="agent:chat_bot:real"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              <span className="mt-1 block text-[10px] text-slate-500">
                Mặc định: <code>agent:chat_bot:real</code> (hoặc <code>agent:chat_bot:demo</code>)
              </span>
            </div>

            {/* Authorization Token Field */}
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Authorization Token (Bearer)
              </label>
              <input
                type="text"
                value={settingsKeyInput}
                onChange={(e) => setSettingsKeyInput(e.target.value)}
                placeholder="Tùy chọn (để trống nếu không yêu cầu)"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Next.js Proxy Checkbox */}
            <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    Next.js Backend Proxy
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Khuyên dùng để tránh lỗi CORS khi truy cập qua mạng LAN hoặc IP nội bộ.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={useProxy}
                  onChange={(e) => setUseProxy(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Test Status Banner */}
            <div className="mb-4 rounded-lg bg-slate-50 p-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Trạng thái:</span>
                <span
                  className={`font-medium ${
                    connectionStatus === "online"
                      ? "text-emerald-600"
                      : connectionStatus === "checking"
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {connectionStatus === "online"
                    ? "Online"
                    : connectionStatus === "checking"
                    ? "Đang kiểm tra..."
                    : "Offline"}
                </span>
              </div>
              {statusMessage && (
                <p className="mt-1 text-[11px] text-slate-500 break-words">{statusMessage}</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isTestingConnection ? "animate-spin" : ""}`}
                />
                Thử kết nối
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Items / History Drawer */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="relative flex h-full w-full max-w-lg flex-col bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Items trong Conversation
                </h3>
                <p className="font-mono text-xs text-purple-600">
                  {conversationId || "Chưa có ID"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Endpoint: <code>GET /v1/conversations/{conversationId}/items</code>
              </span>
              <button
                type="button"
                onClick={() => conversationId && fetchConversationItems(conversationId)}
                disabled={isLoadingHistory}
                className="flex items-center gap-1 rounded-lg border border-purple-200 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-50"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoadingHistory ? "animate-spin" : ""}`}
                />
                Làm mới
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {isLoadingHistory ? (
                <div className="flex h-32 items-center justify-center text-xs text-slate-400">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin text-purple-600" />
                  Đang tải danh sách items từ server...
                </div>
              ) : serverHistoryItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  Chưa có item nào được lưu trong conversation này hoặc server chưa đồng bộ.
                </div>
              ) : (
                serverHistoryItems.map((rawItem: any, idx: number) => {
                  const isUser = rawItem.role === "user";
                  let itemText = "";
                  if (Array.isArray(rawItem.content)) {
                    itemText = rawItem.content.map((c: any) => c.text || "").join("\n");
                  } else if (typeof rawItem.content === "string") {
                    itemText = rawItem.content;
                  }

                  return (
                    <div
                      key={rawItem.id || idx}
                      className={`rounded-xl p-3 border text-xs ${
                        isUser
                          ? "border-purple-200 bg-purple-50/70"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-semibold uppercase tracking-wider text-purple-700">
                          {rawItem.role}
                        </span>
                        <span className="font-mono">{rawItem.id}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans">
                        {itemText}
                      </p>
                      {rawItem.created_at && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          {new Date(rawItem.created_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
