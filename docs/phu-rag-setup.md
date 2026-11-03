# Chạy và hiểu phần RAG của Phú

## Mở demo hiện tại

Chạy `start-demo.cmd` trong thư mục repo. Script kiểm tra môi trường, mở backend ở `127.0.0.1:8000`, frontend ở `localhost:5173`, nạp index nếu thiếu và mở trình duyệt. Các helper chạy nền, log nằm ở `backend/storage/`.

Launcher so phiên bản từ `backend/service-version.txt` với `/api/health`. Nếu cần thay backend cũ, nó dừng đúng tiến trình sở hữu cổng 8000 của dự án, gồm cả trường hợp Python chạy qua tiến trình con trên Windows.

Mở Sandbox bằng `open-sandbox.cmd`. Script dùng mã nhóm lưu cục bộ; URL mở ban đầu có mã trong fragment rồi giao diện xóa fragment. Không chia sẻ liên kết có mã. Nếu nhập tay, mã nằm ở `backend/storage/admin-token.txt`, hoặc `ADMIN_TOKEN` nếu đã cấu hình riêng. Token không phải Gemini API key.

Trình tự thao tác khách: chọn hiện vật → mở Hỏi AI → nhập câu hỏi hoặc giữ nút micro → xem/sửa chữ → Gửi → mở Nguồn tham khảo.

## Chạy bằng Terminal

Các lệnh dưới đây chạy từ thư mục `hist rag chatbox`, là thư mục cha của repo:

```powershell
.\.venv\Scripts\python.exe -m pip install -r HIST_2026\backend\requirements-dev.txt
.\.venv\Scripts\python.exe -X utf8 HIST_2026\backend\scripts\ingest.py
.\.venv\Scripts\python.exe -X utf8 -m uvicorn app.main:app --app-dir HIST_2026/backend --host 127.0.0.1 --port 8000
```

Mở Terminal thứ hai:

```powershell
cd HIST_2026\frontend
npm ci
npm run dev -- --strictPort
```

Không chạy thêm server nếu cổng đã có demo hoạt động. Ctrl+C trong Terminal đã mở server để dừng. Những tiến trình chạy nền từ launcher được xem/dừng trong Task Manager; nhận diện theo lệnh uvicorn và Vite của dự án này.

## Cấu hình

Key hiện nằm ở `.env` của workspace. Thứ tự đọc file: workspace `.env` → repo `.env` → `backend/.env`; biến môi trường hệ điều hành có ưu tiên cao nhất. Key chỉ dùng trên backend. `backend/.env` hiện chỉ có tên model, không sao chép key sang frontend.

- Model chat/STT: `gemini-3.5-flash-lite`, đã thử thật với tài khoản hiện tại.
- Embedding: `gemini-embedding-001`, 768 chiều, vector được chuẩn hóa.
- Gemini 3.8 Flash từng báo quá tải; Gemini 2.5 Flash bị API từ chối với tài khoản mới dù còn trong danh sách model. Không mặc định mọi model được liệt kê đều gọi được.
- Khi đổi embedding hoặc dữ liệu, chạy lại ingest. Tên collection chứa fingerprint nên không dùng nhầm vector cũ. Ingest lại cùng dữ liệu không nhân bản chunk.

## Những file cần đọc để hiểu phần mình

| File | Vai trò |
|---|---|
| `frontend/src/App.tsx` | Nhận `selectedId` từ scene của Vũ, truyền vào chat; chọn chế độ Sandbox |
| `frontend/src/components/ChatAssistant.tsx` | Hội thoại riêng theo hiện vật, gửi câu hỏi và hiện nguồn |
| `frontend/src/components/PushToTalk.tsx` | Xin micro, giữ/bấm để ghi, chuyển âm thanh thành chữ |
| `frontend/src/components/RagSandbox.tsx` | Khung thử nghiệm có mã truy cập |
| `frontend/src/lib/api.ts` | Giao tiếp HTTP, session của tab và thời gian chờ |
| `backend/app/main.py` | API, phân quyền Sandbox, giới hạn yêu cầu, STT |
| `backend/app/rag.py` | Phạm vi, lịch sử, chọn bằng chứng, kiểm tra trích dẫn |
| `backend/app/conversation.py` | Phân tích chủ đề + thao tác + trường dữ liệu, giữ ngữ cảnh, câu nhiều ý |
| `backend/app/vector.py` | Embedding và Chroma persistence |
| `backend/app/corpus.py` | Registry ba mã, chuẩn hóa câu hỏi, kiểm tra metadata |
| `backend/data/corpus.json` | 46 đoạn từ 10 bài/hồ sơ, nhãn mức chắc chắn và mâu thuẫn nguồn |
| `backend/data/answers.json` | Lời đáp theo trường dữ kiện, có ID nguồn bắt buộc |

## Hợp đồng với Vũ

```json
{"question":"Cái này cao bao nhiêu?","artifact_id":"drum","session_id":"visitor-session-id"}
```

| Khóa dùng trong API/metadata `artifact_id` | Metadata `corpus_id` |
|---|---|
| drum | NL-01 |
| jar | DT-01 |
| dagger | DG-DS-01 |

Điểm khác với ví dụ sơ bộ trong ghi chú bàn giao ban đầu: code hiện dùng `artifact_id=drum/jar/dagger` nhất quán cả frontend và Chroma; mã PDF nằm trong trường `corpus_id`. Không gửi `NL-01` vào `artifact_id` của API.

