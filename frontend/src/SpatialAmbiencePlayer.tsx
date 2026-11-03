import { useCallback, useEffect, useRef, useState } from "react";
import "./SpatialAmbiencePlayer.css";

export function SpatialAmbiencePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const pannerRef = useRef<PannerNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [audioSource, setAudioSource] = useState("");
  const [ambiencePlaying, setAmbiencePlaying] = useState(false);
  const [bearing, setBearing] = useState(35);
  const [orientationEnabled, setOrientationEnabled] = useState(false);
  const [spatialMessage, setSpatialMessage] = useState(
    "Tải file ambience để nghe thử vị trí âm thanh quanh khách.",
  );

  const orientationHandlerRef = useRef<(event: DeviceOrientationEvent) => void>(
    () => undefined,
  );

  useEffect(() => {
    orientationHandlerRef.current = (event) => {
      if (event.alpha === null || !contextRef.current) return;
      const radians = (event.alpha * Math.PI) / 180;
      const listener = contextRef.current.listener;

      listener.forwardX.setTargetAtTime(
        Math.sin(radians),
        contextRef.current.currentTime,
        0.08,
      );
      listener.forwardY.setTargetAtTime(0, contextRef.current.currentTime, 0.08);
      listener.forwardZ.setTargetAtTime(
        -Math.cos(radians),
        contextRef.current.currentTime,
        0.08,
      );

      const relativeBearing = ((event.alpha - bearing + 540) % 360) - 180;
      const facingVolume =
        0.15 + 0.85 * Math.max(0, Math.cos((relativeBearing * Math.PI) / 180));
      gainRef.current?.gain.setTargetAtTime(
        facingVolume,
        contextRef.current.currentTime,
        0.12,
      );
      setOrientationEnabled(true);
    };
  }, [bearing]);

  const orientationListener = useCallback((event: DeviceOrientationEvent) => {
    orientationHandlerRef.current(event);
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      window.removeEventListener("deviceorientation", orientationListener);
      void contextRef.current?.close();
    };
  }, [orientationListener]);

  const setSourceBearing = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    const panner = pannerRef.current;
    const context = contextRef.current;

    if (panner && context) {
      panner.positionX.setValueAtTime(Math.sin(radians), context.currentTime);
      panner.positionZ.setValueAtTime(-Math.cos(radians), context.currentTime);
    }
  };

  const enableSpatialAudio = async () => {
    const element = audioRef.current;
    if (!element || !audioSource) {
      setSpatialMessage("Chọn file âm thanh môi trường trước.");
      return;
    }

    if (!element.paused) {
      element.pause();
      return;
    }

    try {
      const AudioContextConstructor = window.AudioContext;
      const context = contextRef.current ?? new AudioContextConstructor();
      contextRef.current = context;

      if (!sourceRef.current) {
        const source = context.createMediaElementSource(element);
        const panner = context.createPanner();
        const gain = context.createGain();

        panner.panningModel = "HRTF";
        panner.distanceModel = "inverse";
        panner.refDistance = 1;
        panner.maxDistance = 8;
        panner.rolloffFactor = 0.35;
        gain.gain.value = 0.85;
        source.connect(panner);
        panner.connect(gain);
        gain.connect(context.destination);
        sourceRef.current = source;
        pannerRef.current = panner;
        gainRef.current = gain;
      }

      await context.resume();
      setSourceBearing(bearing);

      const deviceOrientation =
        typeof DeviceOrientationEvent === "undefined"
          ? undefined
          : (DeviceOrientationEvent as typeof DeviceOrientationEvent & {
              requestPermission?: () => Promise<"granted" | "denied">;
            });
      const permission = await deviceOrientation?.requestPermission?.();

      if (permission === "denied") {
        setOrientationEnabled(false);
        setSpatialMessage("Bạn chưa cấp quyền cảm biến. Chỉnh hướng thủ công bằng thanh trượt.");
      }

      if (deviceOrientation && permission !== "denied") {
        window.removeEventListener("deviceorientation", orientationListener);
        window.addEventListener("deviceorientation", orientationListener);
        setOrientationEnabled(true);
        setSpatialMessage("Âm thanh đang đặt trong không gian 3D; xoay điện thoại để đổi hướng nghe.");
      } else {
        setSpatialMessage("Thiết bị chưa hỗ trợ cảm biến xoay; chỉnh góc bằng thanh trượt.");
      }

      await element.play();
    } catch (error) {
      setSpatialMessage(
        error instanceof Error ? error.message : "Không thể khởi tạo Web Audio.",
      );
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const nextAudioUrl = URL.createObjectURL(file);
    audioUrlRef.current = nextAudioUrl;
    setAudioSource(nextAudioUrl);
    setAudioFileName(file.name);
    setSpatialMessage("Đã tải ambience. Nhấn phát để bật không gian 360°.");
  };

  return (
    <div className="spatial-audio-panel">
      <div className="spatial-audio-heading">
        <div>
          <span className="section-label">WEB AUDIO API</span>
          <h4>Âm thanh không gian 360°</h4>
        </div>
        <span
          className={`orientation-status ${orientationEnabled ? "is-active" : ""}`}
        >
          {orientationEnabled ? "GYRO ON" : "GYRO OFF"}
        </span>
      </div>

      <label className="ambience-file-picker">
        <span>{audioFileName || "Chọn file ambience (MP3 / WAV)"}</span>
        <input
          type="file"
          accept="audio/*"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
      </label>

      <audio
        ref={audioRef}
        className="spatial-audio-element"
        src={audioSource}
        loop
        onPlay={() => setAmbiencePlaying(true)}
        onPause={() => setAmbiencePlaying(false)}
      />

      <div className="spatial-direction-control">
        <span aria-hidden="true" className="direction-dial">
          <span style={{ transform: `rotate(${bearing}deg)` }}>↑</span>
        </span>
        <label>
          Hướng âm thanh <strong>{bearing}°</strong>
          <input
            type="range"
            min="0"
            max="359"
            value={bearing}
            onChange={(event) => {
              const nextBearing = Number(event.target.value);
              setBearing(nextBearing);
              setSourceBearing(nextBearing);
            }}
          />
        </label>
      </div>

      <button
        className="spatial-play-button"
        type="button"
        onClick={enableSpatialAudio}
      >
        {ambiencePlaying ? "Tạm dừng ambience" : "Phát ambience 360°"}
      </button>

      <p className="spatial-audio-message" role="status">
        {spatialMessage}
      </p>
      <p className="spatial-audio-note">
        Cảm biến xoay cần quyền truy cập trên iOS Safari và kết nối HTTPS.
      </p>
    </div>
  );
}
