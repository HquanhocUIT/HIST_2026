"""Check the real local API's tone and latency. --live also calls Gemini for open questions."""
import argparse
import json
from pathlib import Path
import re
import sys
import time
import httpx
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.config import REPOSITORY
from app.corpus import normalize


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--live",action="store_true")
    args=parser.parse_args()
    cases=[
        ("dagger","Hiện vật được dùng làm gì?","answered","tự vệ"),
        ("dagger","cái dao này làm bằng gì","answered","đồng"),
        ("dagger","cái dao này được làm từ bao giờ","insufficient_evidence","niên đại"),
        ("drum","Cái này có nguồn gốc thế nào?","answered","1893"),
        ("jar","Cái này cao bao nhiêu?","answered","98"),
        ("jar","hoa văn đc lấy ý tưởng từ đâu","answered","tín ngưỡng"),
        ("drum","Trống nặng bao nhiêu?","answered","86"),
        ("jar","Ai phát hiện thạp?","answered","quân nhân"),
        ("jar","Ai là chủ nhân đầu tiên của thạp?","insufficient_evidence","chưa xác định"),
    ]
    local_count=len(cases)
    if args.live:
        cases += [("dagger","Kể một điều thú vị về hiện vật này nhé","answered",""),
                  ("dagger","Giải thích ngắn gọn hơn được không?","answered","")]
    results=[]
    with httpx.Client(base_url="http://127.0.0.1:8000",timeout=23) as client:
        version=client.get("/api/health").json().get("service_version")
        for i,(artifact,question,status,term) in enumerate(cases):
            start=time.perf_counter()
            response=client.post("/api/chat",json={"question":question,"artifact_id":artifact,"session_id":"conversation-final"})
            elapsed=round((time.perf_counter()-start)*1000)
            body=response.json()
            text=body.get("answer","")
            natural=not re.search(r"\[\d+\]|theo tư liệu|bài nguồn|bài viết",text,re.I)
            budget=1000 if i<local_count else 20000
            passed=response.status_code==200 and body.get("status")==status and normalize(term) in normalize(text) and natural and elapsed<budget
            item={"question":question,"artifact_id":artifact,"passed":passed,"http_status":response.status_code,
                  "response":body,"end_to_end_ms":elapsed,"latency_budget_ms":budget,"no_inline_citations_or_article_voice":natural}
            results.append(item)
            print(json.dumps({"question":question,"passed":passed,"elapsed_ms":elapsed,"answer":text},ensure_ascii=False),flush=True)
    report={"service_version":version,"live_generation_requested":args.live,"passed":sum(item["passed"] for item in results),"total":len(results),"results":results}
    (REPOSITORY/"docs"/"conversation-checks.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"RESULT: {report['passed']}/{report['total']}")
    raise SystemExit(0 if report["passed"]==report["total"] else 1)


if __name__=="__main__":
    main()
