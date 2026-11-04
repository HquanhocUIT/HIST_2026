# Thuyết minh video

Kịch bản nằm trong `../src/videoNarrations.json`. `narration` là văn bản hiển thị;
`speechText` là văn bản đưa vào KorvaTTS nếu cần cách đọc riêng cho số/ngày tháng.
Khi không có `speechText`, trình tạo audio dùng `narration`.

Ví dụ các mốc đã duyệt cách viết để đọc:

| Hiển thị | Văn đọc |
| --- | --- |
| 1893 | một nghìn tám trăm chín mươi ba |
| Tháng 4 năm 1903 | Tháng tư năm một nghìn chín trăm linh ba |
| 2012 | hai nghìn không trăm mười hai |
| Ngày 14 tháng 9 năm 1961 | Ngày mười bốn tháng chín năm một nghìn chín trăm sáu mươi mốt |

Trình tạo từ chối văn đọc còn chữ số hoặc trống trước khi tải model/ghi MP3.
Với số đo, niên đại và khoảng thời gian mới, cần viết cách đọc phù hợp ngữ cảnh
trong `speechText`; không thay đổi giá trị lịch sử trong `narration`.

Chạy từ thư mục `frontend`, bằng Python đã cài `requirements-local.txt`:

```powershell
python -m unittest discover -s audio_ai_engineering -p test_video_narration.py -v
python audio_ai_engineering/generate-video-narration.py --exhibit drum --video story --force --assets-dir <thu-muc-model-da-co>
python audio_ai_engineering/generate-video-narration.py --exhibit jar --video story --force --assets-dir <thu-muc-model-da-co>
```

`--assets-dir` dùng model trên máy và tắt tải model. Bỏ tùy chọn này sẽ cho phép
KorvaTTS tải weights khi cần. `--force` ghi đè MP3 đã có; không cần tái tạo bốn file
không đổi. Metadata của file tạo mới lưu `spoken_text` để đối chiếu đầu vào.

Sau khi thay MP3, mở **Câu chuyện** của trống đồng/thạp đồng để nghe lại cả các
mốc số và câu cuối, bao gồm lúc tua/dừng/phát lại. Kiểm tra văn đọc và MP3 giải mã
được không thay thế việc nghe duyệt phát âm thực tế.
