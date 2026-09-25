"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  RotateCcw,
  Paperclip,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  AlertCircle,
  X,
  ExternalLink,
  Edit2,
  Hash,
} from "lucide-react";

export type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  isError?: boolean;
  imageUrl?: string;
  serviceDescription?: string;
};

type MediaTechService =
  | "media_text_to_image"
  | "media_text_to_text"
  | "media_content_smart"
  | "media_spell_check"
  | "media_script_writing"
  | "media_image_to_text"
  | "media_text_to_speech";

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

export const OPENCLAW_SESSION_MAP: Record<string, string> = {
  "502": "2864c9fe-3620-4240-9391-78734c438f5a",
  "503": "bc5e63af-3ef3-47bc-b441-77d095aeca4d",
  "504": "23e1307d-ecd1-46b0-9699-f79cadab540a",
  "505": "e242f71d-0753-41a7-b1c1-91eeb7f4f6fa",
  "506": "f64e2355-0f01-42a7-b395-e55647a4a544",
  "507": "3243c2ed-f904-4561-81a4-f83a74d65849",
  "511": "53d10567-449b-4ea1-b38a-d713455435ae",
  "534": "e47ee527-a824-4615-8a4d-91ab34ac442c",
  "535": "6f154a07-15a0-420e-ab34-4c9d548df2e7",
  "536": "dd61a316-f935-4de7-b27e-d39488faee1e",
  "537": "16fcdefe-c0ce-4459-be48-a14746944496",
  "538": "757ae2d6-45e8-4f52-a865-28b5ec0eddd6",
  "539": "5a42a7dd-8779-4aed-b701-c3cad06dd923",
  "540": "ee1ad515-9cc0-4052-ba37-dec83e880c7c",
};

