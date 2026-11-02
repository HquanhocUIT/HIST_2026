import { useEffect, useState } from "react";
import type { ExhibitId } from "./InteractiveScene";
import type { ExhibitStory } from "./exhibitStories";
import "./ArtifactStory.css";

type ArtifactStoryProps = {
  exhibitId: ExhibitId;
  exhibitName: string;
  story: ExhibitStory;
};

const ngocLuTimeline = [
  {
    date: "Khoảng 1893–1894",
    title: "Bắt gặp trong bãi cát",
    text: "Trong lúc đắp đê ở xã Như Trác, người dân bắt gặp một vật đồng lớn nằm sâu dưới bãi cát. Bài giới thiệu của Bảo tàng kể rằng vật được phát hiện ở độ sâu khoảng 2 mét.",
  },
  {
    date: "Đêm hôm ấy",
    title: "Đưa trống về đình làng",
    text: "Theo lời kể được Bảo tàng đăng lại, những người phát hiện lấp đất lại rồi quay lại đào vào ban đêm. Sau đó, trống được đưa về thờ tại đình làng Ngọc Lũ.",
  },
  {
    date: "Đầu thế kỷ XX",
    title: "Rời đình làng, vào sưu tập bảo tàng",
    text: "Một họa sĩ Pháp đến vẽ chiếc trống tại đình và báo cho Công sứ Hà Nam. Sau đó trống được Viện Viễn Đông Bác cổ sưu tầm; hồ sơ hiện vật của Bảo tàng ghi nhận việc sưu tầm vào tháng 4 năm 1903.",
  },
  {
    date: "Năm 2012",
    title: "Được công nhận là Bảo vật quốc gia",
    text: "Trống đồng Ngọc Lũ được công nhận là Bảo vật quốc gia. Ngày nay, chiếc trống được lưu giữ và giới thiệu tại Bảo tàng Lịch sử Quốc gia.",
  },
];

const museumStorySources = [
  {
    title: "Bảo vật quốc gia: Trống Ngọc Lũ",
    url: "https://baotanglichsu.vn/vi/Articles/1001/73637/bao-vat-quoc-gia-trong-ngoc-lu.html",
  },
  {
    title: "Giới thiệu bảo vật quốc gia: Trống đồng Ngọc Lũ",
    url: "https://baotanglichsu.vn/vi/Articles/1001/13602/gioi-thieu-bao-vat-quoc-gia-1-trong-djong-ngoc-lu-hien-vat-tieu-bieu-nhat-cua-nen-van-hoa-djong-son.html",
  },
];

export function ArtifactStory({
  exhibitId,
  exhibitName,
  story,
}: ArtifactStoryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [exhibitId]);

  const isNgocLuDrum = exhibitId === "drum";

  const timeline = isNgocLuDrum
    ? ngocLuTimeline
    : story.scenes.map((scene, index) => ({
        date: `Chặng ${String(index + 1).padStart(2, "0")}`,
        title: scene.title,
        text: scene.narration,
      }));

  const activeEvent = timeline[activeIndex] ?? timeline[0];

  return (
    <section
      className="artifact-story"
      aria-label={`Câu chuyện về ${exhibitName}`}
    >
      <span className="section-label">CÂU CHUYỆN HIỆN VẬT</span>

      <h2>
        {isNgocLuDrum
          ? "Từ bãi cát ven sông đến bảo vật quốc gia"
          : story.title}
      </h2>

      <p className="artifact-story-introduction">
        {isNgocLuDrum
          ? "Không chỉ là một chiếc trống của văn hóa Đông Sơn, Ngọc Lũ còn có hành trình đặc biệt: được bắt gặp khi người dân đắp đê, được đưa về đình làng rồi trở thành bảo vật được gìn giữ trong bảo tàng."
          : story.introduction}
      </p>

      <div className="artifact-story-narrative-heading">
        <span className="section-label">CÂU CHUYỆN THEO DÒNG THỜI GIAN</span>
        <span>
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(timeline.length).padStart(2, "0")}
        </span>
      </div>

      {isNgocLuDrum ? (
        <ol className="artifact-story-timeline">
          {timeline.map((event, index) => (
            <li key={event.title}>
              <button
                className={`artifact-story-event ${
                  index === activeIndex ? "is-active" : ""
                }`}
                type="button"
                aria-current={index === activeIndex ? "step" : undefined}
                onClick={() => setActiveIndex(index)}
              >
                <span className="artifact-story-event-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="artifact-story-event-copy">
                  <small>{event.date}</small>
                  <strong>{event.title}</strong>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="artifact-story-timeline artifact-story-timeline-generic">
          {timeline.map((event, index) => (
            <button
              className={`artifact-story-event ${
                index === activeIndex ? "is-active" : ""
              }`}
              key={event.title}
              type="button"
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <span className="artifact-story-event-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="artifact-story-event-copy">
                <small>{event.date}</small>
                <strong>{event.title}</strong>
              </span>
            </button>
          ))}
        </div>
      )}

      {activeEvent && (
        <article className="artifact-story-event-detail" aria-live="polite">
          <span className="section-label">{activeEvent.date}</span>
          <h3>{activeEvent.title}</h3>
          <p>{activeEvent.text}</p>
        </article>
      )}

      {isNgocLuDrum && (
        <aside className="artifact-story-crack-note">
          <strong>Còn những vết nứt thì sao?</strong>
          <p>
            Các nguồn Bảo tàng đang dẫn chưa giải thích nguyên nhân vết nứt
            trên chiếc trống Ngọc Lũ. Vì vậy demo không gán chúng cho quá trình
            đúc, lúc khai quật hay bảo quản; mô hình 3D cũng không dùng vết nứt
            để khẳng định tình trạng thật của hiện vật.
          </p>
        </aside>
      )}

      <div className="artifact-story-sources">
        <span className="section-label">NGUỒN CÂU CHUYỆN</span>

        {(isNgocLuDrum ? museumStorySources : story.sources).map((source) => (
          <a
            href={source.url}
            key={source.url}
            target="_blank"
            rel="noreferrer"
          >
            {source.title} ↗
          </a>
        ))}
      </div>
    </section>
  );
}