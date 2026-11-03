import type { ExhibitChatContext } from "../Chatbot";
import { ChatAssistant } from "./ChatAssistant";

// Adapt Vũ's existing context without sending client facts as trusted RAG evidence.
export function PhuChatbot({ exhibit }: { exhibit: ExhibitChatContext | null }) {
  const id = exhibit?.id;
  const artifactId = id === "drum" || id === "jar" || id === "dagger" ? id : null;
  return <ChatAssistant embedded open artifactId={artifactId}
    artifactName={exhibit?.name ?? null} onToggle={() => {}} />;
}
