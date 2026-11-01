import type { ExhibitId } from "./InteractiveScene";

export type ExhibitInformation = {
  period: string;
  material: string;
  overview: string;
  facts: string[];
  sourceTitle: string;
  sourceUrl: string;
  note?: string;
};

export const exhibitInformation: Record<ExhibitId, ExhibitInformation> = {
  drum: {
    period: "Văn hóa Đông Sơn, khoảng 2.000–2.500 năm trước",
    material: "Đồng",
    overview:
      "Trống Ngọc Lũ có dáng cân đối, hoa văn phong phú và là hiện vật tiêu biểu cho kỹ thuật đúc đồng thời Đông Sơn.",
    facts: [
      "Đường kính mặt: 79,3 cm; đường kính chân: 80 cm; cao: 63 cm.",
      "Được phát hiện năm 1893 khi đắp đê Trần Thủy tại xã Như Trác, huyện Nam Xang (nay thuộc huyện Lý Nhân, tỉnh Hà Nam).",
      "Được công nhận là Bảo vật quốc gia năm 2012.",
    ],
    sourceTitle: "Bảo tàng Lịch sử Quốc gia — Trống đồng Ngọc Lũ",
    sourceUrl:
      "https://baotanglichsu.vn/vi/Articles/1001/28538/bao-vat-quoc-gia-viet-nam-trong-djong-ngoc-lu.html",
  },

  jar: {
    period: "Văn hóa Đông Sơn, khoảng 2.500 năm trước",
    material: "Đồng",
    overview:
      "Thạp đồng có thân hình trụ thuôn dần xuống đáy và nắp hình nón cụt.",
    facts: [
      "Được phát hiện năm 1961 tại thôn Đào Thịnh, huyện Trấn Yên, tỉnh Yên Bái.",
      "Trên nắp có hình mặt trời 12 tia, bao quanh là các vành hoa văn.",
    ],
    sourceTitle: "Bảo tàng Lịch sử Quốc gia — Thạp đồng Đào Thịnh",
    sourceUrl:
      "https://baotanglichsu.vn/vi/Articles/1001/13608/gioi-thieu-bao-vat-quoc-gia-3-thap-djong-djao-thinh-va-thong-djiep-cua-nen-van-hoa-djong-son.html",
  },

  dagger: {
    period: "Văn hóa Đông Sơn",
    material: "Đồng",
    overview:
      "Dao găm Đông Sơn có nhiều kiểu dáng; một số có phần chuôi tạo hình người hoặc động vật.",
    facts: [
      "Dao găm có thể được dùng trong chiến đấu và trong sinh hoạt như tự vệ, cắt gọt.",
    ],
    sourceTitle: "Bảo tàng Lịch sử Quốc gia — Dao găm Đông Sơn",
    sourceUrl:
      "https://baotanglichsu.vn/vi/Articles/3101/76005/van-hoa-djong-son-chien-tranh-va-hoa-binh-ky-22-nhung-luoi-dao-gam-mang-djay-tinh-bieu-trung.html",
    note:
      "Mô hình 3D mang tính minh họa, chưa xác định là bản sao của một hiện vật cụ thể trong bộ sưu tập.",
  },
};