import { useEffect, useState } from "react";
import type { ExhibitId } from "./InteractiveScene";
import "./StoryPlayer.css";

type StoryPlayerProps = {
  exhibitId: ExhibitId;
  title: string;
};

const exhibitVideoSources: Record<ExhibitId, string> = {
  drum: "/videos/ngoc-lu-bronze-drum.mp4",
  jar: "/videos/dao-thinh-bronze-jar.mp4",
  dagger: "/videos/dong-son-bronze-dagger.mp4",
};

export function StoryPlayer({ exhibitId, title }: StoryPlayerProps) {
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const videoSource = exhibitVideoSources[exhibitId];

  useEffect(() => {
    setVideoUnavailable(false);
  }, [videoSource]);

  return (
    <div className="story-video-wrapper">
      <video
        className="story-video"
        controls
        playsInline
        preload="metadata"
        aria-label={`Video hoạt họa về ${title}`}
        onLoadedData={() => setVideoUnavailable(false)}
        onError={() => setVideoUnavailable(true)}
      >
        <source src={videoSource} type="video/mp4" />
        Trình duyệt không hỗ trợ phát video.
      </video>

      {videoUnavailable && (
        <div className="story-video-placeholder" role="status">
          <p>Video hoạt họa về {title} đang được chuẩn bị.</p>
        </div>
      )}
    </div>
  );
}