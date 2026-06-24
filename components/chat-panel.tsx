"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles } from "lucide-react"

interface Message { id: string; role: "user" | "assistant"; content: string }

export function ChatPanel({ onDataChanged }: { onDataChanged?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { fetch("/api/chat").then((r) => r.ok ? r.json() : []).then(setMessages) }, [])

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Chat request failed" }))
        throw new Error(err.error || "Chat request failed")
      }
      const data = await res.json()
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: data.reply }])
      if (data.created) onDataChanged?.()
    } catch (e) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: e instanceof Error ? e.message : "Sorry, something went wrong. Please try again." }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Sparkles size={22} className="text-gold" />
              </div>
              <h1 className="font-serif text-xl font-semibold tracking-tight">How can I help?</h1>
              <p className="text-sm text-muted-foreground max-w-sm">I can manage your tasks, notes, and calendar. Just tell me what you need.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={13} className="text-gold" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[75%] ${m.role === "user" ? "bg-gold text-background rounded-br-sm border border-[#d4af37]" : "bg-secondary text-secondary-foreground rounded-bl-sm"}`}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-gold">U</span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Sparkles size={13} className="text-gold" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 bg-secondary text-sm text-muted-foreground">Thinking...</div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Textarea ref={inputRef} placeholder="Ask anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} className="min-h-[44px] max-h-[120px] resize-none rounded-xl bg-input border-border focus-visible:ring-1 focus-visible:ring-gold/45" rows={1} />
          <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()} className="shrink-0 rounded-xl h-[44px] w-[44px] bg-gold text-background hover:bg-gold/90">
            <Send size={16} />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
