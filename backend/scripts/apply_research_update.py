"""Apply the manually researched, source-audited expansion. No web content is auto-ingested."""
import json
from pathlib import Path

data=Path(__file__).resolve().parents[1]/"data"
corpus=json.loads((data/"corpus.json").read_text(encoding="utf-8"))
update=json.loads((data/"research-expansion.json").read_text(encoding="utf-8"))
for key in ("sources","chunks"):
    by_id={item["id"]:item for item in corpus[key]}
    by_id.update({item["id"]:item for item in update[key]})
    corpus[key]=list(by_id.values())
corpus["checked_on"]=update["checked_on"]
corpus["source_conflicts"]=update["source_conflicts"]
tags={"period":["period","material","culture"],"size":["height","dimensions","base_diameter","mouth_diameter","face_diameter"],"decoration":["decoration","motif_detail","sun_count","band_count"],"discovery":["discovery"],"collection":["collection","location"],"meaning":["motif_meaning","use"],"use":["use"],"restoration":["restoration","statue_count"],"hilt":["hilt"],"classification":["classification"],"lacviet":["shape"],"material":["material"],"sites":["discovery"],"treasure":["treasure"]}
for chunk in corpus["chunks"]:
    suffix=chunk["id"].split("-")[-1]
    chunk.setdefault("facts",tags.get(suffix,[]))
    chunk.setdefault("certainty","interpretation" if suffix in ("meaning","use") else "documented")
(data/"corpus.json").write_text(json.dumps(corpus,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Corpus: {len(corpus['sources'])} sources, {len(corpus['chunks'])} chunks; team review still pending.")
