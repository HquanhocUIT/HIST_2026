import type { ExhibitId } from "./InteractiveScene";

export type ExhibitStoryScene = {
  title: string;
  narration: string;
};

export type ExhibitStorySource = {
  title: string;
  url: string;
  kind: "article" | "museum-video";
};

export type ExhibitStory = {
  title: string;
  introduction: string;
  videoSrc: string;
  videoDescription: string;
  scenes: ExhibitStoryScene[];
  sources: ExhibitStorySource[];
};

export const exhibitStories: Record<ExhibitId, ExhibitStory> = {
  drum: {
    title: "Hành trình của trống đồng Ngọc Lũ",
    introduction:
      "Một chiếc trống từ văn hóa Đông Sơn trở thành bảo vật quốc gia, lưu giữ dấu ấn về nghệ thuật và đời sống của người Việt cổ.",
    videoSrc: "/videos/ngoc-lu-bronze-drum-v2.mp4",
    videoDescription:
      "Hoạt họa 2D kể lại các mốc phát hiện năm 1893, sưu tầm năm 1903 và công nhận Bảo vật quốc gia năm 2012. Hình ảnh là minh họa, không phải phim tư liệu.",
    scenes: [
      {
        title: "Dấu ấn Đông Sơn",
        narration:
          "Trống đồng Ngọc Lũ có niên đại khoảng 2.000–2.500 năm, thuộc văn hóa Đông Sơn.",
      },
      {
        title: "Hoa văn và đời sống",
        narration:
          "Hình dáng cân đối cùng hệ thống hoa văn phong phú khiến chiếc trống trở thành tư liệu quý về nghệ thuật và đời sống đương thời.",
      },
      {
        title: "Được phát hiện",
        narration:
          "Trống được phát hiện ở khu vực Như Trác, Hà Nam vào cuối thế kỷ XIX, rồi được đưa về bảo tàng lưu giữ.",
      },
      {
        title: "Bảo vật quốc gia",
        narration:
          "Năm 2012, trống đồng Ngọc Lũ được công nhận là Bảo vật quốc gia.",
      },
    ],
    sources: [
      {
        title: "Bảo vật quốc gia: Trống Ngọc Lũ — Bảo tàng Lịch sử Quốc gia",
        url: "https://baotanglichsu.vn/vi/Articles/1001/73637/bao-vat-quoc-gia-trong-ngoc-lu.html",
        kind: "article",
      },
      {
        title: "Video Trống đồng Ngọc Lũ — Bảo tàng Lịch sử Quốc gia",
        url: "https://baotanglichsu.vn/en/Video/121/trong-djong-ngoc-lu.html",
        kind: "museum-video",
      },
    ],
  },

  jar: {
    title: "Câu chuyện của thạp đồng Đào Thịnh",
    introduction:
      "Thạp Đào Thịnh kể câu chuyện về một hiện vật Đông Sơn có hoa văn đặc sắc và dấu tích khảo cổ khiến các nhà nghiên cứu tiếp tục tìm hiểu chức năng của nó.",
    videoSrc: "/videos/dao-thinh-bronze-jar-v2.mp4",
    videoDescription:
      "Hoạt họa 2D kể lại việc thạp được phát hiện năm 1961, chuyển giao và phục dựng. Hình ảnh là minh họa, không phải phim tư liệu.",
    scenes: [
      {
        title: "Một hiện vật Đông Sơn",
        narration:
          "Thạp đồng Đào Thịnh có niên đại khoảng 2.000–2.500 năm, thuộc văn hóa Đông Sơn.",
      },
      {
        title: "Được tìm thấy bên sông Hồng",
        narration:
          "Năm 1961, thạp được phát hiện khi bờ sông bị lở tại thôn Đào Thịnh, tỉnh Yên Bái.",
      },
      {
        title: "Dấu tích bên trong",
        narration:
          "Khi khai quật, bên trong thạp có than tro và răng người. Dấu tích này cho thấy thạp từng được dùng trong mai táng, dù chức năng ban đầu vẫn cần được diễn giải thận trọng.",
      },
      {
        title: "Thông điệp trên hoa văn",
        narration:
          "Những hình thuyền, chim và họa tiết trên thân thạp mở ra góc nhìn về đời sống vật chất, tinh thần của cư dân Đông Sơn.",
      },
    ],
    sources: [
      {
        title: "Bảo vật quốc gia: Thạp Đào Thịnh — Bảo tàng Lịch sử Quốc gia",
        url: "https://baotanglichsu.vn/VI/Articles/1001/73800/bao-vat-quoc-gia-thap-djao-thinh.html",
        kind: "article",
      },
    ],
  },

  dagger: {
    title: "Dao găm trong văn hóa Đông Sơn",
    introduction:
      "Mô hình trong demo đại diện cho loại hình dao găm Đông Sơn, không phải một hiện vật cụ thể đã được định danh. Câu chuyện tập trung vào vai trò và ý nghĩa biểu trưng của loại hình này.",
    videoSrc: "/videos/dong-son-bronze-dagger-v2.mp4",
    videoDescription:
      "Hoạt họa 2D giới thiệu chung về loại hình dao găm Đông Sơn; không kể hành trình phát hiện của một mẫu vật cụ thể.",
    scenes: [
      {
        title: "Nhiều kiểu dáng",
        narration:
          "Dao găm Đông Sơn có nhiều hình thức. Một số chiếc có chuôi được tạo hình người hoặc động vật.",
      },
      {
        title: "Vũ khí và vật dụng",
        narration:
          "Tư liệu nghiên cứu cho thấy dao găm có thể gắn với chiến đấu, tự vệ và một số công việc trong sinh hoạt.",
      },
      {
        title: "Vật mang ý nghĩa biểu trưng",
        narration:
          "Ngoài công năng, nhiều dao găm được trang trí cầu kỳ và có thể thể hiện địa vị hoặc quyền lực của người sở hữu.",
      },
    ],
    sources: [
      {
        title: "Vũ khí Đông Sơn — Bảo tàng Lịch sử Quốc gia",
        url: "https://baotanglichsu.vn/vi/Articles/1002/28064/vu-khi-djong-son.html",
        kind: "article",
      },
      {
        title:
          "Những lưỡi dao găm mang đầy tính biểu trưng — Bảo tàng Lịch sử Quốc gia",
        url: "https://baotanglichsu.vn/vi/Articles/3101/76005/van-hoa-djong-son-chien-tranh-va-hoa-binh-ky-22-nhung-luoi-dao-gam-mang-djay-tinh-bieu-trung.html",
        kind: "article",
      },
    ],
  },
};