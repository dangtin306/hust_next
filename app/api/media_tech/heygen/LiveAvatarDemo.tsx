"use client";

import {
  LiveAvatarSession,
  SessionState,
} from "@heygen/liveavatar-web-sdk";
import {
  ArrowUpRight,
  Check,
  CircleHelp,
  LoaderCircle,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  Video,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./heygen-demo.module.css";

type DemoStatus = "idle" | "connecting" | "connected" | "stopping";
type Message = { role: "user" | "avatar"; text: string };

export default function HeyGenDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    return () => {
      const session = sessionRef.current;
      sessionRef.current = null;
      if (session?.state === SessionState.CONNECTED) void session.stop();
    };
  }, []);

  const startSession = async () => {
    setError("");
    setStatus("connecting");

    try {
      const response = await fetch("/next/api/media_tech/heygen/session", {
        method: "POST",
      });
      const result = (await response.json()) as {
        sessionToken?: string;
        sessionId?: string;
        error?: string;
      };

      if (!response.ok || !result.sessionToken) {
        throw new Error(result.error || "Không tạo được phiên LiveAvatar.");
      }

      const session = new LiveAvatarSession(result.sessionToken, {
        autoKeepAlive: true,
        voiceChat: { defaultMuted: true },
      });
      sessionRef.current = session;
      await session.start();

      if (videoRef.current) session.attach(videoRef.current);
      setSessionId(result.sessionId || session.sessionId || "");
      setMessages([]);
      setStatus("connected");
    } catch (cause) {
      sessionRef.current = null;
      setStatus("idle");
      setError(
        cause instanceof Error ? cause.message : "Không thể khởi động phiên.",
      );
    }
  };

  const stopSession = async () => {
    const session = sessionRef.current;
    if (!session) return;

    setStatus("stopping");
    sessionRef.current = null;
    try {
      if (session.state === SessionState.CONNECTED) await session.stop();
    } finally {
      if (videoRef.current) videoRef.current.srcObject = null;
      setStatus("idle");
      setSessionId("");
    }
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = message.trim();
    const session = sessionRef.current;
    if (!text || status !== "connected" || !session) return;

    try {
      session.repeat(text);
      setMessages((current) => [...current, { role: "user", text }]);
      setMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không gửi được tin nhắn.");
    }
  };

  const isActive = status === "connected";
  const isBusy = status === "connecting" || status === "stopping";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <a className={styles.brand} href="/next/api/mt/media/heygen/home">
            <span className={styles.brandMark}>
              <Sparkles size={18} />
            </span>
            <span>HUST MEDIA <i>LAB</i></span>
          </a>
          <div className={styles.topbarRight}>
            <span className={styles.researchPill}><span /> RESEARCH DEMO</span>
            <span className={styles.liveAvatarWordmark}>LIVEAVATAR <b>BY HEYGEN</b></span>
          </div>
        </header>

        <section className={styles.intro}>
          <div>
            <div className={styles.eyebrow}><span /> REAL-TIME AVATAR EXPERIENCE</div>
            <h1>Meet your <em>virtual host.</em></h1>
            <p>
              Thử nghiệm MC ảo thời gian thực với HeyGen LiveAvatar. Bắt đầu một
              phiên, nhập lời thoại và xem avatar phản hồi trực tiếp.
            </p>
          </div>
          <div className={styles.introNote}>
            <ShieldCheck size={17} />
            <span>API key được giữ ở server</span>
          </div>
        </section>

        <section className={styles.workspace} aria-label="LiveAvatar demo">
          <div className={styles.stageColumn}>
            <div className={styles.stage}>
              <div className={styles.stageGrid} />
              <div className={styles.stageTopline}>
                <span className={styles.stageLabel}><Video size={14} /> LIVE SESSION</span>
                <span className={`${styles.connection} ${isActive ? styles.connected : ""}`}>
                  <span /> {isActive ? "CONNECTED" : status === "connecting" ? "CONNECTING" : "STANDBY"}
                </span>
              </div>

              <video ref={videoRef} className={styles.avatarVideo} autoPlay playsInline />

              {!isActive && (
                <div className={styles.stagePlaceholder}>
                  <div className={styles.avatarOrb}>
                    {status === "connecting" ? <LoaderCircle className={styles.spin} size={30} /> : <Sparkles size={30} />}
                  </div>
                  <strong>{status === "connecting" ? "Đang kết nối avatar" : "Sẵn sàng cho buổi phát"}</strong>
                  <span>{status === "connecting" ? "Đang mở phiên LiveAvatar LITE…" : "Bắt đầu phiên để đưa MC ảo lên hình"}</span>
                </div>
              )}

              <div className={styles.stageFooter}>
                <span><Wifi size={14} /> LiveAvatar LITE</span>
                {sessionId && <span className={styles.sessionCode}>SESSION {sessionId.slice(0, 8).toUpperCase()}</span>}
              </div>
            </div>

            {error && (
              <div className={styles.errorBanner} role="alert">
                <CircleHelp size={17} /> <span>{error}</span>
                <button onClick={() => setError("")} aria-label="Đóng thông báo"><X size={16} /></button>
              </div>
            )}

            <div className={styles.controls}>
              <div className={styles.controlCopy}>
                <span className={styles.controlIcon}><Mic size={17} /></span>
                <span><strong>{isActive ? "Phiên đang hoạt động" : "Bắt đầu phiên thử nghiệm"}</strong><small>{isActive ? "Micro đang tắt · dùng khung chat để gửi lời thoại" : "Tạo một phiên LiveAvatar sandbox"}</small></span>
              </div>
              {isActive ? (
                <button className={styles.stopButton} onClick={stopSession} disabled={isBusy}>
                  {isBusy ? <LoaderCircle className={styles.spin} size={16} /> : <span className={styles.stopSquare} />}
                  Kết thúc phiên
                </button>
              ) : (
                <button className={styles.startButton} onClick={startSession} disabled={isBusy}>
                  {isBusy ? <LoaderCircle className={styles.spin} size={17} /> : <Video size={17} />}
                  {isBusy ? "Đang kết nối…" : "Bắt đầu LiveAvatar"}
                  {!isBusy && <ArrowUpRight size={15} />}
                </button>
              )}
            </div>

            <div className={styles.notice}>
              <Check size={15} /> <span>Sandbox mode đang bật — phù hợp để thử nghiệm, chưa dành cho phiên production.</span>
            </div>
          </div>

          <aside className={styles.chatPanel}>
            <div className={styles.chatHeader}>
              <div className={styles.chatTitleIcon}><Volume2 size={17} /></div>
              <div><h2>Studio chat</h2><p>Gửi câu nói cho avatar</p></div>
              <span className={styles.chatMode}>TEXT</span>
            </div>

            <div className={styles.chatBody}>
              {messages.length === 0 ? (
                <div className={styles.emptyChat}>
                  <div className={styles.emptyIcon}><Sparkles size={20} /></div>
                  <strong>Cuộc trò chuyện bắt đầu ở đây</strong>
                  <p>{isActive ? "Nhập lời chào hoặc nội dung MC muốn nói." : "Mở phiên LiveAvatar trước, rồi gửi lời thoại cho MC ảo."}</p>
                  {isActive && <button onClick={() => setMessage("Xin chào mọi người, chào mừng đến với chương trình hôm nay!")}>Thử câu chào mẫu <ArrowUpRight size={13} /></button>}
                </div>
              ) : (
                <div className={styles.messageList}>
                  <div className={styles.timestamp}>PHIÊN HIỆN TẠI</div>
                  {messages.map((item, index) => (
                    <div className={styles.userMessage} key={`${index}-${item.text}`}>
                      <span>BẠN · LỜI THOẠI</span><p>{item.text}</p>
                    </div>
                  ))}
                  <div className={styles.avatarReply}><span><Sparkles size={12} /> MC ẢO</span><p>Avatar đang nói lời thoại của bạn.</p></div>
                </div>
              )}
            </div>

            <form className={styles.composer} onSubmit={sendMessage}>
              <label htmlFor="avatar-message">LỜI THOẠI</label>
              <div className={styles.composerInput}>
                <input
                  id="avatar-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={isActive ? "Nhập nội dung MC sẽ nói…" : "Bắt đầu phiên để nhập lời thoại"}
                  disabled={!isActive}
                />
                <button aria-label="Gửi lời thoại" type="submit" disabled={!isActive || !message.trim()}><Send size={16} /></button>
              </div>
              <p><span>ENTER</span> để gửi <i>·</i> Tin nhắn sẽ được phát bằng giọng avatar</p>
            </form>
          </aside>
        </section>

        <footer className={styles.footer}>
          <span>HUST MEDIA · AI MEDIA RESEARCH</span>
          <span>Powered by <strong>HeyGen LiveAvatar SDK</strong></span>
        </footer>
      </div>
    </main>
  );
}
