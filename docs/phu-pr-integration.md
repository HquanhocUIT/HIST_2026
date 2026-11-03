# Tích hợp riêng phần Phú trên main

Nhánh PR: `feature/phu-rag-chatbot-pr`, nền `origin/main` tại `00605aa`. Main đã được cập nhật giao diện sau bản `10b16a7` dùng để phát triển và quay demo chatbot ban đầu.

## Phạm vi

- Thêm toàn bộ backend RAG, corpus, đáp án có nguồn, STT, Sandbox, kiểm thử và tài liệu của Phú.
- Thêm các component chatbot riêng trong `frontend/src/components` và API client trong `frontend/src/lib`.
- `PhuChatbot` nhận context sẵn có của Vũ, chỉ chuyển ID hợp lệ và tên hiển thị. Backend tự lấy nguồn; không tin thông tin hiện vật do client gửi lên.
- `App.tsx` chỉ nối component chat mới vào vị trí chat có sẵn và thêm đường Sandbox `?sandbox`. Giữ toàn bộ luồng quét, camera, viewer, video, chế tác, đố vui và tính điểm của main.
- `vite.config.ts` thêm proxy `/api` tới FastAPI ở cổng 8000.
- CSS riêng của Phú cho phép hiện nút Hỏi AI trên điện thoại (CSS main đang ẩn nút này), không sửa CSS gốc của Vũ.
- Giữ nguyên `Chatbot.tsx` và `Chatbot.css` cũ để đối chiếu. Giữ nguyên dữ liệu thông tin tĩnh, mô hình 3D, scene, video, quiz và CSS của Vũ.

Không đưa `.env`, API key, token Sandbox, Chroma, nhật ký máy cá nhân, node_modules hoặc bản build vào Git. Máy khác cần tự điền key và chạy ingest; `start-demo.cmd` hỗ trợ khởi động.

## Bằng chứng kiểm tra

`rag-evaluation.md` và các JSON kèm theo ghi nhận kiểm tra backend/chatbot trước khi tách PR. Ảnh và video demo trong `docs` dùng giao diện nền cũ, không đại diện giao diện main mới. `browser_check.py` và `record_demo.py` dùng bộ chọn của giao diện cũ; dùng `browser_check_main.py` để kiểm tra tích hợp trên main.

Kết quả kiểm tra tích hợp lần này được ghi riêng tại `pr-integration-checks.json`. Các cảnh báo có sẵn của main được phân biệt với lỗi trong phần Phú.

Không merge PR hoặc thay đổi nhánh của Vũ trong bước bàn giao này.
