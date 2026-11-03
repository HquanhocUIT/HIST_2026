"""Evaluate question relevance with separate source-grounded review calls, not keyword counts."""
import argparse
import json
from pathlib import Path
import sys
import threading
import time
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from langchain_core.messages import HumanMessage,SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel,Field
from app.config import Settings,REPOSITORY
from app.corpus import Corpus,normalize
from app.rag import EvidenceSelector,RagEngine
from app.schemas import ChatRequest
from app.vector import VectorIndex


class Review(BaseModel):
    answers_actual_question:bool
    supported_by_evidence:bool
    respects_uncertainty:bool
    covers_requested_parts:bool
    explanation:str=Field(max_length=800)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--live",action="store_true")
    parser.add_argument("--only")
    parser.add_argument("--retry-failed",action="store_true")
    args=parser.parse_args()
    if not args.live:
        print("Add --live: this runs answer generation and independent Gemini review calls.")
        return
    settings=Settings.load()
    cases=json.loads((Path(__file__).resolve().parents[1]/"tests"/"open_semantic_cases.json").read_text(encoding="utf-8"))
    if args.only:
        cases=[case for case in cases if case["id"] in args.only.split(",")]
    previous=None
    if args.retry_failed:
        path=REPOSITORY/"docs"/"semantic-audit-live.json"
        previous=json.loads(path.read_text(encoding="utf-8"))
        (REPOSITORY/"docs"/"semantic-audit-before-retry.json").write_text(json.dumps(previous,ensure_ascii=False,indent=2),encoding="utf-8")
        failed={case["id"] for case in previous["results"] if not case["passed"]}
        cases=[case for case in cases if case["id"] in failed]
    pace_lock=threading.Lock()
    next_call=0.0
    def pace():
        nonlocal next_call
        with pace_lock:
            wait=max(0,next_call-time.monotonic())
            next_call=max(time.monotonic(),next_call)+5.5
        if wait: time.sleep(wait)
    class PacedSelector(EvidenceSelector):
        def select(self,payload):
            pace()
            return super().select(payload)
    corpus=Corpus(settings.corpus)
    engine=RagEngine(settings,VectorIndex(settings,corpus),PacedSelector(settings))
    critic=ChatGoogleGenerativeAI(model=settings.model,google_api_key=settings.api_key,timeout=18,max_retries=0,
        max_output_tokens=700,thinking_config={"thinking_level":"minimal"}).with_structured_output(Review,method="json_schema")
    results=[]
    started=time.time()
    for i,case in enumerate(cases):
        session=f"semantic-{case['id']}-{int(started)}"
        response=None
        stage="generation"
        try:
            setup=[]
            for question in case.get("setup",[]):
                response,_=engine.chat(ChatRequest(question=question,artifact_id=case["artifact"],session_id=session))
                setup.append({"question":question,"answer":response.answer})
            response,debug=engine.chat(ChatRequest(question=case["question"],artifact_id=case["artifact"],session_id=session),debug=True)
            evidence=[{"text":corpus.by_id[c.chunk_id]["text"],"certainty":corpus.by_id[c.chunk_id].get("certainty","documented")} for c in response.citations]
            stage="review"
            pace()
            review=critic.invoke([SystemMessage(content="Bạn là người kiểm định độc lập, chấm nghiêm câu trả lời hướng dẫn bảo tàng. Đối chiếu câu hỏi mới nhất, lịch sử, tiêu chí và evidence. Đúng chủ đề nhưng không trả lời ý hỏi là SAI. Mô tả số hoa văn không giải thích nguồn cảm hứng. Không được biết tâm ý nghệ nhân khi không có ghi chép. Không biến suy đoán thành sự thật hoặc chốt một số khi nguồn mâu thuẫn. Một câu từ chối đúng giới hạn có thể ĐẠT. Phải kiểm tra từng vế của câu hỏi, kể cả vế chưa biết. Với dữ kiện khẳng định phải có chứng cứ trong evidence; thông tin bối cảnh dự án có thể dùng project_context. Không chấm theo vẻ tự tin hoặc theo số từ khóa."),
                HumanMessage(content=json.dumps({"question":case["question"],"history":setup,"rubric":case["rubric"],"answer":response.answer,"status":response.status,"evidence":evidence,"project_context":"Đây là demo ba mô hình 3D được đơn giản hóa. Mô hình dao găm chưa định danh theo một tiêu bản khảo cổ cụ thể. Tất cả hình 3D không phải ảnh chụp/scan đã kiểm chứng của nguyên bản."},ensure_ascii=False))])
            hard_checks=(response.status in case.get("statuses",[response.status]) and all(any(normalize(term) in normalize(response.answer) for term in alternatives) for alternatives in case.get("required",[])))
            passed=hard_checks and all((review.answers_actual_question,review.supported_by_evidence,review.respects_uncertainty,review.covers_requested_parts)) and response.status!="temporarily_unavailable"
            result={**case,"passed":passed,"required_content_passed":hard_checks,"response":response.model_dump(),"question_focus":debug.get("question_focus"),"review":review.model_dump()}
        except Exception as exc:
            result={**case,"passed":False,"error_type":type(exc).__name__,"error_stage":stage,"provider_code":str(getattr(exc,"code",getattr(exc,"status_code","unknown")))}
            if response is not None: result["response"]=response.model_dump()
        results.append(result)
        print(f"{i+1}/{len(cases)} {case['id']}: {'PASS' if result['passed'] else 'FAIL'}",flush=True)
    attempted=len(results)
    if previous:
        merged={item["id"]:item for item in previous["results"]}
        merged.update({item["id"]:item for item in results})
        results=list(merged.values())
    report={"run_at":int(started),"corpus_version":corpus.version,"model":settings.model,"review_method":"Separate Gemini call plus mandatory content checks evaluate question relevance, cited support, uncertainty and coverage. This is model-assisted review, not expert historical approval.","attempted_this_run":attempted,"retry_failed":args.retry_failed,"passed":sum(r["passed"] for r in results),"total":len(results),"elapsed_seconds":round(time.time()-started),"results":results}
    filename="semantic-audit-rerun.json" if args.only else "semantic-audit-live.json"
    (REPOSITORY/"docs"/filename).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"RESULT: {report['passed']}/{report['total']}")
    raise SystemExit(0 if report["passed"]==report["total"] else 1)


if __name__=="__main__":main()
