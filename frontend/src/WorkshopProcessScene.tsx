import { useEffect, useState } from "react";
import "./WorkshopProcessScene.css";

type WorkshopStep = {
  title: string;
  description: string;
};

export const workshopSteps: WorkshopStep[] = [
  {
    title: "Chuẩn bị mẫu và lõi khuôn",
    description:
      "Hoạt họa minh họa việc chuẩn bị hình mẫu và phần lõi khuôn cho một vật đúc bằng đồng. Đây là mô phỏng khái quát, chưa xác nhận riêng cho Thạp Đào Thịnh.",
  },
  {
    title: "Tạo hoa văn",
    description:
      "Người thợ tạo hình các chi tiết trang trí trên mẫu hoặc khuôn. Cách tạo hoa văn cụ thể của Thạp Đào Thịnh hiện chưa được xác minh.",
  },
  {
    title: "Tạo khuôn",
    description:
      "Khuôn bao ngoài được chuẩn bị để tạo hình sản phẩm. Đây là bước minh họa chung về kỹ thuật đúc đồng Đông Sơn, không phải bản phục dựng chính xác khuôn của chiếc thạp.",
  },
  {
    title: "Nung khuôn và rót đồng",
    description:
      "Cảnh minh họa công đoạn nung khuôn và rót đồng nóng chảy theo một quy trình đúc khái quát. Không xem đây là kết luận về kỹ thuật riêng đã dùng cho Thạp Đào Thịnh.",
  },
  {
    title: "Tháo khuôn và hoàn thiện",
    description:
      "Sau khi vật đúc nguội, người thợ lấy sản phẩm ra và xử lý bề mặt. Đây là hoạt họa tái dựng để giải thích kỹ thuật, không phải tư liệu ghi hình nguyên gốc.",
  },
];

type WorkshopProcessSceneProps = {
  step: number;
  onStepChange: (step: number) => void;
  onContinueToFact: () => void;
  supported?: boolean;
};

