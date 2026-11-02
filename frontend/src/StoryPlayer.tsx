import type { ExhibitId } from "./InteractiveScene";
import { workshopSteps } from "./WorkshopProcessScene";
import "./StoryPlayer.css";

type StoryPlayerProps = {
  exhibitId: ExhibitId;
  exhibitName: string;
  activeStep: number;
  onStepChange: (step: number) => void;
};

const castingSources = [
  {
    title: "Vài nét về nghề luyện kim đúc đồng thời Đông Sơn",
    url: "https://baotanglichsu.vn/VI/Articles/3101/16312/vai-net-ve-nghe-luyen-kim-djuc-djong-thoi-djong-son.html",
  },
  {
    title: "Đúc trống Đông Sơn: Lược sử nghiên cứu và những khám phá mới",
    url: "https://baotanglichsu.vn/DataFiles/2023/01/News/Tieng%20Viet/4.1.2023/Thong%20bao%20KH%20so%201%20nam%202022/007.pdf",
  },
];

export function StoryPlayer({ exhibitId, exhibitName, activeStep, onStepChange }: StoryPlayerProps) {
  const isDrumProcess = exhibitId === "drum";
  const currentStep = workshopSteps[activeStep] ?? workshopSteps[0];

  if (!isDrumProcess) {
    return (
      <section className="story-panel story-player">
        <span className="section-label">QUY TRÌNH CHẾ TÁC</span>
        <h2 className="story-player-title">Chưa có quy trình được xác minh</h2>
        <p className="story-player-introduction">
          Demo hiện chỉ tái dựng giả thuyết đúc trống đồng Đông Sơn cho trống Ngọc Lũ.
          T chưa gán quy trình này cho {exhibitName} khi chưa có tư liệu phù hợp.
        </p>
      </section>
    );
  }

  return (
    <section className="story-panel story-player" aria-label={`Quy trình chế tác ${exhibitName}`}>
      <span className="section-label">QUY TRÌNH CHẾ TÁC</span>
      <h2 className="story-player-title">Đúc một chiếc trống lớn</h2>
      <p className="story-player-introduction">
        Các bước dưới đây minh họa một số giả thuyết nghiên cứu về kỹ thuật đúc đồng Đông Sơn.
        Chưa thể khẳng định đây là chính xác quy trình tạo ra chiếc trống Ngọc Lũ.
      </p>

      <div className="craft-story-heading">
        <span className="section-label">CÁC CÔNG ĐOẠN</span>
        <span>{String(activeStep + 1).padStart(2, "0")} / 05</span>
      </div>
      <ol className="craft-process-list">
        {workshopSteps.map((item, index) => (
          <li key={item.title}>
            <button
              className={`craft-process-step ${index === activeStep ? "is-active" : ""}`}
              type="button"
              aria-current={index === activeStep ? "step" : undefined}
              onClick={() => onStepChange(index)}
            >
              <span className="craft-process-number">{String(index + 1).padStart(2, "0")}</span>
              <span>{item.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <article className="craft-step-story" aria-live="polite">
        <span className="section-label">BƯỚC {String(activeStep + 1).padStart(2, "0")}</span>
        <h3>{currentStep.title}</h3>
        <p>{currentStep.description}</p>
      </article>

      <div className="craft-process-sources">
        <span className="section-label">NGUỒN VỀ KỸ THUẬT ĐÚC</span>
        {castingSources.map((source) => (
          <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>
        ))}
      </div>
    </section>
  );
}
