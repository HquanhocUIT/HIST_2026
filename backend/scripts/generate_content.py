"""Generate source-linked narration and quiz drafts. Human review is required."""
import argparse
import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))

from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from app.config import Settings, REPOSITORY, BACKEND
from app.corpus import ARTIFACTS, Corpus, normalize
from app.schemas import Passage


class Quiz(BaseModel):
    question: str
    options: list[str] = Field(min_length=4,max_length=4)
    correct_index: int = Field(ge=0,le=3)
    chunk_id: str
    quote: str


class Draft(BaseModel):
    title: str
    narration: list[Passage] = Field(min_length=4,max_length=6)
    quizzes: list[Quiz] = Field(min_length=5,max_length=5)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live",action="store_true",required=True)
    parser.parse_args()
    settings=Settings.load(); corpus=Corpus(settings.corpus)
    llm=ChatGoogleGenerativeAI(model=settings.model,google_api_key=settings.api_key,
        max_output_tokens=5000,timeout=60,max_retries=0,thinking_config={"thinking_level":"minimal" if "3.5-flash-lite" in settings.model else "low"})
    generator=llm.with_structured_output(Draft,method="json_schema")
    quiz_bank=json.loads((BACKEND/"data"/"quiz-bank.json").read_text(encoding="utf-8"))
    outputs=[]
    for artifact,info in ARTIFACTS.items():
        chunks={item["id"]:item for item in corpus.chunks if item["artifact_id"]==artifact}
        prompt="""Tạo bản nháp thuyết minh tiếng Việt và 5 câu đố trắc nghiệm, chỉ từ hồ sơ sau.
Trong narration, chọn 4-6 đoạn quote nguyên văn liên tiếp từ text của đúng chunk_id,
sắp xếp thành câu chuyện: giới thiệu, hình dáng, phát hiện/kiểu loại, đặc điểm. Không viết thêm dữ kiện.
Mỗi quiz có 4 lựa chọn khác nhau, 1 đáp án đúng; đáp án đúng PHẢI là chuỗi con nguyên văn của quote hỗ trợ.
quote phải là chuỗi con nguyên văn của text, không được sửa dấu/số. Câu hỏi không được thêm tiền đề sai.
Dao găm chỉ là loại hình, không hỏi kích thước/xuất xứ riêng của mô hình demo.
Tiêu đề ngắn, không dùng khẳng định lịch sử ngoài nguồn. Đây là bản nháp sẽ được người duyệt.
"""+json.dumps({"artifact":info["name"],"evidence":list(chunks.values())},ensure_ascii=False)
        try:
            result=generator.invoke(prompt)
            for passage in result.narration:
                assert passage.chunk_id in chunks
                # Render the stored source paragraph, not a possibly altered model copy.
                passage.quote=chunks[passage.chunk_id]["text"]
            quiz_valid=True
            for quiz in result.quizzes:
                if quiz.chunk_id not in chunks:
                    quiz_valid=False
                    break
                quiz.quote=chunks[quiz.chunk_id]["text"]
                if normalize(quiz.options[quiz.correct_index]) not in normalize(quiz.quote) or len(set(quiz.options))!=4:
                    quiz_valid=False
                    break
            if not quiz_valid:
                result.quizzes=[Quiz(**item,quote=chunks[item["chunk_id"]]["text"]) for item in quiz_bank[artifact]]
                print(f"Used curated source-linked quiz bank for: {artifact}",flush=True)
            outputs.append({"artifact_id":artifact,"name":info["name"],"review_required":True,
                            "quiz_origin":"ai_source_checked" if quiz_valid else "curated_source_checked",**result.model_dump()})
            print(f"Generated and validated: {artifact}",flush=True)
        except Exception as exc:
            print(f"Draft generation failed for {artifact}: {type(exc).__name__}; no unvalidated draft was saved.")
            raise SystemExit(1)
    docs=REPOSITORY/"docs"; docs.mkdir(exist_ok=True)
    payload={"corpus_version":corpus.version,"model":settings.model,"review_required":True,"artifacts":outputs}
    (docs/"story-quiz-drafts.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding="utf-8")
    lines=["# Kịch bản và câu đố — bản nháp chờ nhóm duyệt","","Nội dung được AI chọn/tạo từ corpus có nguồn. Cần Phú/nhóm duyệt câu hỏi, cách diễn đạt và thời lượng trước khi Quân tạo giọng đọc. Các phương án sai chỉ dùng trong trắc nghiệm.",""]
    for item in outputs:
        lines += [f"## {item['name']}: {item['title']}","","### Thuyết minh",""]
        if item["artifact_id"]=="dagger":
            lines += ["Lời mở đầu bắt buộc: Mô hình trong demo minh họa loại hình dao găm Đông Sơn; chưa xác định là bản sao của một hiện vật cụ thể.",""]
        for passage in item["narration"]:
            source=corpus.sources[chunks_source(corpus,passage["chunk_id"]) ]
            lines += [passage["quote"],f"Nguồn: [{source['title']}]({source['url']}) · `{passage['chunk_id']}`",""]
        lines += ["### Câu đố",""]
        for number,quiz in enumerate(item["quizzes"],1):
            lines += [f"{number}. {quiz['question']}",""]
            lines += [f"   {chr(65+i)}. {option}" for i,option in enumerate(quiz["options"])]
            lines += ["",f"Đáp án: {chr(65+quiz['correct_index'])}. Căn cứ: {quiz['quote']} (`{quiz['chunk_id']}`).",""]
    (docs/"story-quiz-review.md").write_text("\n".join(lines),encoding="utf-8")
    print("Saved docs/story-quiz-review.md and docs/story-quiz-drafts.json")


def chunks_source(corpus,chunk_id):
    return corpus.by_id[chunk_id]["source_id"]


if __name__=="__main__":
    main()
