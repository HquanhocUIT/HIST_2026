# Kịch bản demo chatbot — bàn giao Phú/Sang/Quân

## Clip thao tác

`demo/chatbot-demo.webm` là clip thao tác tự động trên bản web thật, phản hồi gọi API thật, chưa có lời dẫn và nhạc. Canvas ghi hình 1920×1080. Quân kiểm tra clip rồi ghép vào video cuối, chuyển định dạng/export MP4 theo yêu cầu nộp bài. Thông tin các lượt hỏi nằm ở `demo/recording.json`.

## Lời dẫn đề xuất, khoảng 60–90 giây

| Cảnh | Thao tác | Lời dẫn |
|---|---|---|
| 1 | Chọn trống, mở Hỏi AI, hỏi chiều cao | “Khách có thể hỏi bằng ngôn ngữ tự nhiên ngay khi đang khám phá hiện vật.” |
| 2 | Mở Nguồn tham khảo | “Câu trả lời gắn với đoạn tư liệu đã đối chiếu và có đường dẫn để kiểm tra.” |
| 3 | Chuyển thạp, hỏi niên đại rồi hỏi tiếp năm phát hiện | “Khi đổi hiện vật, hệ thống đổi phạm vi truy xuất. Những câu như ‘cái này’ được hiểu theo hiện vật đang chọn.” |
| 4 | Chọn dao, hỏi dáng lưỡi | “Demo thứ ba giới thiệu loại hình dao găm Đông Sơn. Mô hình 3D mang tính minh họa.” |
| 5 | Hỏi chiều dài mẫu dao | “Khi chưa có dữ kiện của một mẫu cụ thể, trợ lý giải thích giới hạn và không tự tạo số liệu.” |
| 6, bổ sung thủ công | Giữ micro, nói rồi sửa chữ nếu cần | “Khách cũng có thể dùng giọng nói. Bản chép lời được kiểm tra trước khi gửi hỏi.” |

## Cảnh Phú cần thử/quay thêm nếu dùng giọng thật

Cho phép micro ở `http://localhost:5173/`, nói “Trống đồng Ngọc Lũ cao bao nhiêu?”, kiểm tra chữ và bấm Gửi. Thử thêm Đào Thịnh và Đông Sơn; quay một cảnh có tiếng nói nền nhẹ. Không dùng clip giọng tổng hợp để tuyên bố đã thử tiếng ồn bảo tàng thật.

Sang phụ trách footage thực tế theo bảng phân công. Quân dựng cuối, âm thanh, phụ đề và export. Phú duyệt câu trả lời/nguồn trong clip và phần lời dẫn AI trước khi bàn giao. Tránh đưa API key, mã Sandbox hoặc cửa sổ `.env` vào footage.
