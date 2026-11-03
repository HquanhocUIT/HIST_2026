# Bàn giao phần của Phú

## Nền code Vũ

Nhánh triển khai: `feature/phu-rag-chatbot`, tách từ `feature/7-animated-history-tab` ở commit `10b16a7`.

Chuỗi commit nền của Vũ:

| Commit | Nội dung |
|---|---|
| 9fea212 | Viewer 3D tương tác |
| 384dcc9 | Thông tin hiện vật có nguồn và hotspot |
| b9e0fad | Tab câu chuyện, video và tủ trưng bày |
| 10b16a7 | Cải thiện mô hình thạp Đào Thịnh |

Điểm nối chính: `InteractiveScene` gọi `onSelect(id)` → `App.tsx` lưu `selectedId` → `ChatAssistant` gửi ID cùng câu hỏi. Vũ dùng Three.js dựng các mesh trong `InteractiveScene.tsx`; ba video có ánh xạ trong `StoryPlayer.tsx`. Thông tin tĩnh nằm ở `exhibitInformation.ts`, kịch bản cũ ở `exhibitStories.ts`.

Trong commit nền, khung trợ lý là placeholder. Các phần camera MindAR và toàn bộ Admin/CMS trong master plan chưa có trong nhánh nền; Sandbox dưới đây là phần mới phục vụ thử RAG.

## Phần mới đã triển khai

| Hạng mục | Đầu ra |
|---|---|
| Dữ liệu | 46 đoạn đối chiếu từ 10 bài/hồ sơ trên cổng Bảo tàng, có nhãn dữ kiện/diễn giải/mâu thuẫn nguồn |
| RAG | FastAPI + LangChain + Gemini + Chroma lưu bền; ingest lại không nhân bản |
| Phạm vi | Bộ lọc metadata bắt buộc theo ID ở server; lịch sử riêng cho mỗi session và hiện vật |
| Câu trả lời | Câu quen thuộc dùng lời đáp đã đối chiếu; câu mở để Gemini diễn đạt tự nhiên kèm bằng chứng. Backend kiểm tra quote, ID và dữ kiện số; nguồn mở rộng riêng |
| Câu hỏi ngắn quen thuộc | Chuẩn hóa cách gõ Telex; câu hỏi tên, chất liệu và phát hiện dùng dữ kiện/đoạn nguồn của đúng hiện vật đã chọn |
| Đúng ý hỏi | Phân biệt chủ đề và thao tác: mô tả, cảm hứng, ý nghĩa, nguyên nhân, chế tác; giữ ngữ cảnh và giải đáp từng vế |
| Chat UI | Hỏi bằng chữ, câu gợi ý, nguồn mở rộng, lỗi và gửi lại, hủy lượt hỏi khi đổi hiện vật |
| Giọng nói | Giữ hoặc bấm để ghi, giới hạn 30 giây ở UI, STT qua backend, cho sửa chữ trước khi gửi |
| Sandbox | Có mã truy cập; xem corpus, câu trả lời, đoạn truy xuất và tổng số đo |
| Nội dung | Ba bản nháp thuyết minh và 15 câu đố, kiểm tra nguồn/đáp án và chờ nhóm duyệt |
| Slide/chi phí | Nội dung năm slide, CSV có công thức và số đo token thực tế |
| Video | Clip WebM thao tác với API thật, canvas Full HD, lời dẫn bàn giao riêng |

## Mapping chính thức trong code hiện tại

| UI | `artifact_id` | `corpus_id` | Mục |
|---|---|---|---|
| 01 | drum | NL-01 | Trống đồng Ngọc Lũ |
| 02 | jar | DT-01 | Thạp đồng Đào Thịnh |
| 03 | dagger | DG-DS-01 | Dao găm Đông Sơn minh họa loại hình |

`artifact_id` dùng cùng một giá trị ở API và Chroma. Backend gắn thêm `corpus_id` theo mã PDF. Số 01/02/03 chỉ để hiển thị; vị trí hotspot là tọa độ scene.

## Kết quả kiểm tra

