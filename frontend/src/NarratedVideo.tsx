import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { ExhibitId } from "./InteractiveScene";
import { exhibitVideos, type ExhibitVideoKind } from "./videoNarrations";
import "./NarratedVideo.css";

type NarratedVideoProps = {
  exhibitId: ExhibitId;
  kind: ExhibitVideoKind;
  ariaLabel: string;
  videoClassName?: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onLoadedData?: () => void;
  onError?: () => void;
  onEnded?: () => void;
};

export function NarratedVideo({
  exhibitId,
  kind,
  ariaLabel,
  videoClassName,
  videoRef: externalVideoRef,
  onLoadedData,
  onError,
  onEnded,
}: NarratedVideoProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;
  const narrationAudioRef = useRef<HTMLAudioElement>(null);
  const [narrationMessage, setNarrationMessage] = useState("");
  const selectedVideo = exhibitVideos[exhibitId][kind];
  const videoSource = `${import.meta.env.BASE_URL}${selectedVideo.source}`;
  const narrationSource = `${import.meta.env.BASE_URL}narration/${exhibitId}-${kind}-vi.mp3`;

  const pauseNarration = (reset = false) => {
    const audio = narrationAudioRef.current;
    if (!audio) return;

    audio.pause();
    if (reset) audio.currentTime = 0;
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
    if (!audio || !video || !Number.isFinite(audio.duration) || !video.duration) {
      return;
    }

    const narrationWindow = Math.max(1, video.duration - 0.25);
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
      audio.volume = video.muted ? 0 : video.volume;
      await audio.play();
      setNarrationMessage("");
    } catch {
      setNarrationMessage("Không thể tải hoặc phát bản thuyết minh tiếng Việt.");
    }
  };

  useEffect(() => {
    const audio = narrationAudioRef.current;
    return () => {
      audio?.pause();
      if (audio) audio.currentTime = 0;
    };
  }, [videoSource, narrationSource]);

  return (
    <>
      <div className="narrated-video-copy">
        <p className="narrated-video-script" lang="vi">
          {selectedVideo.narration}
        </p>
      </div>

      <video
        key={videoSource}
        ref={videoRef}
        className={videoClassName}
        controls
        playsInline
        preload="metadata"
        aria-label={ariaLabel}
        onPlay={() => void playNarration()}
        onPause={() => pauseNarration()}
        onEnded={() => {
          pauseNarration(true);
          onEnded?.();
        }}
        onSeeking={() => pauseNarration()}
        onSeeked={() => {
          syncNarrationToVideo();
          if (!videoRef.current?.paused) void playNarration();
        }}
        onRateChange={fitNarrationToVideo}
        onVolumeChange={(event) => {
          const audio = narrationAudioRef.current;
          if (audio) {
            audio.volume = event.currentTarget.muted
              ? 0
              : event.currentTarget.volume;
          }
        }}
        onLoadedMetadata={() => {
          fitNarrationToVideo();
          syncNarrationToVideo();
          if (!videoRef.current?.paused && narrationAudioRef.current?.paused) {
            void playNarration();
          }
        }}
        onLoadedData={onLoadedData}
        onError={onError}
      >
        <source src={videoSource} type="video/mp4" />
        Trình duyệt không hỗ trợ phát video.
      </video>

      <audio
        key={narrationSource}
        ref={narrationAudioRef}
        src={narrationSource}
        preload="metadata"
        onLoadedMetadata={() => {
          fitNarrationToVideo();
          syncNarrationToVideo();
          if (!videoRef.current?.paused && narrationAudioRef.current?.paused) {
            void playNarration();
          }
        }}
        onError={() =>
          setNarrationMessage("Không thể tải hoặc phát bản thuyết minh tiếng Việt.")
        }
      />

      {narrationMessage && (
        <p className="narrated-video-status" role="status">
          {narrationMessage}
        </p>
      )}
    </>
  );
}
