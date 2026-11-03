import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

type Props = { disabled: boolean; onTranscript: (text: string) => void; onActivityChange: (active: boolean) => void };
type Phase = "idle" | "requesting" | "recording" | "transcribing";

export function PushToTalk({ disabled, onTranscript, onActivityChange }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const phaseRef = useRef<Phase>("idle");
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const active = useRef(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef<AbortController | null>(null);
  const chunks = useRef<Blob[]>([]);
  const transcriptCallback = useRef(onTranscript);
  useEffect(() => { transcriptCallback.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onActivityChange(phase !== "idle"); }, [phase, onActivityChange]);

  function updatePhase(value: Phase) {
    phaseRef.current = value;
    if (mounted.current) setPhase(value);
  }
  function releaseTracks() {
    if (timer.current) clearTimeout(timer.current);
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
  }
  function cancel() {
    active.current = false;
    if (recorder.current) {
      recorder.current.onstop = null;
      if (recorder.current.state !== "inactive") recorder.current.stop();
    }
    request.current?.abort();
    releaseTracks();
    updatePhase("idle");
  }
  function stop() {
    active.current = false;
    if (recorder.current?.state === "recording") {
      updatePhase("transcribing");
      recorder.current.stop();
      releaseTracks();
    }
  }
  async function start() {
    if (disabled || phaseRef.current !== "idle") return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("Micro cần trình duyệt hỗ trợ và đường dẫn HTTPS hoặc localhost. Bạn vẫn có thể nhập câu hỏi.");
      return;
    }
    active.current = true;
    setMessage("");
    updatePhase("requesting");
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: {
        noiseSuppression: true, echoCancellation: true, autoGainControl: true,
      }});
      if (!active.current || !mounted.current) {
        media.getTracks().forEach(track => track.stop());
        updatePhase("idle");
        return;
      }
      stream.current = media;
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"].find(value => MediaRecorder.isTypeSupported(value));
      const rec = new MediaRecorder(media, mime ? { mimeType: mime } : undefined);
      recorder.current = rec;
      chunks.current = [];
      rec.ondataavailable = event => { if (event.data.size) chunks.current.push(event.data); };
      rec.onstop = async () => {
        releaseTracks();
        if (!mounted.current) return;
        const blob = new Blob(chunks.current, { type: rec.mimeType });
        if (blob.size < 256 || blob.size > 8 * 1024 * 1024) {
          setMessage("Bản ghi quá ngắn hoặc quá lớn. Bạn hãy thử nói một câu ngắn.");
          updatePhase("idle");
          return;
        }
        updatePhase("transcribing");
        const controller = new AbortController();
        request.current = controller;
        const form = new FormData();
        form.append("audio", blob, "question");
        try {
          const result = await api<{ text: string }>("/api/transcribe", { method: "POST", body: form, signal: controller.signal });
          if (!mounted.current || controller.signal.aborted) return;
          if (result.text.trim()) {
            transcriptCallback.current(result.text);
            setMessage("Đã nhận lời nói. Bạn có thể sửa câu hỏi rồi bấm Gửi.");
          } else setMessage("Chưa nghe rõ lời nói. Bạn hãy thử lại hoặc nhập bằng chữ.");
        } catch (error) {
          if (mounted.current && !controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Chưa nhận được lời nói.");
        } finally {
          if (mounted.current && !controller.signal.aborted) updatePhase("idle");
        }
      };
      rec.onerror = () => { cancel(); setMessage("Không ghi được âm thanh. Bạn hãy thử lại."); };
      document.querySelectorAll<HTMLMediaElement>("video, audio").forEach(element => element.pause());
      rec.start(250);
      updatePhase("recording");
      timer.current = setTimeout(stop, 30_000);
    } catch (error) {
      releaseTracks();
      if (mounted.current) {
        setMessage(error instanceof DOMException && error.name === "NotAllowedError"
          ? "Bạn chưa cấp quyền micro. Hãy cho phép trong trình duyệt hoặc nhập câu hỏi."
          : "Chưa mở được micro. Bạn hãy kiểm tra thiết bị rồi thử lại.");
        updatePhase("idle");
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    const hide = () => { if (document.hidden) cancel(); };
    document.addEventListener("visibilitychange", hide);
    return () => { mounted.current = false; cancel(); document.removeEventListener("visibilitychange", hide); };
  }, []);

  const blocked = disabled || phase === "requesting" || phase === "transcribing";
  return (
    <div className="voice-control">
      <div className="voice-actions">
        <button className={`voice-hold ${phase === "recording" ? "is-recording" : ""}`} type="button"
          disabled={blocked} aria-pressed={phase === "recording"} aria-label="Giữ để nói câu hỏi; thả để dừng"
          onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); void start(); }}
          onPointerUp={stop} onPointerCancel={cancel}
          onKeyDown={event => { if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); void start(); } }}
          onKeyUp={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); stop(); } }}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>
          {phase === "recording" ? "Thả để dừng" : phase === "requesting" ? "Đang mở micro…" : phase === "transcribing" ? "Đang nhận lời…" : "Giữ để nói"}
        </button>
        <button type="button" className="voice-toggle" disabled={blocked}
          onClick={() => phase === "recording" ? stop() : void start()}>
          {phase === "recording" ? "Dừng" : "Bấm để ghi"}
        </button>
      </div>
      <p className="voice-note" role="status">{message || (phase === "recording" ? "Đang ghi, tối đa 30 giây. Lọc ồn nếu thiết bị hỗ trợ." : "Giọng nói được gửi đến dịch vụ nhận dạng khi bạn dừng ghi.")}</p>
    </div>
  );
}