export function WorkshopProcessScene({
  step,
  onStepChange,
  onContinueToFact,
  supported = true,
}: WorkshopProcessSceneProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const activeStep = Math.max(0, Math.min(workshopSteps.length - 1, step));
  const current = workshopSteps[activeStep];

  useEffect(() => {
    if (!isPlaying || !supported) return;

    const timer = window.setTimeout(() => {
      if (activeStep >= workshopSteps.length - 1) {
        setIsPlaying(false);
        setHasCompleted(true);
      } else {
        onStepChange(activeStep + 1);
      }
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [activeStep, isPlaying, onStepChange, supported]);

  useEffect(() => {
    if (activeStep < workshopSteps.length - 1) {
      setHasCompleted(false);
    } else if (!isPlaying) {
      setHasCompleted(true);
    }
  }, [activeStep, isPlaying]);

  const handleReplay = () => {
    setHasCompleted(false);
    onStepChange(0);
    setIsPlaying(true);
  };

  if (!supported) {
    return (
      <div className="workshop-unavailable">
        <span className="section-label">TƯ LIỆU ĐANG ĐƯỢC BỔ SUNG</span>
        <h2>Chưa có quy trình riêng được xác minh</h2>
        <p>
          Hiện chưa có đủ tư liệu để tái dựng chính xác quy trình chế tác riêng
          của hiện vật này.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`workshop-process-scene ${hasCompleted ? "is-complete" : ""}`}
      aria-label={`Hoạt họa quy trình: ${current.title}`}
    >
      <div className="workshop-process-top">
        <span className="workshop-live-dot" />
        <span>TÁI DỰNG MINH HỌA · QUY TRÌNH ĐÚC ĐỒNG KHÁI QUÁT</span>
      </div>

      <div className="workshop-process-heading">
        <span className="section-label">
          XƯỞNG ĐÚC ĐỒNG · MÔ PHỎNG GIÁO DỤC
        </span>
        <h2>{current.title}</h2>
      </div>

      <svg
        className="workshop-process-svg"
        viewBox="0 0 1200 760"
        role="img"
        aria-label="Minh họa khái quát các công đoạn đúc đồng"
      >
        <defs>
          <linearGradient id="workshopBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#252820" />
            <stop offset=".62" stopColor="#343328" />
            <stop offset="1" stopColor="#24251d" />
          </linearGradient>

          <linearGradient id="workshopMolten" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#ffd875" />
            <stop offset="1" stopColor="#de642b" />
          </linearGradient>

          <filter id="workshopGlow">
            <feGaussianBlur stdDeviation="16" />
          </filter>

          <pattern
            id="workshopDirt"
            width="36"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="5" cy="7" r="1" fill="#b39a65" opacity=".3" />
            <circle cx="24" cy="14" r="1.2" fill="#b39a65" opacity=".22" />
          </pattern>
        </defs>

        <rect width="1200" height="760" fill="url(#workshopBg)" />
        <path d="M0 514H1200V760H0Z" fill="#353328" />
        <path
          d="M0 520H1200V760H0Z"
          fill="url(#workshopDirt)"
          opacity=".7"
        />
        <path
          d="M46 130L295 35M1154 126L906 35M250 54H950"
          className="workshop-beam"
        />
        <path
          d="M130 110V350M1070 110V350M324 49V242M876 49V238"
          className="workshop-beam-thin"
        />
        <path d="M80 200H1120" className="workshop-crossbeam" />

        <g
          className={`workshop-stage ${activeStep === 0 ? "is-active" : ""}`}
        >
          <ellipse
            cx="593"
            cy="558"
            rx="242"
            ry="34"
            className="workshop-shadow"
          />
          <path d="M408 388H790L830 430H370Z" className="workshop-table" />
          <path
            d="M422 430H462V545H422ZM744 430H784V545H744Z"
            className="workshop-leg"
          />
          <ellipse
            cx="595"
            cy="376"
            rx="114"
            ry="38"
            className="workshop-clay-rim"
          />
          <path
            d="M501 365Q512 324 595 322Q680 324 690 365L676 377H515Z"
            className="workshop-clay"
          />
          <path
            d="M518 356Q595 371 672 356M520 364Q595 381 670 364"
            className="workshop-clay-lines"
          />

          <g transform="translate(850 240)" className="workshop-worker">
            <circle cx="40" cy="45" r="29" className="workshop-skin" />
            <path
              d="M20 76Q4 100 18 163L12 256H73L67 162Q85 109 62 76Z"
              className="workshop-apron"
            />
            <path
              d="M23 91L-8 143M62 91L96 128"
              className="workshop-arm workshop-arm-tap"
            />
          </g>

          <path
            d="M800 365L730 383M844 360L693 376"
            className="workshop-tool"
          />
          <text x="596" y="298" className="workshop-label">
            TẠO MẪU VÀ LÕI KHUÔN
          </text>
        </g>

        <g
          className={`workshop-stage ${activeStep === 1 ? "is-active" : ""}`}
        >
          <ellipse
            cx="583"
            cy="570"
            rx="262"
            ry="35"
            className="workshop-shadow"
          />
          <path d="M350 426H804L838 464H318Z" className="workshop-table" />
          <path
            d="M358 464H402V555H358ZM756 464H800V555H756Z"
            className="workshop-leg"
          />
          <path
            d="M478 420Q494 370 520 337L523 300Q585 278 649 300L652 338Q676 372 693 420L675 438H494Z"
            className="workshop-clay"
          />
          <path
            d="M530 342Q584 359 645 342M505 387Q581 409 667 387"
            className="workshop-pattern-lines"
          />

          <g transform="translate(828 218)" className="workshop-worker">
            <circle cx="35" cy="45" r="28" className="workshop-skin" />
            <path
              d="M13 76Q0 111 15 171L12 264H76L66 171Q83 108 60 76Z"
              className="workshop-apron"
            />
            <path
              d="M20 109L-26 182M66 106L-4 248"
              className="workshop-arm workshop-arm-carve"
            />
          </g>

          <path
            d="M795 377L681 407M795 377L703 428"
            className="workshop-tool"
          />
          <path
            d="M276 381Q318 358 350 386M286 420Q314 400 338 415"
            className="workshop-decoration"
          />
          <text x="585" y="266" className="workshop-label">
            TẠO HOA VĂN · MINH HỌA
          </text>
        </g>

        <g
          className={`workshop-stage ${activeStep === 2 ? "is-active" : ""}`}
        >
          <ellipse
            cx="592"
            cy="571"
            rx="302"
            ry="33"
            className="workshop-shadow"
          />
          <path
            d="M437 446Q443 362 500 329L688 329Q746 367 750 446Z"
            className="workshop-mold"
          />
          <path
            d="M476 413Q483 361 522 344L663 344Q704 367 711 413Z"
            className="workshop-inner-mold"
          />
          <path d="M410 453H786L818 482H379Z" className="workshop-table" />
          <path
            d="M420 482H458V554H420ZM744 482H782V554H744Z"
            className="workshop-leg"
          />
          <path
            d="M337 389Q321 345 364 317L407 345L399 397Z"
            className="workshop-clay"
          />
          <path
            d="M808 385Q795 340 838 316L879 346L870 401Z"
            className="workshop-clay"
          />

          <g transform="translate(905 263)" className="workshop-worker">
            <circle cx="33" cy="41" r="25" className="workshop-skin" />
            <path
              d="M15 68Q1 104 17 160L14 240H72L63 160Q81 103 57 68Z"
              className="workshop-apron"
            />
            <path
              d="M22 99L-15 159M59 98L-14 168"
              className="workshop-arm workshop-arm-lift"
            />
          </g>

          <text x="592" y="297" className="workshop-label">
            TẠO KHUÔN · MINH HỌA
          </text>
        </g>

        <g
          className={`workshop-stage ${activeStep === 3 ? "is-active" : ""}`}
        >
          <ellipse
            cx="613"
            cy="577"
            rx="340"
            ry="39"
            className="workshop-shadow"
          />
          <path
            d="M346 533Q323 492 347 454L367 423H470L490 456Q509 501 482 538Z"
            className="workshop-furnace"
          />
          <ellipse
            cx="417"
            cy="430"
            rx="49"
            ry="19"
            className="workshop-furnace-opening"
          />
          <ellipse
            cx="416"
            cy="492"
            rx="88"
            ry="67"
            className="workshop-fire-glow"
            filter="url(#workshopGlow)"
          />
          <path
            d="M383 512Q411 451 438 512Q461 482 468 533H369Z"
            className="workshop-fire"
          />
          <path
            d="M584 371L745 330M594 391L753 350"
            className="workshop-tool"
          />
          <path
            d="M712 341Q750 321 784 338L777 379Q745 396 711 374Z"
            className="workshop-crucible"
          />
          <path
            d="M742 382Q734 415 712 443Q693 470 693 500"
            className="workshop-pour-stream"
          />
          <path d="M641 501H783L806 530H617Z" className="workshop-mold" />
          <path d="M657 503H768" className="workshop-molten-line" />

          <g transform="translate(887 222)" className="workshop-worker">
            <circle cx="32" cy="42" r="27" className="workshop-skin" />
            <path
              d="M13 71Q-2 109 14 168L11 254H73L63 168Q83 108 58 71Z"
              className="workshop-apron"
            />
            <path
              d="M21 103L-35 166M60 103L-20 169"
              className="workshop-arm workshop-arm-pour"
            />
          </g>

          <text
            x="599"
            y="267"
            className="workshop-label workshop-label-hot"
          >
            NUNG KHUÔN · RÓT ĐỒNG
          </text>
        </g>

        <g
          className={`workshop-stage ${activeStep === 4 ? "is-active" : ""}`}
        >
          <ellipse
            cx="599"
            cy="575"
            rx="328"
            ry="38"
            className="workshop-shadow"
          />
          <path d="M375 468H813L845 500H346Z" className="workshop-table" />
          <path
            d="M388 500H428V560H388ZM757 500H797V560H757Z"
            className="workshop-leg"
          />
          <path
            d="M487 455Q493 417 526 398L526 360Q594 344 664 360L664 398Q695 422 702 455L685 474H505Z"
            className="workshop-bronze"
          />
          <ellipse
            cx="596"
            cy="357"
            rx="70"
            ry="21"
            className="workshop-bronze-rim"
          />
          <path
            d="M526 393Q595 415 665 393M500 442Q596 464 689 442"
            className="workshop-bronze-lines"
          />

          <g transform="translate(838 260)" className="workshop-worker">
            <circle cx="34" cy="42" r="26" className="workshop-skin" />
            <path
              d="M15 70Q0 105 16 164L13 246H74L64 164Q82 105 58 70Z"
              className="workshop-apron"
            />
            <path
              d="M21 102L-21 182M60 102L-12 165"
              className="workshop-arm workshop-arm-finish"
            />
          </g>

          <path d="M800 382L697 442" className="workshop-tool" />
          <text x="595" y="323" className="workshop-label">
            THÁO KHUÔN · HOÀN THIỆN
          </text>
        </g>
      </svg>

      <div className="workshop-process-caption" aria-live="polite">
        <strong>
          Bước {String(activeStep + 1).padStart(2, "0")} · {current.title}.
        </strong>{" "}
        {current.description}
      </div>

      {hasCompleted ? (
        <div
          className="workshop-completion-actions"
          role="group"
          aria-label="Quy trình đã hoàn tất"
        >
          <span>Đã hoàn tất quy trình chế tác</span>
          <button
            className="workshop-replay-button"
            type="button"
            onClick={handleReplay}
          >
            ↻ Replay
          </button>
          <button
            className="workshop-continue-button"
            type="button"
            onClick={onContinueToFact}
          >
            Đi tiếp Fact →
          </button>
        </div>
      ) : (
        <button
          className="workshop-play-button"
          type="button"
          onClick={() => {
            if (activeStep === workshopSteps.length - 1 && !isPlaying) {
              onStepChange(0);
              setHasCompleted(false);
              setIsPlaying(true);
              return;
            }

            setIsPlaying((playing) => !playing);
          }}
        >
          {isPlaying ? "Ⅱ Tạm dừng" : "▶ Tự chạy quy trình"}
        </button>
      )}
    </div>
  );
}