// Markdown-like text renderer with syntax highlighting container for code blocks
export function FormattedMessageContent({ text }: { text: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeStr: string, idx: number) => {
    navigator.clipboard?.writeText(codeStr);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed sm:text-[15px]">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let language = "code";
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
                  {copiedIndex === index ? (
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

        return (
          <div key={index} className="whitespace-pre-wrap break-words">
            {part.split("\n").map((line, lIdx) => {
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
  defaultUserId?: number | string;
  serviceDescriptions?: Record<string, string>;
};

export default function MediaTechChatClient({
  onClose,
  className = "",
  isDrawer = false,
  targetUrl,
  agent,
  sessionKey: propSessionKey,
  storageKey: propStorageKey,
  model: propModel = "gpt-5.6-luna",
  title = "Media Tech AI Assistant",
  subtitle = "Công cụ chat bot hỗ trợ bằng AI • Trực tuyến",
  agentBadge,
  useResponsesApi = false,
  defaultUserId = 502,
  serviceDescriptions = {},
}: MediaTechChatClientProps = {}) {
  type AttachedImage = { name: string; mediaType: string; dataUrl: string };
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [selectedService, setSelectedService] = useState<MediaTechService | null>(null);
  const [isServiceMenuExpanded, setIsServiceMenuExpanded] = useState(true);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | string>(defaultUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const justSentRef = useRef(false);
  const lastResponseIdRef = useRef<string | null>(null);

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
    ? baseSession.replace(/:user_\d+$/, `:user_${userId}`)
    : `${baseSession}:user_${userId}`;

  const activeSessionKey = effectiveSessionKey;

  const targetAgent = agent || (effectiveSessionKey.includes("chat_bot") ? "chat_bot" : "test");
  const openClawSessionId = OPENCLAW_SESSION_MAP[String(userId)] || "";
  const openClawUrl = openClawSessionId
    ? `https://oc.hust.media/md_1/chat/${targetAgent}/${openClawSessionId}`
    : `https://oc.hust.media/md_1/chat/${targetAgent}`;

  const activeModel = propModel;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedService, isServiceMenuExpanded]);

  // Create or load conversation session
  const createConversation = async (overrideUserId?: number | string | null): Promise<string | null> => {
    try {
      const activeUid = overrideUserId !== undefined && overrideUserId !== null ? overrideUserId : userId;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-openclaw-session-key": activeSessionKey,
      };
      if (targetUrl) {
        headers["x-openclaw-target"] = targetUrl;
      }

      const bodyPayload: any = {
        model: activeModel,
        metadata: {
          source: agent
            ? `agent_${agent}`
            : isDrawer
            ? "hust_assistant_real"
            : "hust_assistant_test_1",
          session_key: activeSessionKey,
          agent: agent || undefined,
        },
      };

      if (activeUid !== null && activeUid !== undefined && activeUid !== "") {
        const num = Number(activeUid);
        bodyPayload.user_id = Number.isInteger(num) ? num : activeUid;
      }

      const res = await fetch("/next/api/openclaw/v1/conversations", {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload),
      });
      if (res.ok) {
        const data = await res.json();
        const convKey =
          data.conversation_id ||
          (typeof data.id === "string" ? data.id : (data.id ? String(data.id) : null));
        const returnedUserId = data.user_id ?? (Number.isInteger(data.id) && data.user_id === undefined ? data.id : null);
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
          return convKey;
        }
      }
    } catch (err) {
      console.warn("Lỗi khởi tạo phòng trò chuyện:", err);
    }
    return null;
  };

  useEffect(() => {
    let savedConv: string | null = null;
    let savedUid: string | null = null;
    try {
      savedConv = window.localStorage.getItem(activeStorageKey);
      savedUid = window.localStorage.getItem(`${activeStorageKey}_user_id`);
    } catch {}

    if (savedUid) {
      const parsed = Number(savedUid);
      setUserId(Number.isInteger(parsed) ? parsed : savedUid);
    } else if (defaultUserId) {
      setUserId(defaultUserId);
    }

    if (savedConv) {
      setConversationId(savedConv);
    } else {
      createConversation(savedUid || defaultUserId);
    }
  }, [activeStorageKey]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = async (newUserId?: number | string) => {
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
    setMessages(INITIAL_MESSAGES);
    setInput("");
    setSelectedService(null);
    setIsServiceMenuExpanded(true);
    setAttachedImage(null);
    setIsTyping(false);
    await createConversation(newUserId !== undefined ? newUserId : userId);
  };

  const handleSend = async (
    textToSend?: string,
    apiService: MediaTechService = "media_text_to_text",
    displayService?: MediaTechService,
  ) => {
    const text = (textToSend ?? input).trim() || (attachedImage ? "media_image_to_text: OCR và phân tích hình ảnh." : "");
    if (!text || isTyping) return;

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

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      let activeConvId = conversationId;
      if (!activeConvId) {
        activeConvId = await createConversation();
      }

      const reqHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "x-openclaw-session-key": activeSessionKey,
      };
      if (targetUrl) {
        reqHeaders["x-openclaw-target"] = targetUrl;
      }

      const activeService = attachedImage ? "media_image_to_text" : apiService;
      const isImageGeneration = activeService === "media_text_to_image";
      const endpoint = isImageGeneration
        ? "/next/api/openclaw/v1/images/generations"
        : useResponsesApi
        ? "/next/api/openclaw/v1/responses"
        : "/next/api/openclaw/v1/chat/completions";

      const payload: any = {
        model: isImageGeneration ? "openai/gpt-image-2" : activeModel,
      };
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
        // Keep the upstream Responses identity aligned with the selected agent/session.
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
        if (lastResponseIdRef.current) {
          payload.previous_response_id = lastResponseIdRef.current;
        }
      } else {
        payload.messages = [{ role: "user", content: text }];
        payload.stream = false;
        if (lastResponseIdRef.current) {
          payload.previous_completion_id = lastResponseIdRef.current;
        }
      }

      let res = await fetch(endpoint, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify(payload),
      });

      // If room expired or 404, recreate and retry once
      if (!isImageGeneration && res.status === 404 && activeConvId) {
        activeConvId = await createConversation();
        payload.conversation_id = activeConvId || undefined;
        res = await fetch(endpoint, {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify(payload),
        });
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
            botReply = "Đã tạo hình ảnh theo yêu cầu.";
          }
        }
        if (!botReply && typeof data?.output_text === "string" && data.output_text) {
          botReply = data.output_text;
        } else if (!botReply && Array.isArray(data?.output) && data.output.length > 0) {
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

        if (data.conversation_id && data.conversation_id !== activeConvId) {
          setConversationId(data.conversation_id);
          try {
            window.localStorage.setItem(activeStorageKey, data.conversation_id);
          } catch {}
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: botReply,
            imageUrl,
            time: resTime,
          },
        ]);
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
    } finally {
      setIsTyping(false);
    }
  };

  const onSendSubmit = (
    textToSend?: string,
    apiService: MediaTechService = selectedService ?? "media_text_to_text",
  ) => {
    const rawText = textToSend ?? textareaRef.current?.value ?? input;
    const text = rawText.trim();
    if ((!text && !attachedImage) || isTyping) return;

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

  return (
    <div
      className={`mx-auto flex w-full max-w-6xl flex-col ${
        isDrawer
          ? "h-[85vh] max-h-[760px] p-0"
          : "h-[calc(100vh-140px)] min-h-[580px] max-h-[860px] px-2 py-4 sm:px-4"
      } ${className}`}
    >
      {/* Main Glassmorphism Chat Container */}
      <div
        className={`flex flex-1 flex-col overflow-hidden ${
          isDrawer
            ? "rounded-t-3xl sm:rounded-3xl border border-purple-200/90 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
            : "rounded-3xl border border-white/70 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.18)]"
        } bg-white/95 backdrop-blur-xl transition-all`}
      >
        {/* Top Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-purple-100/90 bg-white/85 px-5 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 text-white shadow-md shadow-purple-500/25">
              <Bot className="h-6 w-6" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                  {title}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {agentBadge || (agent ? `Agent: ${agent}` : "Live AI")}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {subtitle}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {/* User ID Tag */}
                <div className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50/90 px-2 py-0.5 text-[11px] font-medium text-purple-700 shadow-2xs">
                  <User className="h-3 w-3 text-purple-600" />
                  <span>User ID:</span>
                  <span className="font-mono font-bold text-purple-900">
                    {userId ? `#${userId}` : "#502"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = prompt(
                        "Nhập User ID mới để đồng bộ với OpenClaw (VD: 502, 534, 540):",
                        String(userId || "502")
                      );
                      if (newId !== null && newId.trim()) {
                        const parsed = Number(newId.trim());
                        const finalId = Number.isInteger(parsed) ? parsed : newId.trim();
                        handleReset(finalId);
                      }
                    }}
                    title="Đổi User ID"
                    className="ml-0.5 rounded p-0.5 text-purple-500 hover:bg-purple-200/60 hover:text-purple-800"
                  >
                    <Edit2 className="h-2.5 w-2.5" />
                  </button>
                </div>

                {/* Session Key Tag */}
                <div
                  title={`Session Key: ${effectiveSessionKey}\nClick để sao chép`}
                  onClick={() => handleCopy("session_key", effectiveSessionKey)}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-md border border-slate-200/90 bg-slate-50/90 px-2 py-0.5 text-[11px] font-mono text-slate-600 hover:border-purple-300 hover:bg-purple-50/40"
                >
                  <Hash className="h-3 w-3 text-slate-400" />
                  <span className="max-w-[130px] truncate sm:max-w-[190px]">{effectiveSessionKey}</span>
                  {copiedId === "session_key" ? (
                    <Check className="h-2.5 w-2.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-2.5 w-2.5 text-slate-400" />
                  )}
                </div>

                {/* OpenClaw Direct Link */}
                <a
                  href={openClawUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`Mở trực tiếp phiên của User #${userId} trên OpenClaw UI${openClawSessionId ? ` (UUID: ${openClawSessionId})` : ""}`}
                  className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/70 px-2 py-0.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 shadow-2xs"
                >
                  <span>OpenClaw ({userId ? `#${userId}` : "UI"})</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-xl border border-purple-100 bg-purple-50/80 px-3 py-1.5 text-xs font-medium text-purple-700 sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-pink-500" />
              <span>{activeModel}</span>
            </div>

            <button
              type="button"
              onClick={() => handleReset()}
              title="Làm mới cuộc trò chuyện"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Đóng cửa sổ Real chat"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </header>

        {/* Message History Area */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {/* Service picker collapses after selection so conversation remains the main view. */}
          <section
            className={`${isServiceMenuExpanded ? "my-2" : "sticky top-0 z-10 my-1"} rounded-2xl border border-purple-100/70 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-sm`}
            aria-label="Dịch vụ API Media Tech"
          >
            {isServiceMenuExpanded ? (
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    Dịch vụ API Media Tech:
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsServiceMenuExpanded(false)}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-purple-700 transition hover:bg-white/80"
                    aria-expanded="true"
                  >
                    Thu gọn
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {SUGGESTIONS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setSelectedService(item.apiService);
                        setIsServiceMenuExpanded(false);
                        setInput("");
                        if (item.apiService === "media_image_to_text") {
                          imageInputRef.current?.click();
                        } else {
                          textareaRef.current?.focus();
                        }
                      }}
                      className="group flex items-start gap-3 rounded-xl border border-white/80 bg-white/80 p-3 text-left shadow-sm transition-all hover:border-purple-300 hover:bg-white hover:shadow-md active:scale-[0.98]"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-purple-600">
                          {item.title}
                        </div>
                        <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {item.description}
                        </div>
                        <div className="mt-1 font-mono text-[10px] text-purple-600">
                          {item.endpoint}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 px-4 py-2">
                <div className="min-w-0 text-xs text-purple-800">
                  <span className="font-semibold">Dịch vụ:</span>{" "}
                  <span className="font-mono font-semibold">
                    {SUGGESTIONS.find((item) => item.apiService === selectedService)?.title || selectedService || "Chatbot thuần"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsServiceMenuExpanded(true)}
                  className="shrink-0 rounded-lg border border-purple-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-purple-700 transition hover:border-purple-300 hover:bg-white"
                  aria-expanded="false"
                >
                  Đổi dịch vụ
                </button>
              </div>
            )}
          </section>

          {/* Messages List */}
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`group flex items-start gap-2.5 ${
                  isBot ? "justify-start" : "justify-end"
                }`}
              >
                {/* Bot Avatar on Left */}
                {isBot && (
                  <div
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
                      msg.isError
                        ? "bg-rose-500 shadow-rose-500/20"
                        : "bg-gradient-to-tr from-purple-600 to-pink-500 shadow-purple-500/20"
                    }`}
                  >
                    {msg.isError ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                )}

                {/* Message Bubble Content */}
                <div
                  className={`relative flex max-w-[85%] flex-col sm:max-w-[78%] ${
                    isBot ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:text-[15px] ${
                      isBot
                        ? msg.isError
                        ? "rounded-tl-xs border border-rose-200 bg-rose-50/95 text-rose-900"
                        : "rounded-tl-xs border border-purple-100/90 bg-white/95 text-slate-800 backdrop-blur-sm"
                        : "rounded-tr-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-purple-500/20"
                    }`}
                  >
                    {!isBot && msg.serviceDescription && (
                      <div className="mb-2 flex items-start gap-2 border-b border-white/20 pb-2">
                        <span className="mt-0.5 shrink-0 rounded-md border border-white/25 bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90">
                          Service
                        </span>
                        <span className="text-xs font-semibold leading-snug text-white/95">
                          {msg.serviceDescription}
                        </span>
                      </div>
                    )}
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt={isBot ? "Ảnh được tạo bởi Media Tech AI" : "Ảnh được đính kèm để phân tích"}
                        className="mb-2 max-h-[480px] max-w-full rounded-xl border border-purple-100 object-contain"
                      />
                    )}
                    {isBot ? (
                      <FormattedMessageContent text={msg.text} />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                    )}
                  </div>

                  {/* Message Meta Info: Timestamp & Copy button */}
                  <div
                    className={`mt-1 flex items-center gap-2 px-1 text-[11px] text-slate-500 ${
                      isBot ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <span>{msg.time}</span>
                    {isBot && !msg.isError && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 transition-opacity hover:text-purple-600 group-hover:opacity-100"
                        title="Sao chép nội dung"
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

                {/* User Avatar on Right */}
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
            <div className="flex items-start gap-2.5 justify-start">
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

        {/* Input Bar & Footer Controls */}
        <footer className="shrink-0 border-t border-purple-100/90 bg-white/75 p-3 backdrop-blur-md sm:p-4">
          <div className="relative flex items-end gap-2 rounded-2xl border border-purple-200/80 bg-white/95 p-1.5 shadow-inner transition-all focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/30">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleImageSelection}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
              title="Đính kèm ảnh cho dịch vụ OCR"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
            {selectedService && (
              <div className="mb-1 px-1 text-[11px] text-purple-700">
                Đã chọn <strong>{SUGGESTIONS.find((item) => item.apiService === selectedService)?.title || selectedService}</strong> — {selectedService === "media_content_smart" ? "dòng đầu là tiêu đề, các dòng sau ghi mô tả/ý chính; hệ thống dùng độ dài 500 và giọng tự nhiên." : "nhập nội dung đầu vào cụ thể bên dưới rồi nhấn gửi."}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              rows={1}
              placeholder={!selectedService || selectedService === "media_text_to_text" ? "Nhập câu hỏi hoặc nội dung bạn cần... (Enter để gửi, Shift+Enter xuống dòng)" : selectedService === "media_text_to_image" ? "Mô tả hình ảnh muốn tạo..." : selectedService === "media_image_to_text" ? "Đính kèm ảnh và nhập điều muốn nhận diện/phân tích..." : selectedService === "media_content_smart" ? "Dòng 1: tiêu đề. Dòng tiếp: mô tả/ý chính cần viết..." : selectedService === "media_spell_check" ? "Dán đoạn văn cần sửa chính tả..." : selectedService === "media_script_writing" ? "Nhập chủ đề, thời lượng, đối tượng và phong cách kịch bản..." : "Nhập văn bản muốn chuyển thành giọng nói..."}
              className="max-h-60 min-h-10 w-full resize-none bg-transparent py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none sm:text-[15px]"
            />
            </div>

            <button
              type="button"
              onClick={() => onSendSubmit()}
              disabled={(!input.trim() && !textareaRef.current?.value.trim()) || isTyping}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20 transition-all hover:from-purple-700 hover:to-pink-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              title="Gửi tin nhắn"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {attachedImage && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-800">
              <span className="truncate">Ảnh OCR: {attachedImage.name}</span>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="ml-3 rounded p-1 hover:bg-purple-100"
                aria-label="Bỏ ảnh đính kèm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>OpenClaw Live Gateway</span>
              </span>
              <span className="font-mono text-slate-600">
                • User ID: <strong className="text-purple-700">#{userId}</strong>
              </span>
              {conversationId && (
                <span
                  onClick={() => handleCopy("conv_id", conversationId)}
                  title="Click để sao chép conversation_id"
                  className="cursor-pointer font-mono text-slate-400 hover:text-purple-600 flex items-center gap-1"
                >
                  • Conv: {conversationId.slice(0, 10)}...
                  {copiedId === "conv_id" ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={openClawUrl}
                target="_blank"
                rel="noreferrer"
                title={`Mở trực tiếp phiên của User #${userId} trên OpenClaw UI${openClawSessionId ? ` (UUID: ${openClawSessionId})` : ""}`}
                className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <span>Mở OpenClaw UI (#{userId})</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="hidden sm:inline font-mono text-slate-400">
                • {activeModel}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