- 290 kiểm thử qua; trong đó ma trận nội dung có 117 cách hỏi gốc và các biến thể không dấu, kiểm tra cả thông tin cần có và thông tin không được trả lạc sang.
- 70/70 câu QA đạt tiêu chí mẫu, có các câu hỏi trong ảnh báo lỗi và kiểm tra lời đáp không chen trích dẫn/hành văn bài báo.
- 18 kiểm tra browser, gồm đúng chuỗi câu hỏi hoa văn trong ảnh và việc công khai số đo chưa thống nhất.
- 20 tình huống ngữ nghĩa/hội thoại có rubric riêng, kiểm tra nội dung bắt buộc và lượt model đánh giá riêng; đây không phải phê duyệt của chuyên gia lịch sử.
- Nhận đúng câu tiếng Việt từ clip tổng hợp qua endpoint STT thật. Chưa thay thế thử micro thật.
- Build TypeScript/Vite thành công; lint không có lỗi nhưng còn ba cảnh báo ở viewer/video nền và cảnh báo bundle khoảng 839 kB.

Xem dữ liệu và giới hạn tại `rag-evaluation.md`, `qa-live.json`, `browser-checks.json`, `voice-checks.json`. Không diễn giải bộ mẫu thành bảo đảm 0% lỗi cho mọi câu hỏi.

Đối chiếu nguồn: `source-audit.md`. Ví dụ chiều cao thạp có số 98/87/90 cm giữa các hồ sơ; chân trống có 80/81 cm. Bot giữ nguồn tương ứng, không tự chốt hay bịa lý do chênh lệch. Khối lượng trống 86 kg đã bổ sung sau khi có nguồn. Các đoạn và lời đáp có nguồn nằm ở `backend/data/corpus.json` và `answers.json`.

Lượt kiểm tra tốc độ/cách nói riêng được ghi ở `conversation-checks.json`. Demo đọc các đoạn Chroma đúng hiện vật tại máy, không gọi embedding cho từng câu; câu hỏi mở có timeout model 15 giây, frontend 25 giây. Launcher so phiên bản để thay đúng tiến trình Python con đang giữ cổng khi cần cập nhật.

## Việc cần Phú trực tiếp xác nhận

1. **Micro thực tế:** mở demo trên localhost, cấp quyền, nói các tên riêng, thử môi trường có tiếng nói nền và kiểm tra bản chép lời. Nếu dùng điện thoại, cần đường HTTPS và kiểm tra trình duyệt đích.
2. **Nội dung:** đọc các đoạn trong Sandbox hoặc `backend/data/corpus.json`, duyệt `story-quiz-review.md`, xác nhận cách giới thiệu dao là minh họa. Sau khi duyệt mới ghi nhận trạng thái người duyệt và bàn giao Quân tạo audio.
3. **Tài chính tổng:** nhóm chốt khách/tháng, số câu/khách, giá vốn in, phí thanh toán, hosting và các bên nhận chia doanh thu. Bảng CSV đã có phần AI đo được; không suy ra lợi nhuận toàn dự án từ con số đó.
4. **Video/slides:** xem clip trong `docs/demo/`, duyệt lời dẫn và chuyển cho Quân phối hợp dựng cuối. Clip hiện có thao tác và câu trả lời thật; chưa có lời dẫn/nhạc.

Tài khoản API hiện gọi được, không cần tạo key mới. Khi cần triển khai lên hosting hoặc công bố, phải cấu hình tài khoản đích, HTTPS, persistence, giới hạn quota và quyền Sandbox theo môi trường đó; bản hiện tại là demo cục bộ.

## Thứ tự đọc nếu muốn hiểu để thuyết trình

1. Đọc luồng trong `phu-rag-setup.md` và API request mẫu.
2. Mở `App.tsx`, tìm `selectedId`, rồi xem `ChatAssistant.tsx`.
3. Đọc `backend/app/rag.py`: kiểm tra phạm vi → truy xuất → chọn bằng chứng → kiểm tra quote → nguồn.
4. Đọc `backend/app/vector.py` để giải thích embedding và lọc Chroma.
5. Mở `rag-evaluation.md` và bảng chi phí để biết số nào là đo được, số nào là giả định.
