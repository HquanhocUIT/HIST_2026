import { useEffect, useState } from "react";
import type { ExhibitId } from "./InteractiveScene";
import "./QuizPanel.css";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  sourceTitle: string;
  sourceUrl: string;
};

type QuizPanelProps = {
  exhibitId: ExhibitId;
  points: number;
  onPointsChange: (points: number) => void;
};

const exhibitNames: Record<ExhibitId, string> = {
  drum: "Trống đồng Ngọc Lũ",
  jar: "Thạp đồng Đào Thịnh",
  dagger: "Dao găm đồng Đông Sơn",
};

const questions: Record<ExhibitId, QuizQuestion[]> = {
  drum: [
    {
      id: "drum-parts",
      question: "Trống đồng Ngọc Lũ gồm bao nhiêu phần chính?",
      options: ["Hai phần", "Bốn phần", "Sáu phần"],
      answer: 1,
      explanation: "Bốn phần chính là mặt, tang, thân và chân trống.",
      sourceTitle: "Bảo vật quốc gia: Trống Ngọc Lũ",
      sourceUrl:
        "https://baotanglichsu.vn/VI/Articles/1002/28053/trong-djong-ngoc-lu.html",
    },
    {
      id: "drum-star",
      question: "Mặt trống Ngọc Lũ có hình nổi nào ở chính giữa?",
      options: ["Mặt trời 14 tia", "Hoa sen 8 cánh", "Hình vuông đồng tâm"],
      answer: 0,
      explanation:
        "Tư liệu bảo tàng mô tả hình mặt trời 14 tia ở giữa mặt trống.",
      sourceTitle: "Bảo vật quốc gia: Trống Ngọc Lũ",
      sourceUrl:
        "https://baotanglichsu.vn/VI/Articles/1002/28053/trong-djong-ngoc-lu.html",
    },
    {
      id: "drum-discovery",
      question: "Trống đồng Ngọc Lũ được phát hiện trong hoàn cảnh nào?",
      options: [
        "Khi đắp đê ở Như Trác",
        "Khi xây thành ở Cổ Loa",
        "Khi khai quật một ngôi chùa",
      ],
      answer: 0,
      explanation:
        "Trống được phát hiện khi đắp đê tại xã Như Trác, Hà Nam, năm 1893.",
      sourceTitle: "Bảo vật quốc gia: Trống Ngọc Lũ",
      sourceUrl:
        "https://baotanglichsu.vn/VI/Articles/1001/73637/bao-vat-quoc-gia-trong-ngoc-lu.html",
    },
  ],

  jar: [
    {
      id: "jar-discovery-place",
      question: "Thạp đồng Đào Thịnh được phát hiện ở tỉnh nào?",
      options: ["Yên Bái", "Hà Nam", "Thanh Hóa"],
      answer: 0,
      explanation:
        "Thạp được phát hiện tại xã Đào Thịnh, huyện Trấn Yên, tỉnh Yên Bái.",
      sourceTitle:
        "Giới thiệu Bảo vật quốc gia: Thạp đồng Đào Thịnh",
      sourceUrl:
        "https://baotanglichsu.vn/VI/Articles/1001/13608/gioi-thieu-bao-vat-quoc-gia-3-thap-djong-djao-thinh-va-thong-djiep-cua-nen-van-hoa-djong-son.html",
    },
    {
      id: "jar-discovery-remains",
      question: "Tư liệu bảo tàng ghi nhận gì bên trong thạp khi được phát hiện?",
      options: [
        "Than tro và răng người",
        "Tiền xu và đồ gốm",
        "Hạt lúa và công cụ đá",
      ],
      answer: 0,
      explanation:
        "Than tro và răng người là dấu tích khiến các nhà nghiên cứu nhận định thạp từng được dùng làm quan tài.",
      sourceTitle: "Thạp Đào Thịnh",
      sourceUrl:
        "https://baotanglichsu.vn/VI/Articles/1001/28056/thap-djao-thinh.html",
    },
    {
      id: "jar-lid-meaning",
      question: "Theo tư liệu bảo tàng, tượng trên nắp thạp gợi đến ý nghĩa nào?",
      options: [
        "Khát vọng sinh sôi và thịnh vượng",
        "Hoạt động săn bắt trên núi",
        "Việc trao đổi hàng hóa đường biển",
      ],
      answer: 0,
      explanation:
        "Đây là cách diễn giải của tư liệu bảo tàng về các tượng trên nắp thạp và tín ngưỡng Đông Sơn.",
      sourceTitle:
        "Bảo vật quốc gia: Thạp Đào Thịnh",
      sourceUrl:
        "https://baotanglichsu.vn/VI/Articles/1001/73800/bao-vat-quoc-gia-thap-djao-thinh.html",
    },
  ],

  dagger: [
    {
      id: "dagger-design",
      question: "Điểm nào được tư liệu bảo tàng nhấn mạnh là đặc biệt phong phú ở dao găm Đông Sơn?",
      options: ["Phần cán", "Vỏ gỗ", "Dây đeo"],
      answer: 0,
      explanation:
        "Dao găm Đông Sơn có nhiều kiểu dáng; phần cán được tư liệu bảo tàng nhấn mạnh là đặc biệt độc đáo.",
      sourceTitle:
        "Vũ khí văn hóa Đông Sơn – nét đặc trưng trong văn hóa người Việt cổ",
      sourceUrl:
        "https://baotanglichsu.vn/vi/Articles/3101/17296/vu-khi-van-hoa-djong-son-net-djac-trung-trong-van-hoa-nguoi-viet-co.html",
    },
    {
      id: "dagger-use",
      question: "Dao găm được xếp vào nhóm vũ khí nào trong tư liệu về vũ khí Đông Sơn?",
      options: ["Vũ khí đánh gần", "Vũ khí đánh xa", "Vũ khí phòng thủ"],
      answer: 0,
      explanation:
        "Tư liệu Bảo tàng Lịch sử Quốc gia xếp dao găm vào nhóm vũ khí đánh gần.",
      sourceTitle: "Vũ khí Đông Sơn",
      sourceUrl:
        "https://baotanglichsu.vn/vi/Articles/1002/28064/vu-khi-djong-son.html",
    },
    {
      id: "dagger-handle-figures",
      question: "Một số cán dao găm Đông Sơn được tạo hình như thế nào?",
      options: [
        "Có tượng người hoặc động vật",
        "Có hình mái nhà",
        "Có hình bánh xe",
      ],
      answer: 0,
      explanation:
        "Một số cán dao găm được tạo hình người hoặc động vật, bên cạnh các kiểu cán khác.",
      sourceTitle:
        "Vũ khí văn hóa Đông Sơn – nét đặc trưng trong văn hóa người Việt cổ",
      sourceUrl:
        "https://baotanglichsu.vn/vi/Articles/3101/17296/vu-khi-van-hoa-djong-son-net-djac-trung-trong-van-hoa-nguoi-viet-co.html",
    },
  ],
};