Backend chỉ nhận ba khóa trên; tạo filter ở server, lọc cả phiên bản corpus và `source_checked`. Lịch sử giữ tối đa sáu lượt hỏi/đáp theo hiện vật, hết hạn sau một giờ và chỉ trong một process. Không giữ khóa session khi chờ mạng, nên lượt gọi bị chậm không chặn câu hỏi mới. Không lưu hội thoại khách vào log. Bản demo chạy một worker; khi triển khai nhiều worker cần kho session/giới hạn lượt gọi dùng chung.

Câu hỏi được phân biệt theo chủ đề và thao tác trước khi tra dữ kiện: cùng nói về hoa văn nhưng hỏi hình gì, ý nghĩa, cảm hứng hay cách tạo là các yêu cầu khác nhau. Câu quen thuộc dùng lời đáp có nguồn theo đúng trường dữ liệu; các câu nhiều ý rõ ràng được ghép đủ từng phần, phần chưa biết được nói riêng. Câu hỏi mở được Gemini viết lại tự nhiên cùng bằng chứng nguyên văn. Nếu đáp án model không hợp lệ, backend không lấy một đoạn mô tả chung để thay thế lời giải thích còn thiếu. Các kiểm tra không chứng minh đầy đủ mọi diễn giải của model. URL chỉ lấy từ registry, nguồn nằm trong mục mở rộng.

Mỗi hiện vật hiện có 11–18 đoạn ngắn, nên Chroma đọc tập đoạn đúng metadata tại máy và bỏ lượt gọi embedding cho từng câu hỏi. Model chờ tối đa 15 giây; frontend giới hạn 25 giây và có nút Dừng chờ. Câu trả lời model được cache trong RAM tối đa 5 phút, 128 mục. Không tìm kiếm web khi khách hỏi. Xem `source-audit.md` để hiểu cách xử lý các số đo chưa thống nhất thay vì tự chọn một giá trị.

## API

| Đường dẫn | Quyền | Chức năng |
|---|---|---|
| GET `/api/health` | Khách | Trạng thái index/cấu hình, không trả secret |
| POST `/api/chat` | Khách | Câu trả lời và nguồn |
| POST `/api/transcribe` | Khách | Clip → chữ, tối đa 8 MiB |
| GET `/api/admin/corpus` | Bearer token | Hồ sơ đối chiếu |
| POST `/api/admin/chat` | Bearer token | Câu trả lời và debug truy xuất |
| GET `/api/admin/metrics` | Bearer token | Tổng số đo chat, không chứa câu hỏi |

Không có hiện vật → `needs_selection`. Không đủ bằng chứng → `insufficient_evidence`. Ngoài phạm vi/chuyển sang hiện vật khác → `out_of_scope`. Yêu cầu hợp lệ có đáp án → `answered`. ID lạ hoặc câu hỏi trống/quá dài bị lỗi xác thực 422.

Dịch vụ AI mất kết nối/không phản hồi hợp lệ → `temporarily_unavailable`; giao diện báo sự cố kết nối bằng lời ngắn gọn thay vì nhầm thành thiếu dữ kiện lịch sử. Các câu được xử lý từ hồ sơ cục bộ vẫn dùng được.

## Micro và thiết bị

Clip được gửi đến Gemini khi kết thúc ghi, không được lưu nguyên âm thanh trên server; log chỉ giữ số đo token/kích thước và độ trễ. `noiseSuppression` là yêu cầu gửi trình duyệt, không phải cam kết khử hết ồn. Không để bộ nhận dạng âm thanh trả lời trực tiếp: văn bản vẫn đi qua RAG sau khi khách xem/sửa.

`localhost` trên laptop dùng được cho micro. Điện thoại qua IP LAN HTTP không bảo đảm xin được micro; cần HTTPS khi đưa lên thiết bị đó. Chưa tự công bố demo ra Internet hay cấu hình tài khoản hosting. Cần kiểm tra thực tế Safari/iOS/Android trước khi cam kết hỗ trợ.

## Kiểm tra lại khi sửa code

```powershell
.\.venv\Scripts\python.exe -m pytest HIST_2026\backend\tests -q
.\.venv\Scripts\python.exe -X utf8 HIST_2026\backend\scripts\browser_check.py
.\.venv\Scripts\python.exe -X utf8 HIST_2026\backend\scripts\evaluate.py --live
```

Lệnh có `--live` gọi API thật và dùng quota. Bộ đánh giá đã giãn nhịp; nếu gặp 429 hãy kiểm tra quota thay vì chạy lặp liên tục. Kiểm tra chỉ bằng mẫu không chứng minh chatbot luôn đúng. Xem `rag-evaluation.md` và các JSON gốc để phân biệt mock, AI thật và phần đang chờ người thử.

PDF sáu trang trong workspace là tài liệu tham khảo ban đầu, chưa phản ánh toàn bộ lần đối chiếu nguồn mới; không dùng nó để nạp lại dữ liệu hiện hành. Dữ liệu truy xuất chính nằm trong `backend/data/corpus.json`, lời đáp đối chiếu trong `backend/data/answers.json`, và ghi chú nguồn tại `docs/source-audit.md`. Không tự nạp mọi chữ trong PDF vào một kho chung vì có thể trộn hiện vật. `scripts/extract_pdf.py` hỗ trợ bóc chữ PDF để đối chiếu trước khi cập nhật corpus.
