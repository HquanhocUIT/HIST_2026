# HeritageXR — phần RAG của Phú

Backend Gemini/Chroma, chatbot theo hiện vật, Push-to-Talk và Sandbox.

- [Cài đặt và chạy](docs/phu-rag-setup.md)
- [Phạm vi tích hợp trên main](docs/phu-pr-integration.md)
- [Dữ liệu và đối chiếu nguồn](docs/source-audit.md)
- [Kiểm thử chatbot](docs/rag-evaluation.md)
- [Bàn giao phần của Phú](docs/phu-handoff.md)

Sao chép `backend/.env.example` thành `backend/.env`, điền key riêng và chạy `start-demo.cmd` trên Windows. Không đưa key hoặc `backend/storage` lên Git. Không cần huấn luyện lại mô hình; bước ingest tạo kho truy xuất từ corpus đã chuẩn bị.
