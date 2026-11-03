"""Build reviewable QA and cost documents from measured test results; no API calls."""
from collections import defaultdict
import csv
import json
from pathlib import Path
import statistics
import sys
import xml.etree.ElementTree as ET
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.config import BACKEND, REPOSITORY
from app.corpus import normalize

docs=REPOSITORY/"docs"
qa=json.loads((docs/"qa-live.json").read_text(encoding="utf-8"))
browser=json.loads((docs/"browser-checks.json").read_text(encoding="utf-8")) if (docs/"browser-checks.json").exists() else {}
voice=json.loads((docs/"voice-checks.json").read_text(encoding="utf-8")) if (docs/"voice-checks.json").exists() else {}
conversation=json.loads((docs/"conversation-checks.json").read_text(encoding="utf-8")) if (docs/"conversation-checks.json").exists() else {}
semantic=json.loads((docs/"semantic-audit-live.json").read_text(encoding="utf-8")) if (docs/"semantic-audit-live.json").exists() else {}
corpus=json.loads((BACKEND/"data"/"corpus.json").read_text(encoding="utf-8"))
matrix=json.loads((BACKEND/"tests"/"semantic_cases.json").read_text(encoding="utf-8"))
base_questions=sum(len(group["questions"]) for group in matrix)
variants=sum(len(set((q,normalize(q)))) for group in matrix for q in group["questions"])
pytest_path=BACKEND/"storage"/"final-tests.xml"
pytest_summary="chưa có bản JUnit"
if pytest_path.exists():
    suites=ET.parse(pytest_path).getroot().findall("testsuite")
    tests=sum(int(s.get("tests",0)) for s in suites)
    failed=sum(int(s.get("failures",0))+int(s.get("errors",0))+int(s.get("skipped",0)) for s in suites)
    pytest_summary=f"{tests-failed}/{tests} ca qua"
answered=[item["response"] for item in qa["results"] if item.get("response",{}).get("status")=="answered"]
mean_in=statistics.mean(item["usage"].get("input_tokens",0) for item in answered)
mean_out=statistics.mean(item["usage"].get("output_tokens",0) for item in answered)
latencies=sorted(item["elapsed_ms"] for item in answered)
median=statistics.median(latencies)
p95=latencies[min(len(latencies)-1,int(.95*(len(latencies)-1)))]
price_in=.30; price_out=2.50; price_embed=.15
cost=mean_in*price_in/1_000_000+mean_out*price_out/1_000_000
groups=defaultdict(lambda:[0,0])
for item in qa["results"]:
    groups[item["group"]][0]+=int(item["passed"])
    groups[item["group"]][1]+=1

lines=["# Kết quả kiểm tra RAG","",f"Model: `{qa['model']}`. Embedding: `{qa['embedding_model']}`. Corpus: `{qa['corpus_version']}`.","",
       f"Bộ mẫu: **{qa['passed']}/{qa['total']} ca qua**. Đây là kiểm tra trạng thái kỳ vọng, các dữ kiện chính và trích dẫn tại runtime; chưa thay thế người duyệt lịch sử.","",
       "| Nhóm | Qua / Tổng |","|---|---|"]
