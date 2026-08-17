import AmbientBackground from "@/components/AmbientBackground";
import { ChatView } from "@/components/chat/ChatView";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <AmbientBackground />
      <ChatView />
    </main>
  );
}