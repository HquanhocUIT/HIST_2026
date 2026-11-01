import { useState } from "react";
import {
  InteractiveScene,
  type ExhibitId,
} from "./InteractiveScene";
import { exhibitInformation } from "./exhibitInformation";
import { exhibitStories } from "./exhibitStories";
import { StoryPlayer } from "./StoryPlayer";
import "./App.css";

type ExhibitTab = "information" | "story";

const exhibits: {
  id: ExhibitId;
  number: string;
  name: string;
  collection: string;
}[] = [
  {
    id: "drum",
    number: "01",
    name: "Trống đồng Ngọc Lũ",
    collection: "Bộ sưu tập Đông Sơn",
  },
  {
    id: "jar",
    number: "02",
    name: "Thạp đồng Đào Thịnh",
    collection: "Bộ sưu tập Đông Sơn",
  },
  {
    id: "dagger",
    number: "03",
    name: "Dao găm đồng Đông Sơn",
    collection: "Bộ sưu tập Đông Sơn",
  },
];

function App() {
  const [selectedId, setSelectedId] = useState<ExhibitId | null>(null);
  const [activeTab, setActiveTab] = useState<ExhibitTab>("information");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const isScanning = selectedId === null;

  const selectedExhibit =
    selectedId === null
      ? null
      : (exhibits.find((exhibit) => exhibit.id === selectedId) ?? exhibits[0]);

  const selectedInformation =
    selectedId === null ? null : exhibitInformation[selectedId];

  const selectedStory =
    selectedId === null ? null : exhibitStories[selectedId];

  const handleSelectExhibit = (id: ExhibitId) => {
    setSelectedId(id);
    setActiveTab("information");
  };

  const handleBackToScan = () => {
    setSelectedId(null);
    setActiveTab("information");
  };

  return (
    <main className="app">
      <header className="app-header">
        <strong>HeritageXR</strong>
        <span>Không gian trưng bày 3D</span>
      </header>

      <div
        className={`museum-workspace ${
          isScanning ? "is-scanning" : "is-detail"
        } ${isAssistantOpen ? "assistant-open" : ""}`}
      >
        {selectedExhibit && selectedInformation && selectedStory && (
          <aside className="exhibit-sidebar">
            <div className="exhibit-sidebar-header">
              <button
                className="back-to-scan"
                type="button"
                onClick={handleBackToScan}
              >
                ← Quay lại quét
              </button>

              <div className="exhibit-sidebar-title">
                <span className="section-label">HIỆN VẬT ĐANG XEM</span>
                <h1>{selectedExhibit.name}</h1>
                <p>{selectedExhibit.collection}</p>
              </div>
            </div>

            <div
              className="exhibit-tabs"
              role="tablist"
              aria-label="Nội dung hiện vật"
            >
              <button
                id="information-tab"
                className={`exhibit-tab ${
                  activeTab === "information" ? "is-active" : ""
                }`}
                type="button"
                role="tab"
                aria-selected={activeTab === "information"}
                aria-controls="exhibit-tab-panel"
                onClick={() => setActiveTab("information")}
              >
                Thông tin
              </button>

              <button
                id="story-tab"
                className={`exhibit-tab ${
                  activeTab === "story" ? "is-active" : ""
                }`}
                type="button"
                role="tab"
                aria-selected={activeTab === "story"}
                aria-controls="exhibit-tab-panel"
                onClick={() => setActiveTab("story")}
              >
                Câu chuyện
              </button>
            </div>

            <div
              id="exhibit-tab-panel"
              className="exhibit-tab-panel"
              role="tabpanel"
              aria-labelledby={
                activeTab === "information"
                  ? "information-tab"
                  : "story-tab"
              }
            >
              {activeTab === "information" ? (
                <section
                  className="exhibit-information"
                  aria-label={`Thông tin về ${selectedExhibit.name}`}
                >
                  <div className="information-header">
                    <div>
                      <span className="section-label">
                        THÔNG TIN HIỆN VẬT
                      </span>
                      <p className="information-period">
                        {selectedInformation.period}
                      </p>
                    </div>

                    <span className="information-material">
                      {selectedInformation.material}
                    </span>
                  </div>

                  <p className="information-overview">
                    {selectedInformation.overview}
                  </p>

                  <ul className="information-facts">
                    {selectedInformation.facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>

                  {selectedInformation.note && (
                    <p className="information-note">
                      {selectedInformation.note}
                    </p>
                  )}

                  <a
                    className="information-source"
                    href={selectedInformation.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Nguồn: {selectedInformation.sourceTitle} ↗
                  </a>
                </section>
              ) : (
                <section
                  className="story-panel"
                  aria-label={`Câu chuyện về ${selectedExhibit.name}`}
                >
                  <span className="section-label">CÂU CHUYỆN LỊCH SỬ</span>

                  <h2 className="story-title">{selectedStory.title}</h2>

                  <p className="story-introduction">
                    {selectedStory.introduction}
                  </p>

                  <StoryPlayer
                    exhibitId={selectedExhibit.id}
                    title={selectedExhibit.name}
                  />

                  {selectedInformation.note && (
                    <p className="information-note">
                      {selectedInformation.note}
                    </p>
                  )}

                  <a
                    className="information-source"
                    href={selectedInformation.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Nguồn: {selectedInformation.sourceTitle} ↗
                  </a>
                </section>
              )}
            </div>
          </aside>
        )}

        <section
          className={`viewer-panel ${
            isScanning ? "is-scanning" : "is-detail"
          }`}
        >
          <div className="viewer-heading">
            {isScanning ? (
              <div>
                <span className="section-label">CHẾ ĐỘ QUÉT</span>
                <p>Chạm vào hotspot trên hiện vật muốn khám phá</p>
              </div>
            ) : (
              <div>
                <span className="section-label">KHÔNG GIAN 3D</span>
                <p>{selectedExhibit?.name}</p>
              </div>
            )}

            {!isScanning && (
              <span className="viewer-status">ĐANG XEM</span>
            )}
          </div>

          <InteractiveScene
            selectedId={selectedId}
            onSelect={handleSelectExhibit}
          />

          {!isScanning && (
            <p className="viewer-help">
              Kéo để xoay · Cuộn hoặc chụm hai ngón để thu phóng
            </p>
          )}
        </section>

        <aside
          className={`assistant-dock ${
            isAssistantOpen ? "is-open" : "is-collapsed"
          }`}
        >
          {isAssistantOpen ? (
            <section className="assistant-panel">
              <header className="assistant-header">
                <div>
                  <span className="assistant-icon">✦</span>
                  <div>
                    <h2>Trợ lý hiện vật</h2>
                    <p>
                      {selectedExhibit
                        ? `Đang tìm hiểu: ${selectedExhibit.name}`
                        : "Chọn một hiện vật để bắt đầu"}
                    </p>
                  </div>
                </div>

                <button
                  className="assistant-close"
                  type="button"
                  aria-label="Thu gọn trợ lý"
                  onClick={() => setIsAssistantOpen(false)}
                >
                  ×
                </button>
              </header>

              <div className="assistant-placeholder">
                <span className="assistant-placeholder-icon">✦</span>
                <h3>Hỏi thêm về hiện vật</h3>
                <p>
                  Khu vực chatbot AI sẽ được tích hợp tại đây để fen có thể hỏi
                  sâu hơn về lịch sử và ý nghĩa của hiện vật.
                </p>
              </div>

              <button
                className="assistant-input-placeholder"
                type="button"
                disabled
              >
                Chatbot AI sẽ được tích hợp sau
              </button>
            </section>
          ) : (
            <button
              className="assistant-collapsed-button"
              type="button"
              aria-label="Mở trợ lý AI"
              aria-expanded={false}
              onClick={() => setIsAssistantOpen(true)}
            >
              <span className="assistant-icon">✦</span>
              <span>Hỏi AI</span>
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}

export default App;