const pointsStorageKey = "heritagexr-demo-points-v1";
const earnedStorageKey = "heritagexr-demo-earned-quiz-v1";

function readEarnedQuestionIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem(earnedStorageKey);
    const parsedValue: unknown = JSON.parse(storedValue ?? "[]");

    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter(
      (questionId): questionId is string =>
        typeof questionId === "string",
    );
  } catch {
    return [];
  }
}

export function readDemoPoints(): number {
  if (typeof window === "undefined") return 0;

  const storedValue = Number(
    window.localStorage.getItem(pointsStorageKey) ?? "0",
  );

  return Number.isFinite(storedValue) && storedValue >= 0
    ? storedValue
    : 0;
}

export function QuizPanel({
  exhibitId,
  points,
  onPointsChange,
}: QuizPanelProps) {
  const exhibitQuestions = questions[exhibitId];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [wasAlreadyEarned, setWasAlreadyEarned] = useState(false);
  const [rewardCode, setRewardCode] = useState("");

  const question = exhibitQuestions[questionIndex];
  const isLastQuestion = questionIndex === exhibitQuestions.length - 1;
  const isCorrect = selectedAnswer === question.answer;

  useEffect(() => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setWasAlreadyEarned(false);
    setRewardCode("");
  }, [exhibitId]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);

    if (answerIndex !== question.answer) return;

    const earnedIds = readEarnedQuestionIds();
    const alreadyEarned = earnedIds.includes(question.id);

    setWasAlreadyEarned(alreadyEarned);

    if (alreadyEarned) return;

    const nextPoints = points + 10;
    const nextEarnedIds = [...earnedIds, question.id];

    window.localStorage.setItem(
      earnedStorageKey,
      JSON.stringify(nextEarnedIds),
    );
    window.localStorage.setItem(pointsStorageKey, String(nextPoints));

    onPointsChange(nextPoints);
  };

  const handleNext = () => {
    setQuestionIndex((currentIndex) =>
      currentIndex === exhibitQuestions.length - 1 ? 0 : currentIndex + 1,
    );

    setSelectedAnswer(null);
    setWasAlreadyEarned(false);
  };

  const handleRedeem = () => {
    if (points < 30) return;

    const nextPoints = points - 30;

    window.localStorage.setItem(pointsStorageKey, String(nextPoints));
    onPointsChange(nextPoints);

    setRewardCode(
      `HX-DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    );
  };

  return (
    <section
      className="quiz-panel"
      aria-label={`Đố vui về ${exhibitNames[exhibitId]}`}
    >
      <div className="quiz-panel-heading">
        <div>
          <span className="section-label">THỬ THÁCH KIẾN THỨC</span>
          <h2>Bạn nhớ được bao nhiêu?</h2>
        </div>

        <span className="quiz-points-chip">✦ {points} điểm</span>
      </div>

      <p className="quiz-progress">
        CÂU {String(questionIndex + 1).padStart(2, "0")} /{" "}
        {String(exhibitQuestions.length).padStart(2, "0")}
      </p>

      <h3 className="quiz-question">{question.question}</h3>

      <div className="quiz-options">
        {question.options.map((option, index) => {
          const isAnswer =
            selectedAnswer !== null && index === question.answer;
          const isWrong =
            selectedAnswer === index && index !== question.answer;

          return (
            <button
              className={`quiz-option ${
                isAnswer ? "is-correct" : ""
              } ${isWrong ? "is-wrong" : ""}`}
              key={option}
              type="button"
              disabled={selectedAnswer !== null}
              onClick={() => handleAnswer(index)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {option}
            </button>
          );
        })}
      </div>

      {selectedAnswer !== null && (
        <div
          className={`quiz-feedback ${
            isCorrect ? "is-correct" : "is-wrong"
          }`}
          role="status"
        >
          <strong>
            {isCorrect
              ? wasAlreadyEarned
                ? "Chính xác! Câu này đã được tính điểm trước đó."
                : "Chính xác! +10 điểm."
              : "Chưa đúng rồi."}
          </strong>

          <p>{question.explanation}</p>

          <a
            className="quiz-source"
            href={question.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Nguồn: {question.sourceTitle} ↗
          </a>
        </div>
      )}

      {selectedAnswer !== null && (
        <button
          className="quiz-next-button"
          type="button"
          onClick={handleNext}
        >
          {isLastQuestion ? "Làm lại bộ câu hỏi" : "Câu tiếp theo →"}
        </button>
      )}

      <div className="quiz-reward-box">
        <div>
          <strong>Đổi quà tại bảo tàng</strong>
          <p>Đạt 30 điểm để mở mã quà minh họa trong bản demo.</p>
        </div>

        <button
          type="button"
          disabled={points < 30}
          onClick={handleRedeem}
        >
          Đổi 30 điểm
        </button>

        {rewardCode && (
          <p className="quiz-reward-code" role="status">
            Mã demo: <strong>{rewardCode}</strong>
          </p>
        )}
      </div>

      <p className="quiz-demo-note">
        Điểm và mã quà chỉ lưu trên thiết bị để trình diễn; chưa kết nối hệ
        thống đổi quà thật.
      </p>
    </section>
  );
}