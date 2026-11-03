# Đối chiếu nguồn và phạm vi trả lời — 03/11/2026

Kho nguồn mở rộng gồm 10 bài/hồ sơ trên cổng Bảo tàng Lịch sử Quốc gia. Đây không phải 10 nguồn độc lập: có bài danh mục, bài giới thiệu và bài nghiên cứu của tác giả. Các nhận định giải thích được gắn nhãn `interpretation`; số liệu khác nhau được ghi trong `source_conflicts`. Chưa có sự phê duyệt của cán bộ bảo tàng cho bản demo.

## Kết quả cần xử lý rõ

| Vấn đề | Nguồn đã đối chiếu | Cách dùng |
|---|---|---|
| Cảm hứng hoa văn thạp | Bài 2013 mô tả đề tài; nghiên cứu 2019 diễn giải đời sống, chiến đấu, sinh sôi và tín ngưỡng | Giải thích bối cảnh và nêu giới hạn: không có lời ghi trực tiếp của người đúc. Không dùng số tia/vành thay cho câu trả lời về ý tưởng |
| Chiều cao thạp | 98 cm (2013), 87 cm (2019), 90 cm (2023) | Nêu khác biệt; không tự chọn số, không tự quy về đo có nắp/không nắp |
| Chân trống Ngọc Lũ | 80 cm (2017), 81 cm (2019); bài 2013 có số 8 cm | Giữ hai số có đối chiếu; không dùng 8 cm hay âm thầm sửa lỗi nguồn |
| Trống nặng bao nhiêu | Bài 2013 và 2019 đều ghi 86 kg | Bổ sung khối lượng; không tiếp tục trả là chưa có dữ liệu |
| Mốc phát hiện và sưu tầm Ngọc Lũ | 1893/1893–1894; 1902/tháng 4-1903 | Giữ mốc gắn từng hồ sơ, không hợp nhất thành một ngày chính xác |
| Tượng thạp còn bao nhiêu | Hồ sơ 2013 nêu ban đầu bốn cặp, lúc đó còn hai | Chỉ nói hiện trạng theo mốc hồ sơ; chưa có kiểm kê hiện trạng mới nhất |
| Than tro, răng người | Được diễn giải liên quan mai táng; bài 2016 lưu ý suy đoán về hỏa táng/chủ nhân | Không biến thành danh tính một thủ lĩnh hoặc nghi lễ đã xác nhận |
| Quy trình chế tác | Có nghiên cứu về đúc thử Ngọc Lũ và cách gắn tượng ở một số mẫu | Không coi bản đúc thử hiện đại là nguyên bản; không lấy kỹ thuật một mẫu áp cho mọi đồ Đông Sơn |
| Dao găm demo | Chưa định danh theo một tiêu bản | Không gán chiều dài, niên đại riêng, mã kiểm kê, nơi phát hiện hoặc danh hiệu bảo vật của mẫu khác |

## Nguồn chính

- [Thạp Đào Thịnh — 2013](https://baotanglichsu.vn/vi/Articles/1001/13608/gioi-thieu-bao-vat-quoc-gia-3-thap-djong-djao-thinh-va-thong-djiep-cua-nen-van-hoa-djong-son.html)
- [Danh mục thạp Đào Thịnh — 2023](https://baotanglichsu.vn/vi/Articles/1001/73800/bao-vat-quoc-gia-thap-djao-thinh.html)
- [Nhóm bảo vật Đông Sơn — 2019](https://baotanglichsu.vn/vi/Articles/3096/71184/net-djac-sac-nhom-bao-vat-quoc-gia-van-hoa-djong-son-luu-giu-tai-bao-tang-lich-su-quoc-gia.html)
- [Ngọc Lũ — 2013](https://baotanglichsu.vn/vi/Articles/1001/13602/gioi-thieu-bao-vat-quoc-gia-1-trong-djong-ngoc-lu-hien-vat-tieu-bieu-nhat-cua-nen-van-hoa-djong-son.html), [Ngọc Lũ — 2017](https://baotanglichsu.vn/vi/Articles/1001/28538/bao-vat-quoc-gia-viet-nam-trong-djong-ngoc-lu.html)
- [Thạp Đào Thịnh — 2016](https://baotanglichsu.vn/vi/Articles/1001/19667/thap-djong-djao-thinh.html)
- [Kỹ thuật luyện kim — 2014](https://baotanglichsu.vn/vi/Articles/3101/16312/vai-net-ve-nghe-luyen-kim-djuc-djong-thoi-djong-son.html)
- [Tượng rời và kỹ thuật gắn táp — 2024](https://baotanglichsu.vn/vi/Articles/3101/74578/nguoi-djong-son-ky-17-nhung-tuong-roi-djong-son-dung-dje-gan-vao-mot-djo-vat-khac.html)
- [Dao găm — 2025](https://baotanglichsu.vn/vi/Articles/3101/76005/van-hoa-djong-son-chien-tranh-va-hoa-binh-ky-22-nhung-luoi-dao-gam-mang-djay-tinh-bieu-trung.html)

Không nhập toàn bộ bài vào kho một cách máy móc. Ví dụ bài cũ về thạp có các mô tả số thuyền khác với hồ sơ chính đã đối chiếu; những đoạn chưa giải quyết được không dùng làm đáp án chắc chắn. Kiến thức và lời đáp được quản lý trong `backend/data/corpus.json` và `answers.json`; thay đổi phải được kiểm tra nguồn và kiểm thử trước khi nâng phiên bản server.
