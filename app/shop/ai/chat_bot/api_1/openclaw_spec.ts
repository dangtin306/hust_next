export const openClawSwaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Hust AI Assistant | OpenClaw Gateway API",
    version: "1.0.0",
    description: `### OpenClaw Gateway API cho Hust AI Assistant

Tài liệu API tích hợp chính thức cho hệ thống OpenClaw Gateway.

**Base URL Production:**
\`https://node_js.hust.media/openclaw\`

**Luồng sử dụng 5 bước:**
1. \`POST /v1/conversations\` ➔ Tạo conversation & nhận \`conversation_id\` (e.g. \`conv_...\`)
2. \`POST /v1/chat/completions\` ➔ Gửi tin nhắn kèm \`conversation_id\` & nhận câu trả lời AI
3. \`GET /v1/conversations/{conversation_id}\` ➔ Lấy thông tin phòng hội thoại
4. \`GET /v1/conversations/{conversation_id}/items\` ➔ Lấy danh sách lịch sử tin nhắn
5. \`POST /v1/conversations/{conversation_id}/items\` ➔ Thêm tin nhắn thủ công vào lịch sử

**Header tùy chọn:**
* \`Authorization: Bearer <token>\`
* \`x-openclaw-session-key: agent:chat_bot:real\` (hoặc \`agent:chat_bot:demo\`)
`,
  },
  servers: [
    {
      url: "https://node_js.hust.media/openclaw",
      description: "OpenClaw Production Gateway (Khuyên dùng)",
    },
    {
      url: "http://localhost:2999/openclaw",
      description: "Node.js Gateway Local (Chạy nội bộ trên server)",
    },
    {
      url: "/next/api/openclaw",
      description: "Next.js Local Proxy (Tránh CORS khi gọi từ trình duyệt LAN)",
    },
  ],
  tags: [
    {
      name: "Conversations",
      description: "Tạo phòng hội thoại, quản lý tin nhắn và lịch sử items",
    },
    {
      name: "Chat Completions",
      description: "Sinh phản hồi AI chat completion theo ngữ cảnh cuộc trò chuyện",
    },
  ],
  paths: {
    "/v1/conversations": {
      post: {
        tags: ["Conversations"],
        summary: "1. Tạo conversation mới",
        description:
          "Khởi tạo một phòng hội thoại mới trên OpenClaw Gateway. Lưu lại trường `id` trong response để làm `conversation_id` cho các lượt chat tiếp theo.",
        operationId: "createConversation",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  model: {
                    type: "string",
                    example: "gpt-5.6-luna",
                    description: "Model dùng cho conversation (tùy chọn)",
                  },
                  metadata: {
                    type: "object",
                    description: "Dữ liệu phụ do client tự lưu",
                    example: {
                      user_id: 123,
                      room_id: "room_001",
                    },
                  },
                },
              },
              example: {
                model: "gpt-5.6-luna",
                metadata: {
                  user_id: 123,
                  room_id: "room_001",
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Đã tạo conversation thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "conv_550e8400-e29b-41d4-a716-446655440000",
                    },
                    object: { type: "string", example: "conversation" },
                    created_at: {
                      type: "string",
                      example: "2026-09-22T10:00:00.000Z",
                    },
                    metadata: { type: "object" },
                    model: { type: "string", example: "gpt-5.6-luna" },
                  },
                },
                example: {
                  id: "conv_550e8400-e29b-41d4-a716-446655440000",
                  object: "conversation",
                  created_at: "2026-09-22T10:00:00.000Z",
                  metadata: {
                    user_id: 123,
                    room_id: "room_001",
                  },
                  model: "gpt-5.6-luna",
                },
              },
            },
          },
          "502": {
            description: "Không kết nối được OpenClaw Gateway",
          },
        },
      },
    },

    "/v1/chat/completions": {
      post: {
        tags: ["Chat Completions"],
        summary: "2. Gửi tin nhắn chat completion",
        description:
          "Gửi tin nhắn trong phòng hội thoại tới AI model và nhận phản hồi trực tiếp kèm số lượng token đã dùng.",
        operationId: "createChatCompletion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["messages"],
                properties: {
                  model: {
                    type: "string",
                    example: "gpt-5.6-luna",
                    description: "Model yêu cầu (ví dụ: gpt-5.6-luna, gemini-3.7-flash)",
                  },
                  conversation_id: {
                    type: "string",
                    example: "",
                    description:
                      "Conversation ID cần liên kết (Tùy chọn: lấy từ kết quả POST /v1/conversations. Nếu để trống, AI phản hồi độc lập)",
                  },
                  messages: {
                    type: "array",
                    description: "Danh sách tin nhắn",
                    items: {
                      type: "object",
                      required: ["role", "content"],
                      properties: {
                        role: {
                          type: "string",
                          enum: ["user", "assistant", "system", "developer"],
                          example: "user",
                        },
                        content: {
                          type: "string",
                          example: "Xin chào, hãy giới thiệu về bạn?",
                        },
                      },
                    },
                  },
                  stream: {
                    type: "boolean",
                    default: false,
                    example: false,
                  },
                  previous_response_id: {
                    type: "string",
                    description: "ID response trước đó (nếu có)",
                  },
                },
              },
              example: {
                model: "gpt-5.6-luna",
                conversation_id: "",
                messages: [
                  {
                    role: "user",
                    content: "Xin chào, hãy giới thiệu về bạn?",
                  },
                ],
                stream: false,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Chat completion phản hồi thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "chatcmpl_abc123" },
                    object: { type: "string", example: "chat.completion" },
                    created: { type: "integer", example: 1780000000 },
                    model: { type: "string", example: "gpt-5.6-luna" },
                    choices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          index: { type: "integer", example: 0 },
                          message: {
                            type: "object",
                            properties: {
                              role: { type: "string", example: "assistant" },
                              content: {
                                type: "string",
                                example:
                                  "Hà Nội là thủ đô của Việt Nam, nổi tiếng với lịch sử ngàn năm văn hiến...",
                              },
                            },
                          },
                          finish_reason: { type: "string", example: "stop" },
                        },
                      },
                    },
                    usage: {
                      type: "object",
                      properties: {
                        input_tokens: { type: "integer", example: 20 },
                        output_tokens: { type: "integer", example: 35 },
                        total_tokens: { type: "integer", example: 55 },
                      },
                    },
                  },
                },
                example: {
                  id: "chatcmpl_abc123",
                  object: "chat.completion",
                  created: 1780000000,
                  model: "gpt-5.6-luna",
                  choices: [
                    {
                      index: 0,
                      message: {
                        role: "assistant",
                        content:
                          "Hà Nội là thủ đô của Việt Nam, nổi tiếng với lịch sử ngàn năm văn hiến...",
                      },
                      finish_reason: "stop",
                    },
                  ],
                  usage: {
                    input_tokens: 20,
                    output_tokens: 35,
                    total_tokens: 55,
                  },
                },
              },
            },
          },
          "404": {
            description: "Không tìm thấy conversation",
            content: {
              "application/json": {
                example: {
                  error: {
                    message: "Không tìm thấy conversation",
                    type: "invalid_request_error",
                  },
                },
              },
            },
          },
          "502": {
            description: "Không kết nối được OpenClaw Gateway",
          },
          "504": {
            description: "OpenClaw Gateway request timed out",
          },
        },
      },
    },

    "/v1/conversations/{conversation_id}": {
      get: {
        tags: ["Conversations"],
        summary: "3. Lấy thông tin conversation",
        description: "Lấy chi tiết cấu hình và metadata của một phòng hội thoại.",
        operationId: "getConversation",
        parameters: [
          {
            name: "conversation_id",
            in: "path",
            required: true,
            description: "Mã conversation identifier (dạng conv_...)",
            schema: {
              type: "string",
              example: "conv_550e8400-e29b-41d4-a716-446655440000",
            },
          },
        ],
        responses: {
          "200": {
            description: "Thông tin conversation",
            content: {
              "application/json": {
                example: {
                  id: "conv_550e8400-e29b-41d4-a716-446655440000",
                  object: "conversation",
                  created_at: "2026-09-22T10:00:00.000Z",
                  metadata: {
                    user_id: 123,
                    room_id: "room_001",
                  },
                  model: "gpt-5.6-luna",
                },
              },
            },
          },
          "404": {
            description: "Không tìm thấy conversation",
            content: {
              "application/json": {
                example: {
                  error: {
                    message: "Không tìm thấy conversation",
                    type: "invalid_request_error",
                  },
                },
              },
            },
          },
        },
      },
    },

    "/v1/conversations/{conversation_id}/items": {
      get: {
        tags: ["Conversations"],
        summary: "4. Lấy danh sách conversation items (Lịch sử)",
        description:
          "Lấy danh sách tất cả các tin nhắn của user và assistant đã được lưu trong cuộc hội thoại.",
        operationId: "listConversationItems",
        parameters: [
          {
            name: "conversation_id",
            in: "path",
            required: true,
            description: "Mã conversation identifier (dạng conv_...)",
            schema: {
              type: "string",
              example: "conv_550e8400-e29b-41d4-a716-446655440000",
            },
          },
        ],
        responses: {
          "200": {
            description: "Danh sách conversation items",
            content: {
              "application/json": {
                example: {
                  object: "list",
                  data: [
                    {
                      id: "item_abc123",
                      object: "conversation.item",
                      role: "user",
                      content: [
                        {
                          type: "input_text",
                          text: "Xin chào",
                        },
                      ],
                      created_at: "2026-09-22T10:01:00.000Z",
                    },
                    {
                      id: "item_def456",
                      object: "conversation.item",
                      role: "assistant",
                      content: [
                        {
                          type: "output_text",
                          text: "Xin chào, tôi có thể giúp gì cho bạn?",
                        },
                      ],
                      response_id: "chatcmpl_abc123",
                      created_at: "2026-09-22T10:01:02.000Z",
                    },
                  ],
                  has_more: false,
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Conversations"],
        summary: "5. Thêm item thủ công vào conversation",
        description: "Lưu thủ công tin nhắn của user hoặc assistant vào phòng chat.",
        operationId: "createConversationItem",
        parameters: [
          {
            name: "conversation_id",
            in: "path",
            required: true,
            description: "Mã conversation identifier (dạng conv_...)",
            schema: {
              type: "string",
              example: "conv_550e8400-e29b-41d4-a716-446655440000",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["role", "content"],
                properties: {
                  role: {
                    type: "string",
                    enum: ["user", "assistant"],
                    example: "user",
                  },
                  content: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          example: "input_text",
                        },
                        text: {
                          type: "string",
                          example: "Nội dung cần lưu",
                        },
                      },
                    },
                  },
                  response_id: {
                    type: "string",
                    example: "chatcmpl_abc123",
                  },
                },
              },
              example: {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: "Nội dung cần lưu",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Item đã được thêm thành công",
            content: {
              "application/json": {
                example: {
                  id: "item_xyz789",
                  object: "conversation.item",
                  role: "user",
                  content: [
                    {
                      type: "input_text",
                      text: "Nội dung cần lưu",
                    },
                  ],
                  created_at: "2026-09-22T10:05:00.000Z",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Token xác thực API (nếu gateway yêu cầu).",
      },
      SessionKey: {
        type: "apiKey",
        in: "header",
        name: "x-openclaw-session-key",
        description: "Header phiên OpenClaw, mặc định: agent:chat_bot:real (hoặc agent:chat_bot:demo cho demo)",
      },
    },
  },
  security: [{ BearerAuth: [] }, { SessionKey: [] }],
};
