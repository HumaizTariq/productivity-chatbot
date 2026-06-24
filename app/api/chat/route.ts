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
    // ponytail: `any` is fine here — LLM output shape is unpredictable. If this gets a real schema, type with a discriminated union.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any
    try {
      parsed = JSON.parse(command)
    } catch {
      parsed = null
    }
    if (parsed) {
      try {
        const data = parsed.data ?? {}
        switch (parsed.action) {
          case "create_task": {
            const { error } = await supabase.from("tasks").insert({
              user_id: user.id,
              title: data.title,
              description: data.description,
              priority: data.priority ?? "medium",
              due_date: data.due_date,
            })
            if (!error) created = { type: "task" }
            break
          }
          case "create_note": {
            const { error } = await supabase.from("notes").insert({
              user_id: user.id,
              title: data.title,
              content: data.content,
            })
            if (!error) created = { type: "note" }
            break
          }
          case "create_event": {
            const { error } = await supabase.from("events").insert({
              user_id: user.id,
              title: data.title,
              date: data.date,
              time: data.time,
              all_day: data.all_day ?? false,
            })
            if (!error) created = { type: "event" }
            break
          }
        }
      } catch (e) {
        console.error("Command execution failed:", e)
      }
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
