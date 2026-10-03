"use client";

import { Loader2 } from "lucide-react";
import {
  apiFetchLaravelRooms,
  apiFetchRoomMessages,
  type FetchRoomsResult,
} from "../api/media_api";

export type InitialChatLoadProgress = (progress: number, status: string) => void;

/** Initial Laravel room lookup; the actual HTTP implementation stays in api/. */
export function fetchInitialChatRooms(
  onProgress: InitialChatLoadProgress,
): Promise<FetchRoomsResult> {
  onProgress(30, "Đang tìm phòng chat trên Laravel…");
  return apiFetchLaravelRooms(1, 30);
}

/** Initial room-history lookup; the actual HTTP implementation stays in api/. */
export function fetchInitialChatMessages(
  roomId: number | string,
  onProgress: InitialChatLoadProgress,
  progress = 60,
): ReturnType<typeof apiFetchRoomMessages> {
  onProgress(progress, "Đã tìm thấy phòng — đang tải lịch sử tin nhắn…");
  return apiFetchRoomMessages(roomId, 50);
}

export function InitialChatLoader({
  progress,
  status,
  title = "Đang tải cuộc trò chuyện",
}: {
  progress: number;
  status: string;
  title?: string;
}) {
  const safeProgress = Number.isFinite(progress)
    ? Math.min(100, Math.max(0, progress))
    : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-10 mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-purple-100 bg-white/95 p-3.5 shadow-[0_8px_24px_rgba(126,34,206,0.10)] backdrop-blur-md sm:p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 text-purple-700">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <p className="min-w-0 text-xs leading-relaxed text-slate-500">{status}</p>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-purple-700">
            {safeProgress}%
          </span>
        </div>
        <div
          className="mt-2 h-1 overflow-hidden rounded-full bg-purple-100"
          role="progressbar"
          aria-label="Tiến trình tải cuộc trò chuyện"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={safeProgress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-[width] duration-500 ease-out"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
