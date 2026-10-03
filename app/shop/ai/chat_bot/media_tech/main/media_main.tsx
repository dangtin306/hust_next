"use client";

import React from "react";
import {
  useMediaChatProcess,
  type MediaTechChatClientProps,
} from "../chat_main/chat_process";
import { MediaUiUx } from "../chat_main/ui_ux";

export * from "../chat_main/chat_process";
export * from "../chat_main/ui_ux";

/**
 * Component chính Media Tech AI Assistant:
 * Nhúng nạp logic trạng thái và quy trình từ `useMediaChatProcess`,
 * chuyển giao toàn bộ giao diện cho `MediaUiUx` hiển thị.
 */
export default function MediaMain(props: MediaTechChatClientProps) {
  const process = useMediaChatProcess(props);

  return (
    <MediaUiUx
      {...props}
      {...process}
    />
  );
}

export { MediaMain };
