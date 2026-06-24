import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { gemini } from "@/lib/gemini"

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(50)

  return NextResponse.json(data ?? [])
}

function extractCommand(text: string): { reply: string; command: string | null } {
  const markerMatch = text.match(/<<<ACTION>>>\s*([\s\S]*?)\s*<<<END>>>/)
  if (markerMatch) {
    const reply = text.replace(markerMatch[0], "").trim()
    return { reply: reply || "Done! I've completed that action.", command: markerMatch[1].trim() }
  }
  const lastBrace = text.match(/\{[^{}\[\]]*\}\s*$/)
  if (lastBrace && lastBrace.index !== undefined) {
    return { reply: text.slice(0, lastBrace.index).trim(), command: lastBrace[0].trim() }
  }
  return { reply: text.trim(), command: null }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { message } = body
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  // Save user message
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "user",
    content: message,
  }).select().single()

  // Get last 20 messages for context (most recent, oldest first for LLM)
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  const llmMessages = (history ?? []).reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const rawReply = await gemini.chat(llmMessages)
  const { reply, command } = extractCommand(rawReply)

  // Execute command if present
  let created: { type: string } | undefined
  if (command) {
    try {
      const parsed = JSON.parse(command)
      switch (parsed.action) {
        case "create_task":
          await supabase.from("tasks").insert({
            user_id: user.id,
            title: parsed.data.title,
            description: parsed.data.description,
            priority: parsed.data.priority ?? "medium",
            due_date: parsed.data.due_date,
          })
          created = { type: "task" }
          break
        case "create_note":
          await supabase.from("notes").insert({
            user_id: user.id,
            title: parsed.data.title,
            content: parsed.data.content,
          })
          created = { type: "note" }
          break
        case "create_event":
          await supabase.from("events").insert({
            user_id: user.id,
            title: parsed.data.title,
            date: parsed.data.date,
            time: parsed.data.time,
            all_day: parsed.data.all_day ?? false,
          })
          created = { type: "event" }
          break
      }
    } catch {
      // If JSON parsing fails, just respond with the text
    }
  }

  // Save assistant reply
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "assistant",
    content: reply,
  })

  return NextResponse.json({ reply, created })
}
