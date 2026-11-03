# Kết quả kiểm tra RAG

Model: `gemini-3.5-flash-lite`. Embedding: `gemini-embedding-001`. Corpus: `ae1e7fc0c34fdd29`.

Bộ mẫu: **70/70 ca qua**. Đây là kiểm tra trạng thái kỳ vọng, các dữ kiện chính và trích dẫn tại runtime; chưa thay thế người duyệt lịch sử.

| Nhóm | Qua / Tổng |
|---|---|
| conversation | 4 / 4 |
| injection | 6 / 6 |
| known | 30 / 30 |
| missing | 8 / 8 |
| outside | 9 / 9 |
| researched | 1 / 1 |
| switch | 6 / 6 |
| typo | 6 / 6 |

Kho hiện hành: 46 đoạn có nguồn, từ 10 bài/hồ sơ trên cổng Bảo tàng. Xem `source-audit.md` về mức độ chắc chắn và số liệu mâu thuẫn.

Trên 40 câu được trả lời: trung vị 0 ms, P95 theo mẫu 1 ms; trung bình 43.6 token vào và 3.1 token ra. Câu nhận diện hiện vật dùng tên mục đã chọn; câu chất liệu/khám phá dùng mẫu câu gắn với đoạn nguồn, nên có thể có số token bằng 0. Số đo gồm bước truy xuất/gọi model, không phải SLA cho mọi thiết bị hoặc thời điểm.

Các bản trước sửa/thử lại được giữ trong `qa-live-before-*.json` và `semantic-audit-before-*.json`. Kết quả cuối có thể gồm lần thử lại riêng ca bị lỗi sau một sửa đổi có mục tiêu; đọc `attempted_this_run` trong JSON để phân biệt.

## Kiểm tra phần mềm

- Pytest: 290/290 ca qua, đọc từ JUnit thực tế; gồm Chroma, metadata, session, nguồn giả, phân quyền và ngữ nghĩa câu hỏi.
- Ma trận đúng ý hỏi: 117 cách hỏi gốc, 234 biến thể có/không dấu. Kiểm tra trường cần trả lời, thông tin không được trả lạc sang và nguồn bắt buộc.
- Trình duyệt Edge: 18 kiểm tra qua. Các tương tác dùng phản hồi giả lập, riêng các lượt cuối gọi backend và Gemini thật; kiểm tra nguồn mở rộng và nút Dừng chờ.
- STT với giọng nói tiếng Việt tổng hợp: qua. Xem `voice-checks.json`; micro giả lập không chứng minh chất lượng micro thật.
- Frontend TypeScript/Vite build thành công; lint không có lỗi. Còn ba cảnh báo ở code viewer/video ban đầu của Vũ và cảnh báo bundle khoảng 839 kB.

## Giới hạn cần trình bày đúng

- Câu quen thuộc dùng cách diễn đạt thân thiện gắn với hồ sơ nguồn. Câu mở được Gemini diễn đạt lại; backend xác thực đoạn bằng chứng và kiểm tra các số xuất hiện trong đáp án. Nguồn chỉ mở rộng khi khách cần.
- Kiểm tra quote và con số không chứng minh đầy đủ mọi diễn giải ngữ nghĩa của model. Kết quả bộ mẫu không bảo đảm đúng tuyệt đối với câu hỏi chưa thử.
- Với bộ demo nhỏ, Chroma đọc toàn bộ các đoạn của đúng hiện vật tại máy; không gọi API embedding cho mỗi câu. Model có timeout 15 giây, frontend chờ tối đa 25 giây và có Dừng chờ. Xem số đo API ở `conversation-checks.json`.
- Mẫu dao là minh họa loại hình. Không có kích thước, mã kiểm kê hay nơi phát hiện riêng của mô hình 3D.
- Hồ sơ đang ở trạng thái chờ nhóm duyệt, chưa ghi nhận sự phê duyệt của cán bộ bảo tàng.
- Cần Phú thử micro thật, tiếng ồn nền và thiết bị đích. Điện thoại cần HTTPS để xin quyền micro.

## Câu hỏi mở và hội thoại nhiều lượt

20/20 tình huống đạt tiêu chí trong `semantic-audit-live.json`. Mỗi ca có rubric riêng về ý hỏi, từng vế, nguồn và sự không chắc chắn. Một lượt Gemini riêng hỗ trợ đánh giá; các ca số liệu có kiểm tra nội dung bắt buộc bổ sung. Đây không phải phê duyệt chuyên gia và không được chỉ dựa vào điểm model.

Đã kiểm tra các cặp dễ nhầm: mô tả/cảm hứng/ý nghĩa, ngày phát hiện/tình trạng khi phát hiện, bằng chứng sử dụng/lý do lựa chọn, tên gọi/nơi đào thấy, số ban đầu/hiện trạng theo hồ sơ. Câu hỏi nhiều ý có phần chưa biết phải nêu rõ từng phần, không từ chối chung hoặc bỏ qua phần khó.

## Kiểm tra API hội thoại và độ trễ

Phiên bản: `2026.11.03-research.5`; 11/11 ca qua. Đo trên máy demo, không phải cam kết độ trễ cho mọi mạng/thiết bị.

| Câu hỏi | Thời gian HTTP (ms) |
|---|---:|
| Hiện vật được dùng làm gì? | 19 |
| cái dao này làm bằng gì | 7 |
| cái dao này được làm từ bao giờ | 8 |
| Cái này có nguồn gốc thế nào? | 7 |
| Cái này cao bao nhiêu? | 8 |
| hoa văn đc lấy ý tưởng từ đâu | 7 |
| Trống nặng bao nhiêu? | 6 |
| Ai phát hiện thạp? | 8 |
| Ai là chủ nhân đầu tiên của thạp? | 7 |
| Kể một điều thú vị về hiện vật này nhé | 3231 |
| Giải thích ngắn gọn hơn được không? | 1465 |