import { useEffect, useRef, useState } from "react";
import type { ExhibitId } from "./InteractiveScene";
import { NarratedVideo } from "./NarratedVideo";
import "./CraftingVideo.css";

type CraftingVideoProps = {
  exhibitId: ExhibitId;
  title: string;
  onContinueToFact: () => void;
};

const castingSource =
  "https://baotanglichsu.vn/vi/Articles/3101/17277/nghe-luyen-kim-djuc-djong-trong-van-hoa-djong-son.html";

export function CraftingVideo({
  exhibitId,
  title,
  onContinueToFact,
}: CraftingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    setVideoUnavailable(false);
    setHasCompleted(false);
  }, [exhibitId]);

  const handleReplay = () => {
    const video = videoRef.current;

    if (!video) return;

    video.currentTime = 0;
    setHasCompleted(false);
    void video.play().catch(() => {});
  };

  return (
    <section
      className="crafting-video-panel"
      aria-label={`Video chế tác ${title}`}
    >
      <header className="crafting-video-heading">
        <span className="section-label">HOẠT HỌA TÁI DỰNG</span>
        <h2>Quá trình chế tác {title}</h2>
        <p>
          Hoạt họa minh họa kỹ thuật đúc đồng Đông Sơn, không phải video ghi
          hình quy trình riêng của hiện vật này.
        </p>
      </header>

      {videoUnavailable ? (
        <div className="crafting-video-error" role="status">
          <strong>Không tải được video chế tác.</strong>
          <span>
            Kiểm tra đường dẫn video trong frontend/src/videoNarrations.json.
          </span>
        </div>
      ) : (
        <NarratedVideo
          key={exhibitId}
          exhibitId={exhibitId}
          kind="crafting"
          ariaLabel={`Hoạt họa quá trình chế tác ${title}`}
          videoClassName="crafting-video"
          videoRef={videoRef}
          onLoadedData={() => setVideoUnavailable(false)}
          onError={() => setVideoUnavailable(true)}
          onEnded={() => setHasCompleted(true)}
        />
      )}

      <p className="crafting-video-note">
        Đây là phần tái dựng minh họa dựa trên tư liệu về kỹ thuật đúc đồng Đông
        Sơn. Các chi tiết không khẳng định chính xác quy trình riêng của từng
        hiện vật.
      </p>

      <a
        className="crafting-video-source"
        href={castingSource}
        target="_blank"
        rel="noreferrer"
      >
        Nguồn tham khảo: Nghề luyện kim đúc đồng trong văn hóa Đông Sơn ↗
      </a>

      {hasCompleted && (
        <div
          className="crafting-video-actions"
          role="group"
          aria-label="Video chế tác đã hoàn tất"
        >
          <span>Đã xem hết quá trình chế tác</span>

          <button type="button" onClick={handleReplay}>
            Replay
          </button>

          <button
            className="crafting-video-continue"
            type="button"
            onClick={onContinueToFact}
          >
            Đi tiếp Fact
          </button>
        </div>
      )}
    </section>
  );
}
