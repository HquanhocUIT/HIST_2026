import type { ExhibitId } from "./InteractiveScene";

export type ExhibitStoryScene = {
  title: string;
  narration: string;
};

export type ExhibitStory = {
  title: string;
  introduction: string;
  scenes: ExhibitStoryScene[];
};

export const exhibitStories: Record<ExhibitId, ExhibitStory> = {
  drum: {
    title: "Hành trình của trống đồng Ngọc Lũ",
    introduction:
      "Từ thời văn hóa Đông Sơn đến khi được tìm thấy tại Hà Nam, trống đồng Ngọc Lũ lưu giữ dấu ấn về kỹ thuật đúc đồng và hoa văn của người xưa.",
    scenes: [
      {
        title: "Thời đại Đông Sơn",
        narration:
          "Chiếc trống có niên đại khoảng 2.000–2.500 năm, thuộc văn hóa Đông Sơn.",
      },
      {
        title: "Hoa văn trên trống",
        narration:
          "Hình dáng cân đối cùng những hoa văn tinh xảo làm nên giá trị đặc biệt của trống Ngọc Lũ.",
      },
      {
        title: "Được phát hiện",
        narration:
          "Năm 1893, trống được phát hiện khi đắp đê Trần Thủy tại Như Trác, Hà Nam.",
      },
      {
        title: "Bảo vật quốc gia",
        narration:
          "Năm 2012, trống đồng Ngọc Lũ được công nhận là Bảo vật quốc gia.",
      },
    ],
  },

  jar: {
    title: "Câu chuyện về thạp đồng Đào Thịnh",
    introduction:
      "Thạp đồng Đào Thịnh là hiện vật văn hóa Đông Sơn nổi bật với thân thuôn dần về đáy, chiếc nắp đặc biệt và những hoa văn tinh xảo.",
    scenes: [
      {
        title: "Một hiện vật Đông Sơn",
        narration:
          "Thạp đồng Đào Thịnh có niên đại khoảng 2.500 năm trước.",
      },
      {
        title: "Dáng thạp độc đáo",
        narration:
          "Thân thạp hình trụ và thuôn dần về phía đáy; phần nắp có dáng hình nón cụt.",
      },
      {
        title: "Hoa văn trên nắp",
        narration:
          "Ở giữa nắp là hình mặt trời 12 tia, xung quanh là các vành hoa văn.",
      },
      {
        title: "Được phát hiện tại Yên Bái",
        narration:
          "Thạp được phát hiện năm 1961 tại thôn Đào Thịnh, huyện Trấn Yên, tỉnh Yên Bái.",
      },
    ],
  },

  dagger: {
    title: "Dao găm trong văn hóa Đông Sơn",
    introduction:
      "Mô hình trong demo đại diện cho loại dao găm Đông Sơn, chưa xác định là một hiện vật cụ thể. Câu chuyện giới thiệu khái quát về kiểu dáng và công dụng của loại hiện vật này.",
    scenes: [
      {
        title: "Nhiều kiểu dáng",
        narration:
          "Dao găm Đông Sơn có nhiều kiểu chuôi; một số được tạo hình người hoặc động vật.",
      },
      {
        title: "Vũ khí và vật dụng",
        narration:
          "Dao găm có thể được dùng trong chiến đấu và trong sinh hoạt hằng ngày.",
      },
      {
        title: "Dấu ấn nghệ thuật",
        narration:
          "Những hình tượng trên chuôi dao cho thấy sự kết hợp giữa công năng và nghệ thuật tạo hình.",
      },
    ],
  },
};