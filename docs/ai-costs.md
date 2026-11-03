# Chi phí AI — số đo và giả định

Model chạy demo: `gemini-3.5-flash-lite`. Bảng tính: `ai-cost-calculator.csv`, mở bằng Excel hoặc nhập vào Google Sheets; sửa các ô giả định trước khi dùng để pitching.

Giá Standard trả phí tham chiếu, đối chiếu ngày 02/11/2026: Flash-Lite đầu vào $0.30/triệu token, đầu ra $2.50/triệu token; embedding-001 $0.15/triệu token. Nguồn: [Google pricing](https://ai.google.dev/gemini-api/docs/pricing). Đây không phải hóa đơn tài khoản hiện tại và không giả định tài khoản luôn còn quota miễn phí.

Trên 40 câu có đáp án trong bộ QA: trung bình 43.6 token vào, 3.1 token ra. Một số câu nhận diện/chất liệu/nơi phát hiện dùng mẫu câu cố định nên tiêu thụ 0 token Gemini. Công thức một câu: `input_tokens × 0.30 / 1,000,000 + output_tokens × 2.50 / 1,000,000`, xấp xỉ **$0.000021/câu** theo giá tham chiếu.

Ví dụ lập kế hoạch, CHƯA phải hành vi đo được: 5 câu/khách → $0.000104/khách; 1.000 khách/tháng → $0.1045/tháng chỉ cho chat. Phải cộng STT, embedding khi tạo index, hosting, lưu trữ, vận hành, TTS và thuế nếu phát sinh. Bộ demo nhỏ hiện đọc các đoạn đã lọc trong Chroma cục bộ, không gọi embedding truy vấn cho mỗi câu. Chưa đo token embedding nên chưa đưa ra số tiền indexing chính xác. Số đo token STT trong bảng chỉ thuộc clip tổng hợp dùng kiểm tra.

Chi phí toàn dự án còn cần nhóm cung cấp: số khách, tỷ lệ mua, giá vốn in, phí thanh toán, ngân sách hosting và bên nhận tỷ lệ chia doanh thu. Giá ảnh 30k/50k và tỷ lệ 70/30 trong workflow là giả định thiết kế, chưa chứng minh lợi nhuận. Không tính toàn bộ chi phí ElevenLabs hay sản xuất video vào một lượt chat; đó là các nhóm chi phí riêng cần phối hợp Quân.

Nếu Excel hiện công thức như văn bản, chọn nhập CSV và dùng dấu phân cách dấu phẩy. Các giá trị USD không được quy đổi sang VND khi chưa chốt tỷ giá giả định.