lines += [f"| {name} | {counts[0]} / {counts[1]} |" for name,counts in groups.items()]
lines += ["",f"Kho hiện hành: {len(corpus['chunks'])} đoạn có nguồn, từ {len(corpus['sources'])} bài/hồ sơ trên cổng Bảo tàng. Xem `source-audit.md` về mức độ chắc chắn và số liệu mâu thuẫn.","",
          f"Trên {len(answered)} câu được trả lời: trung vị {median:.0f} ms, P95 theo mẫu {p95} ms; trung bình {mean_in:.1f} token vào và {mean_out:.1f} token ra. Câu nhận diện hiện vật dùng tên mục đã chọn; câu chất liệu/khám phá dùng mẫu câu gắn với đoạn nguồn, nên có thể có số token bằng 0. Số đo gồm bước truy xuất/gọi model, không phải SLA cho mọi thiết bị hoặc thời điểm.","",
          "Các bản trước sửa/thử lại được giữ trong `qa-live-before-*.json` và `semantic-audit-before-*.json`. Kết quả cuối có thể gồm lần thử lại riêng ca bị lỗi sau một sửa đổi có mục tiêu; đọc `attempted_this_run` trong JSON để phân biệt.","",
          "## Kiểm tra phần mềm","",f"- Pytest: {pytest_summary}, đọc từ JUnit thực tế; gồm Chroma, metadata, session, nguồn giả, phân quyền và ngữ nghĩa câu hỏi.",
          f"- Ma trận đúng ý hỏi: {base_questions} cách hỏi gốc, {variants} biến thể có/không dấu. Kiểm tra trường cần trả lời, thông tin không được trả lạc sang và nguồn bắt buộc.",
          f"- Trình duyệt Edge: {browser.get('passed','chưa chạy')} kiểm tra qua. Các tương tác dùng phản hồi giả lập, riêng các lượt cuối gọi backend và Gemini thật; kiểm tra nguồn mở rộng và nút Dừng chờ.",
          f"- STT với giọng nói tiếng Việt tổng hợp: {'qua' if voice.get('passed') else 'chưa xác nhận'}. Xem `voice-checks.json`; micro giả lập không chứng minh chất lượng micro thật.",
          "- Frontend TypeScript/Vite build thành công; lint không có lỗi. Còn ba cảnh báo ở code viewer/video ban đầu của Vũ và cảnh báo bundle khoảng 839 kB.","",
          "## Giới hạn cần trình bày đúng","","- Câu quen thuộc dùng cách diễn đạt thân thiện gắn với hồ sơ nguồn. Câu mở được Gemini diễn đạt lại; backend xác thực đoạn bằng chứng và kiểm tra các số xuất hiện trong đáp án. Nguồn chỉ mở rộng khi khách cần.",
          "- Kiểm tra quote và con số không chứng minh đầy đủ mọi diễn giải ngữ nghĩa của model. Kết quả bộ mẫu không bảo đảm đúng tuyệt đối với câu hỏi chưa thử.",
          "- Với bộ demo nhỏ, Chroma đọc toàn bộ các đoạn của đúng hiện vật tại máy; không gọi API embedding cho mỗi câu. Model có timeout 15 giây, frontend chờ tối đa 25 giây và có Dừng chờ. Xem số đo API ở `conversation-checks.json`.",
          "- Mẫu dao là minh họa loại hình. Không có kích thước, mã kiểm kê hay nơi phát hiện riêng của mô hình 3D.",
          "- Hồ sơ đang ở trạng thái chờ nhóm duyệt, chưa ghi nhận sự phê duyệt của cán bộ bảo tàng.",
          "- Cần Phú thử micro thật, tiếng ồn nền và thiết bị đích. Điện thoại cần HTTPS để xin quyền micro.",""]
if semantic:
    lines += ["## Câu hỏi mở và hội thoại nhiều lượt", "", f"{semantic['passed']}/{semantic['total']} tình huống đạt tiêu chí trong `semantic-audit-live.json`. Mỗi ca có rubric riêng về ý hỏi, từng vế, nguồn và sự không chắc chắn. Một lượt Gemini riêng hỗ trợ đánh giá; các ca số liệu có kiểm tra nội dung bắt buộc bổ sung. Đây không phải phê duyệt chuyên gia và không được chỉ dựa vào điểm model.","", "Đã kiểm tra các cặp dễ nhầm: mô tả/cảm hứng/ý nghĩa, ngày phát hiện/tình trạng khi phát hiện, bằng chứng sử dụng/lý do lựa chọn, tên gọi/nơi đào thấy, số ban đầu/hiện trạng theo hồ sơ. Câu hỏi nhiều ý có phần chưa biết phải nêu rõ từng phần, không từ chối chung hoặc bỏ qua phần khó.",""]
if conversation:
    lines += ["## Kiểm tra API hội thoại và độ trễ", "", f"Phiên bản: `{conversation.get('service_version')}`; {conversation['passed']}/{conversation['total']} ca qua. Đo trên máy demo, không phải cam kết độ trễ cho mọi mạng/thiết bị.", "", "| Câu hỏi | Thời gian HTTP (ms) |", "|---|---:|"]
    lines += [f"| {item['question']} | {item['end_to_end_ms']} |" for item in conversation["results"]]
(docs/"rag-evaluation.md").write_text("\n".join(lines),encoding="utf-8")

