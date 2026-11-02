import { useEffect, useRef, useState, type FormEvent } from "react";
import "./Chatbot.css";

export type ExhibitChatContext = {
  id: string;
  name: string;
  collection: string;
  period: string;
  material: string;
  overview: string;
  facts: string[];
  note: string;
  sourceTitle: string;
  sourceUrl: string;
  storyTitle: string;
  storyIntroduction: string;
};

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
  source?: {
    title: string;
    url: string;
  } | null;
};

type ChatApiResponse = {
  answer?: string;
  error?: string;
  source?: {
    title: string;
    url: string;
  } | null;
};

type ChatbotProps = {
  exhibit: ExhibitChatContext | null;
};

const suggestedQuestions = [
  "Hiện vật này có gì đặc biệt?",
  "Hiện vật được tạo ra vào thời kỳ nào?",
  "Kể cho tôi nghe câu chuyện về hiện vật này.",
];

const CHAT_API_URL = "http://localhost:3001/api/chat";

export function Chatbot({ exhibit }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = draft.trim();

    if (!exhibit || !question || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: question,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exhibit,
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as ChatApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "Chưa gửi được câu hỏi. Hãy thử lại nhé.");
      }

      if (!data.answer) {
        throw new Error("Trợ lý chưa tạo được câu trả lời. Hãy thử lại nhé.");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        source: data.source,
      };

      setMessages([...nextMessages, assistantMessage]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Đã xảy ra lỗi khi kết nối với trợ lý.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!exhibit) {
    return (
      <div className="chatbot chatbot-no-exhibit">
        <span className="chatbot-empty-icon" aria-hidden="true">
          ✦
        </span>
        <h3>Chọn một hiện vật để bắt đầu</h3>
        <p>
          Sau khi chọn hiện vật, bạn có thể hỏi trợ lý về thông tin và câu
          chuyện lịch sử của hiện vật đó.
        </p>
      </div>
    );
  }

  return (
    <div className="chatbot">
      <div className="chatbot-context">
        <span className="chatbot-context-dot" aria-hidden="true" />
        <span>
          Đang tìm hiểu: <strong>{exhibit.name}</strong>
        </span>
      </div>

      <div
        className="chatbot-messages"
        role="log"
        aria-live="polite"
        aria-label="Tin nhắn với trợ lý hiện vật"
      >
        {messages.length === 0 ? (
          <div className="chatbot-welcome">
            <span className="chatbot-welcome-icon" aria-hidden="true">
              ✦
            </span>
            <h3>Xin chào!</h3>
            <p>
              Hãy hỏi tôi về <strong>{exhibit.name}</strong>. Tôi sẽ trả lời
              dựa trên tư liệu của hiện vật này.
            </p>

            <div className="chatbot-suggestions">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="chatbot-suggestion"
                  onClick={() => setDraft(question)}
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chatbot-message-list">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chatbot-message ${
                  message.role === "user" ? "is-user" : "is-assistant"
                }`}
              >
                <div className="chatbot-message-bubble">
                  <p>{message.content}</p>

                  {message.role === "assistant" && message.source && (
                    <a
                      className="chatbot-source"
                      href={message.source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Nguồn: {message.source.title} ↗
                    </a>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message is-assistant">
                <div className="chatbot-message-bubble chatbot-loading">
                  Đang soạn câu trả lời…
                </div>
              </div>
            )}

            {error && (
              <p className="chatbot-error" role="alert">
                {error}
              </p>
            )}

            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {messages.length === 0 && error && (
        <p className="chatbot-error" role="alert">
          {error}
        </p>
      )}

      <form className="chatbot-form" onSubmit={handleSubmit}>
        <textarea
          className="chatbot-input"
          aria-label="Nhập câu hỏi về hiện vật"
          placeholder="Nhập câu hỏi về hiện vật…"
          value={draft}
          maxLength={1200}
          rows={2}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isLoading}
        />

        <button
          className="chatbot-send"
          type="submit"
          aria-label="Gửi câu hỏi"
          disabled={!draft.trim() || isLoading}
        >
          Gửi
        </button>
      </form>

      <p className="chatbot-disclaimer">
        Trợ lý trả lời dựa trên tư liệu hiện vật được cung cấp.
      </p>
    </div>
  );
}