import { useEffect, useRef, useState } from "react";
import type { ExhibitId } from "./InteractiveScene";
import { SpatialAmbiencePlayer } from "./SpatialAmbiencePlayer";
import {
  exhibitVideos,
  type ExhibitVideoKind,
} from "./videoNarrations";
import "./StoryPlayer.css";

type StoryPlayerProps = {
  exhibitId: ExhibitId;
  title: string;
};

const videoKindLabels: Record<ExhibitVideoKind, string> = {
  crafting: "Quy trình chế tác",
  story: "Câu chuyện hiện vật",
};

export function StoryPlayer({ exhibitId, title }: StoryPlayerProps) {
  const [activeKind, setActiveKind] = useState<ExhibitVideoKind>("story");
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [narrationMessage, setNarrationMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const narrationAudioRef = useRef<HTMLAudioElement>(null);
  const selectedVideo = exhibitVideos[exhibitId][activeKind];
  const videoSource = `${import.meta.env.BASE_URL}${selectedVideo.source}`;
  const narrationSource = `${import.meta.env.BASE_URL}narration/${exhibitId}-${activeKind}-vi.mp3`;

  const pauseNarration = (reset = false) => {
    const audio = narrationAudioRef.current;
    if (audio) {
      audio.pause();
      if (reset) audio.currentTime = 0;
    }
  };

  const syncNarrationToVideo = () => {
    const audio = narrationAudioRef.current;
    const video = videoRef.current;
    if (
      !audio ||
      !video ||
      !Number.isFinite(audio.duration) ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0
    ) {
      return;
    }

    const progress = Math.min(1, Math.max(0, video.currentTime / video.duration));
    audio.currentTime = progress * audio.duration;
  };

  const fitNarrationToVideo = () => {
    const audio = narrationAudioRef.current;
    const video = videoRef.current;
    const videoDuration = video?.duration;
    if (!audio || !video || !Number.isFinite(audio.duration) || !videoDuration) return;

    const narrationWindow = Math.max(1, videoDuration - 0.25);
    const fitRate = Math.min(1.25, Math.max(1, audio.duration / narrationWindow));
    audio.playbackRate = Math.min(4, fitRate * video.playbackRate);
  };

  const playNarration = async () => {
    const audio = narrationAudioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    try {
      syncNarrationToVideo();
      fitNarrationToVideo();
      audio.volume = video.muted
        ? 0
        : video.volume;
      await audio.play();
      setNarrationMessage("");
    } catch {
      setNarrationMessage("Không thể tải hoặc phát bản thuyết minh tiếng Việt.");
    }
  };

  const handleVideoSeeked = () => {
    syncNarrationToVideo();
    if (!videoRef.current?.paused) void playNarration();
  };

  useEffect(() => {
    const audio = narrationAudioRef.current;
    return () => {
      audio?.pause();
      if (audio) audio.currentTime = 0;
    };
  }, [videoSource, narrationSource]);

  const handleKindChange = (kind: ExhibitVideoKind) => {
    pauseNarration(true);
    setActiveKind(kind);
    setVideoUnavailable(false);
    setNarrationMessage("");
  };

  return (
    <div className="story-player">
      <div className="story-video-kinds" aria-label="Chọn video hiện vật">
        {(Object.keys(videoKindLabels) as ExhibitVideoKind[]).map((kind) => (
          <button
            key={kind}
            className={`story-video-kind ${activeKind === kind ? "is-active" : ""}`}
            type="button"
            aria-pressed={activeKind === kind}
            onClick={() => handleKindChange(kind)}
          >
            {videoKindLabels[kind]}
          </button>
        ))}
      </div>

      <div className="story-video-copy">
        <h3>{selectedVideo.title}</h3>
        <p lang="vi">{selectedVideo.narration}</p>
      </div>

      <div className="story-video-wrapper">
        <video
          key={videoSource}
          ref={videoRef}
          className="story-video"
          controls
          playsInline
          preload="metadata"
          aria-label={`Video ${videoKindLabels[activeKind].toLocaleLowerCase("vi")} về ${title}`}
          onPlay={playNarration}
          onPause={() => pauseNarration()}
          onEnded={() => pauseNarration(true)}
          onSeeking={() => pauseNarration()}
          onSeeked={handleVideoSeeked}
          onRateChange={fitNarrationToVideo}
          onVolumeChange={(event) => {
            if (narrationAudioRef.current) {
              narrationAudioRef.current.volume = event.currentTarget.muted
                ? 0
                : event.currentTarget.volume;
            }
          }}
          onLoadedMetadata={fitNarrationToVideo}
          onLoadedData={() => setVideoUnavailable(false)}
          onError={() => setVideoUnavailable(true)}
        >
          <source src={videoSource} type="video/mp4" />
          Trình duyệt không hỗ trợ phát video.
        </video>

        {videoUnavailable && (
          <div className="story-video-placeholder" role="status">
            <p>Video về {title} đang được chuẩn bị.</p>
          </div>
        )}
      </div>

      <audio
        key={narrationSource}
        ref={narrationAudioRef}
        src={narrationSource}
        preload="metadata"
        onLoadedMetadata={fitNarrationToVideo}
      />
      {narrationMessage && (
        <p className="story-narration-status" role="status">
          {narrationMessage}
        </p>
      )}

      <SpatialAmbiencePlayer />
    </div>
  );
}