rows=[
    ["Input price",price_in,"USD / 1M tokens","Gemini 3.5 Flash-Lite, Standard paid reference"],
    ["Output price",price_out,"USD / 1M tokens","Includes thinking tokens at provider rates"],
    ["Embedding price",price_embed,"USD / 1M tokens","Gemini embedding-001"],
    ["Measured mean input",round(mean_in,2),"tokens / answered question",f"From {len(answered)} answered QA cases; includes deterministic zero-token replies"],
    ["Measured mean output",round(mean_out,2),"tokens / answered question",f"From {len(answered)} answered QA cases; includes deterministic zero-token replies"],
    ["Questions per visit",5,"questions","Editable planning assumption, not measured visitor behavior"],
    ["Visits per month",1000,"visits","Editable planning assumption"],
    ["Hosting per month",0,"USD","Local demo only; replace with hosting quote before production"],
    ["Pricing source","https://ai.google.dev/gemini-api/docs/pricing","URL","Checked 2026-11-02; recheck before presenting"],
    ["Chat cost per answered question","=B5*B2/1000000+B6*B3/1000000","USD","Reference paid rates, not actual invoice"],
    ["Chat cost per visit","=B11*B7","USD","Excludes STT and embedding"],
    ["Monthly chat cost","=B12*B8","USD","Excludes STT, embeddings, TTS, operations and taxes"],
    ["Chat plus hosting subtotal","=B13+B9","USD","Partial cost only"],
    ["STT input price",price_in,"USD / 1M tokens","Same configured Flash-Lite model; no live audio API"],
    ["STT output price",price_out,"USD / 1M tokens","Text transcription output"],
    ["Measured STT clip input",voice.get("usage",{}).get("input_tokens",0),"tokens","Synthetic speech fixture, not museum average"],
    ["Measured STT clip output",voice.get("usage",{}).get("output_tokens",0),"tokens","Synthetic speech fixture"],
    ["STT cost for measured clip","=B15*B17/1000000+B16*B18/1000000","USD","Not an estimate for every clip duration"],
    ["Document embedding tokens","","tokens","Not measured; do not claim an exact indexing cost"],
    ["Document embedding cost",'=IF(ISNUMBER(B20),B20*B4/1000000,"")',"USD","One-off until corpus/model changes"],
]
with (docs/"ai-cost-calculator.csv").open("w",encoding="utf-8-sig",newline="") as handle:
    writer=csv.writer(handle);writer.writerow(["Metric","Value","Unit","Basis / limitation"]);writer.writerows(rows)
cost_text=f"""# Chi phí AI — số đo và giả định

Model chạy demo: `{qa['model']}`. Bảng tính: `ai-cost-calculator.csv`, mở bằng Excel hoặc nhập vào Google Sheets; sửa các ô giả định trước khi dùng để pitching.

Giá Standard trả phí tham chiếu, đối chiếu ngày 02/11/2026: Flash-Lite đầu vào $0.30/triệu token, đầu ra $2.50/triệu token; embedding-001 $0.15/triệu token. Nguồn: [Google pricing](https://ai.google.dev/gemini-api/docs/pricing). Đây không phải hóa đơn tài khoản hiện tại và không giả định tài khoản luôn còn quota miễn phí.

Trên {len(answered)} câu có đáp án trong bộ QA: trung bình {mean_in:.1f} token vào, {mean_out:.1f} token ra. Một số câu nhận diện/chất liệu/nơi phát hiện dùng mẫu câu cố định nên tiêu thụ 0 token Gemini. Công thức một câu: `input_tokens × 0.30 / 1,000,000 + output_tokens × 2.50 / 1,000,000`, xấp xỉ **${cost:.6f}/câu** theo giá tham chiếu.

Ví dụ lập kế hoạch, CHƯA phải hành vi đo được: 5 câu/khách → ${cost*5:.6f}/khách; 1.000 khách/tháng → ${cost*5000:.4f}/tháng chỉ cho chat. Phải cộng STT, embedding khi tạo index, hosting, lưu trữ, vận hành, TTS và thuế nếu phát sinh. Bộ demo nhỏ hiện đọc các đoạn đã lọc trong Chroma cục bộ, không gọi embedding truy vấn cho mỗi câu. Chưa đo token embedding nên chưa đưa ra số tiền indexing chính xác. Số đo token STT trong bảng chỉ thuộc clip tổng hợp dùng kiểm tra.

Chi phí toàn dự án còn cần nhóm cung cấp: số khách, tỷ lệ mua, giá vốn in, phí thanh toán, ngân sách hosting và bên nhận tỷ lệ chia doanh thu. Giá ảnh 30k/50k và tỷ lệ 70/30 trong workflow là giả định thiết kế, chưa chứng minh lợi nhuận. Không tính toàn bộ chi phí ElevenLabs hay sản xuất video vào một lượt chat; đó là các nhóm chi phí riêng cần phối hợp Quân.

Nếu Excel hiện công thức như văn bản, chọn nhập CSV và dùng dấu phân cách dấu phẩy. Các giá trị USD không được quy đổi sang VND khi chưa chốt tỷ giá giả định.
"""
(docs/"ai-costs.md").write_text(cost_text,encoding="utf-8")
print(f"Reports exported. QA {qa['passed']}/{qa['total']}; median {median} ms; reference chat cost ${cost:.6f}.")
