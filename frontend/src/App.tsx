import { useState } from "react";
import {
  InteractiveScene,
  type ExhibitId,
} from "./InteractiveScene";
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
    name: "Ngoc Lu Bronze Drum",
    collection: "Dong Son collection",
  },
  {
    id: "jar",
    number: "02",
    name: "Dao Thinh Bronze Jar",
    collection: "Dong Son collection",
  },
  {
    id: "dagger",
    number: "03",
    name: "Bronze Dagger",
    collection: "Dong Son collection",
  },
];

function App() {
  const [selectedId, setSelectedId] = useState<ExhibitId>("drum");
  const selectedExhibit =
    exhibits.find((exhibit) => exhibit.id === selectedId) ?? exhibits[0];

  return (
    <main className="app">
      <header className="app-header">
        <strong>HeritageXR</strong>
        <span>Interactive exhibit viewer</span>
      </header>

      <div className="viewer-layout">
        <aside className="exhibit-sidebar">
          <p className="section-label">EXHIBITS</p>
          <h1>Select an object</h1>

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
              <span className="section-label">SELECTED EXHIBIT</span>
              <h2>{selectedExhibit.name}</h2>
            </div>
            <span className="viewer-status">3D VIEW</span>
          </div>

          <InteractiveScene
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <p className="viewer-help">
            Drag to rotate · Scroll or pinch to zoom · Click an object to select
          </p>
        </section>
      </div>
    </main>
  );
}

export default App;