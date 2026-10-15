"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Video,
} from "lucide-react";

type JsonRecord = Record<string, unknown>;
type Notice = { kind: "info" | "error" | "success"; text: string };

const API_ROOT = "/next/api/media_tech/heygen/backend";

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findArray(value: unknown, keys: string[], depth = 0): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value) || depth > 5) return [];
  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key] as unknown[];
  }
  for (const child of Object.values(value)) {
    const found = findArray(child, keys, depth + 1);
    if (found.length) return found;
  }
  return [];
}

function findString(value: unknown, keys: string[], depth = 0): string {
  if (!isRecord(value) || depth > 6) return "";
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  for (const child of Object.values(value)) {
    const found = findString(child, keys, depth + 1);
    if (found) return found;
  }
  return "";
}

function displayName(item: unknown, fallback: string) {
  return findString(item, ["name", "avatar_name", "voice_name", "display_name", "title"]) || fallback;
}

async function apiRequest(token: string, endpoint: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token.trim()}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_ROOT}/${endpoint}`, {
    ...init,
    cache: "no-store",
    headers,
  });
  const text = await response.text();
  let payload: unknown = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }
  if (!response.ok) {
    const message = findString(payload, ["error", "message"]);
    throw new Error(message || `Yêu cầu thất bại (HTTP ${response.status}).`);
  }
  return payload;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function HeyGenDemo() {
  const [accessToken, setAccessToken] = useState("");
  const [avatars, setAvatars] = useState<unknown[]>([]);
  const [voices, setVoices] = useState<unknown[]>([]);
  const [avatarMode, setAvatarMode] = useState<"image" | "avatar">("image");
  const [imageUrl, setImageUrl] = useState("");
  const [avatarId, setAvatarId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [script, setScript] = useState("Xin chào, đây là video MC ảo thử nghiệm.");
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [jobId, setJobId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoStatus, setVideoStatus] = useState("");

  async function loadCatalog() {
    if (!accessToken.trim()) {
      setNotice({ kind: "error", text: "Nhập access token trước khi tải danh sách." });
      return;
    }
    setLoadingCatalog(true);
    setNotice(null);
    const [avatarResult, voiceResult] = await Promise.allSettled([
      apiRequest(accessToken, "avatars"),
      apiRequest(accessToken, "voices"),
    ]);
    if (avatarResult.status === "fulfilled") {
      const list = findArray(avatarResult.value, ["avatar_looks", "avatars", "items"]);
      setAvatars(list);
      const firstId = list.length
        ? findString(list[0], ["avatar_id", "id", "look_id"])
        : "";
      if (firstId) setAvatarId((current) => current || firstId);
    }
    if (voiceResult.status === "fulfilled") {
      const list = findArray(voiceResult.value, ["voices", "items"]);
      setVoices(list);
      const firstId = list.length
        ? findString(list[0], ["voice_id", "id"])
        : "";
      if (firstId) setVoiceId((current) => current || firstId);
    }
    const errors = [avatarResult, voiceResult]
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason instanceof Error ? result.reason.message : "Không tải được danh sách.");
    if (errors.length) {
      setNotice({ kind: "error", text: errors.join(" ") });
    } else {
      setNotice({
        kind: "success",
        text: `Đã tải ${avatarResult.status === "fulfilled" ? findArray(avatarResult.value, ["avatar_looks", "avatars", "items"]).length : 0} avatar và ${voiceResult.status === "fulfilled" ? findArray(voiceResult.value, ["voices", "items"]).length : 0} giọng đọc.`,
      });
    }
    setLoadingCatalog(false);
  }

  async function createVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken.trim()) {
      setNotice({ kind: "error", text: "Nhập access token trước khi tạo video." });
      return;
    }
    if (!script.trim()) {
      setNotice({ kind: "error", text: "Nhập lời thoại cho video." });
      return;
    }
    if (!voiceId) {
      setNotice({ kind: "error", text: "Chọn hoặc tải danh sách giọng đọc trước." });
      return;
    }

    let input: { avatar_id: string } | { image_url: string };
    if (avatarMode === "image") {
      try {
        const parsed = new URL(imageUrl.trim());
        if (parsed.protocol !== "https:") throw new Error();
      } catch {
        setNotice({ kind: "error", text: "Ảnh cần là đường dẫn HTTPS công khai." });
        return;
      }
      input = { image_url: imageUrl.trim() };
    } else {
      if (!avatarId.trim()) {
        setNotice({ kind: "error", text: "Chọn avatar có sẵn hoặc nhập Avatar ID." });
        return;
      }
      input = { avatar_id: avatarId.trim() };
    }

    setGenerating(true);
    setNotice({ kind: "info", text: "Đang gửi yêu cầu tạo video lên HeyGen…" });
    setVideoUrl("");
    setVideoStatus("Đang khởi tạo");
    setJobId("");
    try {
      const idempotencyKey = `heygen-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const created = await apiRequest(accessToken, "videos", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ ...input, script: script.trim(), voice_id: voiceId }),
      });
      const id = findString(created, ["video_id", "id"]);
      if (!id) throw new Error("HeyGen chưa trả về video_id để theo dõi trạng thái.");
      setJobId(id);
      setVideoStatus("Đang xử lý");

      for (let attempt = 0; attempt < 40; attempt += 1) {
        await sleep(15000);
        const result = await apiRequest(accessToken, `videos/${encodeURIComponent(id)}`);
        const status = findString(result, ["status", "state"]).toLowerCase();
        const url = findString(result, ["video_url", "url"]);
        setVideoStatus(status || "Đang xử lý");
        if (["failed", "error", "cancelled", "canceled"].includes(status)) {
          throw new Error(findString(result, ["error", "message"]) || `Tạo video thất bại (${status}).`);
        }
        if (url && (["completed", "complete", "success", "succeeded"].includes(status) || !status)) {
          setVideoUrl(url);
          setVideoStatus("Hoàn tất");
          setNotice({ kind: "success", text: "Video đã tạo xong." });
          setGenerating(false);
          return;
        }
      }
      setNotice({ kind: "info", text: "Video vẫn đang được xử lý. Bạn có thể dùng mã video để kiểm tra lại sau." });
    } catch (error) {
      setVideoStatus("Có lỗi");
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Không tạo được video." });
    } finally {
      setGenerating(false);
    }
  }

  async function checkVideoStatus() {
    if (!accessToken.trim() || !jobId) return;
    setGenerating(true);
    setNotice({ kind: "info", text: "Đang kiểm tra trạng thái video…" });
    try {
      const result = await apiRequest(accessToken, `videos/${encodeURIComponent(jobId)}`);
      const status = findString(result, ["status", "state"]).toLowerCase();
      const url = findString(result, ["video_url", "url"]);
      setVideoStatus(status || "Đang xử lý");
      if (["failed", "error", "cancelled", "canceled"].includes(status)) {
        throw new Error(findString(result, ["error", "message"]) || `Tạo video thất bại (${status}).`);
      }
      if (url && (["completed", "complete", "success", "succeeded"].includes(status) || !status)) {
        setVideoUrl(url);
        setVideoStatus("Hoàn tất");
        setNotice({ kind: "success", text: "Video đã tạo xong." });
      } else {
        setNotice({ kind: "info", text: `Video đang xử lý${status ? ` (${status})` : ""}.` });
      }
    } catch (error) {
      setVideoStatus("Có lỗi");
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Không kiểm tra được trạng thái video." });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-sm">
            <Video className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">HeyGen · Video API</p>
            <h1 className="mt-0.5 text-xl font-semibold text-slate-900 sm:text-2xl">Demo MC ảo · Avatar IV Photo</h1>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" /> Luồng tạo video, không phải Live Avatar
        </span>
      </header>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <form onSubmit={createVideo} className="space-y-6 p-5 sm:p-8">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Access token của demo</span>
            <input
              type="password"
              autoComplete="off"
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              placeholder="Nhập HEYGEN_API_ACCESS_TOKEN đã cấu hình ở Node.js"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
            <span className="mt-1.5 block text-xs leading-5 text-slate-500">Token chỉ lưu trong bộ nhớ của trang hiện tại; API key HeyGen vẫn nằm ở backend Node.js.</span>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Nguồn ảnh/avatar</h2>
                <p className="mt-0.5 text-xs text-slate-500">Dùng avatar đã có hoặc một ảnh HTTPS công khai.</p>
              </div>
              <button
                type="button"
                onClick={loadCatalog}
                disabled={loadingCatalog || !accessToken.trim()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingCatalog ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Tải avatar & giọng đọc
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setAvatarMode("image")} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${avatarMode === "image" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>Ảnh HTTPS</button>
              <button type="button" onClick={() => setAvatarMode("avatar")} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${avatarMode === "avatar" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>Avatar có sẵn</button>
            </div>

            {avatarMode === "image" ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">URL ảnh chân dung</span>
                <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://example.com/portrait.jpg" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
              </label>
            ) : (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">Avatar trong tài khoản HeyGen</span>
                {avatars.some((avatar) => findString(avatar, ["avatar_id", "id", "look_id"])) ? (
                  <select value={avatarId} onChange={(event) => setAvatarId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100">
                    {avatars.map((avatar, index) => {
                      const id = findString(avatar, ["avatar_id", "id", "look_id"]);
                      return id ? <option key={`${id}-${index}`} value={id}>{displayName(avatar, `Avatar ${index + 1}`)}</option> : null;
                    })}
                  </select>
                ) : (
                  <input value={avatarId} onChange={(event) => setAvatarId(event.target.value)} placeholder="Tải danh sách hoặc nhập Avatar ID" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
                )}
              </label>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Giọng đọc</span>
            {voices.some((voice) => findString(voice, ["voice_id", "id"])) ? (
              <select value={voiceId} onChange={(event) => setVoiceId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100">
                {voices.map((voice, index) => {
                  const id = findString(voice, ["voice_id", "id"]);
                  const language = findString(voice, ["language", "language_code"]);
                  return id ? <option key={`${id}-${index}`} value={id}>{displayName(voice, `Voice ${index + 1}`)}{language ? ` · ${language}` : ""}</option> : null;
                })}
              </select>
            ) : (
              <input value={voiceId} onChange={(event) => setVoiceId(event.target.value)} placeholder="Tải danh sách hoặc nhập Voice ID" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700"><span>Lời thoại</span><span className="text-xs font-normal text-slate-400">{script.length} ký tự</span></span>
            <textarea value={script} onChange={(event) => setScript(event.target.value)} rows={4} maxLength={3000} placeholder="Nhập lời thoại cho MC ảo…" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
          </label>

          {notice ? (
            <div role="status" className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm ${notice.kind === "error" ? "border border-rose-200 bg-rose-50 text-rose-700" : notice.kind === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-blue-200 bg-blue-50 text-blue-700"}`}>
              {notice.kind === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 flex-none" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />}
              <span>{notice.text}</span>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={generating || loadingCatalog} className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
              {generating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
              {generating ? "Đang tạo video…" : "Tạo video"}
            </button>
            <p className="max-w-sm text-xs leading-5 text-slate-500">Chỉ phát sinh yêu cầu tính phí khi bấm “Tạo video”. Hãy dùng lời thoại ngắn để thử trước.</p>
          </div>
        </form>

        <aside className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-8 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Kết quả</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Video đầu ra</h2>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${videoStatus === "Hoàn tất" ? "bg-emerald-100 text-emerald-700" : generating ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>{videoStatus || "Chưa tạo"}</span>
          </div>

          <div className="mt-5 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-slate-400">
            {videoUrl ? <video key={videoUrl} src={videoUrl} controls playsInline className="h-full w-full bg-black" /> : generating ? (
              <div className="flex flex-col items-center gap-3 px-6 text-center text-sm"><LoaderCircle className="h-8 w-8 animate-spin text-cyan-400" /><span>HeyGen đang dựng video. Trang sẽ tự kiểm tra trạng thái.</span></div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 text-center text-sm"><Video className="h-9 w-9 text-slate-600" /><span>Video hoàn tất sẽ hiển thị tại đây.</span></div>
            )}
          </div>

          {jobId ? <p className="mt-4 break-all text-xs text-slate-500">Video ID: <span className="font-mono text-slate-700">{jobId}</span></p> : null}
          {jobId && !videoUrl && !generating ? <button type="button" onClick={checkVideoStatus} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-900"><RefreshCw className="h-4 w-4" />Kiểm tra trạng thái</button> : null}
          {videoUrl ? <a href={videoUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-900">Mở hoặc tải video <ExternalLink className="h-4 w-4" /></a> : null}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            <p className="font-semibold text-slate-800">Luồng xử lý</p>
            <p className="mt-1">Lời thoại + ảnh/avatar + giọng đọc → Node.js → HeyGen tạo video → trả video ID và URL MP4.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
