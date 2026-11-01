import { useState } from "react";
import {
  InteractiveScene,
  type ExhibitId,
} from "./InteractiveScene";
import { exhibitInformation } from "./exhibitInformation";
import "./App.css";

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
  const [selectedId, setSelectedId] = useState<ExhibitId>("drum");

  const selectedExhibit =
    exhibits.find((exhibit) => exhibit.id === selectedId) ?? exhibits[0];

  const selectedInformation = exhibitInformation[selectedId];

  return (
    <main className="app">
      <header className="app-header">
        <strong>HeritageXR</strong>
        <span>Không gian trưng bày 3D</span>
      </header>

      <div className="viewer-layout">
        <aside className="exhibit-sidebar">
          <p className="section-label">HIỆN VẬT</p>
          <h1>Chọn hiện vật</h1>

          <div className="exhibit-list">
            {exhibits.map((exhibit) => (
              <button
                className={`exhibit-option ${
                  exhibit.id === selectedId ? "is-selected" : ""
                }`}
                key={exhibit.id}
                onClick={() => setSelectedId(exhibit.id)}
                aria-pressed={exhibit.id === selectedId}
              >
                <span className="exhibit-number">{exhibit.number}</span>

                <span className="exhibit-option-text">
                  <strong>{exhibit.name}</strong>
                  <small>{exhibit.collection}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="viewer-panel">
          <div className="viewer-heading">
            <div>
              <span className="section-label">HIỆN VẬT ĐANG CHỌN</span>
              <h2>{selectedExhibit.name}</h2>
            </div>

            <span className="viewer-status">CHẾ ĐỘ 3D</span>
          </div>

          <InteractiveScene
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <section
            className="exhibit-information"
            aria-label={`Thông tin về ${selectedExhibit.name}`}
          >
            <div className="information-header">
              <div>
                <span className="section-label">THÔNG TIN HIỆN VẬT</span>
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
              <p className="information-note">{selectedInformation.note}</p>
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

          <p className="viewer-help">
            Kéo để xoay · Cuộn hoặc chụm hai ngón để thu phóng · Chạm vào hiện
            vật để chọn
          </p>
        </section>
      </div>
    </main>
  );
}

export default App;