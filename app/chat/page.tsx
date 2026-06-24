import { Sidebar } from "@/components/sidebar"
import { ChatPanel } from "@/components/chat-panel"

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <ChatPanel />
      </main>
    </div>
  )
